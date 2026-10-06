import type { Project, ProjectKind, SideProject } from '@/types'

export const KIND_LABEL: Record<ProjectKind, string> = { mobile: 'Mobile app', web: 'Web app' }
export type KindFilter = 'all' | ProjectKind

/** Older projects have no `kind`: infer it from what they link to (a live site and no store listing means web), else mobile. */
export const kindOf = (p: Pick<Project, 'kind' | 'stores' | 'liveUrl'>): ProjectKind =>
  p.kind ?? (p.liveUrl && !p.stores?.appStore && !p.stores?.playStore ? 'web' : 'mobile')

/** Side projects are usually web experiments, so that is the default. */
export const sideKindOf = (p: SideProject): ProjectKind => p.kind ?? 'web'

export const hostOf = (url?: string) => { try { return url ? new URL(url).host.replace(/^www\./, '') : '' } catch { return url ?? '' } }
