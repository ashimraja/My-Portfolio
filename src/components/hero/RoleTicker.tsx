import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ease } from '@/lib/animations'

/** Cycles roles. Screen readers get the full list statically. */
export function RoleTicker({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % roles.length), 2400); return () => clearInterval(t) }, [roles.length])
  return (
    <div>
      <p className="sr-only">{roles.join(', ')}</p>
      <div aria-hidden className="relative h-[1.9em] w-[min(36rem,calc(100vw-2*var(--gutter)))] overflow-hidden leading-[1.9] font-mono text-sm sm:text-base">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={i} className="absolute left-0 top-0 whitespace-nowrap" initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '-110%' }} transition={{ duration: 0.7, ease }}>
            <span className="text-accent">/ </span>{roles[i]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
