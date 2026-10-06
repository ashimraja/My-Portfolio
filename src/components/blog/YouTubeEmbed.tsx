import { Play } from 'lucide-react'
import { useState } from 'react'

/** Click-to-play video: shows the thumbnail and loads the player (privacy-friendly domain) only when asked, so the page stays fast. */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false)
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
      {on ? (
        <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`Play video: ${title}`} data-cursor="view" data-cursor-label="PLAY" className="group absolute inset-0 h-full w-full">
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-80 transition-[opacity,transform] duration-700 group-hover:scale-[1.03] group-hover:opacity-100" />
          <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl transition-transform duration-300 group-hover:scale-110"><Play size={26} aria-hidden className="translate-x-0.5 fill-current" /></span></span>
        </button>
      )}
    </div>
  )
}
