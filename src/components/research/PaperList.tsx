import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { formatDate } from '@/lib/research'
import type { ResearchPaper } from '@/types'

/** Editorial rows like the blog list: date and venue, title with authors and abstract, tags. */
export function PaperList({ papers }: { papers: ResearchPaper[] }) {
  return (
    <Stagger as="ul" className="border-t border-border">
      {papers.map((p) => (
        <StaggerItem as="li" key={p.slug}>
          <Link to={`/research/${p.slug}`} className="group grid gap-3 border-b border-border py-8 md:grid-cols-[11rem_1fr_16rem] md:gap-10 md:py-10" data-cursor="view" data-cursor-label="READ" aria-label={`${p.title}. Open paper`}>
            <p className="t-label md:pt-2"><time dateTime={p.date}>{formatDate(p.date)}</time>{p.venue && <span className="block md:mt-1">{p.venue}</span>}</p>
            <div className="min-w-0">
              <h3 className="t-title-lg flex items-start gap-3 transition-transform duration-500 group-hover:translate-x-2">{p.title}<ArrowUpRight aria-hidden className="mt-1.5 h-6 w-6 shrink-0 text-accent opacity-0 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100 md:h-8 md:w-8" /></h3>
              {p.authors.length > 0 && <p className="t-label mt-3">{p.authors.join(', ')}</p>}
              {p.abstract && <p className="t-body mt-3 line-clamp-3 max-w-2xl">{p.abstract}</p>}
            </div>
            <ul className="flex flex-wrap content-start items-start gap-2 md:justify-end md:pt-2" aria-label="Tags">{p.tags.slice(0, 3).map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.72rem]">{t}</li>)}</ul>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
