import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'
import { ease } from '@/lib/animations'
import type { Testimonial } from '@/types'

export function Testimonials() {
  const items = useContent().content.testimonials.items
  return items.length ? <TestimonialSlider testimonials={items} /> : null
}

function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [[i, dir], setState] = useState<[number, number]>([0, 1])
  const t = testimonials[i]
  const go = (d: number) => setState(([n]) => [(n + d + testimonials.length) % testimonials.length, d])
  const mx = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 })
  const quoteX = useTransform(mx, [-1, 1], [-24, 24])
  const markX = useTransform(mx, [-1, 1], [30, -30])
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX - r.left) / r.width) * 2 - 1) }

  return (
    <section id="testimonials" className="section rule overflow-hidden" aria-labelledby="t-h" onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }}>
      <div className="container-x">
        <SectionHeading index="07" kicker="Kind words" title="What people say." />
        <span id="t-h" className="sr-only">Testimonials</span>
        <div className="relative mt-14 md:mt-20" onPointerMove={onMove}>
          <motion.span aria-hidden style={{ x: markX }} className="t-display pointer-events-none absolute -top-10 left-0 select-none text-[22rem] leading-none text-accent/15 md:-top-24 md:text-[36rem]">“</motion.span>
          <div className="relative min-h-[22rem] md:min-h-[26rem]" aria-live="polite">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.figure key={i} custom={dir} style={{ x: quoteX }}
                variants={{ enter: (d: number) => ({ opacity: 0, x: 80 * d }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: -80 * d }) }}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.55, ease }}>
                <blockquote className="max-w-4xl text-[clamp(1.5rem,2.8vw,2.4rem)] font-medium leading-snug tracking-tight">{t.quote}</blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface font-mono text-sm">{t.initials}</span>
                  <span><span className="block font-medium">{t.name}</span><span className="t-label">{t.role} · {t.company}</span></span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <div className="flex gap-2" role="group" aria-label="Choose testimonial">
              {testimonials.map((x, n) => (
                <button key={x.name} onClick={() => setState([n, n > i ? 1 : -1])} aria-label={`Show testimonial from ${x.name}`} aria-current={n === i} className="group py-3" data-cursor="hover">
                  <span className={`block h-[3px] rounded transition-all duration-500 ${n === i ? 'w-12 bg-accent' : 'w-6 bg-border group-hover:bg-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[[-1, ArrowLeft, 'Previous testimonial'], [1, ArrowRight, 'Next testimonial']].map(([d, Icon, label]) => {
                const I = Icon as typeof ArrowLeft
                return <button key={label as string} onClick={() => go(d as number)} aria-label={label as string} className="flex h-12 w-12 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent" data-cursor="hover"><I size={18} /></button>
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
