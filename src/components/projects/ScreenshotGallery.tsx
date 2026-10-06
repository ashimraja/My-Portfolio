import { useEffect, useRef } from 'react'
import type { Project } from '@/types'
import { hostOf, kindOf } from '@/lib/projectKind'
import { BrowserShot } from './BrowserFrame'
import { PhoneFrame } from './PhoneFrame'

/**
 * Horizontally scrollable screenshots. Works with touch swipe, trackpad, the mouse wheel
 * (vertical wheel scrolls the row while it can still move, then hands back to the page) and mouse drag.
 */
export function ScreenshotGallery({ project }: { project: Project }) {
  const web = kindOf(project) === 'web'
  const row = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = row.current!
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // trackpad sideways: native
      const max = el.scrollWidth - el.clientWidth
      const next = el.scrollLeft + e.deltaY
      if ((e.deltaY > 0 && el.scrollLeft < max - 1) || (e.deltaY < 0 && el.scrollLeft > 1)) {
        e.preventDefault()
        el.scrollLeft = Math.max(0, Math.min(max, next))
      }
    }
    let down = false, startX = 0, startLeft = 0, moved = false
    const onDown = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft }
    const onMove = (e: PointerEvent) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 3) moved = true; el.scrollLeft = startLeft - dx }
    const onUp = () => { down = false }
    const onClickCapture = (e: Event) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    el.addEventListener('click', onClickCapture, true)
    return () => {
      el.removeEventListener('wheel', onWheel); el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return (
    <div ref={row} data-lenis-prevent data-cursor="drag" data-cursor-label="DRAG" tabIndex={0} role="region" aria-label={`${project.title} screenshots`}
      className="-mx-[var(--gutter)] cursor-grab select-none overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-6 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-start gap-4">
        {project.screenshots.map((shot, i) => {
          const { src, caption } = typeof shot === 'string' ? { src: shot, caption: undefined } : shot
          return (
            <div key={src}>
              {web
                ? <BrowserShot image={src} visual={{ ...project.visual, pattern: (['blocks', 'grid', 'waves', 'rings'] as const)[i % 4] }} caption={caption} index={i} url={hostOf(project.liveUrl)} />
                : <PhoneFrame image={src} visual={{ ...project.visual, pattern: (['rings', 'grid', 'waves', 'blocks'] as const)[(i + 1) % 4] }} caption={caption} index={i} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
