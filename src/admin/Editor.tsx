import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
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

function RowTools({ i, n, onMove, onRemove, onCopy, hidden, onToggleHide }: { i: number; n: number; onMove: (d: number) => void; onRemove: () => void; onCopy?: () => void; hidden?: boolean; onToggleHide?: () => void }) {
  const b = 'rounded-md p-1.5 text-muted-foreground transition-colors hover:text-accent disabled:opacity-30'
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={b} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp size={15} /></button>
      <button type="button" className={b} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown size={15} /></button>
      {onToggleHide && <button type="button" className={`${b} ${hidden ? '!text-accent' : ''}`} onClick={onToggleHide} aria-pressed={hidden} aria-label={hidden ? 'Show on the site' : 'Hide from the site'} title={hidden ? 'Hidden from the site — click to show' : 'Hide from the site (keeps the data)'}>{hidden ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
      {onCopy && <button type="button" className={b} onClick={onCopy} aria-label="Duplicate"><Copy size={15} /></button>}
      <button type="button" className={`${b} hover:!text-red-400`} onClick={onRemove} aria-label="Remove"><Trash2 size={15} /></button>
    </div>
  )
}

const SWATCHES = ['#ff2d6f', '#ff9f1c', '#e6c200', '#3ddc84', '#00c2a8', '#2f80ff', '#7c5cff', '#c77dff']

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
  const valid = value === '' || hex
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input type="color" aria-label="Pick a colour" value={hex && value.length === 7 ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-background p-1" />
        <input className={`${inputCls} max-w-[9rem] font-mono`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Default" spellCheck={false} />
        {!valid && <span className="text-xs text-red-400">Use a hex colour like #2f80ff, or clear it for the default</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange('')} className={`rounded-full border px-3 text-xs ${value === '' ? 'border-foreground' : 'border-border text-muted-foreground'}`}>Default</button>
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
  // Most lists keep a `hidden` flag; the resume's projects and skills already had an `include` tick, which the eye now drives (hidden = not included).
  const isHidden = (item: Obj) => (f.hideKey === 'include' ? item.include === false : Boolean(item.hidden))
  const toggle = (item: Obj): Obj => (f.hideKey === 'include' ? { ...item, include: item.include === false } : { ...item, hidden: !item.hidden })
  const titleOf = (item: Obj, i: number) => (f.titleFrom?.(item).trim()) || (f.titleKey && String(item[f.titleKey] ?? '').trim()) || `${f.label} ${i + 1}`
  // Hidden items live in their own group below, so it is always clear what visitors can see. Indexes stay those of the saved array.
  const shown = value.map((_, i) => i).filter((i) => !isHidden(value[i]))
  const hid = value.map((_, i) => i).filter((i) => isHidden(value[i]))
  const swap = (i: number, group: number[], d: number) => { // move within the item's own group: swap with its neighbour there
    const at = group.indexOf(i), j = group[at + d]
    if (j === undefined) return
    const out = value.slice();[out[i], out[j]] = [out[j], out[i]]
    onChange(out)
    if (open === i) setOpen(j)
  }
  const row = (i: number, group: number[]) => {
    const item = value[i], title = titleOf(item, i), isOpen = open === i, at = group.indexOf(i)
    return (
      <div key={i} className="rounded-lg border border-border bg-surface/50">
        <div className="flex items-center gap-1 pr-2">
          <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3 text-left">
            <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            <span className={`truncate text-sm font-medium ${isHidden(item) ? 'text-muted-foreground' : ''}`}>{title}</span>
          </button>
          <RowTools i={at} n={group.length} hidden={isHidden(item)} onToggleHide={f.hideable ? () => onChange(value.map((x, k) => (k === i ? toggle(x) : x))) : undefined}
            onMove={(d) => swap(i, group, d)}
            onCopy={() => { onChange([...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)]); setOpen(null) }}
            onRemove={() => { if (confirm(`Remove “${title}” for good? To keep it but not show it, use the eye button instead.`)) { onChange(value.filter((_, k) => k !== i)); setOpen(null) } }} />
        </div>
        {isOpen && <div className="border-t border-border p-4"><Editor fields={f.fields} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} /></div>}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {f.hideable && hid.length > 0 && <p className="t-label !text-[0.7rem] pt-1">On the site · {shown.length}</p>}
      {shown.map((i) => row(i, shown))}
      <button type="button" className={btnCls} onClick={() => { onChange([...value, blankOf(f.fields)]); setOpen(value.length) }}><Plus size={14} /> Add {f.label.toLowerCase().replace(/s$/, '')}</button>
      {hid.length > 0 && (
        <div className="mt-5 space-y-2 rounded-lg border border-dashed border-border p-3">
          <p className="t-label !text-[0.7rem] flex items-center gap-2"><EyeOff size={13} aria-hidden /> Hidden from the site · {hid.length} <span className="normal-case tracking-normal opacity-70">(kept, not deleted — click the eye to show again)</span></p>
          {hid.map((i) => row(i, hid))}
        </div>
      )}
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
