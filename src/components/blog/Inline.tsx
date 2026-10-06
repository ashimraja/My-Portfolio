import type { ReactNode } from 'react'

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g
const safeHref = (h: string) => (/^(https?:|mailto:|\/|#)/i.test(h) ? h : '#')

/** Tiny inline markup for blog text: **bold**, *italic*, `code` and [label](url). Anything else is plain text (so nothing can inject HTML). */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = []
  text.split(TOKEN).forEach((part, i) => {
    if (!part) return
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) out.push(<code key={i} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.88em] text-foreground">{part.slice(1, -1)}</code>)
    else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) out.push(<strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>)
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) out.push(<em key={i}>{part.slice(1, -1)}</em>)
    else {
      const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (m) out.push(<a key={i} href={safeHref(m[2])} target={m[2].startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener" className="text-foreground underline decoration-accent underline-offset-4 transition-colors hover:text-accent">{m[1]}</a>)
      else out.push(part)
    }
  })
  return <>{out}</>
}
