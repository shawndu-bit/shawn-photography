import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { Photo } from '@/types'

interface Album {
  id: string
  name: string
  photos: Photo[]
  cover: Photo | null
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

function createAlbums(photos: Photo[]) {
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

  return [{ id: 'featured', name: 'Featured Works', photos: featured, cover: featured[0] ?? null }, ...categoryAlbums].filter((album) => album.photos.length > 0)
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
      filter: 'brightness(0.96)',
    }
  }

  if (slot === 'right') {
    return {
      ...base,
      width: 'min(500px, 35vw)',
      transform: 'translate(-50%, -50%) translate3d(clamp(360px,30vw,420px), 0, -90px) rotateY(-30deg) scale(0.9)',
      opacity: 1,
      zIndex: 25,
      filter: 'brightness(0.96)',
    }
  }

  if (slot === 'farLeft') {
    return {
      ...base,
      width: 'min(360px, 27vw)',
      transform: 'translate(-50%, -50%) translate3d(clamp(-700px,-48vw,-600px), 0, -180px) rotateY(42deg) scale(0.76)',
      opacity: 0.82,
      zIndex: 15,
      filter: 'brightness(0.86)',
    }
  }

  return {
    ...base,
    width: 'min(360px, 27vw)',
    transform: 'translate(-50%, -50%) translate3d(clamp(600px,48vw,700px), 0, -180px) rotateY(-42deg) scale(0.76)',
    opacity: 0.82,
    zIndex: 15,
    filter: 'brightness(0.86)',
  }
}

export default function PortfolioPage() {
  const { siteContent } = useSiteContentContext()
  const albums = useMemo(() => createAlbums(siteContent.photos), [siteContent.photos])

  const [activeAlbumId, setActiveAlbumId] = useState('featured')
  const [carouselOrder, setCarouselOrder] = useState<Photo[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayPhoto, setDisplayPhoto] = useState<Photo | null>(null)

  const activeAlbum = albums.find((album) => album.id === activeAlbumId) ?? albums[0] ?? null

  useEffect(() => {
    if (!activeAlbum) {
      setCarouselOrder([])
      return
    }
    setCarouselOrder(activeAlbum.photos)
    setDisplayPhoto(activeAlbum.photos[0] ?? null)
    setIsAnimating(false)
  }, [activeAlbum])

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

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader mode="inner" />

      <main className="relative isolate overflow-hidden bg-black pt-28 lg:pt-32">
        {displayPhoto && (
          <>
            <div className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center opacity-20 blur-3xl" style={{ backgroundImage: `url(${displayPhoto.thumbnailSrc || displayPhoto.src})` }} />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/80 to-black/95" />
          </>
        )}

        <section className="w-full min-h-[calc(100vh-5rem)] px-[clamp(24px,5.5vw,96px)] pb-16 lg:pb-20">
          <header className="mb-20 lg:mb-24">
            <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/35">PORTFOLIO</p>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{activeAlbum?.name ?? 'Portfolio'}</h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/45 sm:text-xs">Selected photographs across landscape, city, coast, forest, and night.</p>
          </header>

          <div className="flex flex-col">
            <div className="relative">
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
                        className={`aspect-[3/2] overflow-hidden ${slot === 'center' ? 'cursor-zoom-in' : slot === 'left' || slot === 'right' ? 'cursor-pointer' : 'pointer-events-none'}`}
                        style={getPanelStyle(slot)}
                        aria-label={slot === 'center' ? 'Open image in lightbox' : `View ${displayPhoto?.title || photo.title}`}
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

            <div className="relative left-1/2 mt-14 w-screen -translate-x-1/2 overflow-x-auto px-[clamp(24px,5.5vw,96px)] pb-3 lg:mt-16">
              <div className="flex min-w-max items-stretch gap-3 pr-3">
                {albums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => {
                      setActiveAlbumId(album.id)
                      setCarouselOrder(album.photos)
                      setDisplayPhoto(album.photos[0] ?? null)
                    }}
                    className={`group relative aspect-[4/3] h-full min-h-[92px] w-[160px] overflow-hidden rounded-2xl border transition md:w-[180px] lg:w-[210px] ${activeAlbumId === album.id ? 'scale-[1.02] border-white/90 ring-1 ring-white/50 brightness-115 shadow-[0_8px_22px_rgba(0,0,0,0.35)]' : 'border-white/20 brightness-[0.78] hover:border-white/45 hover:brightness-95'}`}
                  >
                    {album.cover ? <img src={album.cover.thumbnailSrc || album.cover.src} alt={album.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-white/10" />}
                    <div className="pointer-events-none absolute inset-0 bg-black/35 transition group-hover:bg-black/22" />
                    <div className="pointer-events-none absolute inset-0 grid place-items-center px-2"><p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/92 md:text-xs">{album.name}</p></div>
                  </button>
                ))}
              </div>
            </div>
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
    </div>
  )
}
