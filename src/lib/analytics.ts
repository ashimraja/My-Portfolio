import { SUPABASE_URL, cloudEnabled, restHeaders } from '@/lib/cloud'

export type EventType = 'pageview' | 'project_click' | 'store_click' | 'outbound' | 'resume_download' | 'contact' | 'section'

/** Set in the dashboard so your own visits never count. */
export const IGNORE_KEY = 'analytics-ignore'

const attempt = <T,>(fn: () => T, fallback: T): T => { try { return fn() } catch { return fallback } }
const uid = () => attempt(() => crypto.randomUUID(), `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`)

const stored = (store: Storage, key: string, make: () => string) => {
  const found = attempt(() => store.getItem(key), null)
  if (found) return found
  const v = make()
  attempt(() => store.setItem(key, v), null)
  return v
}

const enabled = () =>
  cloudEnabled &&
  (!import.meta.env.DEV || attempt(() => localStorage.getItem('analytics-dev') === '1', false)) &&
  !attempt(() => localStorage.getItem(IGNORE), null) &&
  navigator.doNotTrack !== '1' &&
  !navigator.webdriver &&
  !/bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent) &&
  !window.location.pathname.startsWith('/admin')

const device = () => (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop')
const browser = () => {
  const ua = navigator.userAgent
  return /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\/|CriOS/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other'
}

/** Where the visit came from: a ?ref= / ?utm_source= / ?for= tag wins, otherwise the referring site. Remembered for the visit. */
const origin = () => {
  const q = new URLSearchParams(window.location.search)
  const tag = q.get('ref') || q.get('utm_source') || q.get('for')
  if (tag) attempt(() => sessionStorage.setItem('a-src', tag.slice(0, 100)), null)
  const source = attempt(() => sessionStorage.getItem('a-src'), null) ?? ''
  let referrer = attempt(() => sessionStorage.getItem('a-ref'), null)
  if (referrer === null) {
    const host = attempt(() => (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''), '')
    referrer = host && host !== window.location.hostname.replace(/^www\./, '') ? host : ''
    attempt(() => sessionStorage.setItem('a-ref', referrer ?? ''), null)
  }
  return { source, referrer }
}

const once = new Set<string>()

/** Fire-and-forget. Never throws and never blocks the page. `once` events (like reaching a section) are sent a single time per visit. */
export function track(type: EventType, target?: string, opts: { once?: boolean } = {}) {
  try {
    if (!enabled()) return
    const key = `${type}:${target ?? ''}`
    if (opts.once) { if (once.has(key)) return; once.add(key) }
    const { source, referrer } = origin()
    const row = {
      visitor: stored(localStorage, 'a-vid', uid), session: stored(sessionStorage, 'a-sid', uid), type,
      path: window.location.pathname, target: target?.slice(0, 200) ?? null, referrer: referrer || null, source: source || null,
      device: device(), browser: browser(), tz: attempt(() => Intl.DateTimeFormat().resolvedOptions().timeZone, ''),
    }
    void fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST', keepalive: true,
      headers: { ...restHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    }).catch(() => { /* analytics must never get in the way */ })
  } catch { /* ignore */ }
}

/** One delegated listener: anything with data-track="type" data-target="x" is counted, and so is any link that leaves the site. */
export function listenForClicks() {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.('[data-track]') as HTMLElement | null
    if (el) return track(el.dataset.track as EventType, el.dataset.target)
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (a && /^https?:$/.test(a.protocol) && a.hostname !== window.location.hostname) track('outbound', a.hostname.replace(/^www\./, ''))
  }
  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
