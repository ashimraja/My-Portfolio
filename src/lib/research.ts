import type { ResearchPaper } from '@/types'

export { formatDate, readMinutes } from '@/lib/blog'

/** Papers visitors may see: published ones only, newest first. */
export const publishedPapers = (items: ResearchPaper[]) => items.filter((p) => p.status === 'published').sort((a, b) => b.date.localeCompare(a.date))

export const hasPaperBody = (p: ResearchPaper) => p.blocks.length > 0
