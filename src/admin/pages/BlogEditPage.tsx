import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { BlogContent, BlogPost } from '@/types'

function newPost(): BlogPost {
  return { id: Date.now().toString(), category: '', title: '', excerpt: '' }
}

export default function BlogEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [blog, setBlog] = useState<BlogContent>(siteContent.blog)
  const [posts, setPosts] = useState<BlogPost[]>(siteContent.blogPosts)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setBlog(siteContent.blog) }, [siteContent.blog])
  useEffect(() => { setPosts(siteContent.blogPosts) }, [siteContent.blogPosts])

  function setBlogField<K extends keyof BlogContent>(key: K, val: BlogContent[K]) {
    setBlog((prev) => ({ ...prev, [key]: val }))
    setDirty(true)
    setSaved(false)
  }

  function updatePost(id: string, key: keyof BlogPost, val: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)))
    setDirty(true)
    setSaved(false)
  }

  function addPost() {
    setPosts((prev) => [...prev, newPost()])
    setDirty(true)
  }

  function removePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    await saveContent({ ...siteContent, blog, blogPosts: posts })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setBlog(siteContent.blog)
    setPosts(siteContent.blogPosts)
    setDirty(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
            <h1 className="font-display text-3xl text-white">Blog Preview</h1>
            <p className="mt-2 text-sm text-white/55">Homepage blog preview editor (not full blog post management).</p>
          </div>
          <button
            onClick={addPost}
            className="rounded-full border border-white/15 px-5 py-2.5 text-[12px] tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            + 新增文章
          </button>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/40">版块标题</p>
            <div className="space-y-4">
              <Field
                label="眉题（Eyebrow）"
                value={blog.eyebrow}
                onChange={(e) => setBlogField('eyebrow', e.target.value)}
              />
              <Field
                label="主页 Blog 主标题"
                value={blog.title}
                onChange={(e) => setBlogField('title', e.target.value)}
              />
            </div>
          </div>

          {posts.map((post, idx) => (
            <div
              key={post.id}
              className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">文章 {idx + 1}</p>
                <button
                  onClick={() => removePost(post.id)}
                  className="text-[12px] text-white/25 transition hover:text-red-400"
                >
                  删除
                </button>
              </div>
              <div className="space-y-4">
                <Field
                  label="分类标签"
                  value={post.category}
                  onChange={(e) => updatePost(post.id, 'category', e.target.value)}
                  placeholder="Field Notes / Gear / Travel"
                />
                <Field
                  label="标题"
                  value={post.title}
                  onChange={(e) => updatePost(post.id, 'title', e.target.value)}
                />
                <Field
                  as="textarea"
                  label="摘要"
                  value={post.excerpt}
                  onChange={(e) => updatePost(post.id, 'excerpt', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-[13px] text-white/30">暂无文章，点击右上角「新增文章」</p>
          )}

          {saved && !dirty && (
            <p className="text-[12px] text-green-400">✓ 已保存</p>
          )}
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
    </AdminLayout>
  )
}
