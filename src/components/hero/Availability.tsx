import { usePortfolio } from '@/content/ContentProvider'

/** Status capsule: a glass pill with a glowing status dot in its own small disc (green open, amber limited, grey closed), the label, and a quieter second part. */
export function Availability({ compact }: { compact?: boolean }) {
  const { availability, location } = usePortfolio()
  const tone = availability.status === 'open' ? 'text-emerald-500' : availability.status === 'limited' ? 'text-amber-500' : 'text-muted-foreground'
  const quiet = (!compact && availability.note) || location
  return (
    <p className="inline-flex max-w-full items-center gap-3.5 rounded-full border border-foreground/10 bg-foreground/[0.045] py-2 pl-2 pr-6 text-[0.98rem] font-medium leading-none tracking-tight text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_24px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <span aria-hidden className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-current/15 ${tone}`}>
        <span className="pulse-ring h-2.5 w-2.5 rounded-full bg-current" />
      </span>
      <span className="truncate">{availability.label}</span>
      {quiet && (
        <>
          <span aria-hidden className="hidden h-4 w-px shrink-0 bg-foreground/15 sm:block" />
          <span className="hidden truncate font-normal text-foreground/50 sm:inline">{quiet}</span>
        </>
      )}
    </p>
  )
}
