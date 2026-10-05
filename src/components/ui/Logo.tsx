/** Monogram mark. Uses currentColor for the letters and the site's accent colour for the dot, so it follows the theme. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 23 L9.6 9 L14.2 23 M6.9 18.2 H12.3" />
        <path d="M17.6 23 V9 H21.6 a3.6 3.6 0 0 1 0 7.2 H17.6 M21.4 16.2 L25 23" />
      </g>
      <circle cx="28" cy="23" r="1.6" fill="var(--accent)" />
    </svg>
  )
}
