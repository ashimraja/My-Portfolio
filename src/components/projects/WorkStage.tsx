import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroCopy } from '@/components/hero/Hero'
import { ProjectCover } from '@/components/ui/ProjectCover'
import { KindToggle } from '@/components/ui/KindToggle'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useContent } from '@/content/ContentProvider'
import { useIntroDone } from '@/lib/intro'
import { scrollToTarget } from '@/lib/scroll'
import { kindOf, type KindFilter } from '@/lib/projectKind'
import { ProjectCaption } from './ProjectCaption'
import type { Project } from '@/types'

const idx = (n: number) => String(n + 1).padStart(2, '0')
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Where each cover rests in the hero's fan: offset from the fan's anchor as a fraction of a fanned cover's own width (x) and height (y), plus tilt in degrees. First cover sits on top.
 *  Offsets are relative to the covers, not the window, so the four stay overlapped as one stack at every window size. */
const FAN = [{ x: 0, y: 0.12, r: -3 }, { x: 0.22, y: -0.32, r: 5 }, { x: -0.18, y: -0.4, r: -8 }, { x: 0.14, y: 0.5, r: 7 }]
/** Fan placement per screen class; anchor is a fraction of the viewport. */
const FAN_LAYOUT = {
  wide: { scale: 0.5, anchor: { x: 0.795, y: 0.5 } },
  compact: { scale: 0.56, anchor: { x: 0.56, y: 0.8 } },
}

type Pose = { dx: number; dy: number; r: number; oy: number; s: number }
const NO_POSE: Pose = { dx: 0, dy: 0, r: 0, oy: 0, s: 1 }

/**
 * Home: the hero and the work section are one pinned stage.
 * Phase 1 — the project covers fan out on the right of the hero; scrolling flies them into a horizontal row while the hero copy fades.
 * Phase 2 — the row scrolls sideways. On touch screens a sideways swipe drives the same scroll.
 */
export function WorkStage() {
  const { items, intro } = useContent().content.projects
  return items.length ? <WorkStageInner all={items} intro={intro} /> : null
}

function FanCard({ p, i, n, f, stag, pose, cardRef }: { p: Project; i: number; n: number; f: MotionValue<number>; stag: number; pose: Pose; cardRef: (el: HTMLDivElement | null) => void }) {
  const t = useTransform(f, (v) => easeInOut(clamp((v - i * stag) / (1 - (n - 1) * stag))))
  const x = useTransform(t, (v) => pose.dx * (1 - v))
  const y = useTransform(t, (v) => pose.dy * (1 - v))
  const rotate = useTransform(t, (v) => pose.r * (1 - v))
  const scale = useTransform(t, (v) => pose.s + (1 - pose.s) * v)
  const opacity = useTransform(t, (v) => (i < FAN.length ? 1 : clamp(v * 3))) // covers beyond the fan wait behind it and fade in as they leave
  const caption = useTransform(t, (v) => clamp((v - 0.55) / 0.45))
  return (
    <motion.div ref={cardRef} style={{ x, y, rotate, scale, opacity, zIndex: n - i, transformOrigin: `50% ${pose.oy}px`, width: 'var(--card-w)' }} className="pointer-events-auto shrink-0 will-change-transform [backface-visibility:hidden]">
      <Link to={`/work/${p.slug}`} data-track="project_click" data-target={p.slug} data-cursor="view" data-cursor-label="VIEW" aria-label={`${p.title} — ${p.category}. Open case study`}
        className="group flex w-full flex-col gap-6">
        <div data-cover className="relative aspect-[1048/764] w-full overflow-hidden rounded-3xl border-[1.5px] border-foreground/20 bg-background shadow-[0_4px_14px_-8px_rgba(0,0,0,0.3)]">
          <ProjectCover project={p} className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          <motion.span style={{ opacity: caption }} className="absolute left-4 top-4 font-mono text-xs text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">{idx(i)} / {idx(n - 1)}</motion.span>
        </div>
        <motion.div style={{ opacity: caption }}><ProjectCaption p={p} stacked /></motion.div>
      </Link>
    </motion.div>
  )
}

function WorkStageInner({ all, intro }: { all: Project[]; intro: { kicker: string; title: string } }) {
  const introDone = useIntroDone()
  const compact = !useMediaQuery('(min-width: 768px)')
  const [filter, setFilter] = useState<KindFilter>('all')
  const counts: Record<KindFilter, number> = { all: all.length, mobile: all.filter((p) => kindOf(p) === 'mobile').length, web: all.filter((p) => kindOf(p) === 'web').length }
  const projects = filter === 'all' ? all : all.filter((p) => kindOf(p) === filter)
  const n = projects.length
  const stag = n > 1 ? Math.min(0.06, 0.4 / (n - 1)) : 0

  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const heroEl = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const [dist, setDist] = useState(0)
  const [vh, setVh] = useState(() => window.innerHeight)
  const [poses, setPoses] = useState<Pose[]>([])
  const fly = Math.round(vh * 0.85) // scroll distance of the fan-to-row flight
  const range = fly + dist

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const f = useTransform(scrollYProgress, (v) => clamp((v * range) / fly))
  const p2 = useTransform(scrollYProgress, (v) => (dist ? clamp((v * range - fly) / dist) : 0))
  const x = useTransform(scrollYProgress, (v) => -Math.min(dist, Math.max(0, v * range - fly)))
  const bar = useSpring(p2, { stiffness: 120, damping: 30 })
  const count = useTransform(p2, (v) => idx(Math.min(n - 1, Math.round(v * (n - 1)))))
  const heroOpacity = useTransform(f, (v) => 1 - clamp((v - 0.2) / 0.4))
  const heroY = useTransform(f, (v) => -v * fly) // the hero copy leaves at scroll speed, like ordinary page content, while the covers travel up into the row
  const heroEvents = useTransform(f, (v) => (v > 0.3 ? 'none' : 'auto'))
  const barOpacity = useTransform(f, (v) => clamp((v - 0.7) / 0.3))
  const key = projects.map((p) => p.slug).join()

  const measure = useCallback(() => {
    const tr = track.current, tail = end.current
    if (!tr || !tail) return
    // The pinned box is 100svh, so it stays put when a phone's address bar slides away; window.innerHeight would change mid-scroll and re-lay-out the whole stage.
    const w = window.innerWidth, h = pin.current?.offsetHeight || window.innerHeight, L = FAN_LAYOUT[compact ? 'compact' : 'wide']
    setVh(h)
    // On narrow screens the fan sits below the hero copy: fit it into the space that is left instead of a fixed spot that can land on the text.
    const hero = heroEl.current
    let top = 0, bottom = 0
    if (compact && hero && hero.offsetHeight) {
      const k = hero.getBoundingClientRect().height / hero.offsetHeight
      top = hero.offsetTop + hero.offsetHeight * k + 16
      bottom = h - 20
    }
    setDist(Math.max(0, tail.offsetLeft + tail.offsetWidth - w)) // from the layout, not scrollWidth: the fanned covers' transforms would inflate that
    setPoses(cards.current.slice(0, n).map((el, k) => {
      const cover = el?.querySelector<HTMLElement>('[data-cover]')
      if (!el || !cover) return NO_POSE
      const fan = FAN[Math.min(k, FAN.length - 1)]
      const natX = el.offsetLeft + el.offsetWidth / 2
      const natY = tr.offsetTop + el.offsetTop + cover.offsetHeight / 2
      const ch = cover.offsetHeight
      let s = L.scale, ay = h * L.anchor.y
      if (bottom > top) {
        s = Math.max(0.3, Math.min(L.scale, (bottom - top) / (2.1 * ch)))
        ay = (top + bottom) / 2 - 0.05 * ch * s
      }
      return { dx: w * L.anchor.x + fan.x * el.offsetWidth * s - natX, dy: ay + fan.y * ch * s - natY, r: fan.r, oy: ch / 2, s }
    }))
  }, [n, compact])

  useLayoutEffect(() => { measure() }, [measure, key])
  useEffect(() => {
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    if (heroEl.current) ro.observe(heroEl.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [measure])

  // Touch: a sideways swipe scrolls the page by the same amount (with momentum), so it drives the flight and the row. Vertical swipes are left to the browser.
  useEffect(() => {
    const el = pin.current!
    let id = -1, sx = 0, sy = 0, lx = 0, lt = 0, vel = 0, raf = 0, moved = false, mode: 'idle' | 'h' | 'v' = 'idle'
    const scrollBy = (dy: number) => {
      const w = wrap.current
      if (!w) return
      const top = w.getBoundingClientRect().top + window.scrollY, max = w.offsetHeight - (pin.current?.offsetHeight ?? window.innerHeight) // the pinned box is 100svh; innerHeight is taller once a phone's address bar hides, which stopped the swipe short of the last card
      window.scrollTo(0, Math.min(top + max, Math.max(top, window.scrollY + dy)))
    }
    const down = (e: PointerEvent) => { if (e.pointerType === 'mouse') return; cancelAnimationFrame(raf); id = e.pointerId; sx = lx = e.clientX; sy = e.clientY; lt = e.timeStamp; vel = 0; moved = false; mode = 'idle' }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      if (mode === 'idle') {
        const dx = e.clientX - sx, dy = e.clientY - sy
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) { mode = 'h'; try { el.setPointerCapture(id) } catch { /* capture unavailable */ } }
        else if (Math.abs(dy) > 8) mode = 'v'
      }
      if (mode !== 'h') return
      const dx = e.clientX - lx, dt = Math.max(1, e.timeStamp - lt)
      lx = e.clientX; lt = e.timeStamp; moved = true
      scrollBy(-dx)
      vel = 0.7 * vel + 0.3 * (-dx / dt)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      if (mode === 'h' && Math.abs(vel) > 0.05) {
        let v = vel, last = performance.now()
        const step = (now: number) => { const dt = now - last; last = now; scrollBy(v * dt); v *= Math.pow(0.94, dt / 16); if (Math.abs(v) > 0.03) raf = requestAnimationFrame(step) }
        raf = requestAnimationFrame(step)
      }
      mode = 'idle'
    }
    const click = (e: Event) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } } // a swipe is not a tap on the card under the finger
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('click', click, true) }
  }, [])

  return (
    <section id="top" ref={wrap} aria-label="Introduction and selected work" style={{ height: range + vh }} className="relative">
      <span id="work" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: fly }} />
      <div ref={pin} className="sticky top-0 h-[100svh] touch-pan-y overflow-hidden" style={{ ['--card-w' as string]: `min(${compact ? '84vw' : '46vw'}, 56rem, ${Math.max(0, vh - 25 * 16) * 1.3717}px)` }}>
        <motion.div ref={heroEl} style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }} className="container-x absolute inset-x-0 top-0 origin-top-left pt-28 md:top-auto md:bottom-0 md:origin-bottom-left md:pb-14 md:pt-32 [@media(max-height:780px)]:scale-90 [@media(max-height:680px)]:scale-[0.78]"><HeroCopy /></motion.div>

        <motion.header style={{ opacity: barOpacity }} className="container-x pointer-events-none absolute inset-x-0 top-24 flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
          <p className="t-label flex items-center gap-3"><span className="text-accent">01</span><span aria-hidden className="h-px w-10 bg-border" />{intro.kicker}</p>
          <h2 className="t-title">{intro.title}</h2>
        </motion.header>

        <motion.div ref={track} initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          style={{ x }} className="pointer-events-none absolute inset-x-0 bottom-24 top-44 flex items-center gap-8 pl-[var(--gutter)] md:gap-16 will-change-transform">
          {projects.map((p, i) => <FanCard key={p.slug} p={p} i={i} n={n} f={f} stag={stag} pose={poses[i] ?? NO_POSE} cardRef={(el) => { cards.current[i] = el }} />)}
          <div ref={end} aria-hidden className="h-px w-[14vw] shrink-0 md:w-[8vw]" />
        </motion.div>

        <motion.div style={{ opacity: barOpacity }} className="container-x absolute inset-x-0 bottom-0 flex items-center gap-6 pb-8">
          <div aria-hidden className="flex flex-1 items-center gap-6">
            <motion.span className="font-mono text-xs text-accent">{count}</motion.span>
            <div className="h-px flex-1 bg-border"><motion.div className="h-px origin-left bg-accent" style={{ scaleX: bar }} /></div>
            <span className="font-mono text-xs text-muted-foreground">{idx(n - 1)}</span>
          </div>
          <KindToggle value={filter} onChange={(v) => { setFilter(v); if (wrap.current) scrollToTarget(wrap.current.getBoundingClientRect().top + window.scrollY + fly, { immediate: true }) }} counts={counts} label="Show mobile or web projects" />
        </motion.div>
      </div>
    </section>
  )
}
