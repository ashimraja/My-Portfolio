import type { Portfolio } from '@/types'

/**
 * ALL DUMMY DATA — replace with your own. Every string on the site
 * comes from files in /src/data. Use *asterisks* to mark an italic accent word.
 */
export const portfolio: Portfolio = {
  name: 'MD Ashim Raja',
  firstName: 'Ashim',
  initials: 'AR',
  title: 'React Native Developer',
  location: 'India',
  email: 'rajaasim652@gmail.com',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mdashimraja786' },
    { label: 'WhatsApp', href: 'https://wa.me/+917970715234' },
  ],
  availability: { status: 'open', label: 'Available for selective remote freelance work' },

  hero: {
    eyebrow: 'Available for selective remote freelance work',
    greeting: "Hi, I'm Ashim.",
    headline: {
      prefix: 'I build',
      words: ['mobile apps', 'delightful UIs', 'fast interfaces', 'real-time apps'], // rotates, keep each under ~16 characters
      lines: ['with polished interactions', 'that users love.'],
    },
    // Rotating one-liners under the headline (was featuresSentences in home.js)
    roles: [
      'I build delightful mobile experiences.',
      'React Native & performance obsessed.',
      'Crafting polished interactions that users love.',
      'Available for selective remote freelance work.',
    ],
    scrollLabel: 'Scroll',
  },

  about: {
    kicker: 'About',
    words: ['Engineer.', 'Builder.', 'Problem solver.'],
    intro: 'I am a React Native developer who ships polished, production-ready mobile apps — and cares as much about how they feel as how they work.',
    paragraphs: [
      'At Silversky Technology I build React Native apps for iOS and Android. So far I have delivered 5+ production-ready applications to the App Store and Play Store: ride and delivery platforms, an offline-first journaling app, a social e-commerce marketplace and field-service tools.',
      'I enjoy the hard parts of mobile: real-time sockets, background GPS, offline data, barcode scanning and role-based flows. I graduated with a B.Tech in Computer Engineering from R.K University (2022 — 2026).',
    ],
    // Screen-reader description of the Rubik's cube in the About section (no visible text).
    game: { hint: 'Interactive Rubik’s cube. Drag the background to rotate it, drag a face to turn that layer.' },
    focus: [
      { label: 'Technical focus', text: 'React Native, TypeScript, Redux, Reanimated, real-time features and offline-first apps.' },
      { label: 'Product mindset', text: 'Problem-solving and scalable architecture, with polished interactions users love.' },
      { label: 'Currently', text: 'React Native Developer at Silversky Technology and open to selective remote freelance work.' },
    ],
  },

  stats: [
    { value: 5, suffix: '+', label: 'Production Apps Shipped' },
    { value: 2, suffix: '', label: 'Stores — App Store & Play Store' },
    { value: 12, suffix: '', label: 'Core Technologies' },
    { value: 6, suffix: '', label: 'Case Studies' },
  ],

  philosophy: {
    kicker: 'Engineering philosophy',
    title: 'Five things I refuse to compromise on.',
    principles: [
      { title: 'Build for humans.', text: 'Software is judged by the person holding it, not the engineer reading it.' },
      { title: 'Make complexity invisible.', text: 'The best abstraction is the one nobody has to think about.' },
      { title: 'Performance is a feature.', text: 'Speed is the first thing users feel and the last thing they forgive.' },
      { title: 'Good architecture enables creativity.', text: 'Solid foundations are what let a team take risks on the surface.' },
      { title: 'Ship. Measure. Improve.', text: 'Nothing is finished until it has met reality — then it gets better.' },
    ],
  },

  contact: {
    kicker: 'Contact',
    headline: 'Have an idea?',
    emphasis: 'unreasonably good.',
    text: 'Tell me what you are building. I am open to selective remote freelance work and reply to every serious message.',
    formNote: 'Your message is emailed straight to me.',
    emailEndpoint: 'https://formspree.io/f/xbdqjddg',
    successMessage: 'Message received. I will get back to you soon.',
  },

  footer: { tagline: 'Built with curiosity.', legal: '© 2026 MD Ashim Raja' },

  theme: { accent: '#ff5b2e' },

  seo: {
    siteUrl: 'https://md-ashim-raja.vercel.app',
    title: 'MD Ashim Raja — React Native Developer',
    titleTemplate: '%s — MD Ashim Raja',
    description: 'React Native specialist focused on performant mobile apps and polished interactions. Available for selective remote freelance work.',
    ogImage: '/og-image.png',
    twitterHandle: '',
    keywords: ['React Native', 'Mobile Developer', 'iOS', 'Android', 'Freelance', 'Portfolio'],
  },
}
