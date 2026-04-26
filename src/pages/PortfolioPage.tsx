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
    if (bucket) {
      bucket.push(photo)
    } else {
      categoryMap.set(key, [photo])
    }
  })

  const categoryAlbums: Album[] = [...categoryMap.entries()].map(([category, categoryPhotos]) => ({
    id: category,
    name: getAlbumName(category),
    photos: categoryPhotos,
    cover: categoryPhotos[0] ?? null,
  }))

  return [
    {
      id: 'featured',
      name: 'Featured Works',
      photos: featured,
      cover: featured[0] ?? null,
    },
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

  useEffect(() => {
    if (!activeAlbum) return
    setActivePhotoIndex((prev) => getLoopedIndex(prev, activeAlbum.photos.length))
  }, [activeAlbum])

  const photoCount = activePhotos.length
  const canNavigate = photoCount > 1
  const prevPhoto = photoCount > 1 ? activePhotos[getLoopedIndex(activePhotoIndex - 1, photoCount)] : null
  const nextPhoto = photoCount > 1 ? activePhotos[getLoopedIndex(activePhotoIndex + 1, photoCount)] : null

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
    <div className="min-h-screen bg-carbon text-white">
      <SiteHeader mode="inner" />

      <main className="relative overflow-hidden pt-24 md:pt-28">
        {activePhoto && (
          <>
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-35 blur-2xl"
              style={{ backgroundImage: `url(${activePhoto.thumbnailSrc || activePhoto.src})` }}
            />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-black/70" />
          </>
        )}

        <section className="mx-auto max-w-[1300px] px-4 pb-10 md:px-8 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Portfolio</p>
          <h1 className="mt-3 text-2xl font-medium tracking-[0.08em] text-white md:text-3xl">{activeAlbum?.name ?? 'Portfolio'}</h1>

          {activePhoto ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/35 p-4 md:p-6">
              <div className="relative grid items-center gap-4 md:grid-cols-[minmax(120px,1fr)_minmax(360px,2.8fr)_minmax(120px,1fr)] md:gap-6">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!canNavigate}
                  className={`group hidden overflow-hidden rounded-2xl border border-white/10 bg-black/50 md:block ${
                    canNavigate ? 'cursor-pointer' : 'pointer-events-none opacity-0'
                  }`}
                  aria-label="Previous photo"
                >
                  {prevPhoto && (
                    <img
                      src={prevPhoto.thumbnailSrc || prevPhoto.src}
                      alt={prevPhoto.alt}
                      className="h-44 w-full -translate-x-1 rotate-[-4deg] object-cover opacity-45 transition duration-500 group-hover:opacity-70"
                    />
                  )}
                </button>

                <button
                  type="button"
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/40"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open image in lightbox"
                >
                  <img
                    src={activePhoto.thumbnailSrc || activePhoto.src}
                    alt={activePhoto.alt}
                    className="max-h-[70vh] w-full object-contain transition duration-500 group-hover:scale-[1.01]"
                  />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNavigate}
                  className={`group hidden overflow-hidden rounded-2xl border border-white/10 bg-black/50 md:block ${
                    canNavigate ? 'cursor-pointer' : 'pointer-events-none opacity-0'
                  }`}
                  aria-label="Next photo"
                >
                  {nextPhoto && (
                    <img
                      src={nextPhoto.thumbnailSrc || nextPhoto.src}
                      alt={nextPhoto.alt}
                      className="h-44 w-full translate-x-1 rotate-[4deg] object-cover opacity-45 transition duration-500 group-hover:opacity-70"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!canNavigate}
                  className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/85 md:left-[30%]"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNavigate}
                  className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/85 md:right-[30%]"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <p className="text-sm tracking-[0.12em] text-white/85">{activePhoto.title}</p>
                {activePhoto.description && <p className="text-xs leading-6 text-white/60">{activePhoto.description}</p>}
                {activePhoto.specifications && <p className="text-[11px] text-white/45">{activePhoto.specifications}</p>}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-white/60">No photos available.</p>
          )}

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => {
                    setActiveAlbumId(album.id)
                    setActivePhotoIndex(0)
                  }}
                  className={`w-[170px] overflow-hidden rounded-2xl border text-left transition ${
                    activeAlbumId === album.id
                      ? 'border-white/35 bg-white/[0.08]'
                      : 'border-white/10 bg-black/35 hover:border-white/25'
                  }`}
                >
                  {album.cover ? (
                    <img
                      src={album.cover.thumbnailSrc || album.cover.src}
                      alt={album.name}
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-full bg-white/5" />
                  )}
                  <div className="space-y-1 p-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/85">{album.name}</p>
                    <p className="text-[11px] text-white/50">{album.photos.length} photos</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {lightboxOpen && activePhoto && (
        <div className="fixed inset-0 z-[120] bg-black/95 p-4 md:p-8" role="dialog" aria-modal="true" onClick={() => setLightboxOpen(false)}>
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
