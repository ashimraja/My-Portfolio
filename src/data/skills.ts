import type { SectionIntro, StackCategory } from '@/types'

export const stackIntro: SectionIntro = { kicker: 'Stack', title: 'Tools I reach for.' }

export const stack: StackCategory[] = [
  { id: 'mobile', label: 'Mobile', blurb: 'What I ship to the App Store and Play Store.', items: [
    { name: 'React Native', note: 'Expert' },
    { name: 'Reanimated', note: 'Expert' },
    { name: 'Redux', note: 'Expert' },
  ] },
  { id: 'languages', label: 'Languages', blurb: 'The foundation.', items: [
    { name: 'TypeScript', note: 'Expert' },
    { name: 'JavaScript', note: 'Expert' },
  ] },
  { id: 'web', label: 'Web', blurb: 'Interfaces on the web.', items: [
    { name: 'React', note: 'Expert' },
    { name: 'Tailwind CSS', note: 'Advanced' },
  ] },
  { id: 'backend', label: 'Backend', blurb: 'Enough to ship full features.', items: [
    { name: 'Node.js', note: 'Advanced' },
    { name: 'Express', note: 'Advanced' },
    { name: 'Firebase / Firestore', note: 'Advanced' },
    { name: 'MongoDB', note: 'Advanced' },
  ] },
  { id: 'tools', label: 'Tools', blurb: 'Daily workflow.', items: [
    { name: 'Git', note: 'Expert' },
  ] },
]
