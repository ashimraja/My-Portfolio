import { motion, useAnimationControls, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Reveal } from '@/components/animations/Reveal'
import { usePortfolio } from '@/content/ContentProvider'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

interface Spark { id: number; x: number; y: number; dx: number; dy: number; size: number }
let sparkId = 0

/**
 * Portrait under the intro sentence, shown whole (never cropped). Until one is uploaded in the dashboard an initials tile holds the space.
 * Mouse and touch behave the same way: the portrait tilts toward the pointer with and wakes up in colour;
 * a click or tap makes it bounce and throw a few accent sparks. Reduced-motion visitors get the plain picture.
 */
export function AboutPhoto() {
  const { about, name, initials } = usePortfolio()
  const reduce = usePrefersReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const bounce = useAnimationControls()
  const [lit, setLit] = useState(false)
  const [sparks, setSparks] = useState<Spark[]>([])
  const litTimer = useRef(0)

  // pointer position inside the portrait, -0.5 … 0.5
  const px = useMotionValue(0), py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), { stiffness: 140, damping: 16 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [11, -11]), { stiffness: 140, damping: 16 })

  const locate = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, nx: (e.clientX - r.left) / r.width - 0.5, ny: (e.clientY - r.top) / r.height - 0.5 }
  }
  const onMove = (e: React.PointerEvent) => { if (reduce) return; const p = locate(e); px.set(p.nx); py.set(p.ny) }
  const onEnter = () => { if (!reduce) { window.clearTimeout(litTimer.current); setLit(true) } }
  const onLeave = () => { px.set(0); py.set(0); litTimer.current = window.setTimeout(() => setLit(false), 250) }
  const onDown = (e: React.PointerEvent) => {
    if (reduce) return
    const p = locate(e)
    px.set(p.nx); py.set(p.ny)
    setLit(true)
    void bounce.start({ scale: [1, 0.93, 1.045, 1], transition: { duration: 0.55, ease: 'easeOut' } })
    const burst: Spark[] = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + Math.random() * 0.5, d = 46 + Math.random() * 54
      return { id: ++sparkId, x: p.x, y: p.y, dx: Math.cos(a) * d, dy: Math.sin(a) * d, size: 4 + Math.random() * 5 }
    })
    setSparks((s) => [...s, ...burst])
    window.setTimeout(() => setSparks((s) => s.filter((k) => !burst.includes(k))), 800)
    // a finger has no “leave”: fade the colour back and settle the tilt a moment after the tap
    if (e.pointerType !== 'mouse') { window.clearTimeout(litTimer.current); litTimer.current = window.setTimeout(() => { setLit(false); px.set(0); py.set(0) }, 1400) }
  }

  const picture = about.photo
    ? <img src={about.photo} alt={`Portrait of ${name}`} loading="lazy" decoding="async" draggable={false} className={`block h-auto w-full select-none transition-[filter] duration-700 ${lit ? 'saturate-[1.12]' : 'saturate-[0.78]'}`} />
    : <div aria-hidden className="flex aspect-[4/5] w-full items-center justify-center bg-surface"><span className="t-display text-[7rem] leading-none text-foreground/80">{initials}<span className="text-accent">.</span></span></div>

  return (
    <Reveal variant="scale" className="mt-10 max-w-[19rem] md:mt-14 md:max-w-[22rem]">
      <div ref={box} className="relative touch-pan-y" style={{ perspective: 900 }} onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave} onPointerCancel={onLeave} onPointerDown={onDown} onPointerUp={(e) => { if (e.pointerType !== 'mouse') { px.set(0); py.set(0) } }}>
        <motion.div animate={bounce} style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: 'preserve-3d' }} className="relative overflow-hidden rounded-xl will-change-transform">
          {picture}
        </motion.div>
        {sparks.map((k) => (
          <motion.span key={k.id} aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-full bg-accent"
            style={{ width: k.size, height: k.size, x: k.x - k.size / 2, y: k.y - k.size / 2 }}
            initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0.2, x: k.x + k.dx - k.size / 2, y: k.y + k.dy - k.size / 2 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
    </Reveal>
  )
}
