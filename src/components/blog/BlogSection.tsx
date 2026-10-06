import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'
import { sortedPosts } from '@/lib/blog'
import { PostList } from './PostList'

const SHOWN = 4

/** Home-page teaser: the latest articles. Hidden until there is at least one post. */
export function BlogSection() {
  const { intro, items, mediumProfile } = useContent().content.blog
  if (!items.length) return null
  const posts = sortedPosts(items)
  return (
    <section id="blog" className="section rule" aria-labelledby="blog-h">
      <div className="container-x">
        <SectionHeading index="07" kicker={intro.kicker} title={intro.title} />
        <span id="blog-h" className="sr-only">Blog</span>
        <div className="mt-14 md:mt-20"><PostList posts={posts.slice(0, SHOWN)} /></div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {posts.length > SHOWN && <Button to="/blog">All articles</Button>}
          {mediumProfile && <a href={mediumProfile} target="_blank" rel="noreferrer noopener" className="t-label inline-flex items-center gap-2 transition-colors hover:!text-accent" data-cursor="hover">All articles on Medium <ArrowUpRight size={14} aria-hidden /></a>}
          {posts.length <= SHOWN && !mediumProfile && <Link to="/blog" className="t-label hover:!text-accent" data-cursor="hover">Open the archive →</Link>}
        </div>
      </div>
    </section>
  )
}
