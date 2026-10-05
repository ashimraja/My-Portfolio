import type { AfterHoursContent } from '@/types'

/** Dummy content — replace with your own side projects. */
export const afterHours: AfterHoursContent = {
  kicker: 'After Hours',
  headline: ['Things I build', 'when nobody', 'asked me to.'],
  text: 'The office is closed. This is what I build with the lights on — side projects, tools and experiments that never made it into a ticket.',
  cta: { primary: 'Get in touch', secondary: 'See what I built' },
  lampHint: 'Move the light',
  projectsTitle: 'Side projects',
  /** Add your after-office projects here — the Side projects section appears automatically once there is at least one. */
  projects: [
    // { title: 'Project name', blurb: 'One line about it.', year: '2026', status: 'In progress', tech: ['React Native'], href: 'https://github.com/you/project' },
  ],
}
