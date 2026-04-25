import type { BlogContent, BlogPost } from '@/types'

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeDateString(value: unknown, fallback: string) {
  if (typeof value !== 'string' || value.trim().length === 0) return fallback
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  return d.toISOString()
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeBlogSettings(blog: Partial<BlogContent> | undefined, defaults: BlogContent): BlogContent {
  return {
    eyebrow: asString(blog?.eyebrow, defaults.eyebrow),
    title: asString(blog?.title, defaults.title),
    subtitle: asString(blog?.subtitle, defaults.subtitle),
  }
}

export function normalizeBlogPosts(posts: unknown, defaults: BlogPost[]): BlogPost[] {
  const input = Array.isArray(posts) ? posts : defaults

  return input.map((raw, index) => {
    const now = new Date().toISOString()
    const fallback = defaults[index] ?? defaults[0]
    const source = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<BlogPost> & {
      date?: string
    }

    const title = asString(source.title, fallback?.title ?? 'Untitled Post')
    const slugFromTitle = slugify(title)
    const publishedAt = normalizeDateString(source.publishedAt ?? source.date, now)

    return {
      id: asString(source.id, `${Date.now()}-${index}`),
      title,
      slug: asString(source.slug, slugFromTitle || `post-${index + 1}`) || `post-${index + 1}`,
      excerpt: asString(source.excerpt, ''),
      coverImage: asString(source.coverImage, ''),
      coverImageAlt: asString(source.coverImageAlt, ''),
      content: asString(source.content, ''),
      category: asString(source.category, ''),
      published: asBoolean(source.published, true),
      featuredOnHomepage: asBoolean(source.featuredOnHomepage, false),
      publishedAt,
      updatedAt: normalizeDateString(source.updatedAt, publishedAt),
    }
  })
}

export function ensureUniqueSlug(posts: BlogPost[], candidate: string, currentId?: string) {
  const base = slugify(candidate) || 'untitled-post'
  let slug = base
  let n = 2
  const existing = new Set(posts.filter((p) => p.id !== currentId).map((p) => p.slug))

  while (existing.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }

  return slug
}

export function getPublishedPosts(posts: BlogPost[]) {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getHomepagePreviewPosts(posts: BlogPost[], limit = 3) {
  return getPublishedPosts(posts)
    .filter((post) => post.featuredOnHomepage)
    .slice(0, limit)
}

export function formatBlogDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}
