import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useLocation, type Location } from 'react-router-dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { easeInOut } from '@/lib/animations'
import { scrollToTarget } from '@/lib/scroll'

const DURATION = 0.8 // the sheet's single sweep up

/**
 * Route-level transition. The new page is mounted straight away as a full-screen sheet that swipes up over the old one (which dims), so its
 * content is already on it while it rises. When it lands, the sheet simply stops being a sheet — same element, so nothing remounts or
 * replays — and the old page is dropped. The navbar sits above the sheet. Only translateY and opacity move (smooth on phones).
 */
export function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation()
  const reduce = usePrefersReducedMotion()
  const sheetY = useMotionValue(100) // percent of the viewport height; 100 = parked below the screen
  const sheetTransform = useTransform(sheetY, (v) => `${v}%`)
  const dim = useMotionValue(0)
  const [pages, setPages] = useState<Location[]>([location]) // [current] normally; [old, incoming] while the sheet travels
  const latest = useRef(location)
  const busy = useRef(false)
  useEffect(() => { latest.current = location }, [location])

  useEffect(() => {
    const here = pages[pages.length - 1]
    if (location.pathname === here.pathname) { setPages((p) => [...p.slice(0, -1), location]); return } // same page (a hash or state change): no sheet
    if (busy.current) return // a sweep is already under way; it lands on whatever the latest location is
    if (reduce) { setPages([location]); if (!location.hash) scrollToTarget(0, { immediate: true }); return }
    busy.current = true
    sheetY.set(100); dim.set(0)
    setPages((p) => [p[p.length - 1], location])
    void Promise.all([
      animate(sheetY, 0, { duration: DURATION, ease: easeInOut }),
      animate(dim, 0.5, { duration: DURATION, ease: easeInOut }),
    ]).then(() => {
      const to = latest.current
      if (!to.hash) scrollToTarget(0, { immediate: true }) // the sheet fully covers the screen, so the old page jumping to the top is not seen
      setPages([to])
      dim.set(0); busy.current = false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `pages` is read for the current page only; a new location is what starts a sweep
  }, [location, reduce, sheetY, dim])

  const sweeping = pages.length > 1
  return (
    <>
      <motion.div style={{ opacity: dim }} aria-hidden className="pointer-events-none fixed inset-0 z-[49] bg-black" />
      {pages.map((loc, i) => {
        const sheet = sweeping && i === pages.length - 1
        return (
          <motion.div key={loc.pathname} style={{ y: sheet ? sheetTransform : 0 }} aria-hidden={sheet || undefined}
            className={sheet ? 'pointer-events-none fixed inset-0 z-50 overflow-hidden border-t border-foreground/10 bg-background shadow-[0_-30px_70px_-24px_rgba(0,0,0,0.4)] will-change-transform' : undefined}>
            {children(loc)}
          </motion.div>
        )
      })}
    </>
  )
}
