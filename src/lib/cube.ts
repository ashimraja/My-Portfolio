/**
 * Rubik's cube model. World space = CSS space (x right, y down, z toward the viewer).
 * Each cubie keeps an integer position (-1..1) and an integer 3×3 orientation matrix.
 * A move is a quarter turn of one layer about an axis; the sticker you drag moves in the drag direction.
 */
export type V3 = [number, number, number]
export type M3 = number[] // row-major 3×3

export const I3: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
export const mulMV = (m: M3, v: V3): V3 => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]
export const mulMM = (a: M3, b: M3): M3 => {
  const o: number[] = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c])
  return o
}
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const round = (m: number[]) => m.map((x) => Math.round(x))

/** Rotation by angle θ about unit axis r (Rodrigues). */
export function rotation(r: V3, theta: number): M3 {
  const c = Math.cos(theta), s = Math.sin(theta), k = 1 - c
  const [x, y, z] = r
  return [c + k * x * x, k * x * y - s * z, k * x * z + s * y, k * y * x + s * z, c + k * y * y, k * y * z - s * x, k * z * x - s * y, k * z * y + s * x, c + k * z * z]
}
export const quarter = (r: V3, q: 1 | -1): M3 => round(rotation(r, (q * Math.PI) / 2))

/** Camera: rotateX(a) rotateY(b), matching the CSS transform used on the stage. */
export function viewMatrix(aDeg: number, bDeg: number): M3 {
  const a = (aDeg * Math.PI) / 180, b = (bDeg * Math.PI) / 180
  const rx: M3 = [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)]
  const ry: M3 = [Math.cos(b), 0, Math.sin(b), 0, 1, 0, -Math.sin(b), 0, Math.cos(b)]
  return mulMM(rx, ry)
}

export const matrix3d = (m: M3, t: V3) => `matrix3d(${m[0]},${m[3]},${m[6]},0,${m[1]},${m[4]},${m[7]},0,${m[2]},${m[5]},${m[8]},0,${t[0]},${t[1]},${t[2]},1)`

/** A softened cube palette: the six faces stay easy to tell apart, but nothing is neon, so it sits quietly on the black-and-white site. */
export const COLORS = { white: '#f1f0ea', yellow: '#e9c85a', green: '#4aa57a', blue: '#4a74c9', red: '#cf5a4c', orange: '#e48a4a' }

export interface FaceDef { name: string; normal: V3; color: string; css: string }
/** Local faces of a cubie. `css` places a face on that side (outward normal = the listed direction). */
export const FACES: FaceDef[] = [
  { name: 'right', normal: [1, 0, 0], color: COLORS.red, css: 'rotateY(90deg)' },
  { name: 'left', normal: [-1, 0, 0], color: COLORS.orange, css: 'rotateY(-90deg)' },
  { name: 'up', normal: [0, -1, 0], color: COLORS.white, css: 'rotateX(90deg)' },
  { name: 'down', normal: [0, 1, 0], color: COLORS.yellow, css: 'rotateX(-90deg)' },
  { name: 'front', normal: [0, 0, 1], color: COLORS.green, css: '' },
  { name: 'back', normal: [0, 0, -1], color: COLORS.blue, css: 'rotateY(180deg)' },
]

export interface Cubie { pos: V3; o: M3; home: V3 }
export interface Move { r: V3; layer: number; q: 1 | -1 }

export function createCubies(): Cubie[] {
  const out: Cubie[] = []
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) out.push({ pos: [x, y, z], o: I3, home: [x, y, z] })
  return out
}

/** Which of this cubie's faces carry a sticker (those that start on the outside of the cube). */
export const stickerFaces = (c: Cubie) => FACES.filter((f) => dot(f.normal, c.home) === 1)

export const inLayer = (c: Cubie, m: Move) => Math.round(dot(c.pos, m.r)) === m.layer

export function commit(cubies: Cubie[], m: Move) {
  const R = quarter(m.r, m.q)
  for (const c of cubies) if (inLayer(c, m)) { c.pos = round(mulMV(R, c.pos)) as V3; c.o = round(mulMM(R, c.o)) }
}

export function isSolved(cubies: Cubie[]) {
  const seen = new Map<string, string>()
  for (const c of cubies) for (const f of stickerFaces(c)) {
    const n = round(mulMV(c.o, f.normal)).join(',')
    const prev = seen.get(n)
    if (prev && prev !== f.color) return false
    seen.set(n, f.color)
  }
  return true
}

export const randomMove = (): Move => {
  const axis = Math.floor(Math.random() * 3)
  const r: V3 = [0, 0, 0]; r[axis] = 1
  return { r, layer: Math.floor(Math.random() * 3) - 1, q: Math.random() < 0.5 ? 1 : -1 }
}
export const invert = (m: Move): Move => ({ ...m, q: (m.q === 1 ? -1 : 1) as 1 | -1 })
