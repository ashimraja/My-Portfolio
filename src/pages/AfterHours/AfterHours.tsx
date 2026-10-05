import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '@/components/animations/Reveal'
import { RevealText } from '@/components/animations/RevealText'
import { Lamp } from '@/components/afterhours/Lamp'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/layout/Footer'
import { useContent } from '@/content/ContentProvider'
import { scrollToTarget } from '@/lib/scroll'
import { useSeo } from '@/hooks/useSeo'

export default function AfterHours() {
  const c = useContent().content.afterHours
  useSeo('After Hours', c.text, '/after-hours')
  // Night room: swap the palette tokens at the root while this page is mounted.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = 'night'
    return () => { delete document.documentElement.dataset.theme }
  }, [])
  const navigate = useNavigate()
  // Go back to wherever the visitor came from; fall back to home on a direct visit.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))

  return (
    <>
      <button onClick={goBack} data-cursor="hover" className="fixed left-4 top-4 z-[60] flex items-center gap-2 rounded-full border border-border bg-background/70 px-5 py-3 text-sm font-medium backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:left-6 sm:top-6">
        <ArrowLeft size={16} aria-hidden /> Go back
      </button>
      <main id="main" className="relative">
        <section aria-label="After Hours" className="relative flex min-h-[100svh] items-end justify-center overflow-clip pb-[9vh] pt-32 text-center">
          <Lamp />
          <div className="container-x relative w-full">
            <p className="t-label mb-8 flex items-center justify-center gap-3 !text-foreground">
              <span aria-hidden className="pulse-dot h-2 w-2 rounded-full bg-accent" />
              {c.kicker} · {c.lampHint}
            </p>
            <h1 className="sr-only">{c.headline.join(' ')}</h1>
            <RevealText immediate delay={0.9} lines={c.headline} className="t-display t-hero" />
            <Reveal delay={1.6}><p className="t-body mx-auto mt-8 max-w-lg">{c.text}</p></Reveal>
            <Reveal delay={1.8}><div className="mt-8 flex flex-wrap justify-center gap-4"><Button to="/#contact">{c.cta.primary}</Button>{c.projects.length > 0 && <Button variant="outline" onClick={() => scrollToTarget('#side-projects')}>{c.cta.secondary}</Button>}</div></Reveal>
          </div>
        </section>

        {c.projects.length > 0 && <section id="side-projects" className="border-t border-border py-20 md:py-32" aria-labelledby="side-h">
          <div className="container-x mx-auto max-w-4xl text-center">
            <h2 id="side-h" className="t-display t-xl mb-14">{c.projectsTitle}</h2>
            <Stagger as="ul" className="border-t border-border">
              {c.projects.map((p, i) => (
                <StaggerItem as="li" key={p.title} className="border-b border-border">
                  <a href={p.href} target="_blank" rel="noreferrer noopener" data-cursor="view" data-cursor-label="OPEN" className="group flex flex-col items-center gap-3 py-10 md:py-14">
                    <span className="text-xs font-medium text-accent">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t-title-lg flex items-center gap-3 transition-transform duration-500 group-hover:scale-[1.03]">
                      {p.title}<ArrowUpRight aria-hidden className="h-7 w-7 opacity-0 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100 md:h-10 md:w-10" />
                    </span>
                    <span className="t-body max-w-xl">{p.blurb}</span>
                    <span className="t-label">{p.tech.join(' · ')} — {p.year} — <span className="text-foreground">{p.status}</span></span>
                  </a>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>}

        <section className="border-t border-border py-20 text-center md:py-32" aria-label="Contact">
          <div className="container-x">
            <RevealText as="h2" lines={['Got an idea?', '*Let’s build it.*']} className="t-display t-xl" />
            <div className="mt-10 flex justify-center"><Button to="/#contact">{c.cta.primary}</Button></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
