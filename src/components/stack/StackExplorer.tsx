import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Reveal } from '@/components/animations/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'
import { ease } from '@/lib/animations'

export function StackExplorer() {
  const { categories: stack, intro: stackIntro } = useContent().content.stack
  const [selected, setId] = useState('')
  const cat = stack.find((c) => c.id === selected) ?? stack[0]
  const id = cat?.id
  if (!cat) return null
  return (
    <section id="stack" className="section rule" aria-labelledby="stack-h">
      <div className="container-x">
        <SectionHeading index="03" kicker={stackIntro.kicker} title={stackIntro.title} />
        <span id="stack-h" className="sr-only">Stack</span>
        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12">
          <div role="tablist" aria-label="Technology categories" className="flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {stack.map((c, i) => (
              <button key={c.id} role="tab" id={`tab-${c.id}`} aria-selected={c.id === id} aria-controls="stack-panel" onClick={() => setId(c.id)}
                onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setId(stack[(i + 1) % stack.length].id); if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setId(stack[(i - 1 + stack.length) % stack.length].id) }}
                tabIndex={c.id === id ? 0 : -1}
                className={`group relative flex shrink-0 items-baseline gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-left transition-colors lg:rounded-none lg:border-0 lg:border-b lg:border-border lg:px-0 lg:py-3 ${c.id === id ? 'border-accent text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`} data-cursor="hover">
                <span className="hidden font-mono text-xs text-accent lg:inline">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-lg font-medium lg:text-2xl">{c.label}</span>
                <span className="hidden font-mono text-xs text-muted-foreground lg:ml-auto lg:inline">{c.items.length}</span>
              </button>
            ))}
          </div>
          <div id="stack-panel" role="tabpanel" aria-labelledby={`tab-${id}`} className="min-h-[24rem] lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div key={id} initial="hidden" animate="visible" exit={{ opacity: 0, transition: { duration: 0.15 } }} variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="t-label mb-6">{cat.blurb}</motion.p>
                <ul>
                  {cat.items.map((it, i) => (
                    <motion.li key={it.name} variants={{ hidden: { opacity: 0, y: 40, rotateX: -30 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease } } }}
                      className="group flex items-baseline justify-between gap-4 border-t border-border py-3 transition-colors hover:bg-surface-hover sm:py-4">
                      <span className="flex items-baseline gap-4"><span className="text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span><span className="t-title-lg transition-transform duration-500 group-hover:translate-x-3">{it.name}</span></span>
                      <span className="t-label text-right transition-colors group-hover:!text-accent">{it.note}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <Reveal className="mt-10"><p className="t-label">All categories & items live in src/data/skills.ts</p></Reveal>
      </div>
    </section>
  )
}
