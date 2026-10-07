import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { SUPABASE_URL, cloudEnabled, restHeaders } from '@/lib/cloud'
import { applyAccent } from '@/lib/theme'
import type { SiteContent } from '@/types'
import { defaultContent } from './defaults'
import { mergeDeep } from './merge'

interface Ctx { content: SiteContent; ready: boolean }
const ContentContext = createContext<Ctx>({ content: defaultContent, ready: true })

const CACHE_KEY = 'site-content-v1'
const readCache = (): Partial<SiteContent> | null => {
  try { const raw = localStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
const build = (remote: Partial<SiteContent> | null): SiteContent => {
  if (!remote) return defaultContent
  const out = { ...defaultContent }
  for (const k of Object.keys(defaultContent) as (keyof SiteContent)[]) if (remote[k] !== undefined) (out as Record<string, unknown>)[k] = mergeDeep(defaultContent[k], remote[k])
  return out
}

/**
 * Loads content from the cloud (one request, plain fetch — the Supabase SDK is not in this bundle).
 * Stale-while-revalidate: the last response is cached in localStorage and used immediately next visit.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const cached = useMemo(readCache, [])
  const [content, setContent] = useState<SiteContent>(() => build(cached))
  const [ready, setReady] = useState(!cloudEnabled || Boolean(cached))

  // The primary colour is a design token: set it before paint so there is no colour flash.
  useLayoutEffect(() => { applyAccent(content.portfolio.theme?.accent) }, [content.portfolio.theme?.accent])

  useEffect(() => {
    if (!cloudEnabled) return
    const ctrl = new AbortController()
    const timeout = setTimeout(() => { ctrl.abort(); setReady(true) }, 4500)
    fetch(`${SUPABASE_URL}/rest/v1/content?select=key,value`, { headers: restHeaders(), signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((rows: { key: string; value: unknown }[]) => {
        const remote = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<SiteContent>
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(remote)) } catch { /* storage unavailable */ }
        setContent(build(remote))
      })
      .catch(() => { /* offline or not seeded yet: keep what we have */ })
      .finally(() => { clearTimeout(timeout); setReady(true) })
    return () => { clearTimeout(timeout); ctrl.abort() }
  }, [])

  const initials = (content.portfolio.initials || '').trim().slice(0, 3).toUpperCase()
  useEffect(() => {
    if (!initials) return
    const size = initials.length > 2 ? 11 : initials.length > 1 ? 14 : 18
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1b1a18"/><text x="15" y="16" text-anchor="middle" dominant-baseline="central" fill="#f0ebe0" font-family="Helvetica,Arial,sans-serif" font-size="${size}" font-weight="700">${initials.replace(/[<>&]/g, '')}</text><circle cx="28" cy="23" r="1.6" fill="#ff5b2e"/></svg>`
    const link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) { link.type = 'image/svg+xml'; link.href = `data:image/svg+xml,${encodeURIComponent(svg)}` }
  }, [initials])

  const value = useMemo(() => ({ content, ready }), [content, ready])
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)
export const usePortfolio = () => useContent().content.portfolio
