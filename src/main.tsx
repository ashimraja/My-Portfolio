import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ContentProvider } from './content/ContentProvider'
import { lockInspect } from './lib/lockInspect'
import './styles/index.css'

lockInspect()

// A hash only ever tells the app where to scroll. A reload (or a shared link) with one lands on a clean "/" at the top.
if (window.location.hash) {
  history.replaceState(history.state, '', window.location.pathname + window.location.search)
  // The browser may still jump to the fragment once the content exists, so hold the top for a moment unless the user starts scrolling.
  const top = () => window.scrollTo(0, 0)
  top()
  let held = true
  const release = () => { held = false }
  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) window.addEventListener(ev, release, { once: true, passive: true })
  const timer = setInterval(() => { if (held && window.scrollY !== 0) top() }, 50)
  setTimeout(() => clearInterval(timer), 2500)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><ContentProvider><App /></ContentProvider></BrowserRouter></StrictMode>,
)
