import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '@/admin/components/AdminLayout'
import MarkdownContent from '@/components/MarkdownContent'
import Field from '@/admin/components/ui/Field'
import Toggle from '@/admin/components/ui/Toggle'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { ensureUniqueSlug, slugify } from '@/lib/blog'
import type { BlogPost } from '@/types'

const MARKDOWN_TEXTAREA_ID = 'blog-markdown-content'

function createDraftPost(): BlogPost {
  const now = new Date().toISOString()
  return {
    id: Date.now().toString(),
    title: '',
    slug: '',
    excerpt: '',
    coverImage: '',
    coverImageAlt: '',
    content: '',
    category: '',
    published: false,
    featuredOnHomepage: false,
    publishedAt: now,
    updatedAt: now,
  }
}

interface BlogPostEditorPageProps {
  mode: 'new' | 'edit'
}

export default function BlogPostEditorPage({ mode }: BlogPostEditorPageProps) {
  const { id } = useParams() as { id?: string }
  const { siteContent, saveContent } = useSiteContentContext()
  const navigate = useNavigate()
  const sourcePost = siteContent.blogPosts.find((post) => post.id === id)

  const [post, setPost] = useState<BlogPost>(() => (mode === 'edit' && sourcePost ? sourcePost : createDraftPost()))
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false)
  const [inlineImageAlt, setInlineImageAlt] = useState('博客图片')

  useEffect(() => {
    if (mode === 'edit' && sourcePost) {
      setPost(sourcePost)
      setDirty(false)
    }
  }, [mode, sourcePost])

  const slugHint = useMemo(() => `/blog/${post.slug || 'your-post-slug'}`, [post.slug])

  function setField<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setPost((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function handleTitleChange(title: string) {
    setPost((prev) => {
      const next = { ...prev, title }
      if (!prev.slug || prev.slug === slugify(prev.title)) {
        next.slug = slugify(title)
      }
      return next
    })
    setDirty(true)
  }

  async function uploadImage(
    file: File,
    metadata: { usageType: string; uploadedFrom: string },
  ) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('usageType', metadata.usageType)
    formData.append('uploadedFrom', metadata.uploadedFrom)
    formData.append('category', 'general')
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData })
    const data = (await res.json()) as { ok?: boolean; originalUrl?: string; error?: string }
    if (!res.ok || !data.ok || !data.originalUrl) {
      throw new Error(data.error || 'Upload failed')
    }
    return data.originalUrl
  }

  async function uploadCoverImage(file: File) {
    try {
      setUploadingCover(true)
      const imageUrl = await uploadImage(file, {
        usageType: 'blog_cover',
        uploadedFrom: 'admin_blog',
      })
      setField('coverImage', imageUrl)
    } finally {
      setUploadingCover(false)
    }
  }

  function insertMarkdownImageAtCursor(imageUrl: string, altText: string) {
    const safeAlt = altText.trim() || '博客图片'
    const snippet = `![${safeAlt}](${imageUrl})`

    if (typeof document === 'undefined') {
      setField('content', `${post.content}${post.content.endsWith('\n') || post.content.length === 0 ? '' : '\n'}${snippet}`)
      return
    }

    const textarea = document.getElementById(MARKDOWN_TEXTAREA_ID) as HTMLTextAreaElement | null
    if (!textarea) {
      setField('content', `${post.content}${post.content.endsWith('\n') || post.content.length === 0 ? '' : '\n'}${snippet}`)
      return
    }

    const start = textarea.selectionStart ?? post.content.length
    const end = textarea.selectionEnd ?? post.content.length
    const before = post.content.slice(0, start)
    const after = post.content.slice(end)
    const nextContent = `${before}${snippet}${after}`
    setField('content', nextContent)

    requestAnimationFrame(() => {
      const cursor = start + snippet.length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  async function uploadInlineImage(file: File) {
    try {
      setUploadingInlineImage(true)
      const imageUrl = await uploadImage(file, {
        usageType: 'blog_inline',
        uploadedFrom: 'admin_blog',
      })
      insertMarkdownImageAtCursor(imageUrl, inlineImageAlt)
    } finally {
      setUploadingInlineImage(false)
    }
  }

  async function handleSave() {
    const uniqueSlug = ensureUniqueSlug(siteContent.blogPosts, post.slug || post.title, post.id)
    const nextPost = {
      ...post,
      slug: uniqueSlug,
      updatedAt: new Date().toISOString(),
      publishedAt: post.publishedAt || new Date().toISOString(),
    }

    if (mode === 'new') {
      await saveContent({
        ...siteContent,
        blogPosts: [nextPost, ...siteContent.blogPosts],
      })
      navigate('/admin/blog')
      return
    }

    await saveContent({
      ...siteContent,
      blogPosts: siteContent.blogPosts.map((item) => (item.id === nextPost.id ? nextPost : item)),
    })
    setDirty(false)
  }

  async function handleDelete() {
    if (mode !== 'edit' || !sourcePost) return
    await saveContent({
      ...siteContent,
      blogPosts: siteContent.blogPosts.filter((item) => item.id !== sourcePost.id),
    })
    navigate('/admin/blog')
  }

  if (mode === 'edit' && !sourcePost) {
    return (
      <AdminLayout>
        <div className="px-8 py-10">
          <h1 className="font-display text-3xl text-white">Post Not Found</h1>
          <Link to="/admin/blog" className="mt-4 inline-block text-sm text-white/70 underline">
            Back to Blog Management
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Editor</p>
            <h1 className="font-display text-3xl text-white">
              {mode === 'new' ? 'New Blog Post' : 'Edit Blog Post'}
            </h1>
            <p className="mt-2 text-sm text-white/55">{slugHint}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview((prev) => !prev)}
              className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/70"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link
              to="/admin/blog"
              className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/70"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <Field label="Title" value={post.title} onChange={(e) => handleTitleChange(e.target.value)} />
            <Field
              label="Slug"
              value={post.slug}
              onChange={(e) => setField('slug', slugify(e.target.value))}
              hint="Lowercase URL path. It must be unique."
            />
            <Field as="textarea" label="Excerpt" rows={4} value={post.excerpt} onChange={(e) => setField('excerpt', e.target.value)} />
            <Field label="Category" value={post.category} onChange={(e) => setField('category', e.target.value)} />
            <Field
              type="datetime-local"
              label="Published At"
              value={post.publishedAt.slice(0, 16)}
              onChange={(e) => setField('publishedAt', new Date(e.target.value).toISOString())}
            />
            <Field label="Cover Image URL" value={post.coverImage} onChange={(e) => setField('coverImage', e.target.value)} />
            <label className="inline-flex cursor-pointer items-center rounded-full border border-white/12 px-4 py-2 text-[12px] text-white/70 transition hover:border-white/30 hover:text-white">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadCoverImage(file)
                  e.currentTarget.value = ''
                }}
              />
              {uploadingCover ? 'Uploading cover...' : 'Upload cover image to R2'}
            </label>
            <Field
              label="Cover Image Alt"
              value={post.coverImageAlt}
              onChange={(e) => setField('coverImageAlt', e.target.value)}
            />
            <Toggle label="Published" checked={post.published} onChange={(val) => setField('published', val)} />
            <Toggle
              label="Featured on Homepage"
              checked={post.featuredOnHomepage}
              onChange={(val) => setField('featuredOnHomepage', val)}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <Field
              as="textarea"
              id={MARKDOWN_TEXTAREA_ID}
              label="Markdown Content"
              rows={18}
              value={post.content}
              onChange={(e) => setField('content', e.target.value)}
              hint="Supports headings, links, lists, blockquotes, and images via markdown syntax."
            />

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.015] p-4">
              <div className="min-w-[220px] flex-1">
                <Field
                  label="图片 Alt"
                  value={inlineImageAlt}
                  onChange={(e) => setInlineImageAlt(e.target.value)}
                  placeholder="博客图片"
                />
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full border border-white/12 px-4 py-2 text-[12px] text-white/70 transition hover:border-white/30 hover:text-white">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadInlineImage(file)
                    e.currentTarget.value = ''
                  }}
                />
                {uploadingInlineImage ? '上传并插入中...' : '插入图片'}
              </label>
            </div>

            {preview && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/45">Preview</p>
                <MarkdownContent content={post.content} />
              </div>
            )}
          </div>
        </div>

        {mode === 'edit' && (
          <button
            onClick={handleDelete}
            className="mt-6 rounded-full border border-red-500/40 px-5 py-2 text-xs uppercase tracking-[0.24em] text-red-300 transition hover:bg-red-500/15"
          >
            Delete Post
          </button>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => void handleSave()} />
    </AdminLayout>
  )
}
