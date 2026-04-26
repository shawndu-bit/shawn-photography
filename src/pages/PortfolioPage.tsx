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

const CATEGORY_LABELS: Record<string, string> = {
  mountains: 'Mountains',
  sea_lakes: 'Sea & Lakes',
  forest: 'Forest',
  nightscape: 'Nightscape',
  city: 'City',
}

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

  return [
    { id: 'featured', name: 'Featured Works', photos: featured, cover: featured[0] ?? null },
    ...categoryAlbums,
  ].filter((album) => album.photos.length > 0)
}

function getLoopedIndex(index: number, total: number) {
  if (total <= 0) return 0
  return (index + total) % total
}

export default function PortfolioPage() {
  const { siteContent } = useSiteContentContext()
  const albums = useMemo(() => createAlbums(siteContent.photos), [siteContent.photos])

  const [activeAlbumId, setActiveAlbumId] = useState('featured')
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const activeAlbum = albums.find((album) => album.id === activeAlbumId) ?? albums[0] ?? null
  const activePhotos = activeAlbum?.photos ?? []
  const activePhoto = activePhotos[activePhotoIndex] ?? null
  const photoCount = activePhotos.length
  const canNavigate = photoCount > 1

  const prevPhoto = canNavigate ? activePhotos[getLoopedIndex(activePhotoIndex - 1, photoCount)] : null
  const nextPhoto = canNavigate ? activePhotos[getLoopedIndex(activePhotoIndex + 1, photoCount)] : null

  useEffect(() => {
    if (!activeAlbum) return
    setActivePhotoIndex((prev) => getLoopedIndex(prev, activeAlbum.photos.length))
  }, [activeAlbum])

  const goPrev = useCallback(() => {
    if (!canNavigate) return
    setActivePhotoIndex((prev) => getLoopedIndex(prev - 1, photoCount))
  }, [canNavigate, photoCount])

  const goNext = useCallback(() => {
    if (!canNavigate) return
    setActivePhotoIndex((prev) => getLoopedIndex(prev + 1, photoCount))
  }, [canNavigate, photoCount])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'Escape') setLightboxOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev])

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader mode="inner" />

      <main className="relative isolate overflow-hidden bg-black pt-20">
        {activePhoto && (
          <>
            <div
              className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center opacity-20 blur-3xl"
              style={{ backgroundImage: `url(${activePhoto.thumbnailSrc || activePhoto.src})` }}
            />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/80 to-black/95" />
          </>
        )}

        <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1700px] flex-col px-3 pb-5 sm:px-5 md:px-8 lg:px-10">
          <header className="mb-3 flex-none md:mb-5">
            <p className="text-[10px] uppercase tracking-[0.38em] text-white/45">Portfolio</p>
            <h1 className="mt-2 text-xl tracking-[0.08em] text-white/92 md:text-2xl">{activeAlbum?.name ?? 'Portfolio'}</h1>
          </header>

          <div className="grid flex-1 grid-rows-[5fr_1fr] gap-4 md:gap-5">
            <div className="relative min-h-0">
              {activePhoto ? (
                <div className="grid h-full grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(220px,1.15fr)_minmax(0,2.3fr)_minmax(220px,1.15fr)] lg:gap-4">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canNavigate}
                    className={`group relative hidden aspect-[16/10] w-full self-center overflow-hidden rounded-xl lg:block ${
                      canNavigate ? 'cursor-pointer opacity-75 hover:opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    style={{ transform: 'perspective(1200px) rotateY(16deg) scale(0.95)' }}
                    aria-label="Previous photo"
                  >
                    {prevPhoto && (
                      <img
                        src={prevPhoto.thumbnailSrc || prevPhoto.src}
                        alt={prevPhoto.alt}
                        className="h-full w-full object-cover brightness-[0.48] transition duration-500 group-hover:brightness-[0.7]"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-black/35" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="group relative h-full min-h-[52vh] w-full cursor-zoom-in overflow-hidden"
                    aria-label="Open image in lightbox"
                  >
                    <img
                      src={activePhoto.src}
                      alt={activePhoto.alt}
                      className="mx-auto h-full max-h-[64vh] w-full object-contain transition duration-500 group-hover:scale-[1.006] lg:max-h-[66vh]"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/72 to-transparent md:h-36" />
                    <div className="pointer-events-none absolute bottom-3 left-3 max-w-[76%] space-y-1 text-left md:bottom-5 md:left-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/90 md:text-xs">{activePhoto.title}</p>
                      {activePhoto.description && (
                        <p className="line-clamp-2 text-[11px] leading-5 text-white/65 md:text-xs">{activePhoto.description}</p>
                      )}
                      {activePhoto.specifications && (
                        <p className="line-clamp-1 text-[10px] text-white/55 md:text-[11px]">{activePhoto.specifications}</p>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canNavigate}
                    className={`group relative hidden aspect-[16/10] w-full self-center overflow-hidden rounded-xl lg:block ${
                      canNavigate ? 'cursor-pointer opacity-75 hover:opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    style={{ transform: 'perspective(1200px) rotateY(-16deg) scale(0.95)' }}
                    aria-label="Next photo"
                  >
                    {nextPhoto && (
                      <img
                        src={nextPhoto.thumbnailSrc || nextPhoto.src}
                        alt={nextPhoto.alt}
                        className="h-full w-full object-cover brightness-[0.48] transition duration-500 group-hover:brightness-[0.7]"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-black/35" />
                  </button>

                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canNavigate}
                    className="absolute left-1 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur md:left-2"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canNavigate}
                    className="absolute right-1 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur md:right-2"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="grid h-full place-items-center text-sm text-white/60">No photos available.</div>
              )}
            </div>

            <div className="min-h-0 overflow-x-auto pb-1">
              <div className="flex min-w-max items-stretch gap-3 pr-2">
                {albums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => {
                      setActiveAlbumId(album.id)
                      setActivePhotoIndex(0)
                    }}
                    className={`group relative aspect-[4/3] h-full min-h-[92px] w-[160px] overflow-hidden rounded-xl border transition md:w-[180px] lg:w-[210px] ${
                      activeAlbumId === album.id
                        ? 'scale-[1.02] border-white/70 brightness-110 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]'
                        : 'border-white/20 brightness-[0.78] hover:border-white/45 hover:brightness-95'
                    }`}
                  >
                    {album.cover ? (
                      <img
                        src={album.cover.thumbnailSrc || album.cover.src}
                        alt={album.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/10" />
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-black/35 transition group-hover:bg-black/22" />
                    <div className="pointer-events-none absolute inset-0 grid place-items-center px-2">
                      <p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/92 md:text-xs">{album.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {lightboxOpen && activePhoto && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-4" onClick={(event) => event.stopPropagation()}>
            <div className="relative w-full">
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                width={activePhoto.width}
                height={activePhoto.height}
                className="mx-auto max-h-[78vh] w-auto max-w-full object-contain"
              />

              {canNavigate && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="w-full max-w-3xl space-y-1 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-white/80">{activePhoto.title}</p>
              {activePhoto.description && <p className="text-xs text-white/60">{activePhoto.description}</p>}
              {activePhoto.specifications && <p className="text-[11px] text-white/45">{activePhoto.specifications}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
