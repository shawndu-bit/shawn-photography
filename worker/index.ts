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
