import { useCallback, useEffect, useRef } from 'react'
import { usePortfolio } from '@/content/ContentProvider'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import {
  FACES, commit, createCubies, cross, dot, inLayer, matrix3d, mulMM, mulMV, randomMove, rotation, stickerFaces, viewMatrix,
  type Cubie, type Move, type V3,
} from '@/lib/cube'

const S = 58 // cubie size in px
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Rubik's cube built from CSS 3D (no WebGL). Drag the background to orbit 360°; drag a sticker to turn that layer.
 * All motion is imperative (refs + rAF) so React never re-renders while you play.
 */
export function CubeGame() {
  const g = usePortfolio().about.game
  const reduce = usePrefersReducedMotion()
  const cubies = useRef<Cubie[]>(createCubies())
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const stage = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const fit = useRef<HTMLDivElement>(null)
  const view = useRef({ a: -26, b: -34 })
  const busy = useRef(false)

  const paint = (i: number, turn?: Move, theta = 0) => {
    const c = cubies.current[i], el = nodes.current[i]
    if (!el) return
    let o = c.o
    let p: V3 = [c.pos[0] * S, c.pos[1] * S, c.pos[2] * S]
    if (turn && inLayer(c, turn)) { const R = rotation(turn.r, theta); o = mulMM(R, o); p = mulMV(R, p) }
    el.style.transform = matrix3d(o, p)
  }
  const paintAll = () => cubies.current.forEach((_, i) => paint(i))
  const applyView = () => { if (stage.current) stage.current.style.transform = `rotateX(${view.current.a}deg) rotateY(${view.current.b}deg)` }

  const turn = useCallback((m: Move, ms = 260) => new Promise<void>((resolve) => {
    busy.current = true
    const dur = reduce ? 90 : ms
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      cubies.current.forEach((_, i) => paint(i, m, ease(t) * m.q * (Math.PI / 2)))
      if (t < 1) return requestAnimationFrame(step)
      commit(cubies.current, m); paintAll(); busy.current = false
      resolve()
    }
    requestAnimationFrame(step)
  }), [reduce])

  // Scale the whole cube with the available width (design size: 300px).
  useEffect(() => {
    const el = box.current!
    const apply = () => { if (fit.current) fit.current.style.transform = `scale(${Math.min(1.25, el.clientWidth / 300)})` }
    apply()
    const ro = new ResizeObserver(apply); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Start scrambled (instantly, no animation) so there is something to solve.
  useEffect(() => {
    for (let i = 0; i < 24; i++) commit(cubies.current, randomMove())
    paintAll(); applyView()
  }, [])

  // ── input: orbit (background) or turn a layer (sticker) ──
  const drag = useRef<{ kind: 'orbit' | 'layer'; x: number; y: number; cubie?: number; face?: number; fired?: boolean } | null>(null)
  const onDown = (e: React.PointerEvent) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-sticker]')
    ;try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* synthetic or already-released pointer */ }
    drag.current = t ? { kind: 'layer', x: e.clientX, y: e.clientY, cubie: Number(t.dataset.cubie), face: Number(t.dataset.face) } : { kind: 'orbit', x: e.clientX, y: e.clientY }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (d.kind === 'orbit') {
      view.current.b += dx * 0.6; view.current.a = view.current.a - dy * 0.6
      d.x = e.clientX; d.y = e.clientY; applyView(); return
    }
    if (d.fired || busy.current || Math.hypot(dx, dy) < 14) return
    d.fired = true
    const c = cubies.current[d.cubie!]
    const n = mulMV(c.o, FACES[d.face!].normal) as V3 // sticker normal in world space
    const V = viewMatrix(view.current.a, view.current.b)
    // The two world axes lying in the sticker's plane, both signs; pick the one whose on-screen direction matches the drag.
    let best: V3 = [0, 0, 0], score = -Infinity
    for (const axis of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]) {
      if (Math.abs(dot(axis, n)) === 1) continue
      for (const sgn of [1, -1]) {
        const t: V3 = [axis[0] * sgn, axis[1] * sgn, axis[2] * sgn]
        const p = mulMV(V, t)
        const s = dx * p[0] + dy * p[1]
        if (s > score) { score = s; best = t }
      }
    }
    const r = cross(n, best) // rotating +90° about r carries the sticker toward `best`
    const m: Move = { r, layer: Math.round(dot(c.pos, r)), q: 1 }
    void turn(m)
  }
  const onUp = () => { drag.current = null }

  return (
    <div ref={box} className="w-full max-w-[22rem]" data-cursor-system>
      <div className="cube-stage relative flex aspect-square w-full touch-none select-none items-center justify-center [perspective:900px]"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} role="img" aria-label={g.hint}>
        <div ref={fit} className="[transform-style:preserve-3d]">
        <div ref={stage} className="relative h-0 w-0 [transform-style:preserve-3d]">
          {cubies.current.map((c, i) => (
            <div key={i} ref={(el) => { nodes.current[i] = el }} className="absolute [transform-style:preserve-3d]" style={{ width: S, height: S, left: -S / 2, top: -S / 2 }}>
              {FACES.map((f) => (
                <div key={`k${f.name}`} className="absolute inset-0 [backface-visibility:hidden]" style={{ background: '#0b0b0c', transform: `${f.css} translateZ(${S / 2}px)` }} />
              ))}
              {stickerFaces(c).map((f) => (
                <div key={f.name} data-sticker data-cubie={i} data-face={FACES.indexOf(f)} className="absolute inset-[4px] rounded-[7px] [backface-visibility:hidden]"
                  style={{ background: f.color, transform: `${f.css} translateZ(${S / 2 + 0.6}px)` }} />
              ))}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
