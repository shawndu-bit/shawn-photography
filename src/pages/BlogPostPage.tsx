import { Link, useParams } from 'react-router-dom'
import Footer from '@/components/Footer'
import MarkdownContent from '@/components/MarkdownContent'
import SiteHeader from '@/components/SiteHeader'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { formatBlogDate, getPublishedPosts } from '@/lib/blog'

function isSpecialOrExternalLink(url: string) {
  return /^(mailto:|tel:|https?:)/i.test(url)
}

function isHashRoute(url: string) {
  return url.includes('#')
}

export default function BlogPostPage() {
  const { slug } = useParams() as { slug?: string }
  const { siteContent } = useSiteContentContext()
  const post = getPublishedPosts(siteContent.blogPosts).find((item) => item.slug === slug)

  const cta = siteContent.blog.cta
  const primaryText = cta.primaryText.trim() || 'View Portfolio'
  const primaryHref = cta.primaryHref.trim() || '/portfolio'
  const secondaryText = cta.secondaryText.trim() || 'Contact'
  const secondaryHref = cta.secondaryHref.trim() || '/#contact'

  if (!post) {
    return (
      <>
        <main className="min-h-screen bg-carbon text-white">
          <SiteHeader mode="inner" />
          <section className="mx-auto max-w-3xl px-6 pt-32 pb-16 text-center">
            <h1 className="font-display text-4xl text-white">Article Not Found</h1>
            <p className="mt-3 text-white/60">This post may be unpublished or the link is no longer valid.</p>
            <Link
              to="/blog"
              className="mt-8 inline-flex rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.26em] text-white/80 transition hover:bg-white hover:text-black"
            >
              Back to Blog
            </Link>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-carbon text-white">
        <SiteHeader mode="inner" />
        <article className="mx-auto max-w-3xl px-6 pt-30 pb-12 md:pt-32">
          <Link to="/blog" className="text-xs uppercase tracking-[0.28em] text-white/45 transition hover:text-white">
            ← Back to Blog
          </Link>

          <header className="mt-8 border-b border-white/10 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.25em] text-white/45">
              {post.category && <span>{post.category}</span>}
              <span>{formatBlogDate(post.publishedAt)}</span>
            </div>
            <h1 className="font-display text-4xl text-white md:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mt-5 text-white/65">{post.excerpt}</p>}
          </header>

          {post.coverImage && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
              <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="w-full object-cover" />
            </div>
          )}

          <MarkdownContent content={post.content} className="mt-8" />

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Explore More</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {isSpecialOrExternalLink(primaryHref) || isHashRoute(primaryHref) ? (
                <a
                  href={primaryHref}
                  target={isSpecialOrExternalLink(primaryHref) && /^https?:/i.test(primaryHref) ? '_blank' : undefined}
                  rel={isSpecialOrExternalLink(primaryHref) && /^https?:/i.test(primaryHref) ? 'noopener noreferrer' : undefined}
                  className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                >
                  {primaryText}
                </a>
              ) : (
                <Link
                  to={primaryHref}
                  className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                >
                  {primaryText}
                </Link>
              )}

              {isSpecialOrExternalLink(secondaryHref) || isHashRoute(secondaryHref) ? (
                <a
                  href={secondaryHref}
                  target={isSpecialOrExternalLink(secondaryHref) && /^https?:/i.test(secondaryHref) ? '_blank' : undefined}
                  rel={isSpecialOrExternalLink(secondaryHref) && /^https?:/i.test(secondaryHref) ? 'noopener noreferrer' : undefined}
                  className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                >
                  {secondaryText}
                </a>
              ) : (
                <Link
                  to={secondaryHref}
                  className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                >
                  {secondaryText}
                </Link>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
