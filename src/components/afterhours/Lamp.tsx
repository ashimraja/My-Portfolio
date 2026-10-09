import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { createFluidSmoke, type FluidSmoke } from './fluidSmoke'

/**
 * Pendant lamp that hangs from the top of the screen and swings toward the pointer / finger.
 * The room is dark: a "darkness" layer covers the page and is cut open by the lamp's cone, so
 * content is only really visible where the light falls. All geometry is driven by CSS variables
 * written from one rAF loop (no React re-renders while moving).
 *
 *   --lx / --ly : light source (px)      --la : cone axis angle (deg, 180 = straight down)
 */
const FEATHER = 34         // soft edge width in degrees
const MAX_SWING = 30       // max sideways lamp angle in degrees
const ROOM = 'rgba(7,6,5,'  // darkness colour

// Conic masks are rebuilt from CSS vars, so they follow the lamp with zero JS string work per frame.
const c0 = 80 // where the axis sits inside the gradient
const HALF = 34
const HA = `${HALF}deg`
const start = `calc(var(--la) - ${c0}deg)`
const darkMask = `conic-gradient(from ${start} at var(--lx) var(--ly), #000 0deg, #000 calc(${c0}deg - ${HA} - ${FEATHER}deg), transparent calc(${c0}deg - ${HA}), transparent calc(${c0}deg + ${HA}), #000 calc(${c0}deg + ${HA} + ${FEATHER}deg), #000 360deg)`
const glowCone = `conic-gradient(from ${start} at var(--lx) var(--ly), transparent 0deg, transparent calc(${c0}deg - ${HA} - 14deg), rgba(255,176,96,.05) calc(${c0}deg - ${HA} + 4deg), rgba(255,196,124,.15) calc(${c0}deg - 14deg), rgba(255,210,140,.2) ${c0}deg, rgba(255,196,124,.15) calc(${c0}deg + 14deg), rgba(255,176,96,.05) calc(${c0}deg + ${HA} - 4deg), transparent calc(${c0}deg + ${HA} + 14deg), transparent 360deg)`
// Half-planes split along the rim line (through --rx/--ry, perpendicular to the lamp axis): light exists only below it,
// so no glow spills above or beside the neck. The narrow angular feather keeps the edge soft.
const below = `conic-gradient(from calc(var(--la) - 90deg) at var(--rx) var(--ry), transparent 0deg, #000 9deg, #000 171deg, transparent 180deg, transparent 360deg)`
const above = `conic-gradient(from calc(var(--la) - 90deg) at var(--rx) var(--ry), #000 0deg, transparent 9deg, transparent 171deg, #000 180deg, #000 360deg)`
const reach = 'radial-gradient(circle at var(--lx) var(--ly), #000 0, rgba(0,0,0,.6) 36vh, transparent 98vh)'

export function Lamp() {
  const root = useRef<HTMLDivElement>(null)
  const lamp = useRef<HTMLDivElement>(null)
  const smoke = useRef<HTMLCanvasElement>(null)
  const fluidCv = useRef<HTMLCanvasElement>(null)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const host = root.current!, el = lamp.current!
    let W = window.innerWidth, H = window.innerHeight
    const geom = () => {
      W = window.innerWidth; H = window.innerHeight
      const s = W < 640 ? 0.74 : 1
      const cord = Math.max(36, Math.min(96, H * 0.085))
      el.style.setProperty('--s', String(s))
      el.style.setProperty('--cord', `${cord}px`)
      return { s, cord, D: cord + 40 * s }
    }
    let g = geom()
    let angle = reduce ? -10 : 0, vel = 0, st = 0, stVel = 0, target = angle, lastInput = -1e9, raf = 0, prev = performance.now()
    let lastKey = ''

    // Smoke: soft puffs leave the socket in world space, so when the lamp swings it drags a trail and the plume bends and curls behind it.
    const cv = smoke.current!, cx = cv.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const sizeCanvas = () => { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    sizeCanvas()
    // Preferred: a GPU fluid simulation over the top of the screen. The 2-D puff plume below is the fallback.
    const fluidH = () => Math.round(Math.min(H, 460))
    let fluid: FluidSmoke | null = null
    if (!reduce) { try { fluid = createFluidSmoke(fluidCv.current!) } catch { fluid = null } }
    cv.style.display = fluid ? 'none' : ''; fluidCv.current!.style.display = fluid ? '' : 'none'
    fluid?.resize(W, fluidH())
    let pcx = NaN, pcy = 0, pbx = 0, pby = 0
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64
    const sg = sprite.getContext('2d')!, grad = sg.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(214,210,206,1)'); grad.addColorStop(0.35, 'rgba(204,198,192,.35)'); grad.addColorStop(1, 'rgba(196,190,184,0)')
    sg.fillStyle = grad; sg.fillRect(0, 0, 64, 64)
    type Puff = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number; ph: number }
    const puffs: Puff[] = []
    let emit = 0, sx = 0, sy = 0, psx = NaN
    const stepSmoke = (dt: number, now: number) => {
      const rad = (angle * Math.PI) / 180
      if (fluid) {
        const along = (k: number) => proj(g.cord * (1 + st) + k * g.s)
        const [ex, ey] = along(8), [bx, by] = along(95) // emitter just above the shade's apex; the shade's body pushes the air
        const first = Number.isNaN(pcx)
        const stir = [{ x: bx, y: by, vx: first ? 0 : (bx - pbx) / dt, vy: first ? 0 : (by - pby) / dt }, { x: ex, y: ey, vx: first ? 0 : (ex - pcx) / dt, vy: first ? 0 : (ey - pcy) / dt }]
        pcx = ex; pcy = ey; pbx = bx; pby = by
        fluid.step(dt, { x: ex, y: ey }, stir)
        return
      }
      const d = g.cord * (1 + st) + 14 * g.s // just above the shade's apex
      sx = W / 2 - Math.sin(rad) * d; sy = Math.cos(rad) * d
      const mvx = Number.isNaN(psx) ? 0 : (sx - psx) / dt
      psx = sx
      emit += dt * 70
      while (emit >= 1 && puffs.length < 260) {
        emit -= 1
        puffs.push({ x: sx + (Math.random() - 0.5) * 3, y: sy, vx: mvx * 0.1, vy: -(15 + Math.random() * 4), age: 0, life: 4.5 + Math.random() * 1.5, r: 2.5 + Math.random() * 2, ph: Math.random() * 6.28 })
      }
      emit %= 1
      cx.clearRect(0, 0, W, H)
      cx.globalCompositeOperation = 'lighter'
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]
        p.age += dt
        if (p.age >= p.life || p.y < -60) { puffs.splice(i, 1); continue }
        const u = p.age / p.life
        // swirl: slow sideways sway that grows as the smoke rises, plus a push from the lamp's own motion
        const sway = Math.sin(p.y * 0.07 + now * 0.0021 + p.ph * u * 1.5) * 16 + Math.sin(p.y * 0.031 - now * 0.0009 + p.ph * u) * 12
        p.vx += (sway * (0.2 + u * 1.2) + (Math.random() - 0.5) * 220 * u * u + mvx * 0.3 * (1 - u) - p.vx * 1.6) * dt
        p.vy += (-12 - p.vy * 0.6) * dt
        p.x += p.vx * dt; p.y += p.vy * dt
        const r = p.r + 34 * Math.pow(u, 1.2) // starts as a thread, then diffuses outward
        const a = Math.sin(Math.PI * Math.min(1, u * 1.1)) * 0.9 / (r * 1.1 + 6) // wider means thinner, so the plume doesn't turn into a fat tube
        cx.globalAlpha = a
        cx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2)
      }
      cx.globalAlpha = 1
    }

    const proj = (dist: number) => {
      const r = (angle * Math.PI) / 180
      return [W / 2 - Math.sin(r) * dist, Math.cos(r) * dist] as const
    }
    const apply = () => {
      el.style.transform = `rotate(${angle.toFixed(3)}deg)`
      el.style.setProperty('--st', st.toFixed(4))
      const [lx, ly] = proj(g.D + g.cord * st)
      const key = `${lx.toFixed(1)}|${ly.toFixed(1)}|${angle.toFixed(2)}|${st.toFixed(3)}`
      if (key === lastKey) return
      lastKey = key
      const [rx, ry] = proj(g.cord * (1 + st) + 98 * g.s) // centre of the rim, down the lamp's axis
      host.style.setProperty('--rx', `${rx.toFixed(1)}px`)
      host.style.setProperty('--ry', `${ry.toFixed(1)}px`)
      host.style.setProperty('--lx', `${lx.toFixed(1)}px`)
      host.style.setProperty('--ly', `${ly.toFixed(1)}px`)
      host.style.setProperty('--la', `${(180 + angle).toFixed(2)}deg`)
    }
    const aim = (clientX: number) => {
      const m = Math.max(-1, Math.min(1, (clientX - W / 2) / (W / 2)))
      target = -m * MAX_SWING // rotating clockwise swings the bottom to the left, hence the minus
      lastInput = performance.now()
    }
    const onPointer = (e: PointerEvent) => aim(e.clientX)
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) aim(e.touches[0].clientX) }
    const onResize = () => { g = geom(); sizeCanvas(); fluid?.resize(W, fluidH()); apply() }

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - prev) / 1000); prev = now
      // Nobody touching? Drift gently so the room never feels frozen (and mobile has motion without input).
      const idle = now - lastInput > 2500
      const t = idle ? Math.sin(now * 0.0006) * 16 + Math.sin(now * 0.00023) * 6 : target
      // Damped spring => pendulum overshoot and wobble.
      const acc = 26 * (t - angle) - 2.6 * vel
      vel += acc * dt; angle += vel * dt
      // A touch of elasticity: the cord stretches a little when the lamp is whipped around, then bounces back.
      const pull = Math.min(0.09, (Math.abs(vel) / 260) * 0.09 + Math.abs(vel) * 0.0002)
      stVel += (140 * (pull - st) - 7 * stVel) * dt; st += stVel * dt
      apply()
      stepSmoke(Math.max(dt, 0.001), now)
      raf = requestAnimationFrame(tick)
    }

    apply()
    window.addEventListener('resize', onResize)
    if (!reduce) {
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('touchstart', onTouch, { passive: true })
      window.addEventListener('touchmove', onTouch, { passive: true })
      raf = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(raf)
      fluid?.dispose()
      window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchstart', onTouch); window.removeEventListener('touchmove', onTouch)
    }
  }, [reduce])

  const dark = reduce ? '.62)' : '.9)'
  return (
    <div ref={root} aria-hidden style={{ ['--lx' as string]: '50vw', ['--ly' as string]: '30vh', ['--la' as string]: '180deg', ['--rx' as string]: '50vw', ['--ry' as string]: '40vh' }}>
      {/* 1 — the room: darkness with a soft-edged cone cut out of it */}
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `${ROOM}${dark}`, maskImage: darkMask, WebkitMaskImage: darkMask }} />
      {/* 2 — light gets weaker with distance from the bulb */}
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `radial-gradient(circle at var(--lx) var(--ly), transparent 0, transparent 26vh, ${ROOM}.55) 92vh)`, maskImage: below, WebkitMaskImage: below }} />
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `${ROOM}.97)`, maskImage: above, WebkitMaskImage: above }} />
      {/* 3 — warm glow added on top of whatever the light touches */}
      <div className="pointer-events-none fixed inset-0 z-[31] mix-blend-screen" style={{ background: glowCone, maskImage: `${reach}, ${below}`, WebkitMaskImage: `${reach}, ${below}`, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }} />
      <div className="pointer-events-none fixed inset-0 z-[31] mix-blend-screen" style={{ background: 'radial-gradient(circle 20vh at var(--lx) var(--ly), rgba(255,190,110,.28), transparent 100%)', maskImage: below, WebkitMaskImage: below }} />

      <canvas ref={fluidCv} className="pointer-events-none fixed left-0 top-0 z-[34] w-full" style={{ height: 'min(100vh, 460px)' }} />
      <canvas ref={smoke} className="pointer-events-none fixed inset-0 z-[34] h-full w-full" />

      {/* the lamp */}
      <div ref={lamp} className="pointer-events-none fixed left-1/2 top-0 z-[35] w-0" style={{ transformOrigin: '0 0', willChange: 'transform' }}>
        <div className="absolute left-0 top-0 -translate-x-1/2" style={{ width: 'calc(300px * var(--s))' }}>
          <div className="mx-auto w-px bg-gradient-to-b from-[#3a332b] to-[#8a7358]" style={{ height: 'calc(var(--cord) * (1 + var(--st, 0)))' }} />
          <LampSvg />
        </div>
      </div>
    </div>
  )
}

function LampSvg() {
  const rim = (x: number) => 78 + Math.sqrt(Math.max(0, 1 - (x / 112) ** 2)) * 22 // y of the shade's front rim at offset x from the centre
  return (
    <svg viewBox="0 0 240 110" className="block w-full overflow-visible">
      <defs>
        <linearGradient id="lp-brass" x1="0" x2="1"><stop offset="0" stopColor="#8a5a3a" /><stop offset=".45" stopColor="#ffd9b0" /><stop offset="1" stopColor="#7a4a2c" /></linearGradient>
        <linearGradient id="lp-body" x1="0" x2="1"><stop offset="0" stopColor="#050505" /><stop offset=".35" stopColor="#24201c" /><stop offset=".6" stopColor="#0c0b0a" /><stop offset="1" stopColor="#030303" /></linearGradient>
        <radialGradient id="lp-inner" cx=".5" cy=".42" r=".6"><stop offset="0" stopColor="#fffaf0" /><stop offset=".3" stopColor="#ffdcaa" /><stop offset=".7" stopColor="#f4a456" /><stop offset="1" stopColor="#9a4a1a" /></radialGradient>
        <radialGradient id="lp-bulb" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fffdf2" /><stop offset=".55" stopColor="#ffe3ad" /><stop offset="1" stopColor="#ffb867" /></radialGradient>
        <clipPath id="lp-lit"><path d="M8 78 A112 11 0 0 1 232 78 A112 22 0 0 1 8 78 Z" /></clipPath>
        <filter id="lp-blur" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="lp-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      {/* light bleeding out of the rim */}
      <ellipse cx="120" cy="80" rx="112" ry="18" fill="#ffae55" opacity=".35" filter="url(#lp-blur)" />
      {/* glowing inside of the shade, with soft rays fanning out from the bulb */}
      <path d="M8 78 A112 11 0 0 1 232 78 A112 22 0 0 1 8 78 Z" fill="url(#lp-inner)" />
      <g clipPath="url(#lp-lit)">
      <g fill="#fff4dc" opacity=".2">
        {[[-104, -86], [-72, -54], [-38, -18], [16, 38], [58, 80], [92, 108]].map(([a, b]) => <path key={a} d={`M120 80 L${120 + a} ${rim(a)} L${120 + b} ${rim(b)} Z`} />)}
      </g>
      <g stroke="#fff0cf" strokeOpacity=".16" strokeWidth=".8">
        {[-96, -64, -28, 0, 30, 66, 98].map((x) => <line key={x} x1="120" y1="80" x2={120 + x} y2={rim(x)} />)}
      </g>
      </g>
      {/* socket */}
      <ellipse cx="120" cy="22" rx="16" ry="12" fill="#ffb878" opacity=".35" filter="url(#lp-blur-s)" />
      <rect x="111" y="0" width="18" height="20" rx="3" fill="url(#lp-brass)" />
      <rect x="107" y="18" width="26" height="12" rx="3" fill="url(#lp-brass)" opacity=".95" />
      {/* shade body: a wide, shallow cone; its lower edge domes up so we look into the lit interior */}
      <path d="M111 30 L129 30 L232 78 A112 11 0 0 0 8 78 Z" fill="url(#lp-body)" />
      <path d="M8 78 A112 22 0 0 0 232 78" fill="none" stroke="#ffdcae" strokeOpacity=".3" strokeWidth="1.2" />
      {/* bulb */}
      <ellipse cx="120" cy="86" rx="16" ry="14" fill="#ffd591" opacity=".6" filter="url(#lp-blur-s)" />
      <path d="M120 70 C112 72 110 84 115 91 C117 94 123 94 125 91 C130 84 128 72 120 70 Z" fill="url(#lp-bulb)" />
      <path d="M116 90 q2 -7 4 0 q2 -7 4 0" fill="none" stroke="#c7772d" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
