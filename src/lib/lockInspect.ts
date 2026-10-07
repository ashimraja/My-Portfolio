/**
 * Discourages casual inspection: right-click menu and the usual DevTools / view-source shortcuts.
 * This is a deterrent only. Browsers always give users their own page source and network traffic, so nothing here protects secrets.
 * Production builds only, so development keeps working.
 */
export function lockInspect() {
  if (import.meta.env.DEV) return
  const editable = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName))
  document.addEventListener('contextmenu', (e) => { if (!editable(e.target)) e.preventDefault() })
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase()
    const meta = e.ctrlKey || e.metaKey
    const devtools = e.key === 'F12' || (meta && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) || (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k))
    const source = meta && (k === 'u' || k === 's')
    if (devtools || source) { e.preventDefault(); e.stopPropagation() }
  }, true)
}
