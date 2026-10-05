import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { usePortfolio } from '@/content/ContentProvider'

function Principle({ n, title, text }: { n: number; title: string; text: string }) {
  const ref = useRef<HTMLLIElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'start 40%'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1])
  const x = useTransform(scrollYProgress, [0, 1], [n % 2 ? -40 : 40, 0])
  const line = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <li ref={ref} className="relative overflow-x-clip py-8 md:py-14">
      <motion.div aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-border" style={{ scaleX: line }} />
      <motion.div style={{ opacity, x }} className="grid items-baseline gap-3 md:grid-cols-[6rem_1fr_22rem] md:gap-8">
        <span className="font-mono text-sm text-accent">{String(n + 1).padStart(2, '0')}</span>
        <h3 className="t-title-lg">{title}</h3>
        <p className="t-body max-w-sm">{text}</p>
      </motion.div>
    </li>
  )
}

export function Philosophy() {
  const { philosophy } = usePortfolio()
  return (
    <section id="philosophy" className="section rule" aria-labelledby="phil-title">
      <div className="container-x">
        <p className="t-label mb-6 flex items-center gap-3"><span className="text-accent">06</span><span aria-hidden className="h-px w-10 bg-border" />{philosophy.kicker}</p>
        <h2 id="phil-title" className="t-lead mb-10 max-w-xl !text-muted-foreground md:mb-16">{philosophy.title}</h2>
        <ol>{philosophy.principles.map((p, i) => <Principle key={p.title} n={i} {...p} />)}</ol>
      </div>
    </section>
  )
}
