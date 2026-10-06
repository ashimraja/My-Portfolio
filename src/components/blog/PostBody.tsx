import { youtubeId } from '@/lib/blog'
import type { BlogBlock } from '@/types'
import { CodeBlock } from './CodeBlock'
import { Inline } from './Inline'
import { YouTubeEmbed } from './YouTubeEmbed'

const prose = 'text-[1.06rem] leading-[1.85] text-foreground/80 md:text-[1.15rem]'

function Block({ b }: { b: BlogBlock }) {
  const text = b.text ?? ''
  switch (b.type) {
    case 'heading': return <h2 className="t-title-lg mt-6 !text-[clamp(1.6rem,2.6vw,2.2rem)]">{text}</h2>
    case 'subheading': return <h3 className="t-title mt-2">{text}</h3>
    case 'paragraph': return <p className={`${prose} whitespace-pre-line`}><Inline text={text} /></p>
    case 'list': return (
      <ul className={`${prose} space-y-2`}>{text.split('\n').filter((l) => l.trim()).map((l, i) => <li key={i} className="flex gap-3"><span aria-hidden className="mt-[0.95em] h-px w-4 shrink-0 bg-accent" /><span><Inline text={l.replace(/^[-*•]\s+/, '')} /></span></li>)}</ul>
    )
    case 'quote': return (
      <blockquote className="border-l-2 border-accent pl-5 md:pl-7"><p className="t-title !font-normal italic text-foreground"><Inline text={text} /></p>{b.caption && <footer className="t-label mt-3">— {b.caption}</footer>}</blockquote>
    )
    case 'code': return text.trim() ? <CodeBlock code={text.replace(/\n$/, '')} language={b.language} filename={b.caption} /> : null
    case 'image': return b.src ? (
      <figure><img src={b.src} alt={b.caption ?? ''} loading="lazy" decoding="async" className="mx-auto block h-auto max-h-[22rem] w-auto max-w-full rounded-xl border border-border bg-surface" />{b.caption && <figcaption className="t-label mt-3 text-center">{b.caption}</figcaption>}</figure>
    ) : null
    case 'youtube': {
      const id = youtubeId(b.video)
      return id ? <figure><YouTubeEmbed id={id} title={b.caption || 'YouTube video'} />{b.caption && <figcaption className="t-label mt-3 text-center">{b.caption}</figcaption>}</figure> : null
    }
    default: return null
  }
}

/** Renders an article from its blocks. Unknown or empty blocks are skipped. */
export function PostBody({ blocks }: { blocks: BlogBlock[] }) {
  return <div className="space-y-7 md:space-y-9">{blocks.map((b, i) => <Block key={i} b={b} />)}</div>
}
