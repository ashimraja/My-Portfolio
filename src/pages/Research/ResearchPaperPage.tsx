import { ArrowLeft, ArrowUpRight, FileText } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { RevealText } from '@/components/animations/RevealText'
import { PostBody } from '@/components/blog/PostBody'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useContent } from '@/content/ContentProvider'
import { useSeo } from '@/hooks/useSeo'
import { formatDate, hasPaperBody, publishedPapers } from '@/lib/research'

export default function ResearchPaperPage() {
  const { slug = '' } = useParams()
  const papers = publishedPapers(useContent().content.research.items)
  const paper = papers.find((p) => p.slug === slug) // unpublished papers have no public page
  useSeo(paper?.title, paper?.abstract, `/research/${slug}`)
  if (!paper) return <Navigate to="/research" replace />

  const next = papers.length > 1 ? papers[(papers.findIndex((p) => p.slug === paper.slug) + 1) % papers.length] : undefined
  const doiUrl = paper.doi ? `https://doi.org/${paper.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}` : ''

  return (
    <>
      <article>
        <header className="container-x pt-36 md:pt-44">
          <Link to="/research" className="t-label mb-10 inline-flex items-center gap-2 hover:!text-accent" data-cursor="hover"><ArrowLeft size={14} aria-hidden /> All research</Link>
          <div className="mx-auto max-w-4xl">
            {paper.tags.length > 0 && <ul className="mb-6 flex flex-wrap content-start items-start gap-2" aria-label="Tags">{paper.tags.map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.72rem]">{t}</li>)}</ul>}
            <RevealText as="h1" lines={paper.title} className="t-display t-xl" immediate delay={0.9} />
            {paper.authors.length > 0 && <p className="t-lead mt-8">{paper.authors.join(', ')}</p>}
            <p className="t-label mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <time dateTime={paper.date}>{formatDate(paper.date)}</time>
              {paper.venue && <><span aria-hidden className="h-px w-6 bg-border" />{paper.venue}</>}
              {doiUrl && <><span aria-hidden className="h-px w-6 bg-border" /><a href={doiUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-foreground underline decoration-accent underline-offset-4 hover:text-accent">DOI {paper.doi} <ArrowUpRight size={13} aria-hidden /></a></>}
            </p>
            {(paper.pdfUrl || paper.link) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {paper.pdfUrl && <Button href={paper.pdfUrl} external cursorLabel="OPEN"><FileText size={16} aria-hidden /> Read the PDF</Button>}
                {paper.link && <Button href={paper.link} external variant="outline" cursorLabel="OPEN">View original</Button>}
              </div>
            )}
          </div>
          {paper.cover && <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border border-border"><img src={paper.cover} alt="" className="block h-auto w-full" /></div>}
        </header>

        <div className="container-x mt-14 md:mt-20">
          <div className="mx-auto max-w-3xl">
            {paper.abstract && (
              <section aria-labelledby="abstract-h" className="mb-12">
                <h2 id="abstract-h" className="t-label mb-4">Abstract</h2>
                <p className="text-[1.06rem] leading-[1.85] text-foreground/80 md:text-[1.15rem]">{paper.abstract}</p>
              </section>
            )}
            {hasPaperBody(paper) && <PostBody blocks={paper.blocks} />}
          </div>
        </div>

        {next && (
          <Link to={`/research/${next.slug}`} className="group relative mt-20 block overflow-hidden border-t border-border py-20 md:py-32" data-cursor="view" data-cursor-label="NEXT">
            <div className="container-x"><p className="t-label mb-4">Next paper</p>
              <p className="t-display t-hero max-w-[18ch] transition-transform duration-700 group-hover:translate-x-4">{next.title}</p></div>
          </Link>
        )}
      </article>
      <Footer />
    </>
  )
}
