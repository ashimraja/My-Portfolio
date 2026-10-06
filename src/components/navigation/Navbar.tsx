import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { Lightbulb, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { homeSections, withDefaultLinks } from '@/data/navigation'
import { useContent } from '@/content/ContentProvider'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { hasBody, formatDate, sortedPosts } from '@/lib/blog'
import { getLenis } from '@/lib/scroll'
import { Logo } from '@/components/ui/Logo'
import { ease } from '@/lib/animations'
import { hrefFor, useNavTarget } from './useNavTarget'
import type { BlogPost, NavItem } from '@/types'

/** Full-width bar at the very top of the page; settles into a floating card once you scroll. Leans toward the pointer. */
export function Navbar() {
  const { portfolio, navigation: nav, blog } = useContent().content
  const navigation = withDefaultLinks(nav.items, blog.items.length > 0), navCta = nav.cta
  const { pathname } = useLocation()
  const go = useNavTarget()
  const fine = useFinePointer()
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  const activeSection = useActiveSection(homeSections, pathname === '/')
  const mx = useSpring(useMotionValue(0), { stiffness: 90, damping: 16, mass: 0.6 })
  const my = useSpring(useMotionValue(0), { stiffness: 90, damping: 16, mass: 0.6 })

  useEffect(() => {
    const on = () => setCompact(window.scrollY > 120)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!fine) return
    const move = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2 * 18)
      my.set((e.clientY / window.innerHeight - 0.5) * 2 * 6)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [fine, mx, my])

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const l = getLenis()
    if (open) l?.stop(); else l?.start()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; l?.start() }
  }, [open])

  const isActive = (i: NavItem) => (i.section ? i.section === activeSection : pathname.startsWith(i.to) && i.to !== '/')
  const onClick = (e: React.MouseEvent, i: NavItem) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault(); setOpen(false); go(i)
  }
  const barLinks = navigation.filter((i) => !i.icon && !i.hideOnBar)
  const lamp = navigation.find((i) => i.icon === 'lamp')

  // After Hours is a standalone room: no navbar there, just a Go back button (see AfterHours page).
  if (pathname.startsWith('/after-hours') || pathname.startsWith('/admin')) return null

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[90] rounded bg-accent px-4 py-2 text-accent-foreground">Skip to content</a>
      <header className={`pointer-events-none fixed inset-x-0 z-[60] flex justify-center overflow-x-clip transition-[top,padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${compact ? 'top-3 px-3 sm:top-4 sm:px-5' : 'top-0 px-0'}`}>
        <motion.div style={compact ? { x: mx, y: my } : undefined} className="w-full" animate={{ maxWidth: compact ? 1120 : 2400 }} transition={{ duration: 0.7, ease }}>
          <div className={`pointer-events-auto flex items-center justify-between gap-4 border transition-[background-color,border-color,border-radius,padding,backdrop-filter] duration-700 ${compact ? 'rounded-2xl border-border bg-background/80 py-2.5 pl-5 pr-2.5 backdrop-blur-xl' : 'rounded-none border-transparent bg-transparent px-[var(--gutter)] py-5'}`}>
            <Link to="/" aria-label={`${portfolio.name} — home`} data-cursor="hover" className="flex shrink-0 items-center gap-3 leading-none">
              <Logo className="h-9 w-9 text-foreground" />
              <span className="hidden text-base font-medium tracking-tight min-[400px]:inline sm:text-lg">{portfolio.name}</span>
            </Link>

            <nav aria-label="Primary" className={`hidden items-center gap-1 lg:flex`}>
              {barLinks.map((i) => (
                <div key={i.label} className="group relative">
                  <a href={hrefFor(i)} onClick={(e) => onClick(e, i)} aria-current={isActive(i) ? 'page' : undefined}
                    className={`relative block px-5 py-2 font-mono text-[0.78rem] transition-colors hover:text-foreground ${isActive(i) ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {i.label}
                    {isActive(i) && <motion.span layoutId="nav-dot" className="absolute inset-x-5 -bottom-0.5 h-px bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  </a>
                  {i.to === '/blog' && <BlogMenu posts={sortedPosts(blog.items)} onPick={() => (document.activeElement as HTMLElement | null)?.blur()} />}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {lamp && (
                <a href={hrefFor(lamp)} onClick={(e) => onClick(e, lamp)} aria-label="After Hours" aria-current={isActive(lamp) ? 'page' : undefined} title="After Hours" data-cursor="hover"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-accent">
                  <span aria-hidden className="absolute inset-1 rounded-full bg-accent/0 blur-md transition-colors duration-500 group-hover:bg-accent/40" />
                  <Lightbulb size={18} className={`relative ${isActive(lamp) ? 'text-accent' : ''}`} />
                </a>
              )}
              <a href={hrefFor(navCta)} onClick={(e) => onClick(e, navCta)} data-cursor="hover"
                className={`rounded-lg bg-foreground px-5 py-3 font-mono text-[0.78rem] text-background transition-colors hover:bg-accent hover:text-accent-foreground hidden sm:block`}>
                {navCta.label}
              </a>
              <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} data-cursor="hover"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border lg:hidden">
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[55] flex flex-col justify-between bg-background px-[var(--gutter)] pb-10 pt-28"
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.6, ease }}>
            <nav aria-label="Menu" className="flex flex-col">
              {[...navigation, navCta].map((i, n) => (
                <motion.a key={i.label} href={hrefFor(i)} onClick={(e) => onClick(e, i)}
                  className={`t-title-lg border-b border-border py-3 ${i.to === '/after-hours' ? 'text-accent' : ''}`}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + n * 0.05, duration: 0.6, ease } }}>
                  <span className="t-label mr-4 align-middle">0{n + 1}</span>{i.label}
                </motion.a>
              ))}
            </nav>
            <p className="t-label">{portfolio.email} · {portfolio.location}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Hover / keyboard-focus dropdown under “Blog”: the newest articles, each opening its own page, plus the full list. */
function BlogMenu({ posts, onPick }: { posts: BlogPost[]; onPick: () => void }) {
  if (!posts.length) return null
  return (
    <div className="invisible absolute left-1/2 top-full z-10 w-[min(24rem,90vw)] -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-[opacity,transform,visibility] duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="rounded-2xl border border-border bg-background/95 p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <ul>
          {posts.slice(0, 5).map((p) => {
            const body = (
              <>
                <span className="block text-[0.9rem] font-medium leading-snug text-foreground">{p.title}</span>
                <span className="t-label mt-1 block !text-[0.74rem]">{formatDate(p.date)}{p.tags[0] ? ` · ${p.tags[0]}` : ''}</span>
              </>
            )
            const cls = 'block rounded-xl px-4 py-3 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover'
            return (
              <li key={p.slug}>
                {hasBody(p)
                  ? <Link to={`/blog/${p.slug}`} onClick={onPick} className={cls} data-cursor="hover">{body}</Link>
                  : <a href={p.mediumUrl} target="_blank" rel="noreferrer noopener" className={cls} data-cursor="hover">{body}</a>}
              </li>
            )
          })}
        </ul>
        <Link to="/blog" onClick={onPick} className="mt-1 flex items-center justify-between rounded-xl border-t border-border px-4 py-3 font-mono text-[0.74rem] text-muted-foreground transition-colors hover:text-accent" data-cursor="hover">All articles <span aria-hidden>→</span></Link>
      </div>
    </div>
  )
}
