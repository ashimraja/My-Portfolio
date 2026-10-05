import { MotionConfig } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/animations/PageTransition'
import { ScrollProgress } from '@/components/animations/ScrollProgress'
import { Navbar } from '@/components/navigation/Navbar'
import { Cursor } from '@/components/ui/Cursor'
import { IntroLoader } from '@/components/ui/IntroLoader'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import Home from '@/pages/Home/Home'

// Route-level code splitting: only Home is in the entry chunk.
const ProjectPage = lazy(() => import('@/pages/Project/ProjectPage'))
const AfterHours = lazy(() => import('@/pages/AfterHours/AfterHours'))
const Admin = lazy(() => import('@/pages/Admin/AdminPage'))

export default function App() {
  useSmoothScroll()
  const isAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      {!isAdmin && <Cursor />}
      {!isAdmin && <IntroLoader />}
      <Navbar />
      <PageTransition>
        {(location) => (
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes location={location}>
              <Route path="/" element={<main id="main"><Home /></main>} />
              <Route path="/work/:slug" element={<main id="main"><ProjectPage /></main>} />
              <Route path="/after-hours" element={<AfterHours />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        )}
      </PageTransition>
    </MotionConfig>
  )
}
