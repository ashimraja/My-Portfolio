import { Copy, Download, FilePlus2, Pencil, RefreshCw, Save, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Editor } from '@/admin/Editor'
import { getClient } from '@/admin/supabase'
import { btnCls, btnPrimary, inputCls } from '@/admin/ui'
import type { SiteContent } from '@/types'
import { resumeSections } from './fields'
import { addMissingProjects, buildFromSite, normalizeResume, type ResumeData, type ResumeVersion } from './model'
import { ResumePage } from './ResumePage'

const MM = 96 / 25.4
const PAGE_CONTENT_MM = 297 - 28 // A4 height minus the 14 mm top and bottom print margins
const json = (v: unknown) => JSON.stringify(v)
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `r${Date.now()}`)

/** A4 sheet scaled to the available width, with dashed guides where page breaks fall. */
export function Preview({ data }: { data: ResumeData }) {
  const box = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (!box.current || !sheet.current) return
      const s = Math.min(1, box.current.clientWidth / (210 * MM))
      setScale(s); setHeight(sheet.current.offsetHeight * s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box.current!); ro.observe(sheet.current!)
    return () => ro.disconnect()
  }, [data])

  const contentPx = Math.max(0, (sheet.current?.offsetHeight ?? 0) - 28 * MM)
  const pages = Math.max(1, Math.ceil(contentPx / (PAGE_CONTENT_MM * MM) - 0.001))
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">Preview · about <b className="text-foreground">{pages} page{pages > 1 ? 's' : ''}</b> (A4). Dashed lines show roughly where pages break.</p>
      <div ref={box} className="w-full overflow-hidden rounded-lg border border-border bg-neutral-300 p-0" style={{ height: height + 2 }}>
        <div ref={sheet} className="relative origin-top-left bg-white" style={{ width: '210mm', transform: `scale(${scale})`, boxShadow: '0 0 0 1px rgba(0,0,0,.08)' }}>
          <ResumePage data={data} />
          {Array.from({ length: pages - 1 }, (_, k) => (
            <div key={k} aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-dashed border-sky-500/70" style={{ top: `${14 + (k + 1) * PAGE_CONTENT_MM}mm` }}>
              <span className="absolute right-2 -top-4 text-[9px] text-sky-600">page {k + 2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ResumePanel({ site, say }: { site: SiteContent; say: (t: string, ok?: boolean) => void }) {
  const sb = getClient()
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [activeId, setActiveId] = useState('')
  const [name, setName] = useState('Default')
  const [draft, setDraft] = useState<ResumeData | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [tab, setTab] = useState('header')
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [busy, setBusy] = useState(false)

  const dirty = draft !== null && json({ n: name, d: draft }) !== savedJson

  const open = useCallback((v: { id: string; name: string; data: ResumeData }, saved = true) => {
    setActiveId(v.id); setName(v.name); setDraft(v.data)
    setSavedJson(saved ? json({ n: v.name, d: v.data }) : '')
  }, [])

  useEffect(() => {
    void (async () => {
      const { data, error } = await sb.from('resumes').select('*').order('updated_at', { ascending: false })
      if (error) { setState(/relation|schema cache|does not exist/i.test(error.message) ? 'missing' : 'error'); return }
      const list = (data as ResumeVersion[]).map((v) => ({ ...v, data: normalizeResume(v.data, site) }))
      setVersions(list)
      if (list.length) open(list[0]); else open({ id: newId(), name: 'Default', data: buildFromSite(site) }, false)
      setState('ready')
    })()
    // load once; later site edits are pulled in explicitly with “Re-fill from website”
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmLeave = () => !dirty || confirm('You have unsaved changes in this resume. Continue and lose them?')

  const save = async () => {
    if (!draft) return
    setBusy(true)
    const row = { id: activeId, name, data: draft, updated_at: new Date().toISOString() }
    const { error } = await sb.from('resumes').upsert(row)
    setBusy(false)
    if (error) return say(error.message, false)
    setVersions((vs) => [row, ...vs.filter((v) => v.id !== activeId)])
    setSavedJson(json({ n: name, d: draft }))
    say('Resume saved.')
  }
  const create = (data: ResumeData, label: string) => {
    if (!confirmLeave()) return
    const n = prompt('Name this resume (e.g. “Company – Role”)', label)
    if (!n) return
    open({ id: newId(), name: n, data }, false)
  }
  const rename = () => { const n = prompt('Rename this resume', name); if (n) setName(n) }
  const remove = async () => {
    if (!confirm(`Delete the resume “${name}”?`)) return
    await sb.from('resumes').delete().eq('id', activeId)
    const rest = versions.filter((v) => v.id !== activeId)
    setVersions(rest)
    if (rest.length) open(rest[0]); else open({ id: newId(), name: 'Default', data: buildFromSite(site) }, false)
    say('Resume deleted.')
  }
  const refill = () => { if (draft && confirm('Replace everything in this resume with the current website content?')) setDraft(buildFromSite(site)) }
  const addMissing = () => { if (!draft) return; const next = addMissingProjects(draft, site); say(next.projects.length === draft.projects.length ? 'No new website projects to add.' : `Added ${next.projects.length - draft.projects.length} project(s).`); setDraft(next) }

  const printPdf = () => {
    if (!draft) return
    const prev = document.title
    document.title = `${draft.name} - Resume`
    document.body.classList.add('resume-printing')
    const done = () => { document.body.classList.remove('resume-printing'); document.title = prev; window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    setTimeout(() => window.print(), 60)
  }

  const section = useMemo(() => resumeSections.find((s) => s.id === tab) ?? resumeSections[0], [tab])

  if (state === 'loading') return <p className="text-muted-foreground">Loading…</p>
  if (state === 'error') return <p className="text-red-400">Could not load resumes. Check your connection and sign-in.</p>
  if (state === 'missing') return (
    <div className="max-w-xl space-y-3">
      <h2 className="t-title">One more step: create the resume table</h2>
      <p className="t-body !text-[0.95rem]">Resumes are stored privately in their own table. In Supabase → SQL Editor, paste <code className="rounded bg-surface px-1.5 py-0.5">supabase/resume.sql</code> from this project (replace <code className="rounded bg-surface px-1.5 py-0.5">you@example.com</code> with your admin email) and press Run. Then reload this page.</p>
    </div>
  )
  if (!draft) return null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <select className={`${inputCls} max-w-[16rem]`} value={activeId} aria-label="Resume version"
          onChange={(e) => { const v = versions.find((x) => x.id === e.target.value); if (v && confirmLeave()) open(v) }}>
          {!versions.some((v) => v.id === activeId) && <option value={activeId}>{name} (unsaved)</option>}
          {versions.map((v) => <option key={v.id} value={v.id}>{v.id === activeId ? name : v.name}</option>)}
        </select>
        <button className={btnCls} onClick={() => create(buildFromSite(site), 'New resume')}><FilePlus2 size={14} /> New from website</button>
        <button className={btnCls} onClick={() => create(draft, `${name} copy`)}><Copy size={14} /> Duplicate</button>
        <button className={btnCls} onClick={rename}><Pencil size={14} /> Rename</button>
        <button className={btnCls} onClick={remove}><Trash2 size={14} /> Delete</button>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{dirty ? 'Unsaved changes' : 'Saved'}</span>
          <button className={btnPrimary} disabled={busy || !dirty} onClick={save}><Save size={15} /> {busy ? 'Saving…' : 'Save'}</button>
          <button className={btnPrimary} onClick={printPdf}><Download size={15} /> Download PDF</button>
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {resumeSections.map((s) => (
              <button key={s.id} onClick={() => setTab(s.id)} className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${tab === s.id ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-accent'}`}>{s.label}</button>
            ))}
            <button className={`${btnCls} ml-auto`} onClick={refill} title="Replace this resume with the website content"><RefreshCw size={14} /> Re-fill from website</button>
          </div>
          {tab === 'projects' && <button className={btnCls} onClick={addMissing}>Add website projects missing from this resume</button>}
          <Editor fields={section.fields} value={draft as unknown as Record<string, unknown>} onChange={(v) => setDraft(v as unknown as ResumeData)} />
        </div>
        <div className="min-w-0 xl:sticky xl:top-20 xl:self-start"><Preview data={draft} /></div>
      </div>

      <p className="text-xs text-muted-foreground">Download PDF opens your browser’s print dialog: choose <b>Save as PDF</b> and paper size <b>A4</b>. The browser’s own header and footer (title, date, page address) are suppressed by the template. Text stays selectable, so applicant-tracking systems can read it.</p>

      {createPortal(<div id="resume-print-root"><ResumePage data={draft} /></div>, document.body)}
    </div>
  )
}
