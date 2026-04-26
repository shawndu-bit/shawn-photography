import type { SiteContent } from '@/types'
import { defaultSiteContent } from '@/data/siteContent'
import { normalizeBlogPosts, normalizeBlogSettings } from '@/lib/blog'

export const LEGACY_STORAGE_KEY = 'shawn-photography-site-content'

function normalizeCategory(category: string | undefined) {
  if (category === 'ocean') return 'sea_lakes'
  if (category === 'desert') return 'city'
  return (category ?? 'mountains') as SiteContent['photos'][number]['category']
}

export function mergeSiteContent(parsed: Partial<SiteContent>): SiteContent {
  const defaultAlbumDetails = defaultSiteContent.portfolio?.albumDetails ?? {}
  const parsedAlbumDetails = parsed.portfolio?.albumDetails ?? {}
  const mergedAlbumDetails = Object.entries(parsedAlbumDetails).reduce<Record<string, NonNullable<SiteContent['portfolio']>['albumDetails'][string]>>(
    (acc, [albumId, detail]) => {
      acc[albumId] = {
        ...(defaultAlbumDetails[albumId] ?? {}),
        ...detail,
      }
      return acc
    },
    { ...defaultAlbumDetails },
  )

  const mergedPhotos = (parsed.photos ?? defaultSiteContent.photos).map((photo) => ({
    ...photo,
    category: normalizeCategory(photo.category),
    description: photo.description ?? '',
    specifications: photo.specifications ?? '',
    thumbnailSrc: photo.thumbnailSrc ?? photo.src,
  }))

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
      page: {
        ...defaultSiteContent.about.page,
        ...parsed.about?.page,
        bioParagraphs:
          parsed.about?.page?.bioParagraphs
          ?? defaultSiteContent.about.page?.bioParagraphs
          ?? defaultSiteContent.about.paragraphs,
        gear: {
          ...defaultSiteContent.about.page?.gear,
          ...parsed.about?.page?.gear,
          items:
            parsed.about?.page?.gear?.items
            ?? defaultSiteContent.about.page?.gear?.items
            ?? [],
        },
      },
    },
    contact: {
      ...defaultSiteContent.contact,
      ...parsed.contact,
    },
    blog: normalizeBlogSettings(parsed.blog, defaultSiteContent.blog),
    portfolio: {
      ...defaultSiteContent.portfolio,
      ...parsed.portfolio,
      albumDetails: mergedAlbumDetails,
    },
    socialLinks: parsed.socialLinks ?? defaultSiteContent.socialLinks,
    blogPosts: normalizeBlogPosts(parsed.blogPosts, defaultSiteContent.blogPosts),
    photos: mergedPhotos,
    sectionVisibility: {
      ...defaultSiteContent.sectionVisibility,
      ...parsed.sectionVisibility,
    },
  }
}

export function readLegacyLocalSiteContent(): SiteContent | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<SiteContent>
    return mergeSiteContent(parsed)
  } catch {
    return null
  }
}
