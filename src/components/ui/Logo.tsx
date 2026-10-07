import { usePortfolio } from '@/content/ContentProvider'

/** Monogram mark built from the initials set in the dashboard. Uses currentColor for the letters and the site's accent colour for the dot, so it follows the theme. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  const initials = (usePortfolio().initials || '').trim().slice(0, 3).toUpperCase()
  const size = initials.length > 2 ? 11 : initials.length > 1 ? 14 : 18
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <text x="15" y="16" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontSize={size} fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: 'var(--font-sans)' }}>{initials}</text>
      <circle cx="28" cy="23" r="1.6" fill="var(--accent)" />
    </svg>
  )
}
