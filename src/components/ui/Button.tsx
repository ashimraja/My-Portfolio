import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Magnetic } from '@/components/animations/Magnetic'

interface Props { children: ReactNode; href?: string; to?: string; onClick?: () => void; variant?: 'solid' | 'outline'; external?: boolean; type?: 'button' | 'submit'; disabled?: boolean; cursorLabel?: string }

export function Button({ children, href, to, onClick, variant = 'solid', external, type = 'button', disabled, cursorLabel }: Props) {
  const cls = `group inline-flex items-center gap-3 rounded-full px-7 py-4 font-mono text-xs transition-colors duration-300 disabled:opacity-50 ${variant === 'solid' ? 'bg-accent text-accent-foreground hover:bg-foreground' : 'border border-border text-foreground hover:border-foreground'}`
  const inner = <>{children}<ArrowUpRight size={16} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>
  const cursor = cursorLabel ? { 'data-cursor': 'hover', 'data-cursor-label': cursorLabel } : {}
  return (
    <Magnetic strength={0.25}>
      {to ? <Link to={to} className={cls} {...cursor}>{inner}</Link>
        : href ? <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...cursor}>{inner}</a>
        : <button type={type} onClick={onClick} disabled={disabled} className={cls} {...cursor}>{inner}</button>}
    </Magnetic>
  )
}
