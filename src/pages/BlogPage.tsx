import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { formatBlogDate, getPublishedPosts } from '@/lib/blog'

export default function BlogPage() {
  const { siteContent } = useSiteContentContext()
  const posts = getPublishedPosts(siteContent.blogPosts)
  const blog = siteContent.blog

  return (
    <>
      <main className="min-h-screen bg-carbon text-white">
        <SiteHeader mode="inner" />

        <section className="border-b border-white/10 pt-28 pb-10 md:pt-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <p className="text-xs uppercase tracking-[0.45em] text-white/40">{blog.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl text-white md:text-5xl">{blog.title}</h1>
            {blog.subtitle && <p className="mt-4 max-w-3xl text-white/65">{blog.subtitle}</p>}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
              <p className="text-lg text-white/80">No published stories yet.</p>
              <p className="mt-2 text-sm text-white/50">Check back soon for new field notes and essays.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                  {post.coverImage && (
                    <Link to={`/blog/${post.slug}`}>
                      <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="h-56 w-full object-cover" />
                    </Link>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.26em] text-white/45">
                      {post.category && <span>{post.category}</span>}
                      <span>{formatBlogDate(post.publishedAt)}</span>
                    </div>
                    <h2 className="text-2xl text-white">
                      <Link to={`/blog/${post.slug}`} className="transition hover:text-white/80">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-white/60">{post.excerpt}</p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="mt-6 inline-flex text-xs uppercase tracking-[0.28em] text-white/55 transition hover:text-white"
                    >
                      Read Article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
