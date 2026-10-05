import { useEffect, useRef, useState } from 'react'

/** IntersectionObserver hook. `once` keeps it true after first intersection. */
export function useInView<T extends Element>(opts: { once?: boolean; margin?: string } = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); if (opts.once) io.disconnect() } else if (!opts.once) setInView(false) },
      { rootMargin: opts.margin ?? '0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [opts.once, opts.margin])
  return [ref, inView] as const
}
