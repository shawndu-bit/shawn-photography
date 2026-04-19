import { useEffect, useMemo, useState } from 'react'
import type { SiteContent } from '@/types'
import { defaultSiteContent } from '@/data/siteContent'

const STORAGE_KEY = 'shawn-photography-site-content'

function readSiteContent(): SiteContent {
  if (typeof window === 'undefined') return defaultSiteContent

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultSiteContent

  try {
    const parsed = JSON.parse(raw) as Partial<SiteContent>
    return {
      ...defaultSiteContent,
      ...parsed,
      hero: {
        ...defaultSiteContent.hero,
        ...parsed.hero,
      },
      about: {
        ...defaultSiteContent.about,
        ...parsed.about,
        paragraphs: parsed.about?.paragraphs ?? defaultSiteContent.about.paragraphs,
      },
      contact: {
        ...defaultSiteContent.contact,
        ...parsed.contact,
      },
      blog: {
        ...defaultSiteContent.blog,
        ...parsed.blog,
      },
      blogPosts: parsed.blogPosts ?? defaultSiteContent.blogPosts,
      photos: parsed.photos ?? defaultSiteContent.photos,
      sectionVisibility: {
        ...defaultSiteContent.sectionVisibility,
        ...parsed.sectionVisibility,
      },
    }
  } catch {
    return defaultSiteContent
  }
}

export function useSiteContent() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSiteContent(readSiteContent())
    setHydrated(true)
  }, [])

  const actions = useMemo(
    () => ({
      saveContent(next: SiteContent) {
        setSiteContent(next)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        }
      },
      resetContent() {
        setSiteContent(defaultSiteContent)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      },
    }),
    [],
  )

  return {
    siteContent,
    hydrated,
    ...actions,
  }
}
