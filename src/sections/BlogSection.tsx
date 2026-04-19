import { useSiteContentContext } from '@/hooks/useSiteContentContext'

export default function BlogSection() {
  const { siteContent } = useSiteContentContext()
  const posts = siteContent.blogPosts

  return (
    <section id="blog" className="border-t border-white/10 px-5 py-24 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.5em] text-white/40">Journal</p>
            <h2 className="font-display text-3xl text-white md:text-4xl">
              摄影日志与野外采风笔记
            </h2>
          </div>
          <a
            href="#contact"
            className="text-[11px] uppercase tracking-[0.28em] text-white/50 transition hover:text-white"
          >
            More Coming Soon
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[24px] border border-white/10 bg-white/[0.025] p-7 transition hover:bg-white/[0.04]"
            >
              <p className="text-[10px] uppercase tracking-[0.38em] text-white/38">{post.category}</p>
              <h3 className="mt-4 text-xl text-white">{post.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/60">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
