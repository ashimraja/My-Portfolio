import { KIND_LABEL, kindOf } from '@/lib/projectKind'
import { platformsOf } from './StoreButtons'
import type { Project } from '@/types'

/** Title, category line and tech chips shown under a project cover. */
export function ProjectCaption({ p, stacked = false }: { p: Project; stacked?: boolean }) {
  return (
    <div className={`grid gap-4 ${stacked ? '' : 'md:grid-cols-[1fr_auto] md:items-end'}`}>
      <div>
        <h3 className="t-title-lg transition-transform duration-500 group-hover:translate-x-2">{p.title}</h3>
        <p className="t-label mt-2">{[p.category, kindOf(p) === 'web' ? KIND_LABEL.web : platformsOf(p.stores) || KIND_LABEL.mobile].filter(Boolean).join(' — ')}</p>
      </div>
      <ul className={`flex flex-wrap gap-2 ${stacked ? '' : 'md:max-w-sm md:justify-end'}`} aria-label="Technologies">
        {p.tech.slice(0, 4).map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.75rem]">{t}</li>)}
      </ul>
    </div>
  )
}
