import type { KindFilter } from '@/lib/projectKind'

const OPTIONS: { id: KindFilter; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'mobile', label: 'Mobile' }, { id: 'web', label: 'Web' }]

/** Segmented All / Mobile / Web switch. Options with no projects are left out, and it hides itself when there is nothing to choose between. */
export function KindToggle({ value, onChange, counts, label = 'Filter projects by type' }: { value: KindFilter; onChange: (v: KindFilter) => void; counts: Record<KindFilter, number>; label?: string }) {
  const shown = OPTIONS.filter((o) => o.id === 'all' || counts[o.id] > 0)
  if (counts.mobile === 0 || counts.web === 0) return null
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 rounded-full border border-border bg-background/60 p-1 backdrop-blur-md">
      {shown.map((o) => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={value === o.id} data-cursor="hover"
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[0.72rem] transition-colors duration-300 ${value === o.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
          {o.label}<span className={value === o.id ? 'opacity-60' : 'text-accent'}>{counts[o.id]}</span>
        </button>
      ))}
    </div>
  )
}
