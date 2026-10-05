import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeIn, fadeUp, scaleIn, staggerContainer, viewport, stagger } from '@/lib/animations'

const variantMap = { up: fadeUp, fade: fadeIn, scale: scaleIn }

interface RevealProps {
  children: ReactNode
  className?: string
  variant?: keyof typeof variantMap
  delay?: number
  as?: 'div' | 'p' | 'li' | 'section' | 'span' | 'h2' | 'h3'
}

/** Scroll-triggered entrance (Level 1). FadeIn / ScaleIn are aliases via `variant`. */
export function Reveal({ children, className, variant = 'up', delay = 0, as = 'div' }: RevealProps) {
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag className={className} variants={variantMap[variant]} initial="hidden" whileInView="visible" viewport={viewport} transition={{ delay }}>
      {children}
    </Tag>
  )
}
export const FadeIn = (p: Omit<RevealProps, 'variant'>) => <Reveal {...p} variant="fade" />
export const ScaleIn = (p: Omit<RevealProps, 'variant'>) => <Reveal {...p} variant="scale" />

/** Parent that staggers any <StaggerItem> descendants. */
export function Stagger({ children, className, gap = stagger.base, delay = 0, as = 'div' }: { children: ReactNode; className?: string; gap?: number; delay?: number; as?: 'div' | 'ul' | 'ol' }) {
  const Tag = motion[as] as typeof motion.div
  return <Tag className={className} variants={staggerContainer(gap, delay)} initial="hidden" whileInView="visible" viewport={viewport}>{children}</Tag>
}
export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'p' }) {
  const Tag = motion[as] as typeof motion.div
  return <Tag className={className} variants={fadeUp}>{children}</Tag>
}
