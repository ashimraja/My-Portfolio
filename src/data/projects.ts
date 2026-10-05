import type { Project } from '@/types'

export const projectsIntro = {
  kicker: 'Selected work',
  title: 'Six apps, shipped.',
  hint: 'Scroll sideways · open a case study',
  cta: 'Open case study',
}

/**
 * Projects now live in the cloud (Supabase → edit them in /admin → Projects).
 * This empty list is only the fallback shown if the cloud is unreachable.
 */
export const projects: Project[] = []

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
