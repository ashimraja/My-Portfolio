import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { buildFromSite } from '@/admin/resume/model'
import { ResumePage } from '@/admin/resume/ResumePage'
import { Reveal } from '@/components/animations/Reveal'
import { ScrollWords } from '@/components/animations/ScrollWords'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { track } from '@/lib/analytics'
import { useContent } from '@/content/ContentProvider'

const MM = 96 / 25.4

/** First A4 page, scaled to fit its column and faded out at the bottom. */
function PaperPreview({ data }: { data: ReturnType<typeof buildFromSite> }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useLayoutEffect(() => {
    const measure = () => box.current && setScale(Math.min(1, box.current.clientWidth / (210 * MM)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box.current!)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} aria-hidden className="relative w-full select-none overflow-hidden rounded-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10" style={{ height: 297 * MM * scale * 0.82 }}>
      <div className="origin-top-left bg-white" style={{ width: '210mm', transform: `scale(${scale})` }}><ResumePage data={data} /></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent" />
    </div>
  )
}

export default function ResumeSection() {
  const { content } = useContent()
  const data = useMemo(() => buildFromSite(content), [content])
  const { portfolio } = content

  const download = () => {
    track('resume_download')
    const prev = document.title
    document.title = `${data.name} - Resume`
    document.body.classList.add('resume-printing')
    const done = () => { document.body.classList.remove('resume-printing'); document.title = prev; window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    setTimeout(() => window.print(), 60)
  }

  const facts = [
    ['Role', portfolio.title],
    ['Based in', portfolio.location],
    ['Education', content.education.items[0] ? `${content.education.items[0].degree}, ${content.education.items[0].school}` : ''],
  ].filter(([, v]) => v)

  return (
    <section id="resume" className="section rule" aria-labelledby="resume-h">
      <div className="container-x">
        <SectionHeading index="06" kicker="Resume" title="The short version." />
        <span id="resume-h" className="sr-only">Resume</span>
        <div className="mt-14 grid grid-cols-1 items-center gap-12 md:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="min-w-0 lg:col-span-5">
            <ScrollWords className="t-lead" text={data.summary} />
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {facts.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6"><dt className="t-label">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button onClick={download} cursorLabel="PDF">Download PDF</Button>
              <Button variant="outline" href={`mailto:${portfolio.email}`}>Email me</Button>
            </div>
            <p className="t-label mt-5">Opens your print dialog: choose “Save as PDF”.</p>
          </Reveal>
          <Reveal variant="scale" className="mx-auto w-full min-w-0 max-w-[34rem] lg:col-span-7 lg:max-w-none lg:px-10 xl:px-20"><PaperPreview data={data} /></Reveal>
        </div>
      </div>
      {createPortal(<div id="resume-print-root"><ResumePage data={data} /></div>, document.body)}
    </section>
  )
}
