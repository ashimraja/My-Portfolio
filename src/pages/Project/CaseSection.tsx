import type { ReactNode } from 'react'
import { Reveal } from '@/components/animations/Reveal'

export function CaseSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-border py-12 md:grid-cols-12 md:gap-10 md:py-20" aria-labelledby={`cs-${n}`}>
      <div className="md:col-span-3">
        <Reveal><p className="t-label flex gap-3"><span className="text-accent">{String(n).padStart(2, '0')}</span></p>
          <h2 id={`cs-${n}`} className="t-title-lg mt-2">{title}</h2></Reveal>
      </div>
      <div className="min-w-0 md:col-span-8 md:col-start-5">{children}</div>
    </section>
  )
}
