import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Screenshot } from '@/types'
import { ImageField } from './ImageField'
import { blankOf, type Field } from './schema'
import { btnCls, inputCls, Labeled } from './ui'

type Obj = Record<string, unknown>
const asObj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {})
const asArr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d
  if (j < 0 || j >= arr.length) return arr
  const out = arr.slice();[out[i], out[j]] = [out[j], out[i]]
  return out
}

function RowTools({ i, n, onMove, onRemove, onCopy }: { i: number; n: number; onMove: (d: number) => void; onRemove: () => void; onCopy?: () => void }) {
  const b = 'rounded-md p-1.5 text-muted-foreground transition-colors hover:text-accent disabled:opacity-30'
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={b} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp size={15} /></button>
      <button type="button" className={b} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown size={15} /></button>
      {onCopy && <button type="button" className={b} onClick={onCopy} aria-label="Duplicate"><Copy size={15} /></button>}
      <button type="button" className={`${b} hover:!text-red-400`} onClick={onRemove} aria-label="Remove"><Trash2 size={15} /></button>
    </div>
  )
}

const SWATCHES = ['#ff5b2e', '#ff2d6f', '#ff9f1c', '#e6c200', '#3ddc84', '#00c2a8', '#2f80ff', '#7c5cff', '#c77dff']

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input type="color" aria-label="Pick a colour" value={valid && value.length === 7 ? value : '#ff5b2e'} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-background p-1" />
        <input className={`${inputCls} max-w-[9rem] font-mono`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="#ff5b2e" spellCheck={false} />
        {!valid && <span className="text-xs text-red-400">Use a hex colour like #ff5b2e</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((c) => <button key={c} type="button" onClick={() => onChange(c)} aria-label={`Use ${c}`} className="h-8 w-8 rounded-full border border-border transition-transform hover:scale-110" style={{ background: c, outline: c.toLowerCase() === value.toLowerCase() ? '2px solid var(--foreground)' : 'none', outlineOffset: 2 }} />)}
      </div>
    </div>
  )
}

function StringList({ value, onChange, multiline }: { value: string[]; onChange: (v: string[]) => void; multiline?: boolean }) {
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline
            ? <textarea className={`${inputCls} min-h-[4.5rem]`} rows={2} value={s} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
            : <input className={inputCls} value={s} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />}
          <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
        </div>
      ))}
      <button type="button" className={btnCls} onClick={() => onChange([...value, ''])}><Plus size={14} /> Add</button>
    </div>
  )
}

function ImageList({ value, onChange }: { value: Screenshot[]; onChange: (v: Screenshot[]) => void }) {
  const norm = value.map((s) => (typeof s === 'string' ? { src: s, caption: '' } : { src: s.src, caption: s.caption ?? '' }))
  const out = (list: { src: string; caption: string }[]) => onChange(list.map((x) => (x.caption ? { src: x.src, caption: x.caption } : x.src)))
  return (
    <div className="space-y-3">
      {norm.map((s, i) => (
        <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs text-muted-foreground">Image {i + 1}</span>
            <RowTools i={i} n={norm.length} onMove={(d) => out(move(norm, i, d))} onRemove={() => out(norm.filter((_, k) => k !== i))} /></div>
          <ImageField value={s.src} onChange={(src) => out(norm.map((x, k) => (k === i ? { ...x, src } : x)))} />
          <input className={`${inputCls} mt-2`} placeholder="Caption (optional)" value={s.caption} onChange={(e) => out(norm.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))} />
        </div>
      ))}
      <button type="button" className={btnCls} onClick={() => out([...norm, { src: '', caption: '' }])}><Plus size={14} /> Add image</button>
    </div>
  )
}

function ObjectList({ f, value, onChange }: { f: Extract<Field, { kind: 'list' }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null)
  return (
    <div className="space-y-2">
      {value.map((item, i) => {
        const title = (f.titleFrom?.(item).trim()) || (f.titleKey && String(item[f.titleKey] ?? '').trim()) || `${f.label} ${i + 1}`
        const isOpen = open === i
        return (
          <div key={i} className="rounded-lg border border-border bg-surface/50">
            <div className="flex items-center gap-1 pr-2">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3 text-left">
                <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                <span className="truncate text-sm font-medium">{title}</span>
              </button>
              <RowTools i={i} n={value.length} onMove={(d) => { onChange(move(value, i, d)); if (isOpen) setOpen(i + d) }}
                onCopy={() => onChange([...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)])}
                onRemove={() => { if (confirm(`Remove “${title}”?`)) { onChange(value.filter((_, k) => k !== i)); setOpen(null) } }} />
            </div>
            {isOpen && <div className="border-t border-border p-4"><Editor fields={f.fields} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} /></div>}
          </div>
        )
      })}
      <button type="button" className={btnCls} onClick={() => { onChange([...value, blankOf(f.fields)]); setOpen(value.length) }}><Plus size={14} /> Add {f.label.toLowerCase().replace(/s$/, '')}</button>
    </div>
  )
}

/** Renders a form for `fields` against `value` (an object) and reports every change as a new immutable object. */
export function Editor({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v })
  return (
    <div className="space-y-5">
      {fields.map((f) => {
        const v = value[f.key]
        switch (f.kind) {
          case 'text': case 'url': case 'email':
            return <Labeled key={f.key} label={f.label} hint={f.hint}><input className={inputCls} type={f.kind === 'text' ? 'text' : f.kind} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} /></Labeled>
          case 'textarea':
            return <Labeled key={f.key} label={f.label} hint={f.hint}><textarea className={`${inputCls} resize-y`} rows={f.rows ?? 3} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} /></Labeled>
          case 'number':
            return <Labeled key={f.key} label={f.label} hint={f.hint}><input className={inputCls} type="number" value={Number(v ?? 0)} onChange={(e) => set(f.key, Number(e.target.value))} /></Labeled>
          case 'select':
            return <Labeled key={f.key} label={f.label}><select className={inputCls} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o} value={o}>{f.labels?.[o] ?? (o || '— none —')}</option>)}</select></Labeled>
          case 'boolean':
            return (
              <label key={f.key} className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />
                <span><span className="block text-sm font-medium">{f.label}</span>{f.hint && <span className="block text-xs text-muted-foreground">{f.hint}</span>}</span>
              </label>
            )
          case 'color':
            return <div key={f.key}><span className="mb-1.5 block text-sm font-medium">{f.label}</span><ColorField value={String(v ?? '')} onChange={(x) => set(f.key, x)} />{f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}</div>
          case 'image':
            return <div key={f.key}><span className="mb-1.5 block text-sm font-medium">{f.label}</span><ImageField value={String(v ?? '')} onChange={(x) => set(f.key, x)} />{f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}</div>
          case 'strings':
            return <div key={f.key}><span className="mb-1.5 block text-sm font-medium">{f.label}</span><StringList multiline={f.multiline} value={asArr<string>(v)} onChange={(x) => set(f.key, x)} />{f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}</div>
          case 'images':
            return <div key={f.key}><span className="mb-1.5 block text-sm font-medium">{f.label}</span><ImageList value={asArr<Screenshot>(v)} onChange={(x) => set(f.key, x)} />{f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}</div>
          case 'group':
            return (
              <fieldset key={f.key} className="rounded-xl border border-border p-4 md:p-5">
                <legend className="px-2 text-sm font-semibold text-accent">{f.label}</legend>
                <Editor fields={f.fields} value={asObj(v)} onChange={(x) => set(f.key, x)} />
              </fieldset>
            )
          case 'list':
            return <div key={f.key}><span className="mb-1.5 block text-sm font-medium">{f.label}</span><ObjectList f={f} value={asArr<Obj>(v)} onChange={(x) => set(f.key, x)} />{f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}</div>
        }
      })}
    </div>
  )
}
