import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SiteContent } from '@/types'
import { placeOf } from './geo'
import { getClient } from './supabase'
import { btnCls } from './ui'

interface Ev { created_at: string; visitor: string; session: string; type: string; path: string | null; target: string | null; referrer: string | null; source: string | null; device: string | null; browser: string | null; tz: string | null; country_code?: string | null; country?: string | null; region?: string | null; city?: string | null; lat?: number | null; lon?: number | null }

const BASE_COLS = 'created_at,visitor,session,type,path,target,referrer,source,device,browser,tz'
const COLS = `${BASE_COLS},country_code,country,region,city,lat,lon`
const PAGE = 1000
const CAP = 30000
const RANGES = [{ days: 7, label: '7 days' }, { days: 30, label: '30 days' }, { days: 90, label: '90 days' }]
const SECTIONS: [string, string][] = [['work', 'Work'], ['about', 'About'], ['stack', 'Stack'], ['experience', 'Experience'], ['education', 'Education'], ['resume', 'Resume'], ['testimonials', 'Testimonials'], ['contact', 'Contact']]

const dayKey = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const count = <T,>(items: T[], key: (i: T) => string | null | undefined) => {
  const m = new Map<string, number>()
  for (const i of items) { const k = key(i); if (k) m.set(k, (m.get(k) ?? 0) + 1) }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}
const distinct = (items: Ev[], key: 'visitor' | 'session') => new Set(items.map((e) => e[key])).size

/** Pulls every event in the range (the API returns 1000 rows at a time). */
async function load(days: number, cols = COLS): Promise<Ev[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const out: Ev[] = []
  for (let from = 0; from < CAP; from += PAGE) {
    const { data, error } = await getClient().from('events').select(cols).gte('created_at', since).order('created_at', { ascending: true }).range(from, from + PAGE - 1)
    if (error) {
      // the location columns are added by supabase/geo.sql; until it has been run, show everything else
      if (cols === COLS && /column|country|city|lat|lon/i.test(error.message)) return load(days, BASE_COLS)
      throw error
    }
    out.push(...(data as unknown as Ev[]))
    if ((data?.length ?? 0) < PAGE) break
  }
  return out
}

/** Visitor analytics: no cookies, no IP addresses stored; one random id per browser and one per visit, plus the place each visit came from. */
export function AnalyticsPanel({ site }: { site: SiteContent }) {
  const [days, setDays] = useState(30)
  const [events, setEvents] = useState<Ev[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setBusy(true); setError('')
    try { setEvents(await load(days)) } catch (e) { setError((e as { message?: string }).message ?? 'Could not load analytics.'); setEvents(null) }
    setBusy(false)
  }, [days])
  useEffect(() => { void refresh() }, [refresh])

  const titleOf = useMemo(() => {
    const m = new Map(site.projects.items.map((p) => [p.slug, p.title]))
    return (slug: string) => m.get(slug) ?? slug
  }, [site])

  const s = useMemo(() => {
    if (!events) return null
    const views = events.filter((e) => e.type === 'pageview')
    const sessions = distinct(events, 'session')
    const visitors = distinct(events, 'visitor')

    const perVisitor = new Map<string, Set<string>>()
    for (const e of events) { if (!perVisitor.has(e.visitor)) perVisitor.set(e.visitor, new Set()); perVisitor.get(e.visitor)!.add(e.session) }
    const returning = [...perVisitor.values()].filter((x) => x.size > 1).length

    const byDay = new Map<string, { views: number; visitors: Set<string> }>()
    for (let i = days - 1; i >= 0; i--) byDay.set(dayKey(new Date(Date.now() - i * 86_400_000).toISOString()), { views: 0, visitors: new Set() })
    for (const e of views) { const d = byDay.get(dayKey(e.created_at)); if (d) { d.views++; d.visitors.add(e.visitor) } }

    // one row per visit for "where from / what device"
    const firstOfSession = new Map<string, Ev>()
    for (const e of events) if (!firstOfSession.has(e.session)) firstOfSession.set(e.session, e)
    const visits = [...firstOfSession.values()]

    const slugs = new Set<string>()
    for (const e of events) {
      if (e.type === 'pageview' && e.path?.startsWith('/work/')) slugs.add(e.path.slice(6))
      if (e.type === 'project_click' && e.target) slugs.add(e.target)
      if (e.type === 'store_click' && e.target) slugs.add(e.target.split(':')[0])
    }
    const projects = [...slugs].map((slug) => {
      const opened = views.filter((e) => e.path === `/work/${slug}`)
      return {
        slug, clicks: events.filter((e) => e.type === 'project_click' && e.target === slug).length,
        views: opened.length, readers: distinct(opened, 'visitor'),
        stores: events.filter((e) => e.type === 'store_click' && e.target?.split(':')[0] === slug).length,
      }
    }).sort((a, b) => b.views + b.clicks - (a.views + a.clicks))

    const reached = (id: string) => new Set(events.filter((e) => e.type === 'section' && e.target === id).map((e) => e.session)).size
    const sessionsWhere = (f: (e: Ev) => boolean) => new Set(events.filter(f).map((e) => e.session)).size
    return {
      views: views.length, sessions, visitors, returning, byDay: [...byDay.entries()],
      pages: count(views, (e) => e.path),
      projects,
      sections: SECTIONS.map(([id, label]) => [label, reached(id)] as [string, number]),
      referrers: count(visits, (e) => e.referrer || 'Direct / unknown'),
      tags: count(visits, (e) => e.source),
      countries: count(visits, (e) => placeOf(e).country),
      cities: count(visits, (e) => placeOf(e).city),
      realPlaces: visits.filter((e) => e.country_code).length,
      recent: [...visits].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 12),
      devices: count(visits, (e) => e.device), browsers: count(visits, (e) => e.browser),
      outbound: count(events.filter((e) => e.type === 'outbound'), (e) => e.target),
      resume: events.filter((e) => e.type === 'resume_download').length,
      contact: events.filter((e) => e.type === 'contact').length,
      funnel: [
        ['Visited the site', sessions],
        ['Looked at projects', reached('work')],
        ['Opened a case study', sessionsWhere((e) => e.type === 'pageview' && !!e.path?.startsWith('/work/'))],
        ['Downloaded the resume', sessionsWhere((e) => e.type === 'resume_download')],
        ['Sent a message', sessionsWhere((e) => e.type === 'contact')],
      ] as [string, number][],
    }
  }, [events, days])

  const missing = /relation|does not exist|schema cache|events/i.test(error)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button key={r.days} onClick={() => setDays(r.days)} aria-pressed={days === r.days}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${days === r.days ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-accent'}`}>Last {r.label}</button>
        ))}
        <button className={`${btnCls} ml-auto`} onClick={() => void refresh()} disabled={busy}><RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Refresh</button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-border p-4 text-sm">
          <p className="text-red-400">{error}</p>
          {missing && <p className="mt-2 text-muted-foreground">The analytics table doesn’t exist yet. In Supabase → SQL Editor, run the “events” block at the bottom of <code>supabase/schema.sql</code> (with your admin email in place of you@example.com), then press Refresh.</p>}
        </div>
      )}
      {!events && !error && <p className="text-muted-foreground">Loading…</p>}

      {s && (
        <>
          <p className="text-xs text-muted-foreground">Your own visits are excluded in this browser. Tracking is skipped on localhost, for bots, and when a visitor has “Do Not Track” on, so numbers are a floor, not an exact count.</p>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Visitors" value={s.visitors} note={s.returning ? `${s.returning} came back` : undefined} />
            <Stat label="Visits" value={s.sessions} />
            <Stat label="Page views" value={s.views} />
            <Stat label="Resume downloads" value={s.resume} note={s.contact ? `${s.contact} message${s.contact > 1 ? 's' : ''} sent` : undefined} />
          </div>

          <Card title="Visitors per day"><DayChart days={s.byDay} /></Card>

          <Card title="Projects" hint="Clicks are taps on a project card on the home page. Opened is how many times its case study page was loaded.">
            {s.projects.length === 0 ? <Empty /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] text-left text-sm">
                  <thead className="text-xs text-muted-foreground"><tr><th className="py-2 pr-3 font-normal">Project</th><th className="px-3 font-normal">Card clicks</th><th className="px-3 font-normal">Opened</th><th className="px-3 font-normal">People</th><th className="pl-3 font-normal">Store clicks</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {s.projects.map((p) => <tr key={p.slug}><td className="py-2.5 pr-3 font-medium">{titleOf(p.slug)}</td><td className="px-3">{p.clicks}</td><td className="px-3">{p.views}</td><td className="px-3">{p.readers}</td><td className="pl-3">{p.stores}</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="How far visitors scroll" hint="Share of visits that reached each section."><Bars rows={s.sections} total={s.sessions} percent /></Card>
            <Card title="What visitors do"><Bars rows={s.funnel} total={s.sessions} percent /></Card>
            <Card title="Where visitors come from"><Bars rows={s.referrers} total={s.sessions} percent /></Card>
            <Card title="Tagged links" hint="Add ?ref=companyname to a link you send, e.g. yoursite.com/?ref=acme."><Bars rows={s.tags} total={s.sessions} empty="No tagged visits yet." /></Card>
            <Card title="Countries" hint={s.realPlaces ? PLACE_HINT : NO_PLACE_HINT}><Bars rows={s.countries} total={s.sessions} percent /></Card>
            <Card title="Cities"><Bars rows={s.cities} total={s.sessions} percent /></Card>
            <div className="lg:col-span-2"><Card title="Recent visits" hint="The latest visits, newest first: where they were, what they opened first and what they used."><RecentVisits rows={s.recent} /></Card></div>
            <Card title="Pages"><Bars rows={s.pages.map(([path, n]) => [path.startsWith('/work/') ? `Case study: ${titleOf(path.slice(6))}` : path === '/' ? 'Home' : path, n] as [string, number])} total={s.views} /></Card>
            <Card title="Links clicked that leave the site"><Bars rows={s.outbound} total={s.outbound.reduce((a, [, n]) => a + n, 0)} empty="No outbound clicks yet." /></Card>
            <Card title="Devices"><Bars rows={s.devices} total={s.sessions} percent /></Card>
            <Card title="Browsers"><Bars rows={s.browsers} total={s.sessions} percent /></Card>
          </div>
        </>
      )}
    </div>
  )
}

const PLACE_HINT = 'Looked up from each visitor’s IP address when they visit. Only the place is stored, never the address. It is where their internet provider is, so a VPN or a mobile network can show a nearby city. Visits from before this was added use a timezone guess.'
const NO_PLACE_HINT = 'Estimated from each visitor’s device timezone. To record real locations, run supabase/geo.sql once in Supabase → SQL Editor.'

function RecentVisits({ rows }: { rows: Ev[] }) {
  if (!rows.length) return <Empty />
  const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="text-xs text-muted-foreground"><tr><th className="py-2 pr-3 font-normal">When</th><th className="px-3 font-normal">From</th><th className="px-3 font-normal">Opened</th><th className="px-3 font-normal">Device</th><th className="pl-3 font-normal">Came from</th></tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map((e) => {
            const p = placeOf(e)
            return (
              <tr key={`${e.session}-${e.created_at}`}>
                <td className="whitespace-nowrap py-2.5 pr-3 text-muted-foreground">{when(e.created_at)}</td>
                <td className="px-3">
                  {p.city ?? p.country}
                  {p.real && e.lat != null && e.lon != null && <a className="ml-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground" href={`https://www.google.com/maps?q=${e.lat},${e.lon}`} target="_blank" rel="noreferrer noopener">map</a>}
                  {!p.real && <span className="ml-2 text-xs text-muted-foreground">(estimate)</span>}
                </td>
                <td className="px-3">{e.path === '/' ? 'Home' : e.path ?? '—'}</td>
                <td className="px-3 text-muted-foreground">{[e.device, e.browser].filter(Boolean).join(' · ')}</td>
                <td className="pl-3 text-muted-foreground">{e.source || e.referrer || 'Direct'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const Empty = ({ text = 'No data yet.' }: { text?: string }) => <p className="text-sm text-muted-foreground">{text}</p>

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border p-4 sm:p-5">
      <h2 className="font-medium">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Bars({ rows, total, percent, empty }: { rows: [string, number][]; total: number; percent?: boolean; empty?: string }) {
  if (!rows.length || !total) return <Empty text={empty} />
  return (
    <ul className="space-y-2.5">
      {rows.slice(0, 8).map(([label, n]) => (
        <li key={label}>
          <div className="flex items-baseline justify-between gap-3 text-sm"><span className="min-w-0 truncate">{label}</span><span className="shrink-0 tabular-nums text-muted-foreground">{percent ? `${Math.round((n / total) * 100)}% · ` : ''}{n}</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-border"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(2, Math.min(100, (n / total) * 100))}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}

function DayChart({ days }: { days: [string, { views: number; visitors: Set<string> }][] }) {
  const peak = Math.max(1, ...days.map(([, d]) => d.visitors.size))
  if (days.every(([, d]) => !d.views)) return <Empty />
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]" role="img" aria-label="Visitors per day">
        {days.map(([day, d]) => (
          <div key={day} className="group relative flex h-full flex-1 items-end" title={`${day}: ${d.visitors.size} visitors, ${d.views} page views`}>
            <div className="w-full rounded-t bg-accent/80 transition-colors group-hover:bg-accent" style={{ height: `${(d.visitors.size / peak) * 100}%`, minHeight: d.visitors.size ? 3 : 1 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{days[0][0]}</span><span>Most in a day: {peak}</span><span>{days[days.length - 1][0]}</span></div>
    </div>
  )
}
