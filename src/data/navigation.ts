import type { NavItem } from '@/types'

export const navigation: NavItem[] = [
  { label: 'Work', to: '/', section: 'work' },
  { label: 'About', to: '/', section: 'about' },
  { label: 'Stack', to: '/', section: 'stack' },
  { label: 'Experience', to: '/', section: 'experience' },
  { label: 'After Hours', to: '/after-hours', icon: 'lamp' },
  { label: 'Contact', to: '/', section: 'contact', hideOnBar: true },
]

/** The solid call-to-action pill at the end of the navbar. */
export const navCta: NavItem = { label: 'Let’s talk', to: '/', section: 'contact' }

/** Section ids observed on the home page for the active indicator. */
export const homeSections = ['top', 'about', 'work', 'stack', 'experience', 'philosophy', 'testimonials', 'contact']
