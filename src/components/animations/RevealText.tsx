import { motion } from 'framer-motion'
import { Fragment } from 'react'
import { maskWord, staggerContainer, viewport } from '@/lib/animations'
import { parseEmphasis } from '@/lib/utils'
import { useIntroDone } from '@/lib/intro'

interface Props {
  lines: string | string[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  className?: string
  delay?: number
  gap?: number
  /** Animate on mount instead of on scroll (hero). */
  immediate?: boolean
}

/** Staggered per-word mask reveal. Supports *emphasis* markup for italic accents. */
export function RevealText({ lines, as = 'div', className, delay = 0, gap = 0.06, immediate }: Props) {
  const Tag = motion[as] as typeof motion.div
  const arr = Array.isArray(lines) ? lines : [lines]
  const label = arr.join(' ').replace(/\*/g, '')
  const introDone = useIntroDone()
  const trigger = immediate ? { animate: introDone ? 'visible' : 'hidden' } : { whileInView: 'visible', viewport }
  return (
    <Tag className={className} aria-label={label} variants={staggerContainer(gap, delay)} initial="hidden" {...trigger}>
      {arr.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {parseEmphasis(line).map((seg, si) =>
            seg.text.split(' ').filter(Boolean).map((w, wi) => (
              <Fragment key={`${si}-${wi}`}>
                <span className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
                  <motion.span variants={maskWord} className={`inline-block will-change-transform ${seg.em ? 'italic-accent' : ''}`}>{w}</motion.span>
                </span>{' '}
              </Fragment>
            )),
          )}
        </span>
      ))}
    </Tag>
  )
}
