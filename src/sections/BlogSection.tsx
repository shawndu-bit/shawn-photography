import { Link } from 'react-router-dom'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { formatBlogDate, getHomepagePreviewPosts } from '@/lib/blog'

export default function BlogSection() {
  const { siteContent } = useSiteContentContext()
  const b = siteContent.blog
  const posts = getHomepagePreviewPosts(siteContent.blogPosts)

  return (
    <section id="blog" className="border-t border-white/10 px-5 py-24 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.5em] text-white/40">{b.eyebrow}</p>
            <h2 className="font-display text-3xl text-white md:text-4xl">{b.title}</h2>
            {b.subtitle && <p className="mt-3 max-w-2xl text-sm text-white/55">{b.subtitle}</p>}
          </div>
          <Link
            to="/blog"
            className="text-sm uppercase tracking-[0.28em] text-white/50 transition hover:text-white"
          >
            View all articles
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-7 text-white/55">
            No featured blog posts yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-[24px] border border-white/10 bg-white/[0.025] p-7 transition hover:bg-white/[0.04]"
              >
                <p className="text-xs uppercase tracking-[0.38em] text-white/38">{post.category || 'Journal'}</p>
                <h3 className="mt-4 text-xl text-white">{post.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/60">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40">
                  <span>{formatBlogDate(post.publishedAt)}</span>
                  <Link to={`/blog/${post.slug}`} className="transition hover:text-white/80">Read →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
