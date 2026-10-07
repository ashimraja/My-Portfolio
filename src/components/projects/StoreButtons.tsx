import type { Project } from '@/types'

const base = 'group inline-flex min-h-[3.5rem] items-center gap-3 rounded-xl border border-border bg-surface px-5 py-2.5 transition-colors duration-300 hover:border-accent hover:bg-surface-hover'

/** The Apple logo (not a fruit): single colour, follows the text colour. */
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 shrink-0 fill-current">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

/** The Google Play mark in its four brand colours. */
function PlayLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 shrink-0">
      <path d="M4 2 13.2 12 4 22Z" fill="#00a0ff" />
      <path d="M4 2 16.6 9.7 13.2 12Z" fill="#00d26a" />
      <path d="M16.6 9.7 20.5 12 16.6 14.3 13.2 12Z" fill="#ffc400" />
      <path d="M4 22 13.2 12 16.6 14.3Z" fill="#ff3a44" />
    </svg>
  )
}

/** App Store / Google Play badges — only the stores present in project.stores render. */
export function StoreButtons({ stores, slug, className = '' }: { stores: Project['stores']; slug?: string; className?: string }) {
  if (!stores.appStore && !stores.playStore) return null
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {stores.appStore && (
        <a href={stores.appStore} target="_blank" rel="noreferrer noopener" className={base} data-track="store_click" data-target={`${slug ?? ''}:ios`} data-cursor="hover" data-cursor-label="OPEN" aria-label="Download on the App Store">
          <span className="transition-colors group-hover:text-accent"><AppleLogo /></span>
          <span className="leading-tight"><span className="t-label block !text-[0.68rem]">Download on the</span><span className="block text-lg font-medium">App Store</span></span>
        </a>
      )}
      {stores.playStore && (
        <a href={stores.playStore} target="_blank" rel="noreferrer noopener" className={base} data-track="store_click" data-target={`${slug ?? ''}:android`} data-cursor="hover" data-cursor-label="OPEN" aria-label="Get it on Google Play">
          <PlayLogo />
          <span className="leading-tight"><span className="t-label block !text-[0.68rem]">Get it on</span><span className="block text-lg font-medium">Google Play</span></span>
        </a>
      )}
    </div>
  )
}

export const platformsOf = (s: Project['stores']) => [s.appStore && 'iOS', s.playStore && 'Android'].filter(Boolean).join(' · ')
