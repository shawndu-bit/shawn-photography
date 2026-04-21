export interface Env {
  ASSETS: Fetcher;
  DATABASE_URL?: string;
  DATABASE_URL_UNPOOLED?: string;
  BUCKET?: {
    put(
      key: string,
      value: ArrayBuffer | ArrayBufferView | string | ReadableStream | Blob,
      options?: { httpMetadata?: { contentType?: string } },
    ): Promise<void>
    get(
      key: string,
    ): Promise<
      | {
          text(): Promise<string>
          body: ReadableStream | null
          httpMetadata?: { contentType?: string }
        }
      | null
    >
  }
  IMAGES?: ImagesBinding
}

interface ImagesPipeline {
  transform(options: Record<string, unknown>): ImagesPipeline
  output(options: { format: string; quality?: number }): {
    response(): Promise<Response>
  }
}

interface ImagesBinding {
  input(stream: ReadableStream): ImagesPipeline
}

interface SitePhotoRow {
  id: string
  title: string
  src: string
  thumbnail_src: string
  width: number
  height: number
  category: string
  alt: string
  description: string
  specifications: string
  position: number
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
}

function buildImageKey(fileName: string) {
  return `${Date.now()}-${sanitizeName(fileName || 'image')}`
}

function buildOriginalKey(fileName: string) {
  return `uploads/original/${buildImageKey(fileName)}`
}

function buildThumbnailKey(fileName: string) {
  return `uploads/thumb/${buildImageKey(fileName)}.webp`
}

function shouldServeSpaShell(request: Request) {
  if (request.method !== 'GET') return false
  const url = new URL(request.url)
  if (url.pathname.includes('.')) return false
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/html')
}

function getConnectionString(env: Env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  return env.DATABASE_URL
}

async function neonQuery<T>(env: Env, query: string, params: unknown[] = []): Promise<T[]> {
  const connectionString = getConnectionString(env)
  const parsed = new URL(connectionString)
  const sqlEndpoint = `https://${parsed.hostname}/sql`

  const response = await fetch(sqlEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Neon-Connection-String': connectionString,
      'Neon-Raw-Text-Output': 'true',
      'Neon-Array-Mode': 'false',
    },
    body: JSON.stringify({ query, params }),
  })

  if (!response.ok) {
    throw new Error(`Neon query failed (${response.status}): ${await response.text()}`)
  }

  const data = await response.json() as { rows?: T[]; message?: string }
  if (!Array.isArray(data.rows)) {
    throw new Error(data.message || 'Invalid Neon response')
  }

  return data.rows
}

function parseJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>
}

function parsePossiblyStringifiedJson(value: unknown, maxDepth = 3): unknown {
  let parsed: unknown = value

  for (let depth = 0; depth < maxDepth && typeof parsed === 'string'; depth += 1) {
    const trimmed = parsed.trim()
    if (!trimmed) break

    try {
      parsed = JSON.parse(trimmed)
    } catch {
      break
    }
  }

  return parsed
}

function normalizeObject(value: unknown): Record<string, unknown> {
  const parsed = parsePossiblyStringifiedJson(value)
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {}
}

function normalizeArray(value: unknown): unknown[] {
  const parsed = parsePossiblyStringifiedJson(value)
  return Array.isArray(parsed) ? parsed : []
}

async function loadSiteContent(env: Env) {
  const siteRows = await neonQuery<{
    hero: Record<string, unknown>
    about: Record<string, unknown>
    contact: Record<string, unknown>
    blog: Record<string, unknown>
    social_links: unknown[]
    blog_posts: unknown[]
    section_visibility: Record<string, unknown>
  }>(
    env,
    `SELECT hero, about, contact, blog, social_links, blog_posts, section_visibility
     FROM site_content
     WHERE id = 1`,
  )

  const photos = await neonQuery<SitePhotoRow>(
    env,
    `SELECT id, title, src, thumbnail_src, width, height, category, alt, description, specifications, position
     FROM site_photos
     ORDER BY position ASC, created_at ASC`,
  )

  const site = siteRows[0]

  return {
    hero: normalizeObject(site?.hero),
    about: normalizeObject(site?.about),
    contact: normalizeObject(site?.contact),
    blog: normalizeObject(site?.blog),
    socialLinks: normalizeArray(site?.social_links),
    blogPosts: normalizeArray(site?.blog_posts),
    sectionVisibility: normalizeObject(site?.section_visibility),
    photos: photos.map((photo) => ({
      id: photo.id,
      title: photo.title,
      src: photo.src,
      thumbnailSrc: photo.thumbnail_src,
      width: Number(photo.width ?? 0),
      height: Number(photo.height ?? 0),
      category: photo.category,
      alt: photo.alt,
      description: photo.description,
      specifications: photo.specifications,
    })),
  }
}

async function saveSiteContent(env: Env, data: Record<string, unknown>) {
  const hero = normalizeObject(data.hero)
  const about = normalizeObject(data.about)
  const contact = normalizeObject(data.contact)
  const blog = normalizeObject(data.blog)
  const socialLinks = normalizeArray(data.socialLinks)
  const blogPosts = normalizeArray(data.blogPosts)
  const sectionVisibility = normalizeObject(data.sectionVisibility)
  const photos = Array.isArray(data.photos) ? data.photos : []

  await neonQuery(
    env,
    `INSERT INTO site_content (id, hero, about, contact, blog, social_links, blog_posts, section_visibility)
     VALUES (1, $1::jsonb, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
     ON CONFLICT (id) DO UPDATE
     SET
       hero = EXCLUDED.hero,
       about = EXCLUDED.about,
       contact = EXCLUDED.contact,
       blog = EXCLUDED.blog,
       social_links = EXCLUDED.social_links,
       blog_posts = EXCLUDED.blog_posts,
       section_visibility = EXCLUDED.section_visibility,
       updated_at = NOW()`,
    [
      JSON.stringify(hero),
      JSON.stringify(about),
      JSON.stringify(contact),
      JSON.stringify(blog),
      JSON.stringify(socialLinks),
      JSON.stringify(blogPosts),
      JSON.stringify(sectionVisibility),
    ],
  )

  await neonQuery(env, 'DELETE FROM site_photos')

  for (const [index, rawPhoto] of photos.entries()) {
    const photo = rawPhoto as Record<string, unknown>
    await neonQuery(
      env,
      `INSERT INTO site_photos (
         id, title, src, thumbnail_src, width, height, category, alt, description, specifications, position, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
       )`,
      [
        String(photo.id ?? `${Date.now()}-${index}`),
        String(photo.title ?? ''),
        String(photo.src ?? ''),
        String(photo.thumbnailSrc ?? photo.src ?? ''),
        Number(photo.width ?? 0),
        Number(photo.height ?? 0),
        String(photo.category ?? 'mountains'),
        String(photo.alt ?? ''),
        String(photo.description ?? ''),
        String(photo.specifications ?? ''),
        index,
      ],
    )
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/api/site-content') {
      try {
        const data = await loadSiteContent(env)
        return Response.json({ ok: true, data })
      } catch (error) {
        return Response.json({ ok: false, error: `Site content load failed: ${String(error)}` }, { status: 500 })
      }
    }

    if (request.method === 'PUT' && url.pathname === '/api/admin/site-content') {
      try {
        const body = await parseJsonBody<Record<string, unknown>>(request)
        await saveSiteContent(env, body)
        return Response.json({ ok: true })
      } catch (error) {
        return Response.json({ ok: false, error: `Site content save failed: ${String(error)}` }, { status: 500 })
      }
    }

    if (request.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      if (!env.BUCKET) return new Response('R2 bucket not configured', { status: 500 })
      const key = decodeURIComponent(url.pathname.replace('/uploads/', ''))
      if (!key) return new Response('Missing key', { status: 400 })

      const object = await env.BUCKET.get(key)
      if (!object || !object.body) return new Response('Not found', { status: 404 })

      return new Response(object.body, {
        headers: {
          'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream',
          'cache-control': 'public, max-age=31536000, immutable',
        },
      })
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/upload-image') {
      try {
        if (!env.BUCKET) return Response.json({ ok: false, error: 'R2 bucket not configured' }, { status: 500 })
        if (!env.IMAGES) return Response.json({ ok: false, error: 'Images binding not configured' }, { status: 500 })

        const formData = await request.formData()
        const file = formData.get('file')
        const existingOriginalKey = String(formData.get('existingOriginalKey') || '').trim()
        const existingThumbKey = String(formData.get('existingThumbKey') || '').trim()

        if (!(file instanceof File)) {
          return Response.json({ ok: false, error: 'Missing file' }, { status: 400 })
        }
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          return Response.json({ ok: false, error: 'Unsupported file type' }, { status: 400 })
        }

        const reusableOriginalKey = existingOriginalKey.startsWith('uploads/original/')
          ? existingOriginalKey
          : ''
        const reusableThumbKey = existingThumbKey.startsWith('uploads/thumb/')
          ? existingThumbKey
          : ''

        const originalKey = reusableOriginalKey || buildOriginalKey(file.name)
        const thumbnailKey = reusableThumbKey || buildThumbnailKey(file.name)

        await env.BUCKET.put(originalKey, file, {
          httpMetadata: { contentType: file.type || 'application/octet-stream' },
        })

        const transformed = await env.IMAGES
          .input(file.stream())
          .transform({ width: 640, height: 640, fit: 'scale-down' })
          .output({ format: 'image/webp', quality: 82 })

        const transformedResponse = await transformed.response()

        if (!transformedResponse.ok) {
          return Response.json({ ok: false, error: 'Thumbnail generation failed' }, { status: 500 })
        }

        const thumbContentType = transformedResponse.headers.get('content-type') ?? 'image/webp'
        const thumbBody = transformedResponse.body ?? await transformedResponse.arrayBuffer()

        await env.BUCKET.put(thumbnailKey, thumbBody, {
          httpMetadata: { contentType: thumbContentType },
        })

        return Response.json({
          ok: true,
          originalKey,
          originalUrl: `/uploads/${encodeURIComponent(originalKey)}`,
          thumbnailKey,
          thumbnailUrl: `/uploads/${encodeURIComponent(thumbnailKey)}`,
        })
      } catch (error) {
        return Response.json({ ok: false, error: `Upload failed: ${String(error)}` }, { status: 500 })
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ ok: false, error: 'API route not found' }, { status: 404 })
    }

    if (request.method === 'GET' && url.pathname === '/__diag/r2') {
      const hasBucket = Boolean(env.BUCKET)
      const result: Record<string, unknown> = { hasBucket }

      if (!hasBucket) {
        return Response.json(result, { status: 500 })
      }

      try {
        const key = `diag-${Date.now()}`
        const value = 'ok'

        await env.BUCKET!.put(key, value)
        const readBack = await env.BUCKET!.get(key)
        result.roundTripOk = (await readBack?.text()) === value
        result.key = key
      } catch (error) {
        result.roundTripOk = false
        result.error = String(error)
      }

      return Response.json(result, { status: result.roundTripOk ? 200 : 500 })
    }

    const wantsSpaShell = shouldServeSpaShell(request)

    try {
      const assetRes = await env.ASSETS.fetch(request)
      if (assetRes.status !== 404 || !wantsSpaShell) {
        return assetRes
      }
    } catch (error) {
      if (!wantsSpaShell) {
        return new Response(`Asset fetch failed: ${String(error)}`, { status: 500 })
      }
    }

    const spaUrl = new URL(request.url)
    spaUrl.pathname = '/index.html'
    spaUrl.search = ''

    try {
      return await env.ASSETS.fetch(new Request(spaUrl.toString(), request))
    } catch (error) {
      return new Response(`SPA shell fetch failed: ${String(error)}`, { status: 500 })
    }
  }
};
