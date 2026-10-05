import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { useRef } from 'react'
import { HeroHeadline } from './HeroHeadline'
import { usePortfolio } from '@/content/ContentProvider'
import { Availability } from './Availability'
import { DotField } from './DotField'
import { RoleTicker } from './RoleTicker'
import { scrollToTarget } from '@/lib/scroll'
import { useIntroDone } from '@/lib/intro'

export function Hero() {
  const { hero, title, location } = usePortfolio()
  const ref = useRef<HTMLElement>(null)
  const introDone = useIntroDone()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section id="top" ref={ref} aria-label="Introduction" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-32 sm:pb-14">
      <DotField />
      <motion.div style={{ y, opacity }} className="container-x relative w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ delay: 0.2 }} className="mb-8 sm:mb-12"><Availability /></motion.div>
        <h1 className="sr-only">{`${hero.greeting} ${hero.headline.prefix} ${hero.headline.words.join(', ')} ${hero.headline.lines.join(' ')}`}</h1>
        <p aria-hidden className="t-lead mb-4 !text-accent">{hero.greeting}</p>
        <HeroHeadline headline={hero.headline} />
        <div className="mt-10 flex flex-col justify-between gap-8 border-t border-border pt-6 sm:mt-14 md:flex-row md:items-end">
          <div className="space-y-3">
            <RoleTicker roles={hero.roles} />
            <p className="t-label">{title} · {location}</p>
          </div>
          <button onClick={() => scrollToTarget('#about')} className="group flex items-center gap-3 self-start font-mono text-xs text-muted-foreground transition-colors hover:text-foreground md:self-auto" data-cursor="hover" aria-label="Scroll to about section">
            {hero.scrollLabel}
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border">
              <ArrowDown size={16} className="animate-bounce" aria-hidden />
            </span>
          </button>
        </div>
      </motion.div>
    </section>
  )
}
