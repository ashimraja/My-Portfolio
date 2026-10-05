import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Contact } from '@/components/contact/Contact'
import { EducationList } from '@/components/experience/EducationList'
import { ExperienceTimeline } from '@/components/experience/ExperienceTimeline'
import { Hero } from '@/components/hero/Hero'
import { Footer } from '@/components/layout/Footer'
import { ProjectShowcase } from '@/components/projects/ProjectShowcase'
import { About } from '@/components/sections/About'
import { Philosophy } from '@/components/sections/Philosophy'
import { StackExplorer } from '@/components/stack/StackExplorer'
import { Testimonials } from '@/components/testimonials/Testimonials'
import { useSeo } from '@/hooks/useSeo'
import { scrollToTarget } from '@/lib/scroll'

export default function Home() {
  useSeo()
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => scrollToTarget(hash, { immediate: true }), 900) // after curtain lifts
    return () => clearTimeout(t)
  }, [hash])
  return (
    <>
      <Hero /><About /><ProjectShowcase /><StackExplorer /><ExperienceTimeline /><EducationList /><Philosophy /><Testimonials /><Contact /><Footer />
    </>
  )
}
