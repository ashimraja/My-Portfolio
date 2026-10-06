import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'
import { sortedPosts } from '@/lib/blog'
import { PostList } from './PostList'

const SHOWN = 4

/** Home-page teaser: the latest articles. Hidden until there is at least one post. */
export function BlogSection() {
  const { intro, items } = useContent().content.blog
  if (!items.length) return null
  const posts = sortedPosts(items)
  return (
    <section id="blog" className="section rule" aria-labelledby="blog-h">
      <div className="container-x">
        <SectionHeading index="07" kicker={intro.kicker} title={intro.title} />
        <span id="blog-h" className="sr-only">Blog</span>
        <div className="mt-14 md:mt-20"><PostList posts={posts.slice(0, SHOWN)} /></div>
        {posts.length > SHOWN && <div className="mt-10"><Button to="/blog">All articles</Button></div>}
      </div>
    </section>
  )
}
