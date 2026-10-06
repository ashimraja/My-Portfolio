import { useState, type ReactNode } from 'react'
import { ProjectVisual } from '@/components/ui/ProjectVisual'
import type { VisualSpec } from '@/types'

/** A minimal browser window: traffic-light dots and an address pill around whatever it wraps. */
export function BrowserFrame({ url, children, className = '' }: { url?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] ${className}`}>
      <div className="flex items-center gap-3 border-b border-border bg-background/60 px-3.5 py-2.5">
        <span aria-hidden className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" /><i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" /><i className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" /></span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-1 text-center font-mono text-[0.68rem] text-muted-foreground">{url || 'localhost'}</span>
      </div>
      {children}
    </div>
  )
}

/** One screenshot of a web application, in a browser frame (a drawn placeholder when the image is missing). */
export function BrowserShot({ image, visual, caption, index, url }: { image?: string; visual: VisualSpec; caption?: string; index: number; url?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="w-[82vw] shrink-0 sm:w-[28rem] lg:w-[36rem]">
      <BrowserFrame url={url}>
        {image && !failed
          ? <img src={image} alt={caption ?? `Screen ${index + 1}`} draggable={false} loading="lazy" decoding="async" onError={() => setFailed(true)} className="block aspect-[16/10] w-full object-cover object-top" />
          : <ProjectVisual visual={visual} label={caption ?? `Screen ${index + 1}`} className="block aspect-[16/10] w-full" />}
      </BrowserFrame>
      <figcaption className="t-label mt-3 text-center"><span className="text-accent">{String(index + 1).padStart(2, '0')}</span>{caption && ` — ${caption}`}</figcaption>
    </figure>
  )
}
