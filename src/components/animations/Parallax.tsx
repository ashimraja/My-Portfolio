import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Moves children on the Y axis relative to scroll. `speed` in px of travel each way. Off on phones, where tight stacked lines would overlap as neighbours drift in opposite directions. */
export function Parallax({ children, speed = 60, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const wide = useMediaQuery('(min-width: 768px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  return <div ref={ref} className={className}><motion.div style={wide ? { y } : undefined}>{children}</motion.div></div>
}
