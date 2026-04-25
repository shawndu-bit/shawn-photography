import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { formatBlogDate } from '@/lib/blog'
import type { BlogContent, BlogPost } from '@/types'

export default function BlogEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [blog, setBlog] = useState<BlogContent>(siteContent.blog)
  const [posts, setPosts] = useState<BlogPost[]>(siteContent.blogPosts)
  const [dirty, setDirty] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { setBlog(siteContent.blog) }, [siteContent.blog])
  useEffect(() => { setPosts(siteContent.blogPosts) }, [siteContent.blogPosts])

  function setBlogField<K extends keyof BlogContent>(key: K, val: BlogContent[K]) {
    setBlog((prev) => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  async function handleSaveSettings() {
    await saveContent({ ...siteContent, blog })
    setDirty(false)
  }


  async function handleToggleFeatured(id: string) {
    const nextPosts = posts.map((post) => (
      post.id === id ? { ...post, featuredOnHomepage: !post.featuredOnHomepage } : post
    ))
    setPosts(nextPosts)
    await saveContent({ ...siteContent, blog, blogPosts: nextPosts })
  }

  async function handleDeletePost(id: string) {
    const nextPosts = posts.filter((post) => post.id !== id)
    await saveContent({ ...siteContent, blog, blogPosts: nextPosts })
    setPosts(nextPosts)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Manage</p>
            <h1 className="font-display text-3xl text-white">Blog 日志</h1>
            <p className="mt-2 text-sm text-white/55">Page settings and article overview.</p>
          </div>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="rounded-full border border-white/20 px-5 py-2.5 text-xs uppercase tracking-[0.24em] text-white/80 transition hover:border-white/40 hover:text-white"
          >
            + New Post
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/40">Blog Page Settings</p>
            <div className="space-y-4">
              <Field
                label="Eyebrow"
                value={blog.eyebrow}
                onChange={(e) => setBlogField('eyebrow', e.target.value)}
              />
              <Field
                label="Page Title"
                value={blog.title}
                onChange={(e) => setBlogField('title', e.target.value)}
              />
              <Field
                as="textarea"
                label="Subtitle / Intro"
                value={blog.subtitle}
                onChange={(e) => setBlogField('subtitle', e.target.value)}
                rows={4}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/40">Posts</p>

            {posts.length === 0 ? (
              <p className="text-sm text-white/45">No posts yet. Click “New Post” to create one.</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-white/10 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base text-white">{post.title || '(Untitled)'}</p>
                        <p className="mt-1 text-xs text-white/45">/{post.slug}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => void handleToggleFeatured(post.id)}
                          className={`rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] transition ${
                            post.featuredOnHomepage
                              ? 'border-emerald-300/45 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'
                              : 'border-white/15 text-white/55 hover:border-white/35 hover:text-white/80'
                          }`}
                        >
                          Homepage: {post.featuredOnHomepage ? 'On' : 'Off'}
                        </button>
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/70 transition hover:border-white/35 hover:text-white"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-full border border-red-400/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-red-300 transition hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.2em] text-white/45">
                      <span>{post.published ? 'Published' : 'Draft'}</span>
                      <span>{post.featuredOnHomepage ? 'Featured on homepage' : 'Not featured'}</span>
                      <span>{formatBlogDate(post.publishedAt) || 'No date'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={handleSaveSettings} onReset={() => setBlog(siteContent.blog)} />
    </AdminLayout>
  )
}
