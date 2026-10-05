import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState('top')
  useEffect(() => {
    if (!enabled) return
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, enabled])
  return enabled ? active : ''
}
