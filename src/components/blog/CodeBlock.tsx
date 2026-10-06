import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

/** Code with a language tag, optional file name and copy button. Plain text first; coloured as soon as the highlighter has loaded. */
export function CodeBlock({ code, language, filename }: { code: string; language?: string; filename?: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    void import('@/lib/highlight').then((m) => { if (alive) setHtml(m.highlightCode(code, language)) })
    return () => { alive = false }
  }, [code, language])

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* clipboard blocked */ }
  }

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-[#14130f]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-3 font-mono text-[0.72rem] text-muted-foreground">
          <span aria-hidden className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" /><i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" /><i className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" /></span>
          <span className="truncate">{filename || language || 'code'}</span>
        </span>
        <button type="button" onClick={copy} data-cursor="hover" className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[0.72rem] text-muted-foreground transition-colors hover:text-foreground">
          {copied ? <><Check size={13} aria-hidden /> Copied</> : <><Copy size={13} aria-hidden /> Copy</>}
        </button>
      </figcaption>
      <pre data-lenis-prevent tabIndex={0} className="overflow-x-auto p-4 font-mono text-[0.84rem] leading-[1.7] text-[#e6e0d2] md:p-5 md:text-[0.9rem]">
        {html !== null ? <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} /> : <code>{code}</code>}
      </pre>
    </figure>
  )
}
