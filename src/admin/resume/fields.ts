import type { Field } from '@/admin/schema'

const t = (key: string, label: string, hint?: string): Field => ({ kind: 'text', key, label, hint })
const bool = (key: string, label: string, hint?: string): Field => ({ kind: 'boolean', key, label, hint })
const strs = (key: string, label: string, hint?: string): Field => ({ kind: 'strings', key, label, hint, multiline: true })

/** Form for ResumeData (rendered by the same generic Editor as the website content). */

export const resumeSections: { id: string; label: string; fields: Field[] }[] = [
  { id: 'design', label: 'Template', fields: [
    { kind: 'select', key: 'template', label: 'Template', options: ['classic', 'sidebar', 'latex', 'harvard', 'twocol'], labels: { classic: 'Classic — single column, ATS-friendly', sidebar: 'Sidebar — coloured side panel with skill bars', latex: 'LaTeX — serif, small-caps (popular with engineers)', harvard: 'Harvard — Times, centred header', twocol: 'Two-column — compact engineer CV' } },
    { kind: 'color', key: 'color', label: 'Template colour', hint: 'Used by templates with colour: Sidebar panel and the Two-column name and headings.' },
  ] },
  { id: 'header', label: 'Header', fields: [
    t('name', 'Name'), t('headline', 'Title line (e.g. React Native Developer)', 'Shown by templates that have a title line, such as Sidebar.'), t('phone', 'Phone'), { kind: 'email', key: 'email', label: 'Email' }, t('location', 'Location line (e.g. Gujarat, India)'),
    { kind: 'list', key: 'links', label: 'Links', titleKey: 'label', fields: [t('label', 'Text shown (e.g. LinkedIn)'), { kind: 'url', key: 'href', label: 'Link' }] },
  ] },
  { id: 'summary', label: 'Summary', fields: [
    { kind: 'group', key: 'show', label: 'Which sections to print', fields: [bool('summary', 'Summary'), bool('otherProjects', 'Other projects'), bool('education', 'Education'), bool('skills', 'Skills')] },
    { kind: 'textarea', key: 'summary', label: 'Summary', rows: 6, hint: 'Tailor this to the job description.' },
  ] },
  { id: 'experience', label: 'Experience', fields: [
    { kind: 'list', key: 'experience', label: 'Jobs', titleKey: 'company', hideable: true, fields: [t('company', 'Company'), t('role', 'Role'), t('location', 'Location'), t('period', 'Dates'), strs('bullets', 'Extra bullets under this job (optional)')] },
  ] },
  { id: 'projects', label: 'Projects', fields: [
    { kind: 'list', key: 'projects', label: 'Projects', titleKey: 'title', hideable: true, hideKey: 'include', hint: 'Order matters: use the arrows. The eye hides a project from this resume without deleting it; hidden projects wait in their own group.', fields: [
      t('title', 'Title'), t('tagline', 'Short description (grey text after the title)'), strs('bullets', 'Bullets'), t('slug', 'Website project id (leave as is)'),
    ] },
    { kind: 'number', key: 'featuredCount', label: 'How many of the first projects to show in full', hint: 'The first N projects in the list above (hidden ones are skipped) are printed in full, with all their bullets, under your first job. Every project after those goes into the Other projects section below. Use 0 to put them all there.' },
    t('otherProjectsTitle', 'Heading of the other-projects section'),
    { kind: 'textarea', key: 'otherProjectsText', label: 'Other projects: one short paragraph', rows: 5, hint: 'Sum up the main things you did across your other projects in a few sentences. When this is filled, the section prints just this paragraph instead of one entry per project (the settings below then do not apply). Leave empty to list each project separately.' },
    { kind: 'number', key: 'otherBullets', label: 'Bullets per project in the other-projects section', hint: 'Only used when the paragraph above is empty.' },
  ] },
  { id: 'education', label: 'Education', fields: [
    { kind: 'list', key: 'education', label: 'Schools', titleKey: 'school', hideable: true, hint: 'The eye hides a school from this resume without deleting it. Hidden schools wait in their own group (or turn the whole Education section off under Summary).', fields: [t('school', 'School'), t('degree', 'Degree'), t('location', 'Location (optional)'), t('period', 'Years')] },
  ] },
  { id: 'skills', label: 'Skills', fields: [
    { kind: 'list', key: 'skills', label: 'Skill lines', titleKey: 'label', hideable: true, hideKey: 'include', hint: 'Printed in two columns, like “Languages: JavaScript, TypeScript”. The eye hides a line without deleting it.', fields: [t('label', 'Label'), t('items', 'Items (comma separated)')] },
  ] },
  { id: 'bars', label: 'Bars & languages', fields: [
    { kind: 'list', key: 'skillBars', label: 'Skill bars', titleKey: 'name', hint: 'Used by the Sidebar template (level 0–100). The Classic template prints the Skills tab instead.', fields: [t('name', 'Skill'), { kind: 'number', key: 'level', label: 'Level (0–100)' }] },
    { kind: 'list', key: 'languages', label: 'Languages', titleKey: 'name', hint: 'Shown by the Sidebar template when not empty.', fields: [t('name', 'Language'), { kind: 'number', key: 'level', label: 'Level (0–100)' }] },
  ] },
  { id: 'extra', label: 'Extra sections', fields: [
    { kind: 'list', key: 'extra', label: 'Extra sections', titleKey: 'title', hint: 'Certifications, achievements, languages… printed after Skills.', fields: [t('title', 'Section title'), strs('lines', 'Bullets')] },
  ] },
]
