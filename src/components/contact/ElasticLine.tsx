import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

const H = 40 // svg height; the string rests at H / 2
const MAX_PULL = 16

/** Returns pointer handlers + motion values for a string that bends toward the cursor and springs back. */
export function useElasticLine() {
  const fine = useFinePointer()
  const reduce = usePrefersReducedMotion()
  const rawX = useMotionValue(0.5) // 0..1 along the line
  const rawY = useMotionValue(0)   // px offset
  const cx = useSpring(rawX, { stiffness: 260, damping: 26 })
  const cy = useSpring(rawY, { stiffness: 320, damping: 6, mass: 0.6 }) // low damping => wobble like a net/string
  const ref = useRef<HTMLDivElement>(null)
  const enabled = fine && !reduce
  const onPointerMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    rawX.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
    const dy = e.clientY - r.bottom
    // Strongest when the pointer is near the line, fading out with distance.
    const near = Math.max(0, 1 - Math.abs(dy) / 90)
    rawY.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * 0.5)) * near)
  }
  const onPointerLeave = () => { rawY.set(0) }
  return { ref, cx, cy, onPointerMove, onPointerLeave }
}

export function ElasticLine({ cx, cy, active }: { cx: MotionValue<number>; cy: MotionValue<number>; active: boolean }) {
  const holder = useRef<SVGSVGElement>(null)
  const [w, setW] = useState(400)
  useEffect(() => {
    const el = holder.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const d = useTransform([cx, cy] as MotionValue<number>[], ([x, y]: number[]) => `M0 ${H / 2} Q ${x * w} ${H / 2 + y * 2} ${w} ${H / 2}`)
  return (
    <svg ref={holder} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full translate-y-1/2 overflow-visible">
      <motion.path d={d} fill="none" strokeWidth={active ? 1.5 : 1} vectorEffect="non-scaling-stroke" style={{ stroke: active ? 'var(--accent)' : 'var(--border)', transition: 'stroke .4s, stroke-width .4s' }} />
    </svg>
  )
}
