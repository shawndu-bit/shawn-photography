export interface Env {
  ASSETS: Fetcher;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

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
        .response()

      if (!transformed.ok) {
        return Response.json({ ok: false, error: 'Thumbnail generation failed' }, { status: 500 })
      }

      const thumbContentType = transformed.headers.get('content-type') ?? 'image/webp'
      const thumbBody = transformed.body ?? await transformed.arrayBuffer()

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
