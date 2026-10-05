import { Fragment, type ReactNode } from 'react'
import type { ResumeData } from '../model'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="r-section"><h2>{title}</h2>{children}</section>
)
const Bullets = ({ items }: { items: string[] }) => {
  const list = items.filter((s) => s.trim())
  return list.length ? <ul>{list.map((b, i) => <li key={i}>{b}</li>)}</ul> : null
}

/** The resume template. Pure function of `data` — the same markup is used for the preview and for printing to PDF. */
export function ClassicDocument({ data: d }: { data: ResumeData }) {
  const included = d.projects.filter((p) => p.include)
  const featured = included.slice(0, Math.max(0, d.featuredCount))
  const others = included.slice(Math.max(0, d.featuredCount))
  const contact: ReactNode[] = [d.phone, d.email, d.location].filter(Boolean)
  const parts = [...contact, ...d.links.filter((l) => l.label).map((l) => <a key={l.label} href={l.href}>{l.label}</a>)]
  const edu = d.education // every school is printed; remove one from the list (or switch the section off) to leave it out
  const skills = d.skills.filter((s) => s.include && s.label)

  return (
    <div className="resume">
      <h1>{d.name}</h1>
      <p className="r-contact">{parts.map((p, i) => <Fragment key={i}>{i > 0 && <span className="sep">|</span>}{p}</Fragment>)}</p>

      {d.show.summary && d.summary.trim() && <Section title="Summary"><p>{d.summary}</p></Section>}

      {d.experience.length > 0 && (
        <Section title="Experience">
          {d.experience.map((e, i) => (
            <div key={i} className="r-job">
              <div className="r-row"><span className="r-company">{e.company}</span><span className="r-date">{e.period}</span></div>
              <div className="r-row"><span className="r-role">{e.role}</span><span className="r-role">{e.location}</span></div>
              <Bullets items={e.bullets} />
              {i === 0 && featured.map((p) => (
                <div key={p.slug} className="r-proj">
                  <p className="r-proj-head"><b>{p.title}</b>{p.tagline && <span> — {p.tagline}</span>}</p>
                  <Bullets items={p.bullets} />
                </div>
              ))}
            </div>
          ))}
        </Section>
      )}

      {d.show.otherProjects && others.length > 0 && (
        <Section title={d.otherProjectsTitle || 'Other Projects'}>
          {others.map((p) => (
            <div key={p.slug} className="r-proj">
              <p className="r-proj-head"><b>{p.title}</b>{p.tagline && <span> — {p.tagline}</span>}</p>
              <Bullets items={p.bullets.slice(0, Math.max(0, d.otherBullets))} />
            </div>
          ))}
        </Section>
      )}

      {d.show.education && edu.length > 0 && (
        <Section title="Education">
          {edu.map((e, i) => (
            <div key={i} className="r-edu">
              <div className="r-row"><span className="r-school">{e.school}</span><span className="r-date">{e.period}</span></div>
              <div className="r-degree">{[e.degree, e.location].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </Section>
      )}

      {d.show.skills && skills.length > 0 && (
        <Section title="Skills"><div className="r-skills">{skills.map((s, i) => <div key={i}><b>{s.label}:</b> {s.items}</div>)}</div></Section>
      )}

      {d.extra.filter((x) => x.title).map((x, i) => (
        <Section key={i} title={x.title}><Bullets items={x.lines} /></Section>
      ))}
    </div>
  )
}
