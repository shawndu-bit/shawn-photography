import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MarkdownContent from '@/components/MarkdownContent'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { defaultSiteContent } from '@/data/siteContent'
import type { Photo, PortfolioAlbumDetail } from '@/types'

interface Album {
  id: string
  name: string
  photos: Photo[]
  cover: Photo | null
}
interface MediaAsset {
  id: string
  originalUrl: string
  thumbnailUrl: string | null
  title: string
  alt: string
  description: string
  category: string
  width: number | null
  height: number | null
}

type Slot = 'farLeft' | 'left' | 'center' | 'right' | 'farRight'

const CATEGORY_LABELS: Record<string, string> = {
  mountains: 'Mountains',
  sea_lakes: 'Sea & Lakes',
  forest: 'Forest',
  nightscape: 'Nightscape',
  city: 'City',
}

const TRANSITION_MS = 860

function getAlbumName(category: string) {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase())
}

function normalizePhotoCategory(category: string | undefined, fallback: Photo['category'] = 'mountains'): Photo['category'] {
  if (category === 'mountains' || category === 'sea_lakes' || category === 'nightscape' || category === 'forest' || category === 'city') {
    return category
  }
  return fallback
}

function fallbackAlbumIds(photos: Photo[]) {
  const categories = [...new Set(photos.map((photo) => photo.category))]
  return ['featured', ...categories.filter((category) => category !== 'featured')]
}

function assetToPhoto(asset: MediaAsset, albumId: string): Photo {
  return {
    id: `asset-${asset.id}`,
    title: asset.title || 'Untitled',
    description: asset.description || '',
    specifications: '',
    src: asset.originalUrl,
    thumbnailSrc: asset.thumbnailUrl || asset.originalUrl,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    category: normalizePhotoCategory(asset.category, normalizePhotoCategory(albumId)),
    alt: asset.alt || asset.title || 'portfolio photo',
  }
}

function createAlbums(photos: Photo[], portfolio: ReturnType<typeof useSiteContentContext>['siteContent']['portfolio'], mediaById: Map<string, MediaAsset>) {
  const featured = photos.slice(0, 10)
  const categoryMap = new Map<string, Photo[]>()

  photos.forEach((photo) => {
    const key = photo.category || 'mountains'
    const bucket = categoryMap.get(key)
    if (bucket) bucket.push(photo)
    else categoryMap.set(key, [photo])
  })

  const categoryAlbums: Album[] = [...categoryMap.entries()].map(([category, categoryPhotos]) => ({
    id: category,
    name: getAlbumName(category),
    photos: categoryPhotos,
    cover: categoryPhotos[0] ?? null,
  }))

  const fallbackAlbums = [{ id: 'featured', name: 'Featured Works', photos: featured, cover: featured[0] ?? null }, ...categoryAlbums]
  const fallbackMap = new Map<string, Album>(fallbackAlbums.map((album) => [album.id, album]))
  const details = portfolio?.albumDetails ?? {}
  const albumPhotoIds = portfolio?.albumPhotoIds ?? {}
  const albumOrder = portfolio?.albumOrder?.length
    ? portfolio.albumOrder
    : fallbackAlbumIds(photos)
  const extraIds = [...Object.keys(details), ...Object.keys(albumPhotoIds), ...fallbackMap.keys()]
  const allIds = [...albumOrder, ...extraIds].filter((id, index, arr) => !!id && arr.indexOf(id) === index)

  return allIds.map((albumId) => {
    const fallbackAlbum = fallbackMap.get(albumId)
    const managedIds = albumPhotoIds[albumId] ?? []
    const managedPhotos = managedIds
      .map((assetId) => mediaById.get(assetId))
      .filter((asset): asset is MediaAsset => Boolean(asset))
      .map((asset) => assetToPhoto(asset, albumId))

    const photosForAlbum = managedPhotos.length > 0
      ? managedPhotos
      : fallbackAlbum?.photos ?? []
    const name = details[albumId]?.albumName?.trim() || details[albumId]?.title?.trim() || fallbackAlbum?.name || getAlbumName(albumId)

    return {
      id: albumId,
      name,
      photos: photosForAlbum,
      cover: photosForAlbum[0] ?? fallbackAlbum?.cover ?? null,
    }
  })
}

function rotateNext(list: Photo[]) {
  if (list.length <= 1) return list
  return [...list.slice(1), list[0]]
}

function rotatePrev(list: Photo[]) {
  if (list.length <= 1) return list
  return [list[list.length - 1], ...list.slice(0, -1)]
}

function getVisiblePanels(order: Photo[]) {
  const n = order.length
  if (n === 0) return [] as Array<{ photo: Photo; slot: Slot }>
  if (n === 1) return [{ photo: order[0], slot: 'center' as const }]
  if (n === 2) return [{ photo: order[0], slot: 'center' as const }, { photo: order[1], slot: 'right' as const }]
  if (n === 3) {
    return [
      { photo: order[2], slot: 'left' as const },
      { photo: order[0], slot: 'center' as const },
      { photo: order[1], slot: 'right' as const },
    ]
  }
  if (n === 4) {
    return [
      { photo: order[3], slot: 'farLeft' as const },
      { photo: order[0], slot: 'center' as const },
      { photo: order[1], slot: 'right' as const },
      { photo: order[2], slot: 'farRight' as const },
    ]
  }

  return [
    { photo: order[n - 2], slot: 'farLeft' as const },
    { photo: order[n - 1], slot: 'left' as const },
    { photo: order[0], slot: 'center' as const },
    { photo: order[1], slot: 'right' as const },
    { photo: order[2], slot: 'farRight' as const },
  ]
}

function getPanelStyle(slot: Slot): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transformOrigin: 'center center',
    transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: 'transform, opacity, filter',
  }

  if (slot === 'center') {
    return {
      ...base,
      width: 'min(860px, 60vw)',
      transform: 'translate(-50%, -50%) translate3d(0, 0, 110px) rotateY(0deg) scale(1)',
      opacity: 1,
      zIndex: 40,
      filter: 'brightness(1)',
    }
  }

  if (slot === 'left') {
    return {
      ...base,
      width: 'min(500px, 35vw)',
      transform: 'translate(-50%, -50%) translate3d(clamp(-420px,-30vw,-360px), 0, -90px) rotateY(30deg) scale(0.9)',
      opacity: 1,
      zIndex: 25,
    }
  }

  if (slot === 'right') {
    return {
      ...base,
      width: 'min(500px, 35vw)',
      transform: 'translate(-50%, -50%) translate3d(clamp(360px,30vw,420px), 0, -90px) rotateY(-30deg) scale(0.9)',
      opacity: 1,
      zIndex: 25,
    }
  }

  if (slot === 'farLeft') {
    return {
      ...base,
      width: 'min(360px, 27vw)',
      transform: 'translate(-50%, -50%) translate3d(clamp(-700px,-48vw,-600px), 0, -180px) rotateY(42deg) scale(0.76)',
      opacity: 0.82,
      zIndex: 15,
    }
  }

  return {
    ...base,
    width: 'min(360px, 27vw)',
    transform: 'translate(-50%, -50%) translate3d(clamp(600px,48vw,700px), 0, -180px) rotateY(-42deg) scale(0.76)',
    opacity: 0.82,
    zIndex: 15,
  }
}

function isSpecialOrExternalLink(url: string) {
  return /^(mailto:|tel:|https?:)/i.test(url)
}

function isHashRoute(url: string) {
  return url.includes('#')
}

export default function PortfolioPage() {
  const { siteContent } = useSiteContentContext()
  const { search } = useLocation()
  const navigate = useNavigate()
  const initialAlbumFromUrl = useMemo(() => new URLSearchParams(search).get('album')?.trim() ?? '', [search])
  const [managedAssets, setManagedAssets] = useState<MediaAsset[]>([])
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [stageIntroActive, setStageIntroActive] = useState(false)
  const [stripIntroActive, setStripIntroActive] = useState(true)
  const managedAssetIds = useMemo(() => {
    const ids = Object.values(siteContent.portfolio?.albumPhotoIds ?? {}).flat()
    return ids.filter((id, index, list) => !!id && list.indexOf(id) === index)
  }, [siteContent.portfolio?.albumPhotoIds])
  const managedAssetMap = useMemo(() => {
    const map = new Map<string, MediaAsset>()
    managedAssets.forEach((asset) => map.set(asset.id, asset))
    return map
  }, [managedAssets])

  useEffect(() => {
    if (managedAssetIds.length === 0) {
      setManagedAssets([])
      setAssetsLoaded(true)
      return
    }
    let active = true
    const load = async () => {
      try {
        setAssetsLoaded(false)
        const res = await fetch('/api/admin/media-assets?status=active')
        const data = await res.json() as { ok?: boolean; assets?: MediaAsset[] }
        if (!res.ok || !data.ok || !Array.isArray(data.assets)) {
          throw new Error('Failed to load managed album assets')
        }
        if (!active) return
        setManagedAssets(data.assets.filter((asset) => managedAssetIds.includes(asset.id)))
      } catch {
        if (!active) return
        setManagedAssets([])
      } finally {
        if (active) setAssetsLoaded(true)
      }
    }
    void load()
    return () => { active = false }
  }, [managedAssetIds])

  const albums = useMemo(
    () => createAlbums(siteContent.photos, siteContent.portfolio, managedAssetMap),
    [managedAssetMap, siteContent.photos, siteContent.portfolio],
  )

  const [activeAlbumId, setActiveAlbumId] = useState(initialAlbumFromUrl || 'featured')
  const [carouselOrder, setCarouselOrder] = useState<Photo[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayPhoto, setDisplayPhoto] = useState<Photo | null>(null)

  const activeAlbum = albums.find((album) => album.id === activeAlbumId) ?? albums[0] ?? null
  const queryAlbumId = initialAlbumFromUrl

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches)
    syncPreference()
    mediaQuery.addEventListener('change', syncPreference)
    return () => mediaQuery.removeEventListener('change', syncPreference)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setStripIntroActive(false)
      return
    }

    const timeout = window.setTimeout(() => {
      setStripIntroActive(false)
    }, 920)
    return () => window.clearTimeout(timeout)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (albums.length === 0) return

    const hasFeatured = albums.some((album) => album.id === 'featured')
    const fallbackId = hasFeatured ? 'featured' : albums[0].id
    const nextActive = albums.some((album) => album.id === queryAlbumId) ? queryAlbumId : fallbackId

    if (nextActive !== activeAlbumId) {
      setActiveAlbumId(nextActive)
    }
  }, [activeAlbumId, albums, queryAlbumId])

  const syncAlbumQuery = useCallback((albumId: string) => {
    const nextParams = new URLSearchParams(search)
    nextParams.set('album', albumId)
    navigate(`/portfolio?${nextParams.toString()}`)
  }, [navigate, search])

  useEffect(() => {
    if (!activeAlbum) {
      setCarouselOrder([])
      return
    }
    setCarouselOrder(activeAlbum.photos)
    setDisplayPhoto(activeAlbum.photos[0] ?? null)
    setIsAnimating(false)
    if (prefersReducedMotion) {
      setStageIntroActive(false)
      return
    }

    setStageIntroActive(true)
    const timeout = window.setTimeout(() => {
      setStageIntroActive(false)
    }, 1120)
    return () => window.clearTimeout(timeout)
  }, [activeAlbum, prefersReducedMotion])

  const currentPhoto = carouselOrder[0] ?? null
  const canNavigate = carouselOrder.length > 1

  const goNext = useCallback(() => {
    if (!canNavigate || isAnimating) return
    const nextDisplay = carouselOrder[1] ?? carouselOrder[0] ?? null
    setIsAnimating(true)
    setCarouselOrder((prev) => rotateNext(prev))
    window.setTimeout(() => {
      setDisplayPhoto(nextDisplay)
      setIsAnimating(false)
    }, TRANSITION_MS)
  }, [canNavigate, isAnimating, carouselOrder])

  const goPrev = useCallback(() => {
    if (!canNavigate || isAnimating) return
    const nextDisplay = carouselOrder[carouselOrder.length - 1] ?? carouselOrder[0] ?? null
    setIsAnimating(true)
    setCarouselOrder((prev) => rotatePrev(prev))
    window.setTimeout(() => {
      setDisplayPhoto(nextDisplay)
      setIsAnimating(false)
    }, TRANSITION_MS)
  }, [canNavigate, isAnimating, carouselOrder])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev])

  const panels = getVisiblePanels(carouselOrder)
  const portfolioDetails = useMemo(
    () => siteContent.portfolio?.albumDetails ?? defaultSiteContent.portfolio?.albumDetails ?? {},
    [siteContent.portfolio?.albumDetails],
  )
  const getAlbumDetail = useCallback((albumId: string): PortfolioAlbumDetail => {
    return portfolioDetails[albumId] ?? {}
  }, [portfolioDetails])
  const albumDetail = useMemo(() => {
    const detail = getAlbumDetail(activeAlbumId)
    const fallbackSubtitle = activeAlbumId === 'featured'
      ? 'Selected photographs across landscape, city, coast, forest, and night.'
      : 'A focused series from this portfolio.'

    return {
      eyebrow: detail?.eyebrow?.trim() || 'Series Notes',
      title: detail?.title?.trim() || activeAlbum?.name || 'Portfolio Series',
      subtitle: detail?.subtitle?.trim() || fallbackSubtitle,
      body: detail?.body?.trim() || (activeAlbumId === 'featured'
        ? 'A curated selection of photographs focused on quiet light, atmosphere, and restrained composition.'
        : 'This series brings together selected photographs from this category.'),
      contactLabel: detail?.contactLabel?.trim() || 'Contact',
      contactHref: detail?.contactHref?.trim() || 'mailto:hello@example.com',
      blogLabel: detail?.blogLabel?.trim() || 'Other Notes',
      blogHref: detail?.blogHref?.trim() || '/blog',
    }
  }, [activeAlbum?.name, activeAlbumId, getAlbumDetail])

  return (
    <div className="min-h-screen bg-carbon text-white">
      <SiteHeader mode="inner" />

      <main className="relative isolate overflow-hidden bg-carbon pt-28 lg:pt-32">
        {displayPhoto && (
          <>
            <div className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center opacity-20 blur-3xl" style={{ backgroundImage: `url(${displayPhoto.thumbnailSrc || displayPhoto.src})` }} />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#1a1a1a]/90 via-[#171717]/82 to-[#1a1a1a]/95" />
          </>
        )}

        <section className="w-full min-h-[calc(100vh-5rem)] px-[clamp(24px,5.5vw,96px)] pb-16 lg:pb-20">
          <header className="mb-20 lg:mb-24">
            <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/35">PORTFOLIO</p>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{albumDetail.title || activeAlbum?.name || 'Portfolio'}</h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/45 sm:text-xs">{albumDetail.subtitle}</p>
          </header>

          <div className="flex flex-col">
            <div className="relative">
              {!assetsLoaded && managedAssetIds.length > 0 && (
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">Loading album photos…</p>
              )}
              {currentPhoto ? (
                <>
                  <div className="relative hidden h-[clamp(340px,48vh,600px)] w-full overflow-visible lg:block" style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}>
                    {panels.map(({ photo, slot }) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          if (slot === 'center' && !isAnimating) setLightboxOpen(true)
                          if (slot === 'left') goPrev()
                          if (slot === 'right') goNext()
                        }}
                        disabled={isAnimating && slot !== 'center'}
                        className={`group aspect-[3/2] overflow-visible transition-[filter,box-shadow] duration-500 ${slot === 'center' ? 'cursor-zoom-in shadow-[0_22px_70px_rgba(0,0,0,0.55),0_0_36px_rgba(255,255,255,0.05)]' : slot === 'left' || slot === 'right' ? 'cursor-pointer brightness-[0.82] hover:brightness-100 shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(255,255,255,0.04)]' : 'pointer-events-none brightness-[0.7] hover:brightness-90 shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(255,255,255,0.04)]'}`}
                        style={getPanelStyle(slot)}
                        aria-label={slot === 'center' ? 'Open image in lightbox' : `View ${displayPhoto?.title || photo.title}`}
                      >
                        <div
                          className="relative h-full w-full overflow-hidden"
                          style={{
                            animation: !stageIntroActive || prefersReducedMotion
                              ? undefined
                              : slot === 'center'
                                ? 'portfolioCenterIntro 1100ms cubic-bezier(0.22, 1, 0.36, 1) both'
                                : 'portfolioSideIntro 900ms cubic-bezier(0.22, 1, 0.36, 1) 220ms both',
                          }}
                        >
                          <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
                          {slot === 'center' && (
                            <>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/72 to-transparent" />
                              <div className="pointer-events-none absolute bottom-3 left-3 max-w-[76%] space-y-1 text-left md:bottom-5 md:left-5">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-white/90 md:text-xs">{displayPhoto?.title || photo.title}</p>
                                {displayPhoto?.description && <p className="line-clamp-2 text-[11px] leading-5 text-white/65 md:text-xs">{displayPhoto.description}</p>}
                                {displayPhoto?.specifications && <p className="line-clamp-1 text-[10px] text-white/55 md:text-[11px]">{displayPhoto.specifications}</p>}
                              </div>
                            </>
                          )}
                        </div>
                        {slot !== 'center' && (
                          <div
                            className="pointer-events-none absolute inset-x-0 top-full h-[22%] overflow-hidden opacity-15"
                            style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
                          >
                            <img
                              src={photo.src}
                              alt=""
                              aria-hidden="true"
                              className="h-full w-full origin-top scale-y-[-1] object-cover"
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="relative lg:hidden">
                    <button type="button" onClick={() => setLightboxOpen(true)} className="h-full w-full overflow-hidden" aria-label="Open image in lightbox">
                      <img src={currentPhoto.src} alt={currentPhoto.alt} className="h-full max-h-[74vh] w-full object-contain" />
                    </button>
                  </div>

                  <button type="button" onClick={goPrev} disabled={!canNavigate || isAnimating} className="absolute left-3 top-1/2 z-40 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur" aria-label="Previous photo"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" onClick={goNext} disabled={!canNavigate || isAnimating} className="absolute right-3 top-1/2 z-40 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur" aria-label="Next photo"><ChevronRight className="h-5 w-5" /></button>
                </>
              ) : (
                <div className="grid h-full place-items-center text-sm text-white/60">No photos available.</div>
              )}
            </div>

            <div className="relative left-1/2 mt-20 w-screen -translate-x-1/2 overflow-x-auto px-[clamp(24px,5.5vw,96px)] pt-3 pb-4 lg:mt-24">
              <div
                className="flex min-w-max items-stretch gap-3 pr-3"
                style={{
                  animation: !prefersReducedMotion && stripIntroActive
                    ? 'portfolioStripIntro 900ms cubic-bezier(0.22, 1, 0.36, 1) 320ms both'
                    : undefined,
                }}
              >
                {albums.map((album) => {
                  const detail = getAlbumDetail(album.id)
                  const albumCardLabel = detail.albumName?.trim() || detail.title?.trim() || album.name
                  return (
                    <button
                      key={album.id}
                    type="button"
                    onClick={() => {
                      setActiveAlbumId(album.id)
                      setCarouselOrder(album.photos)
                      setDisplayPhoto(album.photos[0] ?? null)
                      syncAlbumQuery(album.id)
                    }}
                    className={`group relative aspect-[4/3] h-full min-h-[92px] w-[160px] overflow-hidden rounded-2xl border transition md:w-[180px] lg:w-[210px] ${activeAlbumId === album.id ? 'scale-[1.02] border-white/90 ring-1 ring-white/50 brightness-115 shadow-[0_8px_22px_rgba(0,0,0,0.35)]' : 'border-white/20 brightness-[0.78] hover:border-white/45 hover:brightness-95'}`}
                  >
                    {album.cover ? <img src={album.cover.thumbnailSrc || album.cover.src} alt={album.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-white/10" />}
                    <div className="pointer-events-none absolute inset-0 bg-black/35 transition group-hover:bg-black/22" />
                    <div className="pointer-events-none absolute inset-0 grid place-items-center px-2"><p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/92 md:text-xs">{albumCardLabel}</p></div>
                  </button>
                  )
                })}
              </div>
            </div>

            <section className="mx-auto mt-16 w-full max-w-4xl border-t border-white/12 pt-14 lg:mt-20 lg:pt-16">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">{albumDetail.eyebrow}</p>
              <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">{albumDetail.title}</h2>
              {albumDetail.subtitle && <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">{albumDetail.subtitle}</p>}

              <MarkdownContent
                content={albumDetail.body}
                className="mt-6 max-w-3xl text-sm [&_p]:text-white/72 [&_p]:leading-8"
              />

              <div className="mt-12 rounded-3xl border border-white/12 bg-white/[0.02] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Explore More</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {isSpecialOrExternalLink(albumDetail.blogHref) || isHashRoute(albumDetail.blogHref) ? (
                    <a
                      href={albumDetail.blogHref}
                      target={isSpecialOrExternalLink(albumDetail.blogHref) && /^https?:/i.test(albumDetail.blogHref) ? '_blank' : undefined}
                      rel={isSpecialOrExternalLink(albumDetail.blogHref) && /^https?:/i.test(albumDetail.blogHref) ? 'noopener noreferrer' : undefined}
                      className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                    >
                      {albumDetail.blogLabel}
                    </a>
                  ) : (
                    <Link
                      to={albumDetail.blogHref}
                      className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                    >
                      {albumDetail.blogLabel}
                    </Link>
                  )}

                  {isSpecialOrExternalLink(albumDetail.contactHref) || isHashRoute(albumDetail.contactHref) ? (
                    <a
                      href={albumDetail.contactHref}
                      target={isSpecialOrExternalLink(albumDetail.contactHref) && /^https?:/i.test(albumDetail.contactHref) ? '_blank' : undefined}
                      rel={isSpecialOrExternalLink(albumDetail.contactHref) && /^https?:/i.test(albumDetail.contactHref) ? 'noopener noreferrer' : undefined}
                      className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                    >
                      {albumDetail.contactLabel}
                    </a>
                  ) : (
                    <Link
                      to={albumDetail.contactHref}
                      className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/85 transition hover:bg-white hover:text-black"
                    >
                      {albumDetail.contactLabel}
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />

      {lightboxOpen && currentPhoto && (
        <div className="fixed inset-0 z-[120] bg-black/95 p-4 md:p-8" role="dialog" aria-modal="true" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5" onClick={() => setLightboxOpen(false)} aria-label="Close lightbox"><X className="h-5 w-5" /></button>
          <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-4" onClick={(event) => event.stopPropagation()}>
            <div className="relative w-full">
              <img src={currentPhoto.src} alt={currentPhoto.alt} width={currentPhoto.width} height={currentPhoto.height} className="mx-auto max-h-[78vh] w-auto max-w-full object-contain" />
              {canNavigate && (
                <>
                  <button type="button" onClick={goPrev} className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45" aria-label="Previous photo"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" onClick={goNext} className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45" aria-label="Next photo"><ChevronRight className="h-5 w-5" /></button>
                </>
              )}
            </div>
            <div className="w-full max-w-3xl space-y-1 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-white/80">{currentPhoto.title}</p>
              {currentPhoto.description && <p className="text-xs text-white/60">{currentPhoto.description}</p>}
              {currentPhoto.specifications && <p className="text-[11px] text-white/45">{currentPhoto.specifications}</p>}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes portfolioCenterIntro {
          from {
            opacity: 0;
            transform: translateX(40px) rotateY(-8deg) scale(0.985);
            filter: brightness(0.82);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) scale(1);
            filter: brightness(1);
          }
        }
        @keyframes portfolioSideIntro {
          from {
            opacity: 0;
            filter: brightness(0.78);
          }
          to {
            opacity: 1;
            filter: brightness(1);
          }
        }
        @keyframes portfolioStripIntro {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
