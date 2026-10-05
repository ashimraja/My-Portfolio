import { useEffect } from 'react'
import Lenis from 'lenis'
import { setLenis } from '@/lib/scroll'
import { usePrefersReducedMotion, useFinePointer } from './useMediaQuery'

/** Lenis on pointer devices only; native momentum scrolling is better on touch. */
export function useSmoothScroll() {
  const reduce = usePrefersReducedMotion()
  const fine = useFinePointer()
  useEffect(() => {
    if (reduce || !fine) return
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
    setLenis(lenis)
    let raf = 0
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setLenis(null) }
  }, [reduce, fine])
}
