import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BlogSection } from '@/components/blog/BlogSection'
import { Contact } from '@/components/contact/Contact'
import { EducationList } from '@/components/experience/EducationList'
import { ExperienceTimeline } from '@/components/experience/ExperienceTimeline'
import { Hero } from '@/components/hero/Hero'
import { Footer } from '@/components/layout/Footer'
import { ProjectShowcase } from '@/components/projects/ProjectShowcase'
import { About } from '@/components/sections/About'
import { StackExplorer } from '@/components/stack/StackExplorer'
import { Testimonials } from '@/components/testimonials/Testimonials'
import { useSeo } from '@/hooks/useSeo'
import { scrollToTarget } from '@/lib/scroll'

// The resume pulls in the print templates, so it is split out of the entry chunk.
const ResumeSection = lazy(() => import('@/components/resume/ResumeSection'))

export default function Home() {
  useSeo()
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => scrollToTarget(hash, { immediate: true }), 600) // after curtain lifts
    return () => clearTimeout(t)
  }, [hash])
  return (
    <>
      <Hero /><ProjectShowcase /><About /><StackExplorer /><ExperienceTimeline /><EducationList />
      <Suspense fallback={<div id="resume" className="min-h-[40vh]" />}><ResumeSection /></Suspense>
      <BlogSection /><Testimonials /><Contact /><Footer />
    </>
  )
}
