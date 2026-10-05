import { Availability } from '@/components/hero/Availability'
import { usePortfolio } from '@/content/ContentProvider'
import { cleanHref } from '@/lib/links'

export function Footer() {
  const { footer, location, email, socials } = usePortfolio()
  return (
    <footer className="rule">
      <div className="container-x grid gap-8 py-10 text-sm md:grid-cols-3">
        <p>{footer.legal}</p>
        <div className="space-y-2">{location && <p className="t-label">{location}</p>}<Availability compact /></div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
          <li><a href={`mailto:${email}`} className="hover:text-accent">{email}</a></li>
          {socials.map((s) => <li key={s.label}><a href={cleanHref(s.href)} target="_blank" rel="noreferrer noopener" className="hover:text-accent">{s.label}</a></li>)}
        </ul>
      </div>
    </footer>
  )
}
