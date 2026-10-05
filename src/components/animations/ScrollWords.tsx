import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, type ElementType } from 'react'

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return <><motion.span style={{ opacity }} className="inline-block">{children}</motion.span>{' '}</>
}

/**
 * Words brighten one after another as the paragraph scrolls up through the viewport
 * (0.14 → 1 opacity). The full text stays in the DOM; reduced-motion users get it fully visible.
 */
export function ScrollWords({ text, as: Tag = 'p', className }: { text: string; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 88%', 'end 52%'] })
  if (reduce) return <Tag className={className}>{text}</Tag>
  const words = text.split(' ')
  const spread = 0.65 // portion of the scroll range used to stagger words; the rest is each word's own fade
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden>
        {words.map((w, i) => {
          const start = (i / words.length) * spread
          return <Word key={i} progress={scrollYProgress} range={[start, start + (1 - spread)]}>{w}</Word>
        })}
      </span>
    </Tag>
  )
}
