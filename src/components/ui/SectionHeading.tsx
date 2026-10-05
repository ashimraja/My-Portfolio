import { RevealText } from '@/components/animations/RevealText'

export function SectionHeading({ index, kicker, title, className = '' }: { index: string; kicker: string; title: string | string[]; className?: string }) {
  return (
    <header className={className}>
      <p className="t-label mb-6 flex items-center gap-3"><span className="text-accent">{index}</span><span aria-hidden className="h-px w-10 bg-border" />{kicker}</p>
      <RevealText as="h2" lines={title} className="t-display t-xl max-w-[16ch]" />
    </header>
  )
}
