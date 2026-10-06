import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { formatDate, hasBody, readMinutes } from '@/lib/blog'
import type { BlogPost } from '@/types'

/** Editorial rows: date, title with summary, tags. Posts with content open their own page; link-only posts go to Medium. */
export function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <Stagger as="ul" className="border-t border-border">
      {posts.map((p) => {
        const inner = (
          <>
            <p className="t-label md:pt-2"><time dateTime={p.date}>{formatDate(p.date)}</time>{hasBody(p) && <span className="block md:mt-1">{readMinutes(p)} min read</span>}</p>
            <div className="min-w-0">
              <h3 className="t-title-lg flex items-start gap-3 transition-transform duration-500 group-hover:translate-x-2">{p.title}<ArrowUpRight aria-hidden className="mt-1.5 h-6 w-6 shrink-0 text-accent opacity-0 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100 md:h-8 md:w-8" /></h3>
              {p.excerpt && <p className="t-body mt-3 max-w-2xl">{p.excerpt}</p>}
            </div>
            <ul className="flex flex-wrap content-start items-start gap-2 md:justify-end md:pt-2" aria-label="Tags">{p.tags.slice(0, 3).map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.72rem]">{t}</li>)}{!hasBody(p) && p.mediumUrl && <li className="rounded-full border border-accent/60 px-3 py-1 font-mono text-[0.72rem] text-accent">Medium ↗</li>}</ul>
          </>
        )
        const cls = 'group grid gap-3 border-b border-border py-8 md:grid-cols-[11rem_1fr_16rem] md:gap-10 md:py-10'
        return (
          <StaggerItem as="li" key={p.slug}>
            {hasBody(p)
              ? <Link to={`/blog/${p.slug}`} className={cls} data-cursor="view" data-cursor-label="READ" aria-label={`${p.title}. Read article`}>{inner}</Link>
              : <a href={p.mediumUrl} target="_blank" rel="noreferrer noopener" className={cls} data-cursor="view" data-cursor-label="OPEN" aria-label={`${p.title}. Read on Medium`}>{inner}</a>}
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
