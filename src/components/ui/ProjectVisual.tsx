import { useId } from 'react'
import type { VisualSpec } from '@/types'

/** Procedural placeholder artwork driven by project data (swap for real images later). */
export function ProjectVisual({ visual, label, className }: { visual: VisualSpec; label?: string; className?: string }) {
  const id = useId()
  const [a, bg, c] = visual.colors
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={label ?? 'Project artwork placeholder'}>
      <defs>
        <radialGradient id={`${id}g`} cx="70%" cy="30%" r="80%">
          <stop offset="0" stopColor={a} stopOpacity=".35" />
          <stop offset="1" stopColor={bg} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill={bg} />
      <rect width="800" height="600" fill={`url(#${id}g)`} />
      {visual.pattern === 'rings' && [...Array(9)].map((_, i) => (
        <circle key={i} cx="540" cy="300" r={40 + i * 46} fill="none" stroke={i % 3 === 0 ? a : c} strokeOpacity={i % 3 === 0 ? 1 : 0.3} strokeWidth={i % 3 === 0 ? 3 : 1} />
      ))}
      {visual.pattern === 'grid' && [...Array(14)].flatMap((_, x) => [...Array(10)].map((_, y) => (
        <rect key={`${x}-${y}`} x={30 + x * 55} y={30 + y * 55} width="38" height="38" fill={(x * 7 + y * 3) % 5 === 0 ? a : c} fillOpacity={(x * 7 + y * 3) % 5 === 0 ? 1 : 0.08 + ((x + y) % 4) * 0.05} />
      )))}
      {visual.pattern === 'waves' && [...Array(14)].map((_, i) => (
        <path key={i} d={`M-20 ${120 + i * 32} C 150 ${60 + i * 32}, 300 ${220 + i * 32}, 450 ${130 + i * 32} S 720 ${60 + i * 32}, 840 ${140 + i * 32}`} fill="none" stroke={i % 4 === 0 ? a : c} strokeOpacity={i % 4 === 0 ? 1 : 0.35} strokeWidth="2" />
      ))}
      {visual.pattern === 'blocks' && [[80, 90, 300, 200, a], [420, 90, 300, 120, c], [420, 230, 140, 260, c], [590, 230, 130, 260, a], [80, 320, 300, 170, c]].map(([x, y, w, h, f], i) => (
        <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} fill={f as string} fillOpacity={i % 2 ? 0.16 : 0.9} />
      ))}
    </svg>
  )
}
