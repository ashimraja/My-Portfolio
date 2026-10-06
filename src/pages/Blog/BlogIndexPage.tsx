import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { RevealText } from '@/components/animations/RevealText'
import { PostList } from '@/components/blog/PostList'
import { Footer } from '@/components/layout/Footer'
import { useContent } from '@/content/ContentProvider'
import { useSeo } from '@/hooks/useSeo'
import { sortedPosts } from '@/lib/blog'

export default function BlogIndexPage() {
  const { intro, items, mediumProfile } = useContent().content.blog
  useSeo('Blog', intro.title, '/blog')
  if (!items.length) return <Navigate to="/" replace />
  return (
    <>
      <main id="main">
        <header className="container-x pt-36 md:pt-44">
          <Link to="/#blog" className="t-label mb-10 inline-flex items-center gap-2 hover:!text-accent" data-cursor="hover"><ArrowLeft size={14} aria-hidden /> Home</Link>
          <p className="t-label mb-6">{intro.kicker}</p>
          <RevealText as="h1" lines={intro.title} className="t-display t-xl max-w-[16ch]" immediate delay={0.9} />
        </header>
        <div className="container-x mt-14 pb-24 md:mt-20 md:pb-32">
          <PostList posts={sortedPosts(items)} />
          {mediumProfile && <a href={mediumProfile} target="_blank" rel="noreferrer noopener" className="t-label mt-10 inline-flex items-center gap-2 transition-colors hover:!text-accent" data-cursor="hover">All articles on Medium <ArrowUpRight size={14} aria-hidden /></a>}
        </div>
      </main>
      <Footer />
    </>
  )
}
