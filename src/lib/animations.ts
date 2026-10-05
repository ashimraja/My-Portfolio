import type { Transition, Variants } from 'framer-motion'

export const ease = [0.16, 1, 0.3, 1] as const
export const easeInOut = [0.76, 0, 0.24, 1] as const

export const duration = { fast: 0.25, base: 0.7, slow: 1.1 } as const
export const stagger = { tight: 0.04, base: 0.08, loose: 0.14 } as const

export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 18, mass: 0.6 } as Transition,
  snappy: { type: 'spring', stiffness: 380, damping: 30, mass: 0.5 } as Transition,
  magnetic: { type: 'spring', stiffness: 220, damping: 14, mass: 0.4 } as Transition,
}

export const viewport = { once: true, margin: '-10% 0px -10% 0px' } as const

/** Level 1 — subtle */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: duration.base, ease } },
}
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease } },
}
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.base, ease } },
}
export const staggerContainer = (gap: number = stagger.base, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren: delay } },
})
export const maskWord: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: duration.slow, ease } },
}
