import { usePortfolio } from '@/content/ContentProvider'

export function Availability({ compact }: { compact?: boolean }) {
  const { availability } = usePortfolio()
  const color = availability.status === 'open' ? 'bg-accent' : availability.status === 'limited' ? 'bg-foreground' : 'bg-muted-foreground'
  return (
    <p className="t-label flex items-center gap-3 !text-foreground">
      <span aria-hidden className={`pulse-dot h-2 w-2 rounded-full ${color}`} />
      {availability.label}
      {!compact && availability.note && <span className="hidden text-muted-foreground sm:inline">— {availability.note}</span>}
    </p>
  )
}
