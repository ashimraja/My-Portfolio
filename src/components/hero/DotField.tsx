import { useEffect, useRef } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

const RADIUS = 170

/** Interactive dot grid: ambient wave + pointer repulsion. Paused when off-screen. */
export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const fine = useFinePointer()
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const spacing = fine ? 30 : 44
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0, visible = true
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
    const style = getComputedStyle(document.documentElement)
    const fg = style.getPropertyValue('--foreground').trim()
    const accent = style.getPropertyValue('--accent').trim()

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12
      const time = reduce ? 0 : t * 0.0006
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          const wave = Math.sin(x * 0.012 + time * 2) * Math.cos(y * 0.014 - time * 1.4)
          let px = x, py = y + wave * 4
          let r = 1 + (wave + 1) * 0.35
          const dx = x - mouse.x, dy = y - mouse.y
          const d = Math.hypot(dx, dy)
          let hot = 0
          if (d < RADIUS) {
            hot = 1 - d / RADIUS
            const push = hot * hot * 34
            px += (dx / (d || 1)) * push
            py += (dy / (d || 1)) * push
            r += hot * 2.4
          }
          ctx.globalAlpha = 0.16 + hot * 0.84 + (wave + 1) * 0.05
          ctx.fillStyle = hot > 0.35 ? accent : fg
          ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill()
        }
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw)
    }
    const loop = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) }
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); else cancelAnimationFrame(raf) })
    resize(); io.observe(canvas); loop()
    const ro = new ResizeObserver(() => { resize(); if (reduce) loop() })
    ro.observe(canvas)
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); window.removeEventListener('pointermove', onMove) }
  }, [fine, reduce])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_70%_45%,black_20%,transparent_75%)]" />
}
