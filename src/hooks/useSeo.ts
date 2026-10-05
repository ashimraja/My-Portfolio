import { useEffect } from 'react'
import { usePortfolio } from '@/content/ContentProvider'

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.content = content
}

/** Client-side SEO. Pass a page title to use `seo.titleTemplate`. */
export function useSeo(pageTitle?: string, description?: string, path = '/') {
  const portfolio = usePortfolio()
  useEffect(() => {
    const { seo } = portfolio
    const title = pageTitle ? seo.titleTemplate.replace('%s', pageTitle) : seo.title
    const desc = description ?? seo.description
    const url = seo.siteUrl + path
    document.title = title
    setMeta('name', 'description', desc)
    setMeta('name', 'keywords', seo.keywords.join(', '))
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', seo.siteUrl + seo.ogImage)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:site', seo.twitterHandle)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', desc)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = url
  }, [pageTitle, description, path, portfolio])
}
