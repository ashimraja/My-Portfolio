import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/**
 * Pendant lamp that hangs from the top of the screen and swings toward the pointer / finger.
 * The room is dark: a "darkness" layer covers the page and is cut open by the lamp's cone, so
 * content is only really visible where the light falls. All geometry is driven by CSS variables
 * written from one rAF loop (no React re-renders while moving).
 *
 *   --lx / --ly : light source (px)      --la : cone axis angle (deg, 180 = straight down)
 */
const HALF_ANGLE = 34      // cone half-angle in degrees
const FEATHER = 16         // soft edge width in degrees
const MAX_SWING = 30       // max lamp angle in degrees
const ROOM = 'rgba(7,6,5,'  // darkness colour

// Conic masks are rebuilt from CSS vars, so they follow the lamp with zero JS string work per frame.
const start = `calc(var(--la) - ${HALF_ANGLE + FEATHER + 4}deg)`
const c0 = HALF_ANGLE + FEATHER + 4 // where the axis sits inside the gradient
const darkMask = `conic-gradient(from ${start} at var(--lx) var(--ly), #000 0deg, #000 ${c0 - HALF_ANGLE - FEATHER}deg, transparent ${c0 - HALF_ANGLE}deg, transparent ${c0 + HALF_ANGLE}deg, #000 ${c0 + HALF_ANGLE + FEATHER}deg, #000 360deg)`
const glowCone = `conic-gradient(from ${start} at var(--lx) var(--ly), transparent 0deg, transparent ${c0 - HALF_ANGLE - 6}deg, rgba(255,176,96,.10) ${c0 - HALF_ANGLE + 4}deg, rgba(255,196,124,.22) ${c0 - 10}deg, rgba(255,214,150,.30) ${c0}deg, rgba(255,196,124,.22) ${c0 + 10}deg, rgba(255,176,96,.10) ${c0 + HALF_ANGLE - 4}deg, transparent ${c0 + HALF_ANGLE + 6}deg, transparent 360deg)`
const reach = 'radial-gradient(circle at var(--lx) var(--ly), #000 0, rgba(0,0,0,.65) 42vh, transparent 98vh)'

export function Lamp() {
  const root = useRef<HTMLDivElement>(null)
  const lamp = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const host = root.current!, el = lamp.current!
    let W = window.innerWidth, H = window.innerHeight
    const geom = () => {
      W = window.innerWidth; H = window.innerHeight
      const s = W < 640 ? 0.74 : 1
      const cord = Math.max(70, Math.min(170, H * 0.15))
      el.style.setProperty('--s', String(s))
      el.style.setProperty('--cord', `${cord}px`)
      return { s, cord, D: cord + 40 * s }
    }
    let g = geom()
    let angle = reduce ? -10 : 0, vel = 0, st = 0, stVel = 0, target = angle, lastInput = -1e9, raf = 0, prev = performance.now()
    let lastKey = ''

    const apply = () => {
      const rad = (angle * Math.PI) / 180
      el.style.transform = `rotate(${angle.toFixed(3)}deg)`
      el.style.setProperty('--st', st.toFixed(4))
      const D = g.D + g.cord * st
      const lx = W / 2 - Math.sin(rad) * D, ly = Math.cos(rad) * D
      const key = `${lx.toFixed(1)}|${ly.toFixed(1)}|${angle.toFixed(2)}|${st.toFixed(3)}`
      if (key === lastKey) return
      lastKey = key
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
    const onResize = () => { g = geom(); apply() }

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
      window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchstart', onTouch); window.removeEventListener('touchmove', onTouch)
    }
  }, [reduce])

  const dark = reduce ? '.62)' : '.9)'
  return (
    <div ref={root} aria-hidden style={{ ['--lx' as string]: '50vw', ['--ly' as string]: '30vh', ['--la' as string]: '180deg' }}>
      {/* 1 — the room: darkness with a soft-edged cone cut out of it */}
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `${ROOM}${dark}`, maskImage: darkMask, WebkitMaskImage: darkMask }} />
      {/* 2 — light gets weaker with distance from the bulb */}
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `radial-gradient(circle at var(--lx) var(--ly), transparent 0, transparent 26vh, ${ROOM}.55) 92vh)` }} />
      {/* 3 — warm glow added on top of whatever the light touches */}
      <div className="pointer-events-none fixed inset-0 z-[31] mix-blend-screen" style={{ background: glowCone, maskImage: reach, WebkitMaskImage: reach }} />
      <div className="pointer-events-none fixed inset-0 z-[31] mix-blend-screen" style={{ background: 'radial-gradient(circle 20vh at var(--lx) var(--ly), rgba(255,190,110,.28), transparent 100%)' }} />

      {/* the lamp */}
      <div ref={lamp} className="pointer-events-none fixed left-1/2 top-0 z-[35] w-0" style={{ transformOrigin: '0 0', willChange: 'transform' }}>
        <div className="absolute left-0 top-0 -translate-x-1/2" style={{ width: 'calc(240px * var(--s))' }}>
          <div className="mx-auto w-px bg-gradient-to-b from-[#3a332b] to-[#8a7358]" style={{ height: 'calc(var(--cord) * (1 + var(--st, 0)))' }} />
          <LampSvg />
        </div>
      </div>
    </div>
  )
}

function LampSvg() {
  return (
    <svg viewBox="0 0 240 190" className="block w-full overflow-visible">
      <defs>
        <linearGradient id="lp-brass" x1="0" x2="1"><stop offset="0" stopColor="#5b4630" /><stop offset=".4" stopColor="#d9b98a" /><stop offset="1" stopColor="#4a3823" /></linearGradient>
        <linearGradient id="lp-body" x1="0" x2="1"><stop offset="0" stopColor="#060606" /><stop offset=".3" stopColor="#2b2622" /><stop offset=".55" stopColor="#0d0c0b" /><stop offset="1" stopColor="#040404" /></linearGradient>
        <radialGradient id="lp-inner" cx=".5" cy=".38" r=".62"><stop offset="0" stopColor="#fff6dc" /><stop offset=".3" stopColor="#ffd08e" /><stop offset=".65" stopColor="#f0913f" /><stop offset="1" stopColor="#7a3512" /></radialGradient>
        <radialGradient id="lp-bulb" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fffdf2" /><stop offset=".55" stopColor="#ffe3ad" /><stop offset="1" stopColor="#ffb867" /></radialGradient>
        <filter id="lp-blur" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="lp-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      {/* socket */}
      <rect x="111" y="0" width="18" height="24" rx="3" fill="url(#lp-brass)" />
      <rect x="107" y="22" width="26" height="14" rx="3" fill="url(#lp-brass)" opacity=".9" />
      {/* light bleeding out of the rim */}
      <ellipse cx="120" cy="158" rx="112" ry="20" fill="#ffae55" opacity=".6" filter="url(#lp-blur)" />
      {/* glowing inside of the shade */}
      <ellipse cx="120" cy="150" rx="108" ry="24" fill="url(#lp-inner)" />
      <g stroke="#fff0cf" strokeOpacity=".22" strokeWidth="1.2">
        {[-92, -66, -40, -16, 16, 40, 66, 92].map((x) => <line key={x} x1="120" y1="146" x2={120 + x} y2={150 + (1 - Math.abs(x) / 108) * 20} />)}
      </g>
      {/* bulb */}
      <ellipse cx="120" cy="146" rx="20" ry="18" fill="#ffd591" opacity=".7" filter="url(#lp-blur-s)" />
      <ellipse cx="120" cy="143" rx="11" ry="14" fill="url(#lp-bulb)" />
      <path d="M116 150 q2 -8 4 0 q2 -8 4 0" fill="none" stroke="#c7772d" strokeWidth="1" strokeLinecap="round" />
      {/* shade body: covers the back half of the opening, so we look up into the lit interior */}
      <path d="M111 36 L129 36 L228 150 A108 24 0 0 0 12 150 Z" fill="url(#lp-body)" />
      <path d="M126 36 L200 150 L188 150 L120 36 Z" fill="#fff" opacity=".05" />
      <path d="M12 150 A108 24 0 0 0 228 150" fill="none" stroke="#ffdcae" strokeOpacity=".55" strokeWidth="1.6" />
      <path d="M12 150 A108 24 0 0 1 228 150" fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="1" />
    </svg>
  )
}
