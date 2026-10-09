import { motion, useAnimationControls, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import { Reveal } from '@/components/animations/Reveal'
import { usePortfolio } from '@/content/ContentProvider'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/** Small cards tucked behind the portrait that slide out around it as it scrolls into view. x/y are fractions of the portrait's size. */
const CARDS = [{ x: 0.62, y: -0.06, r: 7 }, { x: -0.06, y: 0.78, r: -6 }, { x: 0.6, y: 1.0, r: 3 }]

function FloatCard({ p, i, label, value }: { p: MotionValue<number>; i: number; label: string; value: string }) {
  const c = CARDS[i]
  const k = useTransform(p, (v) => { const t = Math.min(1, Math.max(0, (v - i * 0.08) / (1 - 0.16))); return 1 - Math.pow(1 - t, 3) })
  const left = `${c.x * 100}%`, top = `${c.y * 100}%`
  const x = useTransform(k, (v) => (1 - v) * (0.2 - c.x) * 260)
  const y = useTransform(k, (v) => (1 - v) * (0.4 - c.y) * 300)
  const rotate = useTransform(k, (v) => c.r * v)
  const opacity = useTransform(k, (v) => Math.min(1, v * 3))
  return (
    <motion.div aria-hidden style={{ left, top, x, y, rotate, opacity }} className="pointer-events-none absolute z-20 w-[9.5rem] rounded-lg border border-border bg-surface px-4 py-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] md:w-40">
      <p className="t-label">{label}</p>
      <p className="mt-1 text-sm font-medium leading-snug">{value}</p>
    </motion.div>
  )
}

interface Spark { id: number; x: number; y: number; dx: number; dy: number; size: number }
let sparkId = 0

/**
 * Portrait under the intro sentence, shown whole (never cropped). Until one is uploaded in the dashboard an initials tile holds the space.
 * Mouse and touch behave the same way: the portrait tilts toward the pointer with and wakes up in colour;
 * a click or tap makes it bounce and throw a few accent sparks. Reduced-motion visitors get the plain picture.
 */
export function AboutPhoto() {
  const { about, name, initials, title, location, stats } = usePortfolio()
  const reduce = usePrefersReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const bounce = useAnimationControls()
  const [lit, setLit] = useState(false)
  const [sparks, setSparks] = useState<Spark[]>([])
  const litTimer = useRef(0)
  const { scrollYProgress } = useScroll({ target: box, offset: ['start 95%', 'start 45%'] })
  const facts = [['Based in', location], ['Role', title], [stats[0]?.label ?? 'Shipped', stats[0] ? `${stats[0].value}${stats[0].suffix}` : '']].filter(([, v]) => v)

  // pointer position inside the portrait, -0.5 … 0.5
  const px = useMotionValue(0), py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), { stiffness: 140, damping: 16 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [11, -11]), { stiffness: 140, damping: 16 })

  const locate = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, nx: (e.clientX - r.left) / r.width - 0.5, ny: (e.clientY - r.top) / r.height - 0.5 }
  }
  const onMove = (e: React.PointerEvent) => { if (reduce || e.pointerType !== 'mouse') return; const p = locate(e); px.set(p.nx); py.set(p.ny) }
  const onEnter = (e: React.PointerEvent) => { if (!reduce && e.pointerType === 'mouse') { window.clearTimeout(litTimer.current); setLit(true) } }
  const onLeave = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') return; px.set(0); py.set(0); litTimer.current = window.setTimeout(() => setLit(false), 250) }
  const onDown = (e: React.PointerEvent) => {
    if (reduce) return
    const p = locate(e)
    if (e.pointerType === 'mouse') { px.set(p.nx); py.set(p.ny); setLit(true) } // a finger gets the bounce and sparks only: no 3D tilt or colour repaint on a phone
    void bounce.start({ scale: [1, 0.95, 1.03, 1], transition: { duration: 0.5, ease: 'easeOut' } })
    const burst: Spark[] = Array.from({ length: e.pointerType === 'mouse' ? 9 : 6 }, (_, i) => {
      const a = (i / (e.pointerType === 'mouse' ? 9 : 6)) * Math.PI * 2 + Math.random() * 0.5, d = 46 + Math.random() * 54
      return { id: ++sparkId, x: p.x, y: p.y, dx: Math.cos(a) * d, dy: Math.sin(a) * d, size: 4 + Math.random() * 5 }
    })
    setSparks((s) => [...s, ...burst])
    window.setTimeout(() => setSparks((s) => s.filter((k) => !burst.includes(k))), 800)
  }

  const picture = about.photo
    ? <img src={about.photo} alt={`Portrait of ${name}`} loading="lazy" decoding="async" draggable={false} className={`block h-auto w-full select-none [@media(hover:hover)]:transition-[filter] [@media(hover:hover)]:duration-700 ${lit ? 'saturate-[1.12]' : 'saturate-[0.78]'}`} />
    : <div aria-hidden className="flex aspect-[4/5] w-full items-center justify-center bg-surface"><span className="t-display text-[7rem] leading-none text-foreground/80">{initials}<span className="text-accent">.</span></span></div>

  return (
    <Reveal variant="scale" className="mx-auto mb-16 mt-10 max-w-[19rem] md:mt-14 md:max-w-[22rem]">
      <div ref={box} className="relative touch-pan-y" style={{ perspective: reduce ? undefined : 900 }} onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave} onPointerCancel={onLeave} onPointerDown={onDown} >
        <motion.div animate={bounce} style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, }} className="relative z-10 overflow-hidden rounded-xl will-change-transform [backface-visibility:hidden]">
          {picture}
        </motion.div>
        {facts.map(([label, value], i) => <FloatCard key={label} p={scrollYProgress} i={i} label={label} value={value} />)}
        {sparks.map((k) => (
          <motion.span key={k.id} aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-full bg-accent"
            style={{ width: k.size, height: k.size, x: k.x - k.size / 2, y: k.y - k.size / 2 }}
            initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0.2, x: k.x + k.dx - k.size / 2, y: k.y + k.dy - k.size / 2 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
    </Reveal>
  )
}
