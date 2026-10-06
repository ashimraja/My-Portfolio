export interface SocialLink { label: string; href: string }

export interface Stat { value: number; suffix: string; label: string }

export interface SeoConfig {
  siteUrl: string
  title: string
  titleTemplate: string
  description: string
  ogImage: string
  twitterHandle: string
  keywords: string[]
}

export interface Portfolio {
  name: string
  firstName: string
  initials: string
  title: string
  location: string
  email: string
  socials: SocialLink[]
  availability: { status: 'open' | 'limited' | 'closed'; label: string; note?: string }
  hero: { eyebrow: string; greeting: string; headline: { prefix: string; words: string[]; lines: string[] }; roles: string[]; scrollLabel: string }
  about: { photo?: string; kicker: string; words: string[]; intro: string; paragraphs: string[]; focus: { label: string; text: string }[]; game: { hint: string } }
  stats: Stat[]
  contact: { kicker: string; headline: string; emphasis: string; text: string; successMessage: string; emailEndpoint?: string }
  footer: { legal: string }
  seo: SeoConfig
  /** Site-wide primary colour (hex). Applied as the --accent design token. */
  theme?: { accent: string }
}

export interface NavItem { label: string; to: string; section?: string; icon?: 'lamp'; hideOnBar?: boolean }

export interface VisualSpec {
  /** Three colours used to procedurally draw the placeholder artwork. */
  colors: [string, string, string]
  pattern: 'rings' | 'grid' | 'waves' | 'blocks'
}

/** What a project is: decides the filter it appears under and which content its detail page shows. */
export type ProjectKind = 'mobile' | 'web'

export type Screenshot = string | { src: string; caption?: string }

export interface Project {
  slug: string
  title: string
  /** Mobile app (store badges, phone screens) or web application (live site, source, browser screens). Defaults sensibly when omitted. */
  kind?: ProjectKind
  /** One short line shown under the title, e.g. "Ride, parcel & food delivery". */
  category: string
  role: string
  summary: string
  tech: string[]
  /** Banner image (public path). Falls back to generated artwork from `visual` if omitted. */
  cover?: string
  visual: VisualSpec
  /** Store listings. Omit a key if the app is not on that store. */
  stores: { appStore?: string; playStore?: string }
  links: { label: string; href: string }[]
  /** Web applications: the live site and (optionally) the source code. */
  liveUrl?: string
  repoUrl?: string
  /** Image paths (files in /public) or {src, caption}. Missing files fall back to a placeholder. */
  screenshots: Screenshot[]
  // Optional case-study content: sections without data are skipped automatically.
  year?: string
  duration?: string
  team?: string
  tagline?: string
  highlights?: string[]
  features?: string[]
  challenges?: { problem: string; solution: string }[]
  results?: { value: string; label: string }[]
  approach?: string[]
  architecture?: { layer: string; detail: string }[]
}

export interface Experience {
  period: string
  start: string
  end: string
  role: string
  company: string
  location?: string
  summary: string
  achievements: string[]
  tech?: string[]
}

export interface Education { school: string; degree: string; period: string; notes: string }

export interface SectionIntro { kicker: string; title: string }

export interface StackCategory { id: string; label: string; blurb: string; items: { name: string; note: string }[] }

export interface Testimonial { quote: string; name: string; role: string; company: string; initials: string }

export type BlogBlockType = 'paragraph' | 'heading' | 'subheading' | 'list' | 'quote' | 'code' | 'image' | 'youtube'
/** One piece of an article. Which fields are used depends on `type` (text → text blocks and code; src → image; video → YouTube link). */
export interface BlogBlock { type: BlogBlockType; text?: string; language?: string; src?: string; video?: string; caption?: string }
export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  /** ISO date, e.g. 2026-03-14. */
  date: string
  tags: string[]
  cover?: string
  /** The original Medium article. With no blocks, the post simply links out to it. */
  mediumUrl?: string
  blocks: BlogBlock[]
}
export interface BlogContent { intro: SectionIntro; items: BlogPost[] }

export interface SideProject { kind?: ProjectKind; title: string; blurb: string; year: string; status: string; tech: string[]; href: string }

export interface AfterHoursContent {
  kicker: string
  headline: string[]
  text: string
  lampHint: string
  cta: { primary: string; secondary: string }
  projectsTitle: string
  projects: SideProject[]
}

/** Everything the site renders. Each key is one row in the Supabase `content` table (see supabase/schema.sql). */
export interface SiteContent {
  portfolio: Portfolio
  projects: { intro: { kicker: string; title: string; hint: string; cta: string }; items: Project[] }
  experience: { intro: SectionIntro; items: Experience[] }
  education: { intro: SectionIntro; items: Education[] }
  stack: { intro: SectionIntro; categories: StackCategory[] }
  testimonials: { items: Testimonial[] }
  afterHours: AfterHoursContent
  blog: BlogContent
  navigation: { items: NavItem[]; cta: NavItem }
}
export type ContentKey = keyof SiteContent
