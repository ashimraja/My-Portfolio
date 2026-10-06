import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '@/components/animations/Reveal'
import { RevealText } from '@/components/animations/RevealText'
import { ScrollWords } from '@/components/animations/ScrollWords'
import { Footer } from '@/components/layout/Footer'
import { BrowserFrame } from '@/components/projects/BrowserFrame'
import { ScreenshotGallery } from '@/components/projects/ScreenshotGallery'
import { StoreButtons, platformsOf } from '@/components/projects/StoreButtons'
import { Button } from '@/components/ui/Button'
import { ProjectCover } from '@/components/ui/ProjectCover'
import { useContent } from '@/content/ContentProvider'
import { useSeo } from '@/hooks/useSeo'
import { KIND_LABEL, hostOf, kindOf } from '@/lib/projectKind'
import { CaseSection } from './CaseSection'

const Bullets = ({ items }: { items: string[] }) => (
  <Stagger as="ul" className="space-y-3">{items.map((r) => <StaggerItem as="li" key={r} className="flex gap-3"><span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-accent" />{r}</StaggerItem>)}</Stagger>
)

export default function ProjectPage() {
  const { slug = '' } = useParams()
  const projects = useContent().content.projects.items
  const p = projects.find((x) => x.slug === slug)
  useSeo(p?.title, p?.summary, `/work/${slug}`)
  if (!p) return <Navigate to="/" replace />
  const next = projects[(projects.findIndex((x) => x.slug === p.slug) + 1) % projects.length]
  const web = kindOf(p) === 'web'
  // The facts differ by kind: apps list the platforms they ship on, web apps the address they run at.
  const meta = [['Role', p.role], ['Type', KIND_LABEL[web ? 'web' : 'mobile']], web ? ['Live at', hostOf(p.liveUrl)] : ['Platforms', platformsOf(p.stores)], ['Year', p.year], ['Duration', p.duration], ['Team', p.team]].filter(([, v]) => v) as [string, string][]
  const webActions = (
    <div className="flex flex-wrap gap-3">
      {p.liveUrl && <Button href={p.liveUrl} external cursorLabel="OPEN">Visit live site</Button>}
      {p.repoUrl && <Button href={p.repoUrl} external variant="outline" cursorLabel="CODE">Source code</Button>}
    </div>
  )

  // Sections without data are skipped, and numbering follows what is left.
  const sections: { title: string; body: ReactNode }[] = [
    { title: 'Overview', body: <ScrollWords className="t-lead" text={p.summary} /> },
    p.highlights?.length && { title: 'What I did', body: <Bullets items={p.highlights} /> },
    p.challenges?.length && { title: 'Challenges & Solutions', body: (
      <div className="space-y-10">{p.challenges.map((c, i) => (
        <Reveal key={c.problem}>
          <p className="flex gap-3 text-lg font-medium"><span className="text-sm text-accent">P{i + 1}</span>{c.problem}</p>
          <div className="mt-3 border-l border-accent pl-4"><p className="t-label !text-foreground">Solution</p><ScrollWords className="t-body mt-1" text={c.solution} /></div>
        </Reveal>))}</div>) },
    p.features?.length && { title: 'Key Features', body: <Bullets items={p.features} /> },
    p.approach?.length && { title: 'Approach', body: <Bullets items={p.approach} /> },
    p.architecture?.length && { title: 'Architecture', body: (
      <Stagger className="divide-y divide-border border-y border-border">{p.architecture.map((a) => <StaggerItem key={a.layer} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr]"><span className="text-sm font-medium text-accent">{a.layer}</span><span>{a.detail}</span></StaggerItem>)}</Stagger>) },
    p.results?.length && { title: 'Impact', body: (
      <Stagger className="grid grid-cols-2 gap-8">{p.results.map((r) => <StaggerItem key={r.label}><p className="t-stat text-accent">{r.value}</p><p className="t-label mt-1">{r.label}</p></StaggerItem>)}</Stagger>) },
    { title: 'Technologies', body: (
      <Stagger as="ul" className="flex flex-wrap gap-2" gap={0.05}>{p.tech.map((t) => <StaggerItem as="li" key={t} className="rounded-full border border-border px-4 py-2 text-sm">{t}</StaggerItem>)}</Stagger>) },
    p.screenshots.length > 0 && { title: web ? 'Screens' : 'Screenshots', body: <ScreenshotGallery project={p} /> },
    (p.links.length > 0 || p.liveUrl || p.repoUrl || p.stores.appStore || p.stores.playStore) && { title: web ? 'Visit' : 'Get the app', body: (
      <>
        {web ? <div className={p.links.length ? 'mb-8' : ''}>{webActions}</div> : <StoreButtons stores={p.stores} className={p.links.length ? 'mb-8' : ''} />}
        <ul className="space-y-3">{p.links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer noopener" className="t-title-lg inline-flex items-center gap-3 transition-colors hover:text-accent">{l.label} <ArrowUpRight aria-hidden /></a></li>)}</ul>
      </>) },
  ].filter(Boolean) as { title: string; body: ReactNode }[]

  return (
    <>
      <article>
        <header className="container-x pt-36 md:pt-44">
          <Link to="/#work" className="t-label mb-10 inline-flex items-center gap-2 hover:!text-accent" data-cursor="hover"><ArrowLeft size={14} aria-hidden /> Selected work</Link>
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="t-label mb-4">{p.category}</p>
              <RevealText as="h1" lines={p.title} className="t-display t-hero" immediate delay={0.9} />
              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-6">
                {meta.map(([k, v]) => <div key={k}><dt className="t-label">{k}</dt><dd className="mt-1">{v}</dd></div>)}
              </dl>
              <div className="mt-8">{web ? webActions : <StoreButtons stores={p.stores} />}</div>
            </div>
            {/* The cover is a supporting visual, not the star: small card, the work is in the text below. */}
            <div className="md:col-span-5">
              {web
                ? <BrowserFrame url={hostOf(p.liveUrl)}><div className="aspect-[16/10] overflow-hidden"><ProjectCover project={p} className="h-full w-full" /></div></BrowserFrame>
                : <div className="aspect-[2/1] overflow-hidden rounded-lg border border-border"><ProjectCover project={p} className="h-full w-full" /></div>}
            </div>
          </div>
        </header>

        <div className="container-x mt-16">
          {sections.map((s, i) => <CaseSection key={s.title} n={i + 1} title={s.title}>{s.body}</CaseSection>)}
        </div>

        <Link to={`/work/${next.slug}`} className="group relative block overflow-hidden border-t border-border py-20 md:py-32" data-cursor="view" data-cursor-label="NEXT">
          <div className="container-x"><p className="t-label mb-4">Next case study</p>
            <p className="t-display t-hero transition-transform duration-700 group-hover:translate-x-4">{next.title}</p></div>
        </Link>
      </article>
      <Footer />
    </>
  )
}
