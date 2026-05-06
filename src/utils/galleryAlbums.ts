import type { Photo, PortfolioContent } from '@/types'

export interface GalleryAlbum {
  id: string
  name: string
  photos: Photo[]
  cover: Photo | null
}

export interface MediaAsset {
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

const FALLBACK_LABELS: Record<string, string> = {
  featured: 'Selected Works',
  mountains: 'Mountains',
  sea_lakes: 'Sea & Lakes',
  city: 'City',
  forest: 'Forest',
  nightscape: 'Nightscape',
}

function formatAlbumId(albumId: string) {
  return albumId.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizePhotoCategory(category: string | undefined, fallback: Photo['category'] = 'mountains'): Photo['category'] {
  if (category === 'mountains' || category === 'sea_lakes' || category === 'nightscape' || category === 'forest' || category === 'city') return category
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
    alt: asset.alt || asset.title || 'gallery photo',
  }
}

export function getAlbumDisplayName(albumId: string, portfolio?: PortfolioContent) {
  const detail = portfolio?.albumDetails?.[albumId]
  return detail?.albumName?.trim() || detail?.title?.trim() || FALLBACK_LABELS[albumId] || formatAlbumId(albumId)
}

export function createGalleryAlbums(photos: Photo[], portfolio: PortfolioContent | undefined, mediaById: Map<string, MediaAsset>): GalleryAlbum[] {
  const featured = photos.slice(0, 10)
  const categoryMap = new Map<string, Photo[]>()

  photos.forEach((photo) => {
    const key = photo.category || 'mountains'
    const bucket = categoryMap.get(key)
    if (bucket) bucket.push(photo)
    else categoryMap.set(key, [photo])
  })

  const categoryAlbums: GalleryAlbum[] = [...categoryMap.entries()].map(([category, categoryPhotos]) => ({
    id: category,
    name: getAlbumDisplayName(category, portfolio),
    photos: categoryPhotos,
    cover: categoryPhotos[0] ?? null,
  }))

  const fallbackAlbums = [{ id: 'featured', name: getAlbumDisplayName('featured', portfolio), photos: featured, cover: featured[0] ?? null }, ...categoryAlbums]
  const fallbackMap = new Map<string, GalleryAlbum>(fallbackAlbums.map((album) => [album.id, album]))
  const details = portfolio?.albumDetails ?? {}
  const albumPhotoIds = portfolio?.albumPhotoIds ?? {}
  const albumOrder = portfolio?.albumOrder?.length ? portfolio.albumOrder : fallbackAlbumIds(photos)
  const extraIds = [...Object.keys(details), ...Object.keys(albumPhotoIds), ...fallbackMap.keys()]
  const allIds = [...albumOrder, ...extraIds].filter((id, index, arr) => !!id && arr.indexOf(id) === index)

  return allIds.map((albumId) => {
    const fallbackAlbum = fallbackMap.get(albumId)
    const managedIds = albumPhotoIds[albumId] ?? []
    const managedPhotos = managedIds
      .map((assetId) => mediaById.get(assetId))
      .filter((asset): asset is MediaAsset => Boolean(asset))
      .map((asset) => assetToPhoto(asset, albumId))

    const photosForAlbum = managedPhotos.length > 0 ? managedPhotos : fallbackAlbum?.photos ?? []
    return {
      id: albumId,
      name: getAlbumDisplayName(albumId, portfolio),
      photos: photosForAlbum,
      cover: photosForAlbum[0] ?? fallbackAlbum?.cover ?? null,
    }
  }).filter((album) => Boolean(album.cover))
}
