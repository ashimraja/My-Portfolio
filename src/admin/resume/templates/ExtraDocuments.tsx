import { Fragment, type ReactNode } from 'react'
import type { ResumeData } from '../model'

/* Shared pieces so the three layouts below only differ in markup and CSS, never in content. */
function parts(d: ResumeData) {
  const included = d.projects.filter((p) => p.include)
  const n = Math.max(0, d.featuredCount)
  return {
    featured: included.slice(0, n),
    others: included.slice(n),
    skills: d.skills.filter((s) => s.include && s.label),
    extra: d.extra.filter((x) => x.title),
  }
}
const Bullets = ({ items }: { items: string[] }) => {
  const list = items.filter((s) => s.trim())
  return list.length ? <ul>{list.map((b, i) => <li key={i}>{b}</li>)}</ul> : null
}
const Contact = ({ d }: { d: ResumeData }) => {
  const items: ReactNode[] = [d.phone, d.email, d.location].filter(Boolean)
  const all = [...items, ...d.links.filter((l) => l.label).map((l) => <a key={l.label} href={l.href}>{l.label}</a>)]
  return <>{all.map((p, i) => <Fragment key={i}>{i > 0 && <span className="rt-sep">|</span>}{p}</Fragment>)}</>
}
const Sec = ({ title, children }: { title: string; children: ReactNode }) => <section className="rt-sec"><h2>{title}</h2>{children}</section>
const ProjHead = ({ title, tagline, sep }: { title: string; tagline: string; sep: string }) => <p className="rt-proj-head"><b>{title}</b>{tagline && <em>{sep}{tagline}</em>}</p>

/** LaTeX-style (the popular “Jake’s resume” look): serif, small-caps headings, compact. */
export function LatexDocument({ data: d }: { data: ResumeData }) {
  const { featured, others, skills, extra } = parts(d)
  return (
    <div className="rt rt-latex">
      <h1>{d.name}</h1>
      <p className="rt-contact"><Contact d={d} /></p>

      {d.show.summary && d.summary.trim() && <Sec title="Summary"><p>{d.summary}</p></Sec>}

      {d.show.education && d.education.length > 0 && (
        <Sec title="Education">
          {d.education.map((e, i) => (
            <div key={i} className="rt-entry">
              <div className="rt-row"><b>{e.school}</b><span>{e.period}</span></div>
              <div className="rt-row"><em>{e.degree}</em><em>{e.location}</em></div>
            </div>
          ))}
        </Sec>
      )}

      {d.experience.length > 0 && (
        <Sec title="Experience">
          {d.experience.map((e, i) => (
            <div key={i} className="rt-entry">
              <div className="rt-row"><b>{e.role}</b><span>{e.period}</span></div>
              <div className="rt-row"><em>{e.company}</em><em>{e.location}</em></div>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </Sec>
      )}

      {(featured.length > 0 || (d.show.otherProjects && others.length > 0)) && (
        <Sec title="Projects">
          {[...featured, ...(d.show.otherProjects ? others : [])].map((p, i) => (
            <div key={p.slug} className="rt-entry rt-proj">
              <ProjHead title={p.title} tagline={p.tagline} sep=" | " />
              <Bullets items={i < featured.length ? p.bullets : p.bullets.slice(0, Math.max(0, d.otherBullets))} />
            </div>
          ))}
        </Sec>
      )}

      {d.show.skills && skills.length > 0 && <Sec title="Technical Skills"><div className="rt-skills">{skills.map((s, i) => <p key={i}><b>{s.label}:</b> {s.items}</p>)}</div></Sec>}
      {extra.map((x, i) => <Sec key={i} title={x.title}><Bullets items={x.lines} /></Sec>)}
    </div>
  )
}

/** Harvard-style: Times, centred header, bold uppercase headings with a rule. */
export function HarvardDocument({ data: d }: { data: ResumeData }) {
  const { featured, others, skills, extra } = parts(d)
  return (
    <div className="rt rt-harvard">
      <h1>{d.name}</h1>
      <p className="rt-contact"><Contact d={d} /></p>

      {d.show.summary && d.summary.trim() && <Sec title="Summary"><p>{d.summary}</p></Sec>}

      {d.experience.length > 0 && (
        <Sec title="Experience">
          {d.experience.map((e, i) => (
            <div key={i} className="rt-entry">
              <div className="rt-row"><b>{e.company}</b><b>{e.location}</b></div>
              <div className="rt-row"><em>{e.role}</em><span>{e.period}</span></div>
              <Bullets items={e.bullets} />
              {i === 0 && featured.map((p) => (
                <div key={p.slug} className="rt-proj"><ProjHead title={p.title} tagline={p.tagline} sep=" — " /><Bullets items={p.bullets} /></div>
              ))}
            </div>
          ))}
        </Sec>
      )}

      {d.show.otherProjects && others.length > 0 && (
        <Sec title={d.otherProjectsTitle || 'Other Projects'}>
          {others.map((p) => <div key={p.slug} className="rt-proj"><ProjHead title={p.title} tagline={p.tagline} sep=" — " /><Bullets items={p.bullets.slice(0, Math.max(0, d.otherBullets))} /></div>)}
        </Sec>
      )}

      {d.show.education && d.education.length > 0 && (
        <Sec title="Education">
          {d.education.map((e, i) => (
            <div key={i} className="rt-entry">
              <div className="rt-row"><b>{e.school}</b><b>{e.location}</b></div>
              <div className="rt-row"><em>{e.degree}</em><span>{e.period}</span></div>
            </div>
          ))}
        </Sec>
      )}

      {d.show.skills && skills.length > 0 && <Sec title="Skills"><div className="rt-skills">{skills.map((s, i) => <p key={i}><b>{s.label}:</b> {s.items}</p>)}</div></Sec>}
      {extra.map((x, i) => <Sec key={i} title={x.title}><Bullets items={x.lines} /></Sec>)}
    </div>
  )
}

/** Two-column engineer CV (Deedy-style): accent-coloured name, narrow left column for education/skills. */
export function TwoColumnDocument({ data: d }: { data: ResumeData }) {
  const { featured, others, skills, extra } = parts(d)
  return (
    <div className="rt rt-twocol">
      <header>
        <h1>{d.name}</h1>
        {d.headline && <p className="rt-headline">{d.headline}</p>}
        <p className="rt-contact"><Contact d={d} /></p>
      </header>
      <div className="rt-cols">
        <aside>
          {d.show.education && d.education.length > 0 && (
            <Sec title="Education">
              {d.education.map((e, i) => (
                <div key={i} className="rt-entry"><b>{e.school}</b><div>{e.degree}</div><div className="rt-date">{[e.period, e.location].filter(Boolean).join(' · ')}</div></div>
              ))}
            </Sec>
          )}
          {d.show.skills && skills.length > 0 && <Sec title="Skills">{skills.map((s, i) => <div key={i} className="rt-entry"><b>{s.label}</b><div>{s.items}</div></div>)}</Sec>}
          {extra.map((x, i) => <Sec key={i} title={x.title}><Bullets items={x.lines} /></Sec>)}
        </aside>
        <div className="rt-main">
          {d.show.summary && d.summary.trim() && <Sec title="Summary"><p>{d.summary}</p></Sec>}
          {d.experience.length > 0 && (
            <Sec title="Experience">
              {d.experience.map((e, i) => (
                <div key={i} className="rt-entry">
                  <div className="rt-row"><b>{e.company}</b><span className="rt-date">{e.period}</span></div>
                  <div className="rt-role">{[e.role, e.location].filter(Boolean).join(' · ')}</div>
                  <Bullets items={e.bullets} />
                  {i === 0 && featured.map((p) => <div key={p.slug} className="rt-proj"><ProjHead title={p.title} tagline={p.tagline} sep=" — " /><Bullets items={p.bullets} /></div>)}
                </div>
              ))}
            </Sec>
          )}
          {d.show.otherProjects && others.length > 0 && (
            <Sec title={d.otherProjectsTitle || 'Other Projects'}>
              {others.map((p) => <div key={p.slug} className="rt-proj"><ProjHead title={p.title} tagline={p.tagline} sep=" — " /><Bullets items={p.bullets.slice(0, Math.max(0, d.otherBullets))} /></div>)}
            </Sec>
          )}
        </div>
      </div>
    </div>
  )
}
