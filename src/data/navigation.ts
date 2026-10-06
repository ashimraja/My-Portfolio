import type { NavItem } from '@/types'

export const navigation: NavItem[] = [
  { label: 'Work', to: '/', section: 'work' },
  { label: 'About', to: '/', section: 'about' },
  { label: 'Stack', to: '/', section: 'stack' },
  { label: 'Experience', to: '/', section: 'experience' },
  { label: 'Resume', to: '/', section: 'resume' },
  { label: 'Blog', to: '/blog' },
  { label: 'After Hours', to: '/after-hours', icon: 'lamp' },
  { label: 'Contact', to: '/', section: 'contact', hideOnBar: true },
]

/** The solid call-to-action pill at the end of the navbar. */
export const navCta: NavItem = { label: 'Let’s talk', to: '/', section: 'contact' }

/** Section ids observed on the home page for the active indicator. */
export const homeSections = ['top', 'work', 'about', 'stack', 'experience', 'education', 'resume', 'testimonials', 'contact']

/**
 * Navigation saved in the dashboard predates newer pages. Make sure Resume is always linked, and Blog whenever there are articles,
 * placing them before the After Hours icon / hidden items so the bar keeps its order.
 */
export function withDefaultLinks(items: NavItem[], hasBlog: boolean): NavItem[] {
  const out = [...items]
  const add = (item: NavItem, present: (i: NavItem) => boolean) => {
    if (out.some(present)) return
    const at = out.findIndex((i) => i.icon || i.hideOnBar)
    out.splice(at === -1 ? out.length : at, 0, item)
  }
  add({ label: 'Resume', to: '/', section: 'resume' }, (i) => i.section === 'resume')
  if (hasBlog) add({ label: 'Blog', to: '/blog' }, (i) => i.to === '/blog' || i.to.startsWith('/blog/'))
  return out
}
