import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SiteContent } from '@/types'
import { defaultSiteContent } from '@/data/siteContent'
import { LEGACY_STORAGE_KEY, mergeSiteContent, readLegacyLocalSiteContent } from '@/lib/siteContent'

async function fetchSiteContent(): Promise<SiteContent> {
  const res = await fetch('/api/site-content', {
    method: 'GET',
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch site content: ${res.status}`)
  }

  const data = (await res.json()) as { ok?: boolean; data?: Partial<SiteContent>; error?: string }
  if (!data.ok || !data.data) {
    throw new Error(data.error || 'Invalid site content response')
  }

  return mergeSiteContent(data.data)
}

async function persistSiteContent(next: SiteContent): Promise<void> {
  const res = await fetch('/api/admin/site-content', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(next),
  })

  const data = (await res.json()) as { ok?: boolean; error?: string }

  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Failed to save site content: ${res.status}`)
  }
}

export function useSiteContent() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      const legacy = readLegacyLocalSiteContent()

      try {
        const remote = await fetchSiteContent()
        if (!active) return
        setSiteContent(remote)
      } catch {
        if (!active) return
        setSiteContent(legacy ?? defaultSiteContent)
      } finally {
        if (active) setHydrated(true)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const saveContent = useCallback(async (next: SiteContent) => {
    await persistSiteContent(next)
    setSiteContent(next)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  const resetContent = useCallback(async () => {
    await persistSiteContent(defaultSiteContent)
    setSiteContent(defaultSiteContent)

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  }, [])

  return useMemo(
    () => ({
      siteContent,
      hydrated,
      saveContent,
      resetContent,
    }),
    [hydrated, resetContent, saveContent, siteContent],
  )
}
