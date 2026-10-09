/**
 * Smoke from a small stable-fluids simulation on the GPU (velocity, pressure, vorticity, dye).
 * Heat from the lamp makes the dye rise, curl is re-injected so it keeps its wisps, and the lamp's own motion
 * stirs the air, so the plume bends, spreads and curls behind a swinging lamp instead of sliding with it.
 * Returns null when WebGL2 with float render targets is unavailable (the caller falls back to a canvas-2D plume).
 */

export interface Stir { x: number; y: number; vx: number; vy: number }
export interface FluidSmoke {
  resize(w: number, h: number): void
  /** emit at (x, y) px from the canvas's top-left; `stir` are moving bodies (px, px/s) that push the air. */
  step(dt: number, emit: { x: number; y: number }, stir: Stir[]): void
  dispose(): void
}

const VERT = `#version 300 es
out vec2 vUv;
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); vUv = p; gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`
const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; out vec4 o;`

const FRAG = {
  advect: `${HEAD}
uniform sampler2D uVel, uSrc; uniform vec2 uTexel; uniform float uDt, uDecay;
void main() { vec2 c = vUv - uDt * texture(uVel, vUv).xy * uTexel; o = texture(uSrc, c) * uDecay; }`,
  splat: `${HEAD}
uniform sampler2D uSrc; uniform vec2 uAt; uniform vec4 uVal; uniform float uAspect, uRadius;
void main() { vec2 p = vUv - uAt; p.x *= uAspect; o = texture(uSrc, vUv) + uVal * exp(-dot(p, p) / uRadius); }`,
  buoyancy: `${HEAD}
uniform sampler2D uVel, uDye; uniform float uDt, uLift;
void main() { vec4 v = texture(uVel, vUv); v.y += uLift * texture(uDye, vUv).r * uDt; o = v; }`,
  curl: `${HEAD}
uniform sampler2D uVel; uniform vec2 uTexel;
void main() {
  float L = texture(uVel, vUv - vec2(uTexel.x, 0.)).y, R = texture(uVel, vUv + vec2(uTexel.x, 0.)).y;
  float B = texture(uVel, vUv - vec2(0., uTexel.y)).x, T = texture(uVel, vUv + vec2(0., uTexel.y)).x;
  o = vec4(0.5 * (R - L - T + B), 0., 0., 1.);
}`,
  vorticity: `${HEAD}
uniform sampler2D uVel, uCurl; uniform vec2 uTexel; uniform float uDt, uStrength;
void main() {
  float L = texture(uCurl, vUv - vec2(uTexel.x, 0.)).x, R = texture(uCurl, vUv + vec2(uTexel.x, 0.)).x;
  float B = texture(uCurl, vUv - vec2(0., uTexel.y)).x, T = texture(uCurl, vUv + vec2(0., uTexel.y)).x;
  float C = texture(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 1e-4; f *= uStrength * C; f.y *= -1.;
  o = vec4(texture(uVel, vUv).xy + f * uDt, 0., 1.);
}`,
  divergence: `${HEAD}
uniform sampler2D uVel; uniform vec2 uTexel;
void main() {
  float L = texture(uVel, vUv - vec2(uTexel.x, 0.)).x, R = texture(uVel, vUv + vec2(uTexel.x, 0.)).x;
  float B = texture(uVel, vUv - vec2(0., uTexel.y)).y, T = texture(uVel, vUv + vec2(0., uTexel.y)).y;
  o = vec4(0.5 * (R - L + T - B), 0., 0., 1.);
}`,
  pressure: `${HEAD}
uniform sampler2D uP, uDiv; uniform vec2 uTexel;
void main() {
  float L = texture(uP, vUv - vec2(uTexel.x, 0.)).x, R = texture(uP, vUv + vec2(uTexel.x, 0.)).x;
  float B = texture(uP, vUv - vec2(0., uTexel.y)).x, T = texture(uP, vUv + vec2(0., uTexel.y)).x;
  o = vec4((L + R + B + T - texture(uDiv, vUv).x) * 0.25, 0., 0., 1.);
}`,
  project: `${HEAD}
uniform sampler2D uP, uVel; uniform vec2 uTexel;
void main() {
  float L = texture(uP, vUv - vec2(uTexel.x, 0.)).x, R = texture(uP, vUv + vec2(uTexel.x, 0.)).x;
  float B = texture(uP, vUv - vec2(0., uTexel.y)).x, T = texture(uP, vUv + vec2(0., uTexel.y)).x;
  o = vec4(texture(uVel, vUv).xy - 0.5 * vec2(R - L, T - B), 0., 1.);
}`,
  // dye density -> premultiplied warm-grey smoke, with a fade at the top and bottom edges and a little dither against banding
  display: `${HEAD}
uniform sampler2D uDye;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float d = texture(uDye, vUv).r;
  d = 1.0 - exp(-d * 1.6);
  float edge = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
  float a = d * 0.46 * edge + (hash(gl_FragCoord.xy) - 0.5) / 255.0 * step(0.002, d);
  a = max(a, 0.0);
  o = vec4(vec3(0.74, 0.71, 0.68) * a, a);
}`,
}

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }
type Pair = { read: Target; write: Target; swap(): void }

export function createFluidSmoke(canvas: HTMLCanvasElement): FluidSmoke | null {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' })
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
    return s
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }
  const progs = {} as Record<keyof typeof FRAG, Prog>
  try {
    for (const k of Object.keys(FRAG) as (keyof typeof FRAG)[]) {
      const p = gl.createProgram()!
      gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAG[k])); gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link')
      const u: Prog['u'] = {}
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i)!.name; u[name] = gl.getUniformLocation(p, name) }
      progs[k] = { p, u }
    }
  } catch { return null }
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const makeTarget = (w: number, h: number): Target => {
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v)
    const fbo = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
    return { tex, fbo, w, h }
  }
  const makePair = (w: number, h: number): Pair => {
    const pair: Pair = { read: makeTarget(w, h), write: makeTarget(w, h), swap() { const t = pair.read; pair.read = pair.write; pair.write = t } }
    return pair
  }
  const free = (t: Target) => { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo) }

  let W = 1, H = 1, sw = 1, sh = 1, dw = 1, dh = 1
  let vel: Pair, dye: Pair, pres: Pair
  let curl: Target, div: Target
  let alive = true

  const use = (name: keyof typeof FRAG, dst: Target | null, setup: (u: Prog['u']) => void) => {
    const { p, u } = progs[name]
    gl.useProgram(p)
    setup(u)
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fbo : null)
    gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  let unit = 0
  const tex = (u: WebGLUniformLocation | null, t: Target) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t.tex); gl.uniform1i(u, unit); unit++ }
  const pass = (name: keyof typeof FRAG, dst: Target | null, setup: (u: Prog['u']) => void) => { unit = 0; use(name, dst, setup) }

  const alloc = () => {
    if (vel) { for (const p of [vel, dye, pres]) { free(p.read); free(p.write) } free(curl); free(div) }
    sw = 144; sh = Math.max(32, Math.round(sw * H / W))
    dw = 288; dh = Math.max(64, Math.round(dw * H / W))
    vel = makePair(sw, sh); pres = makePair(sw, sh); curl = makeTarget(sw, sh); div = makeTarget(sw, sh)
    dye = makePair(dw, dh)
  }

  const splat = (pair: Pair, x: number, y: number, val: [number, number, number, number], radius: number) => {
    pass('splat', pair.write, (u) => { tex(u.uSrc, pair.read); gl.uniform2f(u.uAt, x / W, 1 - y / H); gl.uniform4f(u.uVal, ...val); gl.uniform1f(u.uAspect, W / H); gl.uniform1f(u.uRadius, radius) })
    pair.swap()
  }

  let time = 0
  return {
    resize(w, h) {
      W = Math.max(1, w); H = Math.max(1, h)
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      alloc()
    },
    step(dt, emit, stir) {
      if (!alive) return
      time += dt
      const cell = W / sw // px per sim cell: velocities below are in cells per second
      const sim = (v: number) => v / cell
      const tx = [1 / sw, 1 / sh] as const

      // the lamp stirs the air it moves through, and heat plus a little flutter feed the plume
      for (const s of stir) splat(vel, s.x, s.y, [sim(s.vx) * 0.6, -sim(s.vy) * 0.6, 0, 0], 0.0045)
      const flutter = Math.sin(time * 1.7) * 3 + Math.sin(time * 4.3) * 1.5
      splat(vel, emit.x, emit.y, [flutter, 8, 0, 0], 0.00035)
      splat(dye, emit.x, emit.y, [0.58 + 0.25 * Math.sin(time * 3.1), 0, 0, 0], 0.00016)

      pass('buoyancy', vel.write, (u) => { tex(u.uVel, vel.read); tex(u.uDye, dye.read); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uLift, 38) })
      vel.swap()
      pass('curl', curl, (u) => { tex(u.uVel, vel.read); gl.uniform2f(u.uTexel, tx[0], tx[1]) })
      pass('vorticity', vel.write, (u) => { tex(u.uVel, vel.read); tex(u.uCurl, curl); gl.uniform2f(u.uTexel, tx[0], tx[1]); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uStrength, 9) })
      vel.swap()
      pass('divergence', div, (u) => { tex(u.uVel, vel.read); gl.uniform2f(u.uTexel, tx[0], tx[1]) })
      for (let i = 0; i < 16; i++) {
        pass('pressure', pres.write, (u) => { tex(u.uP, pres.read); tex(u.uDiv, div); gl.uniform2f(u.uTexel, tx[0], tx[1]) })
        pres.swap()
      }
      pass('project', vel.write, (u) => { tex(u.uP, pres.read); tex(u.uVel, vel.read); gl.uniform2f(u.uTexel, tx[0], tx[1]) })
      vel.swap()
      pass('advect', vel.write, (u) => { tex(u.uVel, vel.read); tex(u.uSrc, vel.read); gl.uniform2f(u.uTexel, tx[0], tx[1]); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uDecay, Math.exp(-0.35 * dt)) })
      vel.swap()
      pass('advect', dye.write, (u) => { tex(u.uVel, vel.read); tex(u.uSrc, dye.read); gl.uniform2f(u.uTexel, tx[0], tx[1]); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uDecay, Math.exp(-0.6 * dt)) })
      dye.swap()

      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); gl.clear(gl.COLOR_BUFFER_BIT)
      pass('display', null, (u) => { tex(u.uDye, dye.read) })
      gl.disable(gl.BLEND)
    },
    dispose() {
      alive = false
      for (const p of [vel, dye, pres]) if (p) { free(p.read); free(p.write) }
      if (curl) free(curl)
      if (div) free(div)
      for (const k of Object.keys(progs) as (keyof typeof FRAG)[]) gl.deleteProgram(progs[k].p)
      gl.deleteShader(vs); gl.deleteVertexArray(vao)
    },
  }
}
