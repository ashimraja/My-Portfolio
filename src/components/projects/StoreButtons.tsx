import { Apple, Play } from 'lucide-react'
import type { Project } from '@/types'

const base = 'group inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-3 transition-colors duration-300 hover:border-accent hover:bg-surface-hover'

/** App Store / Google Play badges — only the stores present in project.stores render. */
export function StoreButtons({ stores, className = '' }: { stores: Project['stores']; className?: string }) {
  if (!stores.appStore && !stores.playStore) return null
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {stores.appStore && (
        <a href={stores.appStore} target="_blank" rel="noreferrer noopener" className={base} data-cursor="hover" data-cursor-label="OPEN" aria-label="Download on the App Store">
          <Apple size={26} aria-hidden className="transition-colors group-hover:text-accent" />
          <span className="leading-tight"><span className="t-label block !text-[0.68rem]">Download on the</span><span className="block text-lg font-medium">App Store</span></span>
        </a>
      )}
      {stores.playStore && (
        <a href={stores.playStore} target="_blank" rel="noreferrer noopener" className={base} data-cursor="hover" data-cursor-label="OPEN" aria-label="Get it on Google Play">
          <Play size={24} aria-hidden className="transition-colors group-hover:text-accent" />
          <span className="leading-tight"><span className="t-label block !text-[0.68rem]">Get it on</span><span className="block text-lg font-medium">Google Play</span></span>
        </a>
      )}
    </div>
  )
}

export const platformsOf = (s: Project['stores']) => [s.appStore && 'iOS', s.playStore && 'Android'].filter(Boolean).join(' · ')
