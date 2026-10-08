import { CountUp } from '@/components/animations/CountUp'
import { Parallax } from '@/components/animations/Parallax'
import { Reveal, Stagger, StaggerItem } from '@/components/animations/Reveal'
import { RevealText } from '@/components/animations/RevealText'
import { usePortfolio } from '@/content/ContentProvider'
import { ScrollWords } from '@/components/animations/ScrollWords'
import { AboutPhoto } from './AboutPhoto'
import { CubeGame } from './CubeGame'

export function About() {
  const { about, stats } = usePortfolio()
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container-x">
        <p className="t-label mb-8 flex items-center gap-3"><span className="text-accent">02</span><span aria-hidden className="h-px w-10 bg-border" />{about.kicker}</p>
        <h2 id="about-title" className="sr-only">{about.words.join(' ')}</h2>
        <div className="grid items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div aria-hidden className="t-display t-hero">
              {about.words.map((w, i) => (
                <Parallax key={w} speed={i % 2 ? 10 : -10} className={`pb-[0.06em] ${i === 1 ? 'md:pl-[14vw]' : i === 2 ? 'md:pl-[4vw]' : ''}`}>
                  <RevealText as="div" lines={w} tone={i === about.words.length - 1 ? 'strong' : 'dim'} />
                </Parallax>
              ))}
            </div>

          </div>
          <div className="w-full md:col-span-5 md:flex md:justify-end"><Reveal className="w-full"><CubeGame /></Reveal></div>
        </div>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-5"><ScrollWords className="t-lead" text={about.intro} /><AboutPhoto /></div>
          <div className="space-y-6 md:col-span-6 md:col-start-7">
            {about.paragraphs.map((p) => <ScrollWords key={p} className="t-body" text={p} />)}
            <Stagger className="mt-10 divide-y divide-border border-y border-border">
              {about.focus.map((f) => (
                <StaggerItem key={f.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <span className="t-label">{f.label}</span><span>{f.text}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>

        <Stagger className="mt-20 grid grid-cols-2 gap-px border border-border bg-border md:mt-28 md:grid-cols-4" gap={0.1}>
          {stats.map((s) => (
            <StaggerItem key={s.label} className="bg-background p-5 sm:p-8">
              <p className="t-stat"><CountUp value={s.value} suffix={s.suffix} /></p>
              <p className="t-label mt-3">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
