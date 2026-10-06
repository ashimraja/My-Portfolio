import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealText } from '@/components/animations/RevealText'
import { ProjectCover } from '@/components/ui/ProjectCover'
import { KindToggle } from '@/components/ui/KindToggle'
import { useContent } from '@/content/ContentProvider'
import { scrollToTarget } from '@/lib/scroll'
import { KIND_LABEL, kindOf, type KindFilter } from '@/lib/projectKind'
import { platformsOf } from './StoreButtons'
import type { Project } from '@/types'

const idx = (n: number) => String(n + 1).padStart(2, '0')

function Panel({ p, i, total }: { p: Project; i: number; total: number }) {
  return (
    <Link to={`/work/${p.slug}`} data-cursor="view" data-cursor-label="VIEW" aria-label={`${p.title} — ${p.category}. Open case study`}
      className="group flex h-full w-[82vw] md:w-[min(72vw,60rem)] shrink-0 flex-col justify-center gap-6">
      <div className="relative aspect-[4/3] max-h-[52vh] md:aspect-[2/1] w-full overflow-hidden border border-border">
        <ProjectCover project={p} className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
        <span className="absolute left-4 top-4 font-mono text-xs text-white/80 mix-blend-difference">{idx(i)} / {idx(total - 1)}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h3 className="t-title-lg transition-transform duration-500 group-hover:translate-x-2">{p.title}</h3>
          <p className="t-label mt-2">{[p.category, kindOf(p) === 'web' ? KIND_LABEL.web : platformsOf(p.stores) || KIND_LABEL.mobile].filter(Boolean).join(' — ')}</p>
        </div>
        <ul className="flex flex-wrap gap-2 md:max-w-sm md:justify-end" aria-label="Technologies">
          {p.tech.slice(0, 4).map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.75rem]">{t}</li>)}
        </ul>
      </div>
    </Link>
  )
}

/** Vertical scroll drives a horizontal track (sticky pin) on every screen size, phones included. */
export function ProjectShowcase() {
  const { items, intro } = useContent().content.projects
  return items.length ? <ProjectShowcaseInner projects={items} projectsIntro={intro} /> : null
}

function ProjectShowcaseInner({ projects: all, projectsIntro }: { projects: Project[]; projectsIntro: { kicker: string; title: string } }) {
  const [filter, setFilter] = useState<KindFilter>('all')
  const counts: Record<KindFilter, number> = { all: all.length, mobile: all.filter((p) => kindOf(p) === 'mobile').length, web: all.filter((p) => kindOf(p) === 'web').length }
  const projects = filter === 'all' ? all : all.filter((p) => kindOf(p) === filter)
  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, (v) => -v * dist)
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const count = useTransform(scrollYProgress, (v) => idx(Math.min(projects.length - 1, Math.round(v * (projects.length - 1)))))

  useEffect(() => {
    const measure = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [projects.length]) // the observer only sees the track's own box, so re-measure when the list changes

  const intro = (
    <header className="w-[78vw] shrink-0 pr-6 md:w-[min(60vw,44rem)] md:pr-10">
      <p className="t-label mb-6 flex items-center gap-3"><span className="text-accent">01</span><span aria-hidden className="h-px w-10 bg-border" />{projectsIntro.kicker}</p>
      <RevealText as="h2" lines={projectsIntro.title} className="t-display t-xl" />
      <p className="t-label mt-8 flex items-center gap-3">Scroll <span aria-hidden className="h-px w-16 bg-accent" /></p>
    </header>
  )

  return (
    <section id="work" ref={wrap} aria-labelledby="work-title" style={{ height: dist + (typeof window === 'undefined' ? 0 : window.innerHeight) }} className="relative">
      <span id="work-title" className="sr-only">Selected work</span>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-28">
        <motion.div ref={track} style={{ x }} className="flex min-h-0 flex-1 items-center gap-8 pl-[var(--gutter)] pr-[12vw] md:gap-16 md:pr-[20vw] will-change-transform">
          {intro}
          {projects.map((p, i) => <Panel key={p.slug} p={p} i={i} total={projects.length} />)}
        </motion.div>
        <div className="container-x flex w-full items-center gap-4 pb-8 sm:gap-6">
          <div aria-hidden className="flex flex-1 items-center gap-4 sm:gap-6">
            <motion.span className="font-mono text-xs text-accent">{count}</motion.span>
            <div className="h-px flex-1 bg-border"><motion.div className="h-px origin-left bg-accent" style={{ scaleX: bar }} /></div>
            <span className="font-mono text-xs text-muted-foreground">{idx(projects.length - 1)}</span>
          </div>
          <KindToggle value={filter} onChange={(v) => { setFilter(v); if (wrap.current) scrollToTarget(wrap.current.getBoundingClientRect().top + window.scrollY, { immediate: true }) }} counts={counts} label="Show mobile or web projects" />
        </div>
      </div>
    </section>
  )
}

