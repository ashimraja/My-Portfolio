import { ArrowLeft } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { RevealText } from '@/components/animations/RevealText'
import { Footer } from '@/components/layout/Footer'
import { PaperList } from '@/components/research/PaperList'
import { useContent } from '@/content/ContentProvider'
import { useSeo } from '@/hooks/useSeo'
import { publishedPapers } from '@/lib/research'

export default function ResearchIndexPage() {
  const { intro, items } = useContent().content.research
  const papers = publishedPapers(items)
  useSeo('Research', intro.title, '/research')
  if (!papers.length) return <Navigate to="/" replace />
  return (
    <>
      <main id="main">
        <header className="container-x pt-36 md:pt-44">
          <Link to="/" className="t-label mb-10 inline-flex items-center gap-2 hover:!text-accent" data-cursor="hover"><ArrowLeft size={14} aria-hidden /> Home</Link>
          <p className="t-label mb-6">{intro.kicker}</p>
          <RevealText as="h1" lines={intro.title} className="t-display t-xl max-w-[16ch]" immediate delay={0.9} />
        </header>
        <div className="container-x mt-14 pb-24 md:mt-20 md:pb-32">
          <PaperList papers={papers} />
        </div>
      </main>
      <Footer />
    </>
  )
}
