import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealText } from '@/components/animations/RevealText'
import { ProjectCover } from '@/components/ui/ProjectCover'
import { useContent } from '@/content/ContentProvider'
import { platformsOf } from './StoreButtons'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import type { Project } from '@/types'

const idx = (n: number) => String(n + 1).padStart(2, '0')

function Panel({ p, i, total }: { p: Project; i: number; total: number }) {
  return (
    <Link to={`/work/${p.slug}`} data-cursor="view" data-cursor-label="VIEW" aria-label={`${p.title} — ${p.category}. Open case study`}
      className="group flex h-full w-[min(72vw,60rem)] shrink-0 flex-col justify-center gap-6">
      <div className="relative aspect-[2/1] max-h-[52vh] w-full overflow-hidden border border-border">
        <ProjectCover project={p} className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
        <span className="absolute left-4 top-4 font-mono text-xs text-white/80 mix-blend-difference">{idx(i)} / {idx(total - 1)}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h3 className="t-title-lg transition-transform duration-500 group-hover:translate-x-2">{p.title}</h3>
          <p className="t-label mt-2">{[p.category, platformsOf(p.stores)].filter(Boolean).join(' — ')}</p>
        </div>
        <ul className="flex flex-wrap gap-2 md:max-w-sm md:justify-end" aria-label="Technologies">
          {p.tech.slice(0, 4).map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.75rem]">{t}</li>)}
        </ul>
      </div>
    </Link>
  )
}

/** Desktop: vertical scroll drives a horizontal track (sticky pin). Mobile: plain vertical stack. */
export function ProjectShowcase() {
  const { items, intro } = useContent().content.projects
  return items.length ? <ProjectShowcaseInner projects={items} projectsIntro={intro} /> : null
}

function ProjectShowcaseInner({ projects, projectsIntro }: { projects: Project[]; projectsIntro: { kicker: string; title: string } }) {
  const desktop = useIsDesktop()
  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, (v) => -v * dist)
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const count = useTransform(scrollYProgress, (v) => idx(Math.min(projects.length - 1, Math.round(v * (projects.length - 1)))))

  useEffect(() => {
    if (!desktop) return
    const measure = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [desktop])

  const intro = (
    <header className="w-[min(60vw,44rem)] shrink-0 pr-10">
      <p className="t-label mb-6 flex items-center gap-3"><span className="text-accent">02</span><span aria-hidden className="h-px w-10 bg-border" />{projectsIntro.kicker}</p>
      <RevealText as="h2" lines={projectsIntro.title} className="t-display t-xl" />
      <p className="t-label mt-8 flex items-center gap-3">Scroll <span aria-hidden className="h-px w-16 bg-accent" /></p>
    </header>
  )

  if (!desktop) {
    return (
      <section id="work" className="section" aria-labelledby="work-title">
        <div className="container-x">
          <p className="t-label mb-6 flex items-center gap-3"><span className="text-accent">02</span><span aria-hidden className="h-px w-10 bg-border" />{projectsIntro.kicker}</p>
          <RevealText as="h2" lines={projectsIntro.title} className="t-display t-xl mb-12" />
          <span id="work-title" className="sr-only">Selected work</span>
          <div className="space-y-14">
            {projects.map((p, i) => (
              <Link key={p.slug} to={`/work/${p.slug}`} className="group block" aria-label={`${p.title}. Open case study`}>
                <div className="aspect-[2/1] overflow-hidden border border-border"><ProjectCover project={p} className="h-full w-full" /></div>
                <p className="t-label mt-4"><span className="text-accent">{idx(i)}</span> — {p.category}</p>
                <h3 className="t-title-lg mt-1 flex items-center justify-between">{p.title}<ArrowUpRight aria-hidden className="text-accent" /></h3>
                <p className="t-body mt-2">{p.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="work" ref={wrap} aria-labelledby="work-title" style={{ height: dist + window.innerHeight }} className="relative">
      <span id="work-title" className="sr-only">Selected work</span>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-28">
        <motion.div ref={track} style={{ x }} className="flex min-h-0 flex-1 items-center gap-16 pl-[var(--gutter)] pr-[20vw] will-change-transform">
          {intro}
          {projects.map((p, i) => <Panel key={p.slug} p={p} i={i} total={projects.length} />)}
        </motion.div>
        <div className="container-x flex w-full items-center gap-6 pb-8" aria-hidden>
          <motion.span className="font-mono text-xs text-accent">{count}</motion.span>
          <div className="h-px flex-1 bg-border"><motion.div className="h-px origin-left bg-accent" style={{ scaleX: bar }} /></div>
          <span className="font-mono text-xs text-muted-foreground">{idx(projects.length - 1)}</span>
        </div>
      </div>
    </section>
  )
}
