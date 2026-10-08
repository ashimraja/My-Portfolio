import { AnimatePresence, motion, useMotionValue, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Lightbulb, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { homeSections, withDefaultLinks } from '@/data/navigation'
import { useContent } from '@/content/ContentProvider'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { getLenis } from '@/lib/scroll'
import { ease } from '@/lib/animations'
import { hrefFor, useNavTarget } from './useNavTarget'
import type { NavItem } from '@/types'

/** Floating capsule, inset from the edges from the first frame. Gets a stronger glass fill once you scroll, tucks away while you scroll down and returns on the way up, and leans toward the pointer. */
export function Navbar() {
  const { portfolio, navigation: nav, blog } = useContent().content
  const navigation = withDefaultLinks(nav.items, blog.items.length > 0), navCta = nav.cta
  const { pathname } = useLocation()
  const go = useNavTarget()
  const fine = useFinePointer()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const activeSection = useActiveSection(homeSections, pathname === '/')
  const mx = useSpring(useMotionValue(0), { stiffness: 90, damping: 16, mass: 0.6 })
  const my = useSpring(useMotionValue(0), { stiffness: 90, damping: 16, mass: 0.6 })

  const { scrollYProgress } = useScroll()

  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (Math.abs(y - last) > 6) { setHidden(y > 320 && y > last); last = y } // tuck away on a clear downward scroll, come back on any upward one
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!fine) return
    const move = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2 * 10)
      my.set((e.clientY / window.innerHeight - 0.5) * 2 * 3)
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
  const [first, ...restWords] = portfolio.name.split(' ')
  const rest = restWords.join(' ')
  const barLinks = navigation.filter((i) => !i.icon && !i.hideOnBar)
  const lamp = navigation.find((i) => i.icon === 'lamp')

  // After Hours is a standalone room: no navbar there, just a Go back button (see AfterHours page).
  if (pathname.startsWith('/after-hours') || pathname.startsWith('/admin')) return null

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[90] rounded bg-accent px-4 py-2 text-accent-foreground">Skip to content</a>
      <header className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center overflow-x-clip px-3 sm:top-4 sm:px-5">
        <motion.div style={{ x: mx, y: my }} className="w-full max-w-[1120px]">
          <motion.div animate={{ y: hidden && !open ? '-140%' : '0%' }} transition={{ duration: 0.5, ease }}>
          <div className={`pointer-events-auto relative flex items-center justify-between gap-4 rounded-full border py-2 pl-5 pr-2 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ${scrolled ? 'border-foreground/15 bg-background/80 shadow-[0_10px_34px_-14px_rgba(0,0,0,0.45)]' : 'border-foreground/10 bg-background/45 shadow-[0_6px_24px_-16px_rgba(0,0,0,0.3)]'}`}>
            <Link to="/" aria-label={`${portfolio.name} — home`} data-cursor="hover" className="flex shrink-0 items-center leading-none">
              <span className="text-base font-semibold tracking-tight sm:text-[1.05rem]">{first}{rest && <span className="font-medium text-foreground/45"> {rest}</span>}</span>
            </Link>

            <nav aria-label="Primary" className={`hidden items-center gap-1 lg:flex`}>
              {barLinks.map((i) => (
                <div key={i.label} className="group relative">
                  <a href={hrefFor(i)} onClick={(e) => onClick(e, i)} aria-current={isActive(i) ? 'page' : undefined}
                    className={`relative isolate block rounded-full px-4 py-2 text-[0.92rem] font-medium tracking-tight transition-colors duration-300 hover:text-foreground xl:px-[1.1rem] ${isActive(i) ? 'text-foreground' : 'text-foreground/50'}`}>
                    {isActive(i) && <motion.span aria-hidden layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.08] ring-1 ring-inset ring-foreground/10" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">{i.label}</span>
                  </a>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {lamp && (
                <a href={hrefFor(lamp)} onClick={(e) => onClick(e, lamp)} aria-label="After Hours" aria-current={isActive(lamp) ? 'page' : undefined} title="After Hours" data-cursor="hover"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-accent">
                  <span aria-hidden className="absolute inset-1 rounded-full bg-accent/0 blur-md transition-colors duration-500 group-hover:bg-accent/40" />
                  <Lightbulb size={18} className={`relative ${isActive(lamp) ? 'text-accent' : ''}`} />
                </a>
              )}
              <a href={hrefFor(navCta)} onClick={(e) => onClick(e, navCta)} data-cursor="hover"
                className="group hidden items-center gap-1.5 rounded-full bg-foreground py-2.5 pl-5 pr-4 text-[0.92rem] font-medium tracking-tight text-background transition-colors hover:bg-foreground/85 sm:flex">
                {navCta.label}
                <ArrowUpRight size={16} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} data-cursor="hover"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 lg:hidden">
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
            <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className="pointer-events-none absolute inset-x-8 -bottom-px h-px origin-left bg-foreground/35" />
          </div>
          </motion.div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[55] flex flex-col justify-between bg-background px-[var(--gutter)] pb-10 pt-28"
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.6, ease }}>
            <nav aria-label="Menu" className="flex flex-col">
              {[...navigation.filter((i) => !i.icon), navCta].map((i, n) => (
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
