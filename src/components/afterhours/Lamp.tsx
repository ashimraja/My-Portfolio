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
// Half-planes split along the rim line (through --rx/--ry, perpendicular to the lamp axis). Light only exists below it,
// so nothing fans out beside the neck; the narrow angular feather keeps the edge soft without a visible seam.
const below = `conic-gradient(from calc(var(--la) - 90deg) at var(--rx) var(--ry), transparent 0deg, #000 9deg, #000 171deg, transparent 180deg, transparent 360deg)`
const above = `conic-gradient(from calc(var(--la) - 90deg) at var(--rx) var(--ry), #000 0deg, transparent 9deg, transparent 171deg, #000 180deg, #000 360deg)`
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
      const cord = Math.max(100, Math.min(190, H * 0.17))
      el.style.setProperty('--s', String(s))
      el.style.setProperty('--cord', `${cord}px`)
      return { s, cord, D: cord + 40 * s }
    }
    let g = geom()
    let angle = reduce ? -10 : 0, vel = 0, st = 0, stVel = 0, target = angle, lastInput = -1e9, raf = 0, prev = performance.now()
    let lastKey = ''
    let lx = 0, ly = 0

    const apply = () => {
      const rad = (angle * Math.PI) / 180
      el.style.transform = `rotate(${angle.toFixed(3)}deg)`
      el.style.setProperty('--st', st.toFixed(4))
      const D = g.D + g.cord * st
      lx = W / 2 - Math.sin(rad) * D; ly = Math.cos(rad) * D
      const key = `${lx.toFixed(1)}|${ly.toFixed(1)}|${angle.toFixed(2)}|${st.toFixed(3)}`
      if (key === lastKey) return
      lastKey = key
      const Dr = g.cord * (1 + st) + 150 * g.s // the rim's centre, down the lamp's axis
      host.style.setProperty('--rx', `${(W / 2 - Math.sin(rad) * Dr).toFixed(1)}px`)
      host.style.setProperty('--ry', `${(Math.cos(rad) * Dr).toFixed(1)}px`)
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
    <div ref={root} aria-hidden style={{ ['--lx' as string]: '50vw', ['--ly' as string]: '30vh', ['--la' as string]: '180deg', ['--rx' as string]: '50vw', ['--ry' as string]: '40vh' }}>
      {/* 1 — the room: darkness with a soft-edged cone cut out of it */}
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `${ROOM}${dark}`, maskImage: darkMask, WebkitMaskImage: darkMask }} />
      {/* 2 — light gets weaker with distance from the bulb */}
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `radial-gradient(circle at var(--lx) var(--ly), transparent 0, transparent 26vh, ${ROOM}.55) 92vh)`, maskImage: below, WebkitMaskImage: below }} />
      <div className="pointer-events-none fixed inset-0 z-[30]" style={{ background: `${ROOM}.97)`, maskImage: above, WebkitMaskImage: above }} />
      {/* 3 — warm glow added on top of whatever the light touches */}
      <div className="pointer-events-none fixed inset-0 z-[31] mix-blend-screen" style={{ background: glowCone, maskImage: reach, WebkitMaskImage: reach }} />
      <div className="pointer-events-none fixed inset-0 z-[31] mix-blend-screen" style={{ background: 'radial-gradient(circle 20vh at var(--lx) var(--ly), rgba(255,190,110,.28), transparent 100%)', maskImage: below, WebkitMaskImage: below }} />


      {/* the lamp */}
      <div ref={lamp} className="pointer-events-none fixed left-1/2 top-0 z-[35] w-0" style={{ transformOrigin: '0 0', willChange: 'transform' }}>
        <div className="absolute left-0 top-0 -translate-x-1/2" style={{ width: 'calc(240px * var(--s))' }}>
          {/* thin black flex */}
          <div className="mx-auto w-[1.5px] bg-[#0a0a0a]" style={{ height: 'calc(var(--cord) * (1 + var(--st, 0)))', boxShadow: '0 0 0 .5px rgba(255,255,255,.08)' }} />
          <LampSvg />
        </div>
      </div>
    </div>
  )
}

/** Shade silhouette: a flared cone (steep at the neck, opening out to the rim). The bottom edge is the far half of the rim ellipse. */
const BODY = 'M113 62 L127 62 C 131 90, 192 124, 225.4 144.8 A108 24 0 0 0 14.6 144.8 C 48 124, 109 90, 113 62 Z'

function LampSvg() {
  return (
    <svg viewBox="0 0 240 190" className="block w-full overflow-visible">
      <defs>
        <linearGradient id="lp-matte" x1="0" x2="1"><stop offset="0" stopColor="#050505" /><stop offset=".3" stopColor="#1b1b1d" /><stop offset=".48" stopColor="#2a2a2d" /><stop offset=".7" stopColor="#0d0d0e" /><stop offset="1" stopColor="#030303" /></linearGradient>
        <linearGradient id="lp-cap" x1="0" x2="1"><stop offset="0" stopColor="#040404" /><stop offset=".28" stopColor="#202023" /><stop offset=".42" stopColor="#38383c" /><stop offset=".72" stopColor="#0c0c0d" /><stop offset="1" stopColor="#030303" /></linearGradient>
        <linearGradient id="lp-fall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#ffbe78" stopOpacity=".12" /></linearGradient>
        <radialGradient id="lp-inner" cx=".5" cy=".42" r=".62"><stop offset="0" stopColor="#fff2d6" /><stop offset=".28" stopColor="#f6cf94" /><stop offset=".62" stopColor="#d49458" /><stop offset="1" stopColor="#6b3b1b" /></radialGradient>
        <radialGradient id="lp-bulb" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fffdf2" /><stop offset=".5" stopColor="#ffe9bd" stopOpacity=".85" /><stop offset="1" stopColor="#ffc77a" stopOpacity="0" /></radialGradient>
        <filter id="lp-blur" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="lp-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
        <clipPath id="lp-clip"><path d={BODY} /></clipPath>
      </defs>

      {/* warm light spilling past the rim */}
      <ellipse cx="120" cy="158" rx="112" ry="18" fill="#ffb05c" opacity=".5" filter="url(#lp-blur)" />
      {/* the bare, warm inside of the shade */}
      <ellipse cx="120" cy="150" rx="108" ry="24" fill="url(#lp-inner)" />
      <ellipse cx="120" cy="150" rx="26" ry="9" fill="url(#lp-bulb)" />

      {/* matte black cone */}
      <path d={BODY} fill="url(#lp-matte)" />
      <g clipPath="url(#lp-clip)">
        <rect x="0" y="56" width="240" height="106" fill="url(#lp-fall)" />
        {/* soft sheen along the shoulders, like powder-coated metal */}
        <path d="M122 76 C 126 104 150 124 190 142" fill="none" stroke="#6a6a70" strokeOpacity=".28" strokeWidth="5" strokeLinecap="round" filter="url(#lp-blur-s)" />
        <path d="M118 76 C 114 104 90 124 52 140" fill="none" stroke="#55555a" strokeOpacity=".16" strokeWidth="4" strokeLinecap="round" filter="url(#lp-blur-s)" />
      </g>
      {/* thin rim: a fine warm edge catching the light from inside */}
      <path d="M12 150 A108 24 0 0 0 228 150" fill="none" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.6 148.6 A107.4 23.4 0 0 0 227.4 148.6" fill="none" stroke="#ffd9a2" strokeOpacity=".7" strokeWidth=".9" />
      <path d="M12 150 A108 24 0 0 1 228 150" fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="1" />

      {/* cylindrical cap with a fine collar ring */}
      <rect x="107" y="10" width="26" height="56" rx="2.2" fill="url(#lp-cap)" />
      <rect x="105" y="58" width="30" height="7" rx="2" fill="url(#lp-cap)" />
      <path d="M105 60 H135" stroke="#6a6a72" strokeOpacity=".4" strokeWidth=".7" />
      <path d="M107 10 H133" stroke="#6a6a72" strokeOpacity=".5" strokeWidth=".8" />
      <rect x="111" y="2" width="18" height="9" rx="1.6" fill="url(#lp-cap)" />
    </svg>
  )
}
