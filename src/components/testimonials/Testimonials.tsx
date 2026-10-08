import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'
import type { Testimonial } from '@/types'

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function Testimonials() {
  const items = useContent().content.testimonials.items
  return items.length ? <TestimonialStack testimonials={items} /> : null
}

function QuoteCard({ t, i, n, p, dx, cardRef }: { t: Testimonial; i: number; n: number; p: MotionValue<number>; dx: number; cardRef: (el: HTMLElement | null) => void }) {
  const mid = (n - 1) / 2
  const k = useTransform(p, (v) => easeInOut(clamp((v - i * 0.05) / (1 - (n - 1) * 0.05))))
  const x = useTransform(k, (v) => dx * (1 - v))
  const y = useTransform(k, (v) => (1 - v) * (i - mid) * 10)
  const rotate = useTransform(k, (v) => (1 - v) * (i - mid) * 5)
  const scale = useTransform(k, (v) => 0.94 + 0.06 * v)
  return (
    <motion.figure ref={cardRef} style={{ x, y, rotate, scale, zIndex: n - i }}
      className="flex w-[82vw] shrink-0 snap-center flex-col justify-between gap-10 rounded-xl border border-border bg-surface p-7 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] sm:w-[26rem] sm:p-9">
      <blockquote className="text-[1.15rem] font-medium leading-snug tracking-tight sm:text-[1.3rem]"><span aria-hidden className="t-display mr-1 text-accent">“</span>{t.quote}</blockquote>
      <figcaption className="flex items-center gap-4">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-sm">{t.initials}</span>
        <span><span className="block font-medium">{t.name}</span><span className="t-label">{t.role} · {t.company}</span></span>
      </figcaption>
    </motion.figure>
  )
}

/** Quotes start piled up in the middle of the row and spread out side by side as the section scrolls into view; the row scrolls sideways when it overflows. */
function TestimonialStack({ testimonials }: { testimonials: Testimonial[] }) {
  const n = testimonials.length
  const row = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])
  const [dxs, setDxs] = useState<number[]>([])
  const { scrollYProgress } = useScroll({ target: row, offset: ['start 95%', 'start 35%'] })

  const measure = useCallback(() => {
    const r = row.current
    if (!r) return
    const centre = r.clientWidth / 2 // the pile sits in the middle of what is visible, i.e. the row at scrollLeft 0
    setDxs(cards.current.slice(0, n).map((el) => (el ? centre - (el.offsetLeft + el.offsetWidth / 2) : 0)))
  }, [n])
  useLayoutEffect(() => { measure() }, [measure])
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  return (
    <section id="testimonials" className="section rule overflow-hidden" aria-labelledby="t-h">
      <div className="container-x">
        <SectionHeading index="08" kicker="Kind words" title="What people say." />
        <span id="t-h" className="sr-only">Testimonials</span>
      </div>
      <div ref={row} className="mt-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex snap-x gap-5 overflow-x-auto px-[var(--gutter)] py-10 md:mt-20 md:gap-8" style={{ scrollPaddingInline: 'var(--gutter)' }}>
        {testimonials.map((t, i) => <QuoteCard key={t.name} t={t} i={i} n={n} p={scrollYProgress} dx={dxs[i] ?? 0} cardRef={(el) => { cards.current[i] = el }} />)}
        <div aria-hidden className="w-px shrink-0" />
      </div>
    </section>
  )
}
