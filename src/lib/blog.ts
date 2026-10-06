import type { BlogPost } from '@/types'

export const sortedPosts = (items: BlogPost[]) => [...items].sort((a, b) => b.date.localeCompare(a.date))

export const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Minutes to read, from the words in text, list and quote blocks (about 200 words a minute; code is skimmed). */
export const readMinutes = (p: BlogPost) => {
  const words = p.blocks.reduce((n, b) => n + (b.type === 'code' ? (b.text?.split(/\s+/).length ?? 0) * 0.25 : (b.text?.split(/\s+/).filter(Boolean).length ?? 0)), 0)
  return Math.max(1, Math.round(words / 200))
}

/** Video id from a watch, short, embed or shorts link (or a bare 11-character id). */
export const youtubeId = (input?: string) => {
  if (!input) return ''
  const s = input.trim()
  if (/^[\w-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1).slice(0, 11)
    const v = u.searchParams.get('v')
    if (v) return v.slice(0, 11)
    const m = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/)
    return m?.[1] ?? ''
  } catch { return '' }
}

/** A post with content opens its own page; one without just links to Medium. */
export const hasBody = (p: BlogPost) => p.blocks.length > 0
