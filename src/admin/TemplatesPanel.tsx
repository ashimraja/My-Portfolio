import { Copy, ExternalLink, Mail, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { SiteContent } from '@/types'
import { btnCls, inputCls, Labeled } from './ui'

interface Template { id: string; name: string; subject: string; body: string }

const STORE = 'job-templates-v1'
const DETAILS = 'job-template-details-v1'

/** Short and plain on purpose: recruiters skim, so each one says who you are, what you are applying for, and what happens next. */
const defaults: Template[] = [
  {
    id: 'cover', name: 'Cover letter (short)', subject: '{role} application – {myname}',
    body: `Hi {contact},

I saw the {role} opening at {company} and I'd love to be considered. I'm a {title}, and I like building apps that feel quick and easy to use.

My work is here: {site}. I've attached my resume, and I'm happy to chat whenever suits you.

Thanks for your time,
{myname}
{email}`,
  },
  {
    id: 'email', name: 'Email to a recruiter', subject: 'Interested in the {role} role at {company}',
    body: `Hi {contact},

I'm {myname}, a {title}. I came across the {role} role at {company} and think I could be a good fit.

My portfolio is at {site} and my resume is attached. If it helps, I can share more about any project.

Thanks,
{myname}
{email}`,
  },
  {
    id: 'linkedin', name: 'LinkedIn message', subject: '',
    body: `Hi {contact}, I came across the {role} role at {company}. I'm a {title} and would love to be considered. Happy to send my resume or portfolio ({site}) if useful. Thanks!`,
  },
  {
    id: 'why', name: 'Why this company? (form answer)', subject: '',
    body: `{company} caught my attention, and the {role} role matches what I do every day as a {title}. I want to build things people actually use, and I think I can be useful to the team from the start.`,
  },
  {
    id: 'follow', name: 'Follow-up after a week', subject: 'Following up: {role} at {company}',
    body: `Hi {contact},

I applied for the {role} role at {company} last week and wanted to check in. I'm still very interested and happy to share anything that would help.

Thanks again,
{myname}`,
  },
  {
    id: 'thanks', name: 'Thank you after an interview', subject: 'Thank you – {role} at {company}',
    body: `Hi {contact},

Thank you for taking the time to talk with me about the {role} role at {company}. I enjoyed it and I'm even more interested now.

Please let me know if there's anything else I can send.

Best,
{myname}`,
  },
]

const read = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback } catch { return fallback } }
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* storage unavailable */ } }

/** Replaces {tokens}; one that has no value yet stays visible so a half-filled letter is never sent by accident. */
const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k]?.trim() || m)

/** Cover letter and message templates with the company name, role and so on filled in. Kept in this browser. */
export function TemplatesPanel({ site, say }: { site: SiteContent; say: (text: string, ok?: boolean) => void }) {
  const [templates, setTemplates] = useState<Template[]>(() => read(STORE, defaults))
  const [activeId, setActiveId] = useState(() => templates[0]?.id ?? '')
  const [d, setD] = useState(() => read(DETAILS, { company: '', role: '', contact: '', to: '' }))
  useEffect(() => write(STORE, templates), [templates])
  useEffect(() => write(DETAILS, d), [d])

  const p = site.portfolio
  const vars = useMemo(() => ({
    company: d.company, role: d.role || p.title, contact: d.contact || 'Hiring Team',
    myname: p.name, title: p.title, email: p.email, site: p.seo?.siteUrl ?? '',
  }), [d, p])

  const active = templates.find((t) => t.id === activeId) ?? templates[0]
  const body = active ? fill(active.body, vars) : ''
  const subject = active ? fill(active.subject, vars) : ''
  const open = /\{\w+\}/.test(body + subject)

  const edit = (patch: Partial<Template>) => setTemplates((all) => all.map((t) => (t.id === active?.id ? { ...t, ...patch } : t)))
  const copy = async (text: string, what: string) => { try { await navigator.clipboard.writeText(text); say(`${what} copied.`) } catch { say('Could not copy. Select the text and copy it by hand.', false) } }
  const add = () => { const t: Template = { id: String(Date.now()), name: 'New template', subject: '', body: 'Hi {contact},\n\n' }; setTemplates((all) => [...all, t]); setActiveId(t.id) }
  const remove = () => { if (active && confirm(`Delete “${active.name}”?`)) { const rest = templates.filter((t) => t.id !== active.id); setTemplates(rest); setActiveId(rest[0]?.id ?? '') } }
  const reset = () => { if (confirm('Replace all templates with the built-in ones? Your edits will be lost.')) { setTemplates(defaults); setActiveId(defaults[0].id) } }
  const mailto = `mailto:${encodeURIComponent(d.to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <div className="space-y-6">
      <p className="t-body !text-[0.95rem]">Type the company and role once, pick a template, then copy it or open it in your mail app. Placeholders still shown as <code className="text-accent">{'{like_this}'}</code> are not filled in yet. Templates are saved in this browser.</p>

      <section className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
        <Labeled label="Company"><input className={inputCls} value={d.company} onChange={(e) => setD({ ...d, company: e.target.value })} placeholder="Acme Inc." /></Labeled>
        <Labeled label="Role" hint={`Leave empty to use “${p.title}”.`}><input className={inputCls} value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })} placeholder="React Native Developer" /></Labeled>
        <Labeled label="Contact name" hint="Leave empty to greet “Hiring Team”."><input className={inputCls} value={d.contact} onChange={(e) => setD({ ...d, contact: e.target.value })} placeholder="Priya" /></Labeled>
        <Labeled label="Send to (email, optional)"><input className={inputCls} type="email" value={d.to} onChange={(e) => setD({ ...d, to: e.target.value })} placeholder="jobs@acme.com" /></Labeled>
      </section>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Templates">
        {templates.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === active?.id} onClick={() => setActiveId(t.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${t.id === active?.id ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-accent'}`}>{t.name}</button>
        ))}
        <button onClick={add} className={btnCls}><Plus size={14} /> New</button>
      </div>

      {active ? (
        <>
          <section className="rounded-xl border border-border bg-surface/40 p-4 sm:p-5">
            {subject && <p className="mb-3 text-sm"><span className="text-muted-foreground">Subject: </span><span className="font-medium">{subject}</span></p>}
            <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{body}</p>
            <p className="mt-4 text-xs text-muted-foreground">{body.length} characters{open ? ' · some placeholders are still empty' : ''}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={btnCls} onClick={() => copy(body, 'Message')}><Copy size={14} /> Copy message</button>
              {subject && <button className={btnCls} onClick={() => copy(subject, 'Subject')}><Copy size={14} /> Copy subject</button>}
              {subject && <button className={btnCls} onClick={() => copy(`Subject: ${subject}\n\n${body}`, 'Email')}><Copy size={14} /> Copy both</button>}
              {subject && <a className={btnCls} href={mailto}><Mail size={14} /> Open in mail app <ExternalLink size={12} aria-hidden /></a>}
            </div>
          </section>

          <details className="rounded-xl border border-border p-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">Edit this template</summary>
            <div className="mt-4 space-y-4">
              <Labeled label="Template name"><input className={inputCls} value={active.name} onChange={(e) => edit({ name: e.target.value })} /></Labeled>
              <Labeled label="Subject (leave empty for messages that have none)"><input className={inputCls} value={active.subject} onChange={(e) => edit({ subject: e.target.value })} /></Labeled>
              <Labeled label="Message" hint="Placeholders: {company} {role} {contact} {myname} {title} {email} {site}"><textarea className={inputCls} rows={10} value={active.body} onChange={(e) => edit({ body: e.target.value })} /></Labeled>
              <div className="flex gap-2"><button className={btnCls} onClick={remove}><Trash2 size={14} /> Delete template</button></div>
            </div>
          </details>
        </>
      ) : <p className="text-muted-foreground">No templates yet. Add one, or restore the built-in set.</p>}

      <button className={btnCls} onClick={reset}><RotateCcw size={14} /> Restore built-in templates</button>
    </div>
  )
}
