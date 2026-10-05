import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useLocation, type Location } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { easeInOut } from '@/lib/animations'
import { scrollToTarget } from '@/lib/scroll'

const content: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.6, duration: 0.01 } },
}
const curtain: Variants = {
  initial: { scaleY: 1, transformOrigin: 'top' },
  animate: { scaleY: 0, transformOrigin: 'top', transition: { duration: 0.7, ease: easeInOut, delay: 0.15 } },
  exit: { scaleY: 1, transformOrigin: 'bottom', transition: { duration: 0.55, ease: easeInOut } },
}

const labels: Record<string, string> = { '/': 'Index', '/after-hours': 'After Hours', '/admin': 'Dashboard' }

/** Route-level curtain wipe. Content never blocks: it is interactive as soon as the curtain lifts. */
export function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation()
  const { pathname } = location
  const label = labels[pathname] ?? (pathname.startsWith('/work') ? 'Case study' : '')
  useEffect(() => { if (!window.location.hash) scrollToTarget(0, { immediate: true }) }, [pathname])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} initial="initial" animate="animate" exit="exit">
        {/* Curtain is a sibling of the content, so hiding the old page never hides the curtain (no blink). */}
        <motion.div variants={curtain} aria-hidden className="pointer-events-none fixed inset-0 z-[80] flex items-end bg-accent p-6 text-accent-foreground">
          <span className="t-display t-xl">{label}</span>
        </motion.div>
        <motion.div variants={content}>{children(location)}</motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
