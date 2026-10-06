import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { RevealText } from '@/components/animations/RevealText'
import { PostBody } from '@/components/blog/PostBody'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useContent } from '@/content/ContentProvider'
import { useSeo } from '@/hooks/useSeo'
import { formatDate, hasBody, readMinutes, sortedPosts } from '@/lib/blog'

export default function BlogPostPage() {
  const { slug = '' } = useParams()
  const items = useContent().content.blog.items
  const post = items.find((p) => p.slug === slug)
  useSeo(post?.title, post?.excerpt, `/blog/${slug}`)
  if (!post) return <Navigate to="/blog" replace />

  const posts = sortedPosts(items).filter(hasBody)
  const next = posts.length > 1 ? posts[(posts.findIndex((p) => p.slug === post.slug) + 1) % posts.length] : undefined

  return (
    <>
      <article>
        <header className="container-x pt-36 md:pt-44">
          <Link to="/blog" className="t-label mb-10 inline-flex items-center gap-2 hover:!text-accent" data-cursor="hover"><ArrowLeft size={14} aria-hidden /> All articles</Link>
          <div className="mx-auto max-w-4xl">
            {post.tags.length > 0 && <ul className="mb-6 flex flex-wrap content-start items-start gap-2" aria-label="Tags">{post.tags.map((t) => <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.72rem]">{t}</li>)}</ul>}
            <RevealText as="h1" lines={post.title} className="t-display t-xl" immediate delay={0.9} />
            <p className="t-label mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {hasBody(post) && <><span aria-hidden className="h-px w-6 bg-border" />{readMinutes(post)} min read</>}
              {post.mediumUrl && <><span aria-hidden className="h-px w-6 bg-border" /><a href={post.mediumUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-foreground underline decoration-accent underline-offset-4 hover:text-accent">Originally on Medium <ArrowUpRight size={13} aria-hidden /></a></>}
            </p>
            {post.excerpt && <p className="t-lead mt-8">{post.excerpt}</p>}
          </div>
          {post.cover && <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-border"><img src={post.cover} alt="" className="aspect-[2/1] w-full object-cover" /></div>}
        </header>

        <div className="container-x mt-14 md:mt-20">
          <div className="mx-auto max-w-3xl">
            {hasBody(post)
              ? <PostBody blocks={post.blocks} />
              : <p className="t-body">This article lives on Medium.</p>}
            {post.mediumUrl && (
              <aside className="mt-16 flex flex-wrap items-center justify-between gap-5 border-y border-border py-8">
                <p className="t-lead max-w-md">{hasBody(post) ? 'Enjoyed this? It was first published on Medium.' : 'Read the full article on Medium.'}</p>
                <Button href={post.mediumUrl} external cursorLabel="OPEN">Read on Medium</Button>
              </aside>
            )}
          </div>
        </div>

        {next && (
          <Link to={`/blog/${next.slug}`} className="group relative mt-20 block overflow-hidden border-t border-border py-20 md:py-32" data-cursor="view" data-cursor-label="NEXT">
            <div className="container-x"><p className="t-label mb-4">Next article</p>
              <p className="t-display t-hero max-w-[18ch] transition-transform duration-700 group-hover:translate-x-4">{next.title}</p></div>
          </Link>
        )}
      </article>
      <Footer />
    </>
  )
}
