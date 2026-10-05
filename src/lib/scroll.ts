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
