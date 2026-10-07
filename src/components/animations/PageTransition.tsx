import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useLocation, type Location } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { easeInOut } from '@/lib/animations'
import { usePortfolio } from '@/content/ContentProvider'
import { scrollToTarget } from '@/lib/scroll'

const content: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.6, duration: 0.01 } },
}
// Slides with translateY (compositor-only) rather than scaleY, which re-rasterised the label on every frame and lagged on phones.
const curtain: Variants = {
  initial: { y: '0%' },
  animate: { y: '-100%', transition: { duration: 0.7, ease: easeInOut, delay: 0.15 } },
  exit: { y: ['100%', '0%'], transition: { duration: 0.55, ease: easeInOut } },
}

const labels: Record<string, string> = { '/blog': 'Blog', '/after-hours': 'After Hours', '/admin': 'Dashboard' }

/** Route-level curtain wipe. Content never blocks: it is interactive as soon as the curtain lifts. */
export function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation()
  const { pathname } = location
  const { name } = usePortfolio()
  // The word shown on the sliding panel: the page you are going to (home shows your name).
  const label = pathname === '/' ? name : labels[pathname] ?? (pathname.startsWith('/work') ? 'Case study' : pathname.startsWith('/blog') ? 'Article' : '')
  useEffect(() => { if (!window.location.hash) scrollToTarget(0, { immediate: true }) }, [pathname])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} initial="initial" animate="animate" exit="exit">
        {/* Curtain is a sibling of the content, so hiding the old page never hides the curtain (no blink). */}
        <motion.div variants={curtain} aria-hidden className="pointer-events-none fixed inset-0 z-[80] flex items-end bg-accent p-6 text-accent-foreground will-change-transform">
          <span className="t-display t-xl">{label}</span>
        </motion.div>
        <motion.div variants={content}>{children(location)}</motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
