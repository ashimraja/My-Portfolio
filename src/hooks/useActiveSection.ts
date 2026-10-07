import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'

/**
 * The active section is the last one whose top has passed the middle of the viewport.
 * Sections are looked up on every update because some (the resume) are lazy-loaded and mount after this hook runs.
 */
export function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState('top')
  useEffect(() => {
    if (!enabled) return
    const update = () => {
      const line = window.innerHeight * 0.45
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
      if (current !== 'top') track('section', current, { once: true })
    }
    const schedule = update // cheap: a handful of rect reads, and setState bails out when the section is unchanged
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const mo = new MutationObserver(schedule) // a lazy section mounting shifts the layout without a scroll event
    mo.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); mo.disconnect() }
  }, [ids, enabled])
  return enabled ? active : ''
}
