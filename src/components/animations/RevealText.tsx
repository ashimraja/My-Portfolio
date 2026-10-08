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
  /** 'auto' makes multi-line (or *emphasised*) text two-toned: quiet lines, then the strong last line or emphasised words. */
  tone?: 'auto' | 'dim' | 'strong'
}

/** Staggered per-word mask reveal. *Emphasis* markup marks the strong words; everything else in that text is the quiet tone. */
export function RevealText({ lines, as = 'div', className, delay = 0, gap = 0.06, immediate, tone = 'auto' }: Props) {
  const Tag = motion[as] as typeof motion.div
  const arr = Array.isArray(lines) ? lines : [lines]
  const label = arr.join(' ').replace(/\*/g, '')
  const introDone = useIntroDone()
  const hasEm = arr.some((l) => parseEmphasis(l).some((s) => s.em))
  // Quiet = the primary colour at lower opacity and regular weight; strong = the primary colour.
  // Only two-part headings (and ones given an explicit tone) take the primary colour; a plain one-line heading stays in the text colour, so the colour is used for contrast, not everywhere.
  const accented = tone !== 'auto' || hasEm || arr.length > 1
  const quiet = (li: number, em: boolean) => (tone === 'dim' ? true : tone === 'strong' ? false : hasEm ? !em : arr.length > 1 && li < arr.length - 1)
  const trigger = immediate ? { animate: introDone ? 'visible' : 'hidden' } : { whileInView: 'visible', viewport }
  return (
    <Tag className={className} aria-label={label} variants={staggerContainer(gap, delay)} initial="hidden" {...trigger}>
      {arr.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {parseEmphasis(line).map((seg, si) =>
            seg.text.split(' ').filter(Boolean).map((w, wi) => (
              <Fragment key={`${si}-${wi}`}>
                <span className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
                  <motion.span variants={maskWord} className={`inline-block will-change-transform ${quiet(li, seg.em) ? 'font-normal text-accent/45' : accented ? 'text-accent' : ''}`}>{w}</motion.span>
                </span>{' '}
              </Fragment>
            )),
          )}
        </span>
      ))}
    </Tag>
  )
}
