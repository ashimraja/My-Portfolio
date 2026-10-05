import { ProjectVisual } from './ProjectVisual'
import type { Project } from '@/types'

/** Real banner image when the project has one, generated artwork otherwise. */
export function ProjectCover({ project, className = '' }: { project: Project; className?: string }) {
  return project.cover
    ? <img src={project.cover} alt={`${project.title} banner`} loading="lazy" decoding="async" className={`${className} object-cover`} />
    : <ProjectVisual visual={project.visual} label={`${project.title} preview`} className={className} />
}
