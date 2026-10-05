import { afterHours } from '@/data/afterhours'
import { education, educationIntro } from '@/data/education'
import { experience, experienceIntro } from '@/data/experience'
import { navigation, navCta } from '@/data/navigation'
import { portfolio } from '@/data/portfolio'
import { projects, projectsIntro } from '@/data/projects'
import { stack, stackIntro } from '@/data/skills'
import { testimonials } from '@/data/testimonials'
import type { SiteContent } from '@/types'

/**
 * Built-in content (from /src/data). It is the fallback when the cloud is not configured or unreachable,
 * and the starting point the dashboard seeds the database from.
 */
export const defaultContent: SiteContent = {
  portfolio,
  projects: { intro: projectsIntro, items: projects },
  experience: { intro: experienceIntro, items: experience },
  education: { intro: educationIntro, items: education },
  stack: { intro: stackIntro, categories: stack },
  testimonials: { items: testimonials },
  afterHours,
  navigation: { items: navigation, cta: navCta },
}

export const contentKeys = Object.keys(defaultContent) as (keyof SiteContent)[]
