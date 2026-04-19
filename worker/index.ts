export interface Env {
  ASSETS: Fetcher;
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
    try {
      const assetRes = await env.ASSETS.fetch(request)
      if (assetRes.status !== 404 || !shouldServeSpaShell(request)) {
        return assetRes
      }
    } catch {
      if (!shouldServeSpaShell(request)) throw new Error('Asset fetch failed')
    }

    const spaUrl = new URL(request.url)
    spaUrl.pathname = '/index.html'
    spaUrl.search = ''

    return env.ASSETS.fetch(new Request(spaUrl.toString(), request))
  }
};
