import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { spring } from '@/lib/animations'

/** Element that leans toward the pointer. No-op on touch devices. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const x = useSpring(useMotionValue(0), spring.magnetic)
  const y = useSpring(useMotionValue(0), spring.magnetic)
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }
  return (
    <motion.div ref={ref} className={`inline-block ${className ?? ''}`} style={fine ? { x, y } : undefined} onPointerMove={fine ? onMove : undefined} onPointerLeave={reset}>
      {children}
    </motion.div>
  )
}
