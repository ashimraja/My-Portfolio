import { motion } from 'framer-motion'
import { HeroHeadline } from './HeroHeadline'
import { usePortfolio } from '@/content/ContentProvider'
import { Availability } from './Availability'
import { RoleTicker } from './RoleTicker'
import { useIntroDone } from '@/lib/intro'

/** The hero's text block; shared by the standalone hero and the desktop hero-to-work stage. */
export function HeroCopy() {
  const { hero, title, location } = usePortfolio()
  const introDone = useIntroDone()
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ delay: 0.2 }} className="mb-8 sm:mb-12"><Availability /></motion.div>
      <h1 className="sr-only">{`${hero.greeting} ${hero.headline.prefix} ${hero.headline.words.join(', ')} ${hero.headline.lines.join(' ')}`}</h1>
      <p aria-hidden data-cursor-text className="t-lead mb-4 !text-foreground/55">{hero.greeting}</p>
      <HeroHeadline headline={hero.headline} />
      <div className="mt-10 border-t border-border pt-6 sm:mt-14">
        <div className="space-y-3">
          <RoleTicker roles={hero.roles} />
          <p className="t-label">{title} · {location}</p>
        </div>
      </div>
    </>
  )
}
