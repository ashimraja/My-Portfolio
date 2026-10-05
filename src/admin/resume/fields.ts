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
    { kind: 'list', key: 'experience', label: 'Jobs', titleKey: 'company', fields: [t('company', 'Company'), t('role', 'Role'), t('location', 'Location'), t('period', 'Dates'), strs('bullets', 'Extra bullets under this job (optional)')] },
    { kind: 'number', key: 'featuredCount', label: 'Projects listed under the first job', hint: 'The first N ticked projects below go under Experience; the rest go to the other-projects section.' },
  ] },
  { id: 'projects', label: 'Projects', fields: [
    { kind: 'list', key: 'projects', label: 'Projects', titleKey: 'title', hint: 'Order matters: use the arrows. Untick “Include” to leave a project out of this resume.', fields: [
      bool('include', 'Include in this resume'), t('title', 'Title'), t('tagline', 'Short description (grey text after the title)'), strs('bullets', 'Bullets'), t('slug', 'Website project id (leave as is)'),
    ] },
    t('otherProjectsTitle', 'Heading of the other-projects section'),
    { kind: 'number', key: 'otherBullets', label: 'Bullets per project in the other-projects section' },
  ] },
  { id: 'education', label: 'Education', fields: [
    { kind: 'list', key: 'education', label: 'Schools', titleKey: 'school', hint: 'Every school in this list is printed. Remove one here (or turn the Education section off under Summary) to leave it out.', fields: [t('school', 'School'), t('degree', 'Degree'), t('location', 'Location (optional)'), t('period', 'Years')] },
  ] },
  { id: 'skills', label: 'Skills', fields: [
    { kind: 'list', key: 'skills', label: 'Skill lines', titleKey: 'label', hint: 'Printed in two columns, like “Languages: JavaScript, TypeScript”.', fields: [bool('include', 'Include'), t('label', 'Label'), t('items', 'Items (comma separated)')] },
  ] },
  { id: 'bars', label: 'Bars & languages', fields: [
    { kind: 'list', key: 'skillBars', label: 'Skill bars', titleKey: 'name', hint: 'Used by the Sidebar template (level 0–100). The Classic template prints the Skills tab instead.', fields: [t('name', 'Skill'), { kind: 'number', key: 'level', label: 'Level (0–100)' }] },
    { kind: 'list', key: 'languages', label: 'Languages', titleKey: 'name', hint: 'Shown by the Sidebar template when not empty.', fields: [t('name', 'Language'), { kind: 'number', key: 'level', label: 'Level (0–100)' }] },
  ] },
  { id: 'extra', label: 'Extra sections', fields: [
    { kind: 'list', key: 'extra', label: 'Extra sections', titleKey: 'title', hint: 'Certifications, achievements, languages… printed after Skills.', fields: [t('title', 'Section title'), strs('lines', 'Bullets')] },
  ] },
]
