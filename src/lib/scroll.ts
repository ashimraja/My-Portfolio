import Lenis from 'lenis'

/** Singleton Lenis store so any component can scroll programmatically. */
let instance: Lenis | null = null
export const setLenis = (l: Lenis | null) => { instance = l }
export const getLenis = () => instance

export function scrollToTarget(target: string | number, opts: { immediate?: boolean; offset?: number } = {}) {
  const offset = opts.offset ?? 0
  if (instance) instance.scrollTo(target, { immediate: opts.immediate, offset, duration: 1.4 })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else document.querySelector(target)?.scrollIntoView({ block: 'start' })
}

/** Scroll to a section and keep it pinned to the top while the page settles: the work stage and the lazy resume change height after the first
 *  measure, which would otherwise leave an arrival at the wrong section. Stops at once if the user scrolls. */
export function landOnSection(hash: string, ms = 2500) {
  let live = true
  const stop = () => { live = false }
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
  for (const ev of evs) window.addEventListener(ev, stop, { once: true, passive: true })
  const t0 = performance.now()
  const tick = () => {
    const el = live && document.querySelector(hash)
    if (el) {
      const top = el.getBoundingClientRect().top
      if (Math.abs(top) > 2) {
        const y = window.scrollY + top
        instance?.resize() // the page just changed height; Lenis's own limit is stale until it re-measures, and would clamp or snap the scroll back
        window.scrollTo({ top: y, behavior: 'instant' }) // Lenis applies an immediate scroll on its next frame; this one lands in the same frame as the swap
        instance?.scrollTo(y, { immediate: true, force: true }) // and keeps Lenis's own position in step
      }
    }
    if (live && performance.now() - t0 < ms) setTimeout(tick, 50)
    else for (const ev of evs) window.removeEventListener(ev, stop)
  }
  tick()
}
