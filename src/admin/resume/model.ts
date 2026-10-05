import type { SiteContent } from '@/types'

export interface ResumeLink { label: string; href: string }
export interface ResumeExperience { company: string; role: string; location: string; period: string; bullets: string[] }
export interface ResumeProject { include: boolean; slug: string; title: string; tagline: string; bullets: string[] }
export interface ResumeEducation { school: string; degree: string; location: string; period: string }
export interface ResumeSkill { include: boolean; label: string; items: string }
export interface ResumeBar { name: string; level: number }
export type TemplateId = 'classic' | 'sidebar' | 'latex' | 'harvard' | 'twocol'

/** Everything the resume template renders. It is independent from the website: edit freely per job. */
export interface ResumeData {
  /** Layout only: every template renders the same content below. */
  template: TemplateId
  /** Main colour of templates that use one (e.g. the sidebar). */
  color: string
  name: string
  /** Title line shown by templates that have one (e.g. “React Native Developer”). */
  headline: string
  phone: string
  email: string
  location: string
  links: ResumeLink[]
  show: { summary: boolean; otherProjects: boolean; education: boolean; skills: boolean }
  summary: string
  experience: ResumeExperience[]
  /** The first N included projects are listed under the first job; the rest go to the “other projects” section. */
  featuredCount: number
  /** How many bullets each project shows in the “other projects” section. */
  otherBullets: number
  otherProjectsTitle: string
  projects: ResumeProject[]
  education: ResumeEducation[]
  skills: ResumeSkill[]
  extra: { title: string; lines: string[] }[]
  /** Skill bars (0–100) and languages: shown by templates that draw them (the sidebar). */
  skillBars: ResumeBar[]
  languages: ResumeBar[]
}

export interface ResumeVersion { id: string; name: string; data: ResumeData; updated_at?: string }

const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2)}`
  return d ? `+${d}` : ''
}

const projectFromSite = (p: SiteContent['projects']['items'][number]): ResumeProject => ({
  include: true, slug: p.slug, title: p.title, tagline: p.category, bullets: (p.highlights ?? []).slice(0, 4),
})

const levelFor = (note: string) => (/expert/i.test(note) ? 95 : /advanced/i.test(note) ? 80 : /intermediate/i.test(note) ? 65 : 75)

/** Fresh resume pre-filled from the website content (the dashboard's current drafts). */
export function buildFromSite(c: SiteContent): ResumeData {
  const p = c.portfolio
  const wa = p.socials.find((s) => /whatsapp/i.test(s.label))?.href ?? ''
  const linkedin = p.socials.find((s) => /linkedin/i.test(s.label))
  return {
    template: 'classic',
    color: '#0b4a3a',
    name: p.name,
    headline: p.title,
    phone: formatPhone(wa.split('wa.me/')[1] ?? ''),
    email: p.email,
    location: p.location,
    links: [...(linkedin ? [{ label: 'LinkedIn', href: linkedin.href }] : []), { label: 'Portfolio', href: p.seo.siteUrl }],
    show: { summary: true, otherProjects: true, education: true, skills: true },
    summary: p.about.intro,
    experience: c.experience.items.map((e) => ({ company: e.company, role: e.role, location: e.location ?? '', period: e.period, bullets: [] })),
    featuredCount: 5,
    otherBullets: 2,
    otherProjectsTitle: 'Other Projects',
    projects: c.projects.items.map(projectFromSite),
    education: c.education.items.map((e) => ({ school: e.school, degree: e.degree, location: '', period: e.period })),
    skills: c.stack.categories.map((cat) => ({ include: true, label: cat.label, items: cat.items.map((i) => i.name).join(', ') })),
    extra: [],
    skillBars: c.stack.categories.flatMap((cat) => cat.items.map((i) => ({ name: i.name, level: levelFor(i.note) }))),
    languages: [],
  }
}

/** Appends website projects that are not in the resume yet (matched by slug). */
export function addMissingProjects(data: ResumeData, c: SiteContent): ResumeData {
  const have = new Set(data.projects.map((p) => p.slug))
  const add = c.projects.items.filter((p) => !have.has(p.slug)).map(projectFromSite)
  return { ...data, projects: [...data.projects, ...add] }
}

/** Fills any field an older saved version is missing, so the editor and template never crash. */
export function normalizeResume(data: Partial<ResumeData>, c: SiteContent): ResumeData {
  const base = buildFromSite(c)
  return { ...base, ...data, show: { ...base.show, ...data.show } }
}
