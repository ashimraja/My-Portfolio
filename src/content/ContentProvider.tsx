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

  const value = useMemo(() => ({ content, ready }), [content, ready])
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)
export const usePortfolio = () => useContent().content.portfolio
