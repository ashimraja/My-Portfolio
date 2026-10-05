import type { ReactNode } from 'react'
import type { ResumeData } from '../model'

const Bars = ({ items }: { items: { name: string; level: number }[] }) => (
  <>{items.filter((s) => s.name).map((s, i) => (
    <div key={i}><div className="rs-bar-label">{s.name}</div><div className="rs-bar"><i style={{ width: `${Math.min(100, Math.max(0, s.level))}%` }} /></div></div>
  ))}</>
)
const Bullets = ({ items }: { items: string[] }) => {
  const list = items.filter((s) => s.trim())
  return list.length ? <ul>{list.map((b, i) => <li key={i}>{b}</li>)}</ul> : null
}
const Block = ({ title, children }: { title: string; children: ReactNode }) => <section className="rs-block"><h2>{title}</h2>{children}</section>

/** Dark sidebar (name, details, skill bars, languages) + main column. Same ResumeData as every other template. */
export function SidebarDocument({ data: d }: { data: ResumeData }) {
  const included = d.projects.filter((p) => p.include)
  const featured = included.slice(0, Math.max(0, d.featuredCount))
  const others = included.slice(Math.max(0, d.featuredCount))
  const skillBars = d.skillBars.filter((s) => s.name)
  const fallbackSkills = d.skills.filter((s) => s.include && s.label)

  return (
    <>
      <aside className="rs-side">
        <h1 className="rs-name">{d.name}</h1>
        <div className="rs-rule" />
        {d.headline && <p className="rs-role">{d.headline}</p>}

        <h3>Details</h3>
        <div className="rs-detail">
          {d.location && <div>{d.location}</div>}
          {d.phone && <div>{d.phone}</div>}
          {d.email && <div><a href={`mailto:${d.email}`}>{d.email}</a></div>}
          {d.links.filter((l) => l.label).map((l) => <div key={l.label}><a href={l.href}>{l.label}</a></div>)}
        </div>

        {d.show.skills && (skillBars.length > 0
          ? <><h3>Skills</h3><Bars items={skillBars} /></>
          : fallbackSkills.length > 0 && <><h3>Skills</h3>{fallbackSkills.map((s, i) => <div key={i} className="rs-detail"><b>{s.label}:</b> {s.items}</div>)}</>)}

        {d.languages.filter((l) => l.name).length > 0 && <><h3>Languages</h3><Bars items={d.languages} /></>}
      </aside>

      <div className="rs-main">
        {d.show.summary && d.summary.trim() && <Block title="Profile"><p>{d.summary}</p></Block>}

        {d.experience.length > 0 && (
          <Block title="Employment History">
            {d.experience.map((e, i) => (
              <div key={i} className="rs-job">
                <div className="rs-title">{[e.role, e.company, e.location].filter(Boolean).join(', ')}</div>
                <div className="rs-date">{e.period}</div>
                <Bullets items={e.bullets} />
                {i === 0 && featured.map((p) => (
                  <div key={p.slug} className="rs-proj">
                    <div className="rs-proj-head"><b>{p.title}</b>{p.tagline && <span> — {p.tagline}</span>}</div>
                    <Bullets items={p.bullets} />
                  </div>
                ))}
              </div>
            ))}
          </Block>
        )}

        {d.show.otherProjects && others.length > 0 && (
          <Block title={d.otherProjectsTitle || 'Other Projects'}>
            {others.map((p) => (
              <div key={p.slug} className="rs-proj">
                <div className="rs-proj-head"><b>{p.title}</b>{p.tagline && <span> — {p.tagline}</span>}</div>
                <Bullets items={p.bullets.slice(0, Math.max(0, d.otherBullets))} />
              </div>
            ))}
          </Block>
        )}

        {d.show.education && d.education.length > 0 && (
          <Block title="Education">
            {d.education.map((e, i) => (
              <div key={i} className="rs-job rs-edu">
                <div className="rs-title">{[e.degree, e.school, e.location].filter(Boolean).join(', ')}</div>
                <div className="rs-date">{e.period}</div>
              </div>
            ))}
          </Block>
        )}

        {d.extra.filter((x) => x.title).map((x, i) => <Block key={i} title={x.title}><Bullets items={x.lines} /></Block>)}
      </div>
    </>
  )
}
