import { Button } from '@/components/ui/Button'
import { ScrollWords } from '@/components/animations/ScrollWords'
import { Reveal } from '@/components/animations/Reveal'
import { RevealText } from '@/components/animations/RevealText'
import { usePortfolio } from '@/content/ContentProvider'
import { scrollToTarget } from '@/lib/scroll'
import { cleanHref, displayLink } from '@/lib/links'
import { ContactForm } from './ContactForm'

export function Contact() {
  const { contact, email, socials } = usePortfolio()
  return (
    <section id="contact" className="section rule" aria-labelledby="contact-h">
      <div className="container-x">
        <p className="t-label mb-8 flex items-center gap-3"><span className="text-accent">08</span><span aria-hidden className="h-px w-10 bg-border" />{contact.kicker}</p>
        <h2 id="contact-h" className="sr-only">{contact.headline} Let’s make it {contact.emphasis}</h2>
        <RevealText lines={[contact.headline.toUpperCase()]} className="t-label mb-4 !text-foreground" />
        <RevealText lines={['Let’s make it', `*${contact.emphasis}*`]} className="t-display t-hero" />
        <div className="mt-12 flex flex-wrap gap-4">
          <Button onClick={() => { scrollToTarget('#contact-form'); document.getElementById('name')?.focus({ preventScroll: true }) }} cursorLabel="WRITE">Start a project</Button>
          <Button variant="outline" href={`mailto:${email}`}>Email me</Button>
        </div>
        <div className="mt-20 grid gap-14 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <ScrollWords className="t-body max-w-xs" text={contact.text} />
            <dl className="mt-8 space-y-4">
              <div><dt className="t-label">Email</dt><dd><a className="text-lg underline decoration-border underline-offset-4 transition-colors hover:decoration-accent" href={`mailto:${email}`}>{email}</a></dd></div>
              {socials.map((s) => <div key={s.label}><dt className="t-label">{s.label}</dt><dd><a className="text-lg underline decoration-border underline-offset-4 transition-colors hover:decoration-accent" href={cleanHref(s.href)} target="_blank" rel="noreferrer noopener">{displayLink(s.label, s.href)}</a></dd></div>)}
            </dl>
          </Reveal>
          <Reveal className="scroll-mt-32 md:col-span-8"><div id="contact-form"><ContactForm /></div></Reveal>
        </div>
      </div>
    </section>
  )
}
