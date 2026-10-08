import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useContent } from '@/content/ContentProvider'
import { easeInOut, ease } from '@/lib/animations'
import { markIntroDone } from '@/lib/intro'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/** Full-screen name intro. Runs once per page load; the site is revealed as the panel lifts. */
export function IntroLoader() {
  const { content, ready } = useContent()
  const portfolio = content.portfolio
  const reduce = usePrefersReducedMotion()
  const [show, setShow] = useState(true)
  const [count, setCount] = useState(0)

  const [minDone, setMinDone] = useState(false)

  // Minimum on-screen time for the animation…
  useEffect(() => {
    const total = reduce ? 300 : 1100
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => { const p = Math.min((t - start) / total, 1); setCount(Math.round(p * 100)); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    document.documentElement.style.overflow = 'hidden'
    const t1 = setTimeout(() => setMinDone(true), total + 100)
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); document.documentElement.style.overflow = '' }
  }, [reduce])

  // …and it only lifts once the cloud content has arrived (or timed out), so the site never visibly swaps text.
  useEffect(() => {
    if (!minDone || !ready) return
    setShow(false)
    const t2 = setTimeout(() => { markIntroDone(); document.documentElement.style.overflow = '' }, reduce ? 100 : 300)
    return () => clearTimeout(t2)
  }, [minDone, ready, reduce])

  const letters = portfolio.name.split('')
  return (
    <AnimatePresence>
      {show && (
        <motion.div role="status" aria-label={`Loading ${portfolio.name}`} className="fixed inset-0 z-[95] flex flex-col justify-between bg-background p-[var(--gutter)] text-foreground"
          exit={{ y: '-100%', transition: { duration: reduce ? 0.2 : 0.7, ease: easeInOut } }}>
          <p className="t-label flex justify-between"><span>{portfolio.title}</span><span>{portfolio.location}</span></p>
          <h1 aria-hidden className="t-display flex flex-wrap text-[clamp(3rem,11vw,12rem)] leading-[0.9]">
            {letters.map((ch, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
                <motion.span className="inline-block" initial={{ y: reduce ? 0 : '110%' }} animate={{ y: 0 }} transition={{ duration: 0.7, ease, delay: reduce ? 0 : 0.05 + i * 0.03 }}>
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              </span>
            ))}
            <span className="text-accent">.</span>
          </h1>
          <div className="flex items-end justify-between">
            <div className="h-px flex-1 bg-border"><div className="h-px bg-accent" style={{ width: `${count}%` }} /></div>
            <p className="t-display ml-6 text-5xl tabular-nums sm:text-7xl">{String(count).padStart(3, '0')}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
