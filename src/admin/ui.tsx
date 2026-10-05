import type { ReactNode } from 'react'

export const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent'
export const btnCls = 'inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40'
export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'

export function Labeled({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}
