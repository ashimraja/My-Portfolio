import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'
import { ease } from '@/lib/animations'
import { useIsDesktop } from '@/hooks/useMediaQuery'

export function ExperienceTimeline() {
  const { items: experience, intro: experienceIntro } = useContent().content.experience
  const [active, setActive] = useState(0)
  const desktop = useIsDesktop()
  const listRef = useRef<HTMLOListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 60%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    itemRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="experience" className="section rule" aria-labelledby="exp-h">
      <div className="container-x">
        <SectionHeading index="04" kicker={experienceIntro.kicker} title={experienceIntro.title} />
        <span id="exp-h" className="sr-only">Experience</span>
        <div className="relative mt-16 md:mt-24">
          <div aria-hidden className="absolute bottom-0 left-[calc(0.3125rem-0.5px)] top-0 w-px bg-border md:left-[calc(25%-1px)]">
            <motion.div className="h-full w-full origin-top bg-accent will-change-transform" style={{ scaleY: desktop ? progress : scrollYProgress }} />
          </div>
          <ol ref={listRef} className="relative">
            {experience.map((e, i) => {
              const on = i === active
              const open = on || !desktop
              return (
                <li key={e.company} ref={(el) => { itemRefs.current[i] = el }} data-i={i} className="grid gap-4 pb-16 pl-8 md:min-h-[46vh] md:grid-cols-[25%_1fr] md:gap-0 md:pb-24 md:pl-0">
                  <div className="md:pr-10 md:text-right">
                    <p className={`t-stat transition-all duration-700 ${on ? 'text-accent' : 'text-muted-foreground/60'}`}>{e.start}<span className="md:block"><span className="md:hidden"> — </span>{e.end}</span></p>
                  </div>
                  <div className="relative md:pl-14">
                    <span aria-hidden className={`absolute -left-8 top-3 h-2.5 w-2.5 rounded-full border transition-all duration-500 will-change-transform md:-left-[0.35rem] ${on ? 'border-accent bg-accent md:scale-150' : 'border-muted-foreground bg-background'}`} />
                    <div className={`lg:transition-opacity lg:duration-700 ${on ? 'opacity-100' : 'lg:opacity-45'}`}>
                      <h3 className="t-title-lg">{e.role}</h3>
                      <p className="t-label mt-3 !text-foreground">{e.company} <span className="text-muted-foreground">· {e.period}</span></p>
                    </div>
                    <div className="grid transition-[grid-template-rows] duration-700" style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: `cubic-bezier(${ease.join(',')})` }}>
                      <div className="overflow-hidden">
                        <p className="t-body mt-5 max-w-xl">{e.summary}</p>
                        <ul className="mt-5 space-y-2">
                          {e.achievements.map((a, n) => (
                            <li key={a} className="flex gap-3 text-sm transition-all duration-700 sm:text-base" style={{ transitionDelay: open ? `${150 + n * 90}ms` : '0ms', opacity: open ? 1 : 0, transform: open ? 'none' : 'translateY(12px)' }}>
                              <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-accent" />{a}
                            </li>
                          ))}
                        </ul>
                        {e.tech?.length ? <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
                          {e.tech.map((t, n) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.75rem] transition-all duration-500" style={{ transitionDelay: open ? `${300 + n * 70}ms` : '0ms', opacity: open ? 1 : 0, transform: open ? 'none' : 'scale(0.8)' }}>{t}</li>)}
                        </ul> : null}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
