import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/**
 * Elements declare cursor behaviour with data attributes — no prop drilling:
 *   data-cursor="hover|view|drag|link"  data-cursor-label="EXPLORE"
 *   data-cursor-system   → inside this element the normal system cursor (hand) is used instead (e.g. the puzzle).
 * Over headline text the cursor becomes a large inverting lens, so only the covered letters change colour.
 */
type Variant = 'default' | 'text' | 'hover' | 'view' | 'drag' | 'link' | 'system'
interface State { variant: Variant; label: string }

const size: Record<Variant, number> = { default: 10, text: 88, hover: 64, link: 44, view: 96, drag: 96, system: 10 }
const defaults: Record<Variant, string> = { default: '', text: '', hover: '', link: '↗', view: 'VIEW', drag: 'DRAG', system: '' }

export function Cursor() {
  const fine = useFinePointer()
  const reduce = usePrefersReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: reduce ? 1000 : 500, damping: reduce ? 60 : 40, mass: 0.4 })
  const sy = useSpring(y, { stiffness: reduce ? 1000 : 500, damping: reduce ? 60 : 40, mass: 0.4 })
  const [state, setState] = useState<State>({ variant: 'default', label: '' })
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('has-custom-cursor')
    const move = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY) }
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest('[data-cursor-system]')) return setState((s) => (s.variant === 'system' ? s : { variant: 'system', label: '' }))
      const el = t?.closest<HTMLElement>('[data-cursor], a, button, input, textarea, select, label')
      if (!el) {
        const isText = !!t?.closest('h1, h2, h3, blockquote, .t-display')
        return setState((s) => (s.variant === (isText ? 'text' : 'default') ? s : { variant: isText ? 'text' : 'default', label: '' }))
      }
      const v = (el.dataset.cursor as Variant | undefined) ?? (el.matches('input, textarea, select') ? 'default' : 'hover')
      setState({ variant: v, label: el.dataset.cursorLabel ?? defaults[v] })
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [fine, x, y])

  if (!fine) return null
  const d = size[state.variant] * (pressed ? 0.88 : 1)
  const filled = state.variant === 'view' || state.variant === 'drag' || state.variant === 'link'
  return (
    <motion.div aria-hidden className={`pointer-events-none fixed left-0 top-0 z-[100] transition-opacity duration-200 ${state.variant === 'system' ? 'opacity-0' : ''} ${filled ? '' : 'mix-blend-difference'}`} style={{ x: sx, y: sy }}>
      <motion.div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[0.72rem] font-medium ${filled ? 'bg-accent text-accent-foreground' : 'bg-white'}`}
        animate={{ width: d, height: d }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <motion.span key={state.label} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>{state.label}</motion.span>
      </motion.div>
    </motion.div>
  )
}
