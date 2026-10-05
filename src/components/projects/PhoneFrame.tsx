import { useState } from 'react'
import { ProjectVisual } from '@/components/ui/ProjectVisual'
import type { VisualSpec } from '@/types'

/** Device frame for app screenshots. Uses `image` when provided, otherwise draws a placeholder screen. */
export function PhoneFrame({ image, visual, caption, index }: { image?: string; visual: VisualSpec; caption?: string; index: number }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="w-[42vw] shrink-0 sm:w-[10rem] lg:w-[11rem]">
      {image && !failed
        // Real screenshots are shown as-is (many already contain their own device frame or store-style artwork).
        ? <img src={image} alt={caption ?? `Screen ${index + 1}`} draggable={false} loading="lazy" decoding="async" onError={() => setFailed(true)}
            className="block h-auto w-full rounded-[1.4rem] border border-border bg-surface shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]" />
        : (
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.2rem] border-[6px] border-foreground/90 bg-background shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            <ProjectVisual visual={visual} label={caption ?? `Screen ${index + 1}`} className="h-full w-full" />
            <div aria-hidden className="absolute inset-x-5 bottom-8 space-y-2">
              <div className="h-2.5 w-2/3 rounded-full bg-white/70" /><div className="h-2 w-1/2 rounded-full bg-white/30" />
              <div className="mt-3 h-10 rounded-xl bg-white/20 backdrop-blur-sm" />
            </div>
            <span aria-hidden className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          </div>
        )}
      <figcaption className="t-label mt-3 text-center"><span className="text-accent">{String(index + 1).padStart(2, '0')}</span>{caption && ` — ${caption}`}</figcaption>
    </figure>
  )
}
