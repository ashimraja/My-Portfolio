import type { ContentKey } from '@/types'

/** A tiny declarative schema: the dashboard renders a form from it, so adding a field is one line. */
export type Field =
  | { kind: 'text' | 'url' | 'email' | 'textarea'; key: string; label: string; hint?: string; rows?: number }
  | { kind: 'number'; key: string; label: string; hint?: string }
  | { kind: 'select'; key: string; label: string; options: string[]; labels?: Record<string, string> }
  | { kind: 'color'; key: string; label: string; hint?: string }
  | { kind: 'boolean'; key: string; label: string; hint?: string }
  | { kind: 'image'; key: string; label: string; hint?: string }
  | { kind: 'strings'; key: string; label: string; multiline?: boolean; hint?: string }
  | { kind: 'images'; key: string; label: string; hint?: string }
  | { kind: 'group'; key: string; label: string; fields: Field[] }
  | { kind: 'list'; key: string; label: string; titleKey?: string; fields: Field[]; hint?: string }

const t = (key: string, label: string, hint?: string): Field => ({ kind: 'text', key, label, hint })
const ta = (key: string, label: string, rows = 3, hint?: string): Field => ({ kind: 'textarea', key, label, rows, hint })
const url = (key: string, label: string, hint?: string): Field => ({ kind: 'url', key, label, hint })
const strs = (key: string, label: string, hint?: string, multiline = false): Field => ({ kind: 'strings', key, label, hint, multiline })
const group = (key: string, label: string, fields: Field[]): Field => ({ kind: 'group', key, label, fields })
const list = (key: string, label: string, titleKey: string | undefined, fields: Field[], hint?: string): Field => ({ kind: 'list', key, label, titleKey, fields, hint })

const intro = [t('kicker', 'Small label'), t('title', 'Title')]

export interface SectionDef { id: string; label: string; group: string; key: ContentKey; fields: Field[]; note?: string }

export const sections: SectionDef[] = [
  // ── Site (all stored in the `portfolio` row) ──
  { id: 'profile', label: 'Profile', group: 'Site', key: 'portfolio', fields: [
    t('name', 'Full name'), t('firstName', 'First name'), t('initials', 'Initials'), t('title', 'Job title'), t('location', 'Location'),
    { kind: 'email', key: 'email', label: 'Email' },
    list('socials', 'Social links', 'label', [t('label', 'Name (e.g. LinkedIn)'), url('href', 'Link')]),
    group('availability', 'Availability', [{ kind: 'select', key: 'status', label: 'Status', options: ['open', 'limited', 'closed'] }, t('label', 'Label'), t('note', 'Extra note (optional)')]),
  ] },
  { id: 'theme', label: 'Colours', group: 'Site', key: 'portfolio', fields: [
    group('theme', 'Theme', [{ kind: 'color', key: 'accent', label: 'Primary colour', hint: 'Used for highlights, buttons, links and the rotating hero word across the whole site.' }]),
  ] },
  { id: 'hero', label: 'Hero', group: 'Site', key: 'portfolio', fields: [
    group('hero', 'Hero section', [
      t('eyebrow', 'Availability line'), t('greeting', 'Greeting'),
      group('headline', 'Headline', [t('prefix', 'Small first line'), strs('words', 'Rotating words', 'Keep each under ~16 characters.'), strs('lines', 'Two big lines')]),
      strs('roles', 'Rotating one-liners under the headline'), t('scrollLabel', 'Scroll button label'),
    ]),
  ] },
  { id: 'about', label: 'About & stats', group: 'Site', key: 'portfolio', fields: [
    group('about', 'About', [t('kicker', 'Small label'), strs('words', 'Big words (3)'), ta('intro', 'Intro sentence'), strs('paragraphs', 'Paragraphs', undefined, true), list('focus', 'Focus rows', 'label', [t('label', 'Label'), ta('text', 'Text', 2)]), group('game', 'Rubik’s cube', [t('hint', 'Screen-reader description')])]),
    list('stats', 'Animated statistics', 'label', [{ kind: 'number', key: 'value', label: 'Number' }, t('suffix', 'After the number (e.g. +)'), t('label', 'Label')]),
  ] },
  { id: 'philosophy', label: 'Philosophy', group: 'Site', key: 'portfolio', fields: [
    group('philosophy', 'Engineering philosophy', [t('kicker', 'Small label'), t('title', 'Title'), list('principles', 'Principles', 'title', [t('title', 'Principle'), ta('text', 'Explanation', 2)])]),
  ] },
  { id: 'contact', label: 'Contact & footer', group: 'Site', key: 'portfolio', fields: [
    group('contact', 'Contact section', [t('kicker', 'Small label'), t('headline', 'Small headline'), t('emphasis', 'Highlighted ending'), ta('text', 'Text'), t('formNote', 'Note under the form'), url('emailEndpoint', 'Email form endpoint (Formspree URL)', 'Messages are emailed through this. Leave empty to only save them to the Messages inbox.'), t('successMessage', 'Message after sending')]),
    group('footer', 'Footer', [t('tagline', 'Tagline'), t('legal', 'Copyright line')]),
  ] },
  { id: 'seo', label: 'SEO & sharing', group: 'Site', key: 'portfolio', fields: [
    group('seo', 'Search & social previews', [url('siteUrl', 'Site URL (https://…)'), t('title', 'Default page title'), t('titleTemplate', 'Title template', 'Use %s for the page name.'), ta('description', 'Description'), { kind: 'image', key: 'ogImage', label: 'Social preview image (1200×630)' }, t('twitterHandle', 'Twitter / X handle'), strs('keywords', 'Keywords')]),
  ] },

  // ── Work ──
  { id: 'projects', label: 'Projects', group: 'Content', key: 'projects', fields: [
    group('intro', 'Section heading', [...intro, t('hint', 'Hint'), t('cta', 'Button label')]),
    list('items', 'Projects', 'title', [
      t('title', 'Title'), t('slug', 'URL slug', 'Used in the address: /work/<slug>. Lowercase, no spaces.'), t('category', 'Short category line'), t('role', 'Your role'),
      ta('summary', 'Description', 4), strs('tech', 'Technologies'),
      { kind: 'image', key: 'cover', label: 'Banner / cover image', hint: 'Wide image (about 2:1).' },
      group('stores', 'Store links', [url('appStore', 'App Store link'), url('playStore', 'Google Play link')]),
      list('links', 'Other links', 'label', [t('label', 'Label'), url('href', 'Link')]),
      { kind: 'images', key: 'screenshots', label: 'Screenshots', hint: 'Add as many as you like. They show in a sideways-scrolling row.' },
      strs('highlights', 'What I did (highlights)', undefined, true), strs('features', 'Key features', undefined, true),
      list('challenges', 'Challenges & solutions', 'problem', [ta('problem', 'Problem', 2), ta('solution', 'Solution', 2)]),
      list('results', 'Impact numbers', 'label', [t('value', 'Value (e.g. 100%)'), t('label', 'Label')]),
      t('year', 'Year (optional)'), t('duration', 'Duration (optional)'), t('team', 'Team (optional)'), t('tagline', 'Tagline (optional)'),
      strs('approach', 'Approach steps (optional)', undefined, true),
      list('architecture', 'Architecture layers (optional)', 'layer', [t('layer', 'Layer'), t('detail', 'Detail')]),
      group('visual', 'Fallback artwork (only used when there is no cover image)', [strs('colors', 'Three colours (hex)'), { kind: 'select', key: 'pattern', label: 'Pattern', options: ['rings', 'grid', 'waves', 'blocks'] }]),
    ], 'Drag order with the arrows. The first project appears first on the site.'),
  ] },
  { id: 'experience', label: 'Experience', group: 'Content', key: 'experience', fields: [
    group('intro', 'Section heading', intro),
    list('items', 'Roles', 'role', [t('role', 'Role'), t('company', 'Company'), t('period', 'Period (e.g. Sep 2025 — Present)'), t('start', 'Start (big year)'), t('end', 'End (big year or Now)'), t('location', 'Location (optional)'), ta('summary', 'Summary'), strs('achievements', 'Achievements', undefined, true), strs('tech', 'Technologies (optional)')]),
  ] },
  { id: 'education', label: 'Education', group: 'Content', key: 'education', fields: [
    group('intro', 'Section heading', intro),
    list('items', 'Schools', 'school', [t('school', 'School / university'), t('degree', 'Degree'), t('period', 'Period'), ta('notes', 'Notes', 2)]),
  ] },
  { id: 'stack', label: 'Tech stack', group: 'Content', key: 'stack', fields: [
    group('intro', 'Section heading', intro),
    list('categories', 'Categories', 'label', [t('id', 'ID (no spaces)'), t('label', 'Name'), t('blurb', 'One-line blurb'), list('items', 'Technologies', 'name', [t('name', 'Name'), t('note', 'Level / note')])]),
  ] },
  { id: 'testimonials', label: 'Testimonials', group: 'Content', key: 'testimonials', fields: [
    list('items', 'Testimonials', 'name', [ta('quote', 'Quote', 3), t('name', 'Name'), t('role', 'Role'), t('company', 'Company'), t('initials', 'Initials')], 'The section stays hidden while this list is empty.'),
  ] },
  { id: 'afterhours', label: 'After Hours', group: 'Content', key: 'afterHours', fields: [
    t('kicker', 'Small label'), strs('headline', 'Big headline (3 lines)'), ta('text', 'Intro text'), t('lampHint', 'Hint next to the label'),
    group('cta', 'Buttons', [t('primary', 'Main button'), t('secondary', 'Second button')]), t('projectsTitle', 'Projects heading'),
    list('projects', 'Side projects', 'title', [t('title', 'Title'), ta('blurb', 'One line', 2), t('year', 'Year'), t('status', 'Status (e.g. Shipped)'), strs('tech', 'Technologies'), url('href', 'Link')], 'The section stays hidden while this list is empty.'),
  ] },
  { id: 'navigation', label: 'Navigation', group: 'Content', key: 'navigation', fields: [
    list('items', 'Menu items', 'label', [t('label', 'Label'), t('to', 'Page path (e.g. / or /after-hours)'), t('section', 'Section id on the home page (optional)'), { kind: 'select', key: 'icon', label: 'Show as icon', options: ['', 'lamp'] }]),
    group('cta', 'Button at the end of the bar', [t('label', 'Label'), t('to', 'Page path'), t('section', 'Section id')]),
  ] },
]

/** Builds an empty item for “Add” buttons. */
export function blankOf(fields: Field[]): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  for (const f of fields) {
    o[f.key] = f.kind === 'number' ? 0 : f.kind === 'color' ? '#ff5b2e' : f.kind === 'boolean' ? true : f.kind === 'strings' || f.kind === 'images' || f.kind === 'list' ? [] : f.kind === 'group' ? blankOf(f.fields) : f.kind === 'select' ? f.options[0] : ''
  }
  return o
}
