import type { Session } from '@supabase/supabase-js'
import { ChevronDown, ExternalLink, LogOut, Menu, Save, Undo2, UploadCloud } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Editor } from '@/admin/Editor'
import { MessagesPanel } from '@/admin/MessagesPanel'
import { sections } from '@/admin/schema'
import { getClient } from '@/admin/supabase'
import { btnCls, btnPrimary, inputCls, Labeled } from '@/admin/ui'
import { defaultContent, contentKeys } from '@/content/defaults'
import { mergeDeep } from '@/content/merge'
import { cloudEnabled } from '@/lib/cloud'
import { applyAccent } from '@/lib/theme'
import type { ContentKey, SiteContent } from '@/types'

const ResumePanel = lazy(() => import('@/admin/resume/ResumePanel'))

type Obj = Record<string, unknown>
const json = (v: unknown) => JSON.stringify(v)

export default function AdminPage() {
  useEffect(() => {
    document.title = 'Dashboard'
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m)
    return () => { m.remove() }
  }, [])
  return (
    <div data-lenis-prevent className="min-h-screen bg-background text-foreground">
      {cloudEnabled ? <AuthGate /> : <SetupGuide />}
    </div>
  )
}

/* ───────────────────────── setup guide (no cloud configured) ───────────────────────── */
function SetupGuide() {
  const steps = [
    ['Create a free project', 'supabase.com → New project. Copy the Project URL and the anon public key (Project Settings → API).'],
    ['Create the tables', 'SQL Editor → paste supabase/schema.sql from this repo. Replace you@example.com with your admin email first, then Run.'],
    ['Create your admin user', 'Authentication → Users → Add user (email + password). Then Authentication → Sign In / Providers → turn OFF “Allow new users to sign up”.'],
    ['Add the keys', 'Copy .env.example to .env and fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add the same two variables to your hosting provider. Restart the dev server.'],
    ['Come back here', 'Sign in, then press “Publish all content to cloud” once. From then on you can edit everything in this dashboard.'],
  ]
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="t-display t-xl">Dashboard setup</h1>
      <p className="t-body mt-4">The cloud database isn’t connected yet, so the site is showing its built-in content. Five quick steps:</p>
      <ol className="mt-8 space-y-5">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{i + 1}</span>
            <div><p className="font-medium">{title}</p><p className="t-body !text-[0.95rem]">{text}</p></div></li>
        ))}
      </ol>
    </main>
  )
}

/* ───────────────────────── login ───────────────────────── */
function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    const sb = getClient()
    void sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <p className="p-10 text-muted-foreground">Loading…</p>
  return session ? <Dashboard email={session.user.email ?? ''} /> : <Login />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    const { error: err } = await getClient().auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setBusy(false)
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="t-display t-lg">Dashboard</h1>
      <p className="t-body mb-8 mt-2 !text-[0.95rem]">Sign in to edit your portfolio.</p>
      <form onSubmit={submit} className="space-y-4">
        <Labeled label="Email"><input className={inputCls} type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></Labeled>
        <Labeled label="Password"><input className={inputCls} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Labeled>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  )
}

/* ───────────────────────── dashboard ───────────────────────── */
function Dashboard({ email }: { email: string }) {
  const sb = getClient()
  const [drafts, setDrafts] = useState<SiteContent>(defaultContent)
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [inCloud, setInCloud] = useState<Set<string>>(new Set())
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [active, setActive] = useState('profile')
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const [unread, setUnread] = useState(0)
  const [busy, setBusy] = useState(false)
  const [raw, setRaw] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pick = (id: string) => { setActive(id); setRaw(null); setMenuOpen(false) }

  const say = useCallback((text: string, ok = true) => { setToast({ text, ok }); setTimeout(() => setToast(null), 3500) }, [])

  useEffect(() => {
    void (async () => {
      const { data, error } = await sb.from('content').select('key,value')
      if (error) { setState('error'); say(`Could not load: ${error.message}`, false); return }
      const remote = Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]))
      const next = { ...defaultContent } as Obj
      for (const k of contentKeys) next[k] = mergeDeep(defaultContent[k], remote[k])
      setDrafts(next as unknown as SiteContent)
      setSaved(Object.fromEntries(contentKeys.map((k) => [k, json(next[k])])))
      setInCloud(new Set(Object.keys(remote)))
      setState('ready')
      const { count } = await sb.from('messages').select('id', { count: 'exact', head: true }).eq('read', false)
      setUnread(count ?? 0)
    })()
  }, [sb, say])

  // Live preview: the dashboard itself wears the colour you are editing.
  const accent = drafts.portfolio.theme?.accent
  useEffect(() => { applyAccent(accent) }, [accent])

  const dirtyKeys = useMemo(() => new Set(contentKeys.filter((k) => saved[k] !== undefined && json(drafts[k]) !== saved[k])), [drafts, saved])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirtyKeys.size) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirtyKeys])

  const section = sections.find((s) => s.id === active)
  const key = section?.key as ContentKey | undefined
  const setKey = (k: ContentKey, v: unknown) => setDrafts((d) => ({ ...d, [k]: v }) as SiteContent)

  const save = async (keys: ContentKey[]) => {
    setBusy(true)
    const rows = keys.map((k) => ({ key: k, value: drafts[k], updated_at: new Date().toISOString() }))
    const { error } = await sb.from('content').upsert(rows)
    setBusy(false)
    if (error) return say(error.message.includes('row-level security') ? 'Not allowed: sign in with the admin email set in schema.sql.' : error.message, false)
    setSaved((s) => ({ ...s, ...Object.fromEntries(keys.map((k) => [k, json(drafts[k])])) }))
    setInCloud((c) => new Set([...c, ...keys]))
    say(keys.length > 1 ? 'Everything published to the cloud.' : 'Saved. Your site shows it on the next page load.')
  }
  const discard = (k: ContentKey) => setKey(k, JSON.parse(saved[k]))
  const resetDefault = (k: ContentKey) => { if (confirm('Replace this section with the built-in default content?')) setKey(k, defaultContent[k]) }

  const currentLabel = active === 'resume' ? 'Resume builder' : active === 'messages' ? 'Messages' : (sections.find((x) => x.id === active)?.label ?? 'Menu')
  const grouped = sections.reduce<Record<string, typeof sections>>((acc, s) => { (acc[s.group] ??= []).push(s); return acc }, {})

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6">
        <p className="font-medium">Dashboard <span className="hidden text-sm text-muted-foreground sm:inline">· {email}</span></p>
        <div className="flex items-center gap-2">
          <a className={btnCls} href="/" target="_blank" rel="noreferrer"><ExternalLink size={14} /> View site</a>
          <button className={btnCls} onClick={() => sb.auth.signOut()}><LogOut size={14} /> Sign out</button>
        </div>
      </header>

      <div className={`mx-auto grid gap-6 px-4 py-6 md:grid-cols-[13rem_1fr] md:px-6 ${active === 'resume' ? 'max-w-[92rem]' : 'max-w-6xl'}`}>
        <nav aria-label="Sections" className="md:sticky md:top-20 md:self-start">
          {/* Phone: a menu button showing the current section; it opens the same list the desktop sidebar shows. */}
          <button type="button" aria-expanded={menuOpen} aria-controls="admin-menu" onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface/60 px-4 py-3 text-left md:hidden">
            <span className="flex items-center gap-2.5 font-medium"><Menu size={18} aria-hidden /> {currentLabel}{dirtyKeys.size > 0 && <span aria-label="unsaved changes" className="h-2 w-2 rounded-full bg-accent" />}</span>
            <ChevronDown size={18} aria-hidden className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          <div id="admin-menu" className={`${menuOpen ? 'mt-3 block' : 'hidden'} space-y-5 rounded-xl border border-border bg-surface/40 p-3 md:mt-0 md:block md:border-0 md:bg-transparent md:p-0`}>
            {Object.entries(grouped).map(([g, items]) => (
              <div key={g}><p className="mb-1.5 px-3 text-xs text-muted-foreground">{g}</p>
                {items.map((s) => (
                  <button key={s.id} onClick={() => pick(s.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${active === s.id ? 'bg-accent text-accent-foreground' : 'hover:bg-surface'}`}>
                    {s.label}{dirtyKeys.has(s.key) && <span aria-label="unsaved changes" className={`h-2 w-2 rounded-full ${active === s.id ? 'bg-accent-foreground' : 'bg-accent'}`} />}
                  </button>
                ))}
              </div>
            ))}
            <div><p className="mb-1.5 px-3 text-xs text-muted-foreground">Tools</p>
              <button onClick={() => pick('resume')} className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${active === 'resume' ? 'bg-accent text-accent-foreground' : 'hover:bg-surface'}`}>Resume builder</button></div>
            <div><p className="mb-1.5 px-3 text-xs text-muted-foreground">Inbox</p>
              <button onClick={() => pick('messages')} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${active === 'messages' ? 'bg-accent text-accent-foreground' : 'hover:bg-surface'}`}>
                Messages{unread > 0 && <span className="rounded-full bg-accent px-2 text-xs font-semibold text-accent-foreground">{unread}</span>}
              </button></div>
            <button className={`${btnCls} w-full`} disabled={busy || state !== 'ready'} onClick={() => { void save(contentKeys); setMenuOpen(false) }}><UploadCloud size={14} /> Publish all content</button>
          </div>
        </nav>

        <main className="min-w-0 pb-28">
          {state === 'loading' && <p className="text-muted-foreground">Loading content…</p>}
          {state === 'error' && <p className="text-red-400">Couldn’t reach the database. Check your keys and that schema.sql has been run.</p>}
          {state === 'ready' && active === 'resume' && (<><h1 className="t-title-lg mb-5">Resume builder</h1><Suspense fallback={<p className="text-muted-foreground">Loading…</p>}><ResumePanel site={drafts} say={say} /></Suspense></>)}
          {state === 'ready' && active === 'messages' && (<><h1 className="t-title-lg mb-5">Messages</h1><MessagesPanel onUnread={setUnread} /></>)}
          {state === 'ready' && section && key && (
            <>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <h1 className="t-title-lg">{section.label}</h1>
                {!inCloud.has(key) && <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Not saved to the cloud yet — showing built-in content</span>}
              </div>
              <Editor fields={section.fields} value={drafts[key] as unknown as Obj} onChange={(v) => setKey(key, v)} />

              <details className="mt-8 rounded-lg border border-border p-4" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) setRaw(JSON.stringify(drafts[key], null, 2)) }}>
                <summary className="cursor-pointer text-sm text-muted-foreground">Advanced: edit raw JSON</summary>
                <textarea className={`${inputCls} mt-3 font-mono text-xs`} rows={14} value={raw ?? ''} onChange={(e) => setRaw(e.target.value)} spellCheck={false} />
                <button className={`${btnCls} mt-2`} onClick={() => { try { setKey(key, JSON.parse(raw ?? '')); say('JSON applied. Review and press Save.') } catch { say('That is not valid JSON.', false) } }}>Apply JSON</button>
              </details>

              <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:left-[calc(50%-36rem+13rem+1.5rem)] md:px-6">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 md:pl-0">
                  <button className={btnPrimary} disabled={busy || !dirtyKeys.has(key)} onClick={() => save([key])}><Save size={15} /> {busy ? 'Saving…' : 'Save changes'}</button>
                  <button className={btnCls} disabled={!dirtyKeys.has(key)} onClick={() => discard(key)}><Undo2 size={14} /> Discard</button>
                  <button className={btnCls} onClick={() => resetDefault(key)}>Reset to default</button>
                  <span className="ml-auto text-xs text-muted-foreground">{dirtyKeys.has(key) ? 'Unsaved changes' : 'All changes saved'}</span>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {toast && <div role="status" className={`fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm shadow-lg ${toast.ok ? 'bg-foreground text-background' : 'bg-red-500 text-white'}`}>{toast.text}</div>}
    </div>
  )
}
