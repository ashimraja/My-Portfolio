import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RevealText } from '@/components/animations/RevealText'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { ease } from '@/lib/animations'
import { useIntroDone } from '@/lib/intro'
import type { Portfolio } from '@/types'

/**
 * Editorial stack with four different voices:
 *  small sans prefix → rotating faded word (the one flourish) → two solid lines, all in the tight sans.
 */
export function HeroHeadline({ headline }: { headline: Portfolio['hero']['headline'] }) {
  const reduce = usePrefersReducedMotion()
  const introDone = useIntroDone()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce || !introDone) return
    const t = setInterval(() => setI((n) => (n + 1) % headline.words.length), 2800)
    return () => clearInterval(t)
  }, [reduce, introDone, headline.words.length])

  return (
    <div aria-hidden data-cursor-text className="select-none md:max-w-[58vw]">
      <div className="flex items-center gap-4 overflow-hidden">
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: introDone ? 1 : 0 }} transition={{ duration: 1, ease, delay: 0.2 }} className="h-px w-12 origin-left bg-accent sm:w-24" />
        <RevealText immediate delay={0.2} lines={headline.prefix} className="font-sans text-[clamp(1.1rem,2.4vw,2.2rem)] font-light" />
      </div>

      <div className="relative mt-2 h-[1.3em] overflow-hidden pr-4 t-hero-main leading-[1.12] -mb-[0.2em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={i} style={{ fontWeight: 400 }} className="t-display absolute t-dim bg-clip-text pb-[0.2em] pr-[0.12em] text-transparent left-0 top-0 whitespace-nowrap leading-[1.12]"
            initial={{ y: '105%', rotate: 3 }} animate={{ y: introDone || i > 0 ? '0%' : '105%', rotate: 0 }} exit={{ y: '-105%', rotate: -3 }} transition={{ duration: 0.9, ease }}>
            {headline.words[i]}
          </motion.span>
        </AnimatePresence>
        <span style={{ fontWeight: 400 }} className="t-display invisible whitespace-nowrap leading-[1.12]">{headline.words[0]}</span>
      </div>

      <RevealText immediate delay={0.5} tone="strong" lines={headline.lines[0]} className="t-display t-hero-main mt-1 block" />
      <RevealText immediate delay={0.65} tone="strong" lines={headline.lines.slice(1)} className="t-display t-hero-main" />
    </div>
  )
}
