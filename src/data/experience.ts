import type { Experience, SectionIntro } from '@/types'

export const experienceIntro: SectionIntro = { kicker: 'Experience', title: 'Where I work.' }

export const experience: Experience[] = [
  {
    period: 'Sep. 2025 — Present',
    start: '2025',
    end: 'Now',
    role: 'React Native Developer',
    company: 'Silversky Technology',
    summary: 'Building production React Native apps for iOS and Android, with a strong focus on problem-solving and scalable architecture.',
    achievements: [
      'Delivered 5+ production-ready applications on the App Store and Play Store',
      'Strong focus on problem-solving and scalable architecture',
      'Revamped TennisPreneur into a modern app on Firebase Firestore, including its subscription flow, while handling client communication and requirement changes',
    ],
  },
]
