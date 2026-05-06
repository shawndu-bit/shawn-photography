import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { createGalleryAlbums, type MediaAsset } from '@/utils/galleryAlbums'

export default function GalleryPage() {
  const { siteContent } = useSiteContentContext()
  const [managedAssets, setManagedAssets] = useState<MediaAsset[]>([])

  const managedAssetIds = useMemo(() => {
    const ids = Object.values(siteContent.portfolio?.albumPhotoIds ?? {}).flat()
    return ids.filter((id, index, list) => !!id && list.indexOf(id) === index)
  }, [siteContent.portfolio?.albumPhotoIds])

  useEffect(() => {
    if (managedAssetIds.length === 0) {
      setManagedAssets([])
      return
    }
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/admin/media-assets?status=active')
        const data = await res.json() as { ok?: boolean; assets?: MediaAsset[] }
        if (!res.ok || !data.ok || !Array.isArray(data.assets)) throw new Error('Failed to load media')
        if (!active) return
        setManagedAssets(data.assets.filter((asset) => managedAssetIds.includes(asset.id)))
      } catch {
        if (active) setManagedAssets([])
      }
    }
    void load()
    return () => { active = false }
  }, [managedAssetIds])

  const mediaMap = useMemo(() => new Map(managedAssets.map((asset) => [asset.id, asset])), [managedAssets])
  const albums = useMemo(() => createGalleryAlbums(siteContent.photos, siteContent.portfolio, mediaMap), [mediaMap, siteContent.photos, siteContent.portfolio])

  return (
    <div className="min-h-screen bg-carbon text-white">
      <SiteHeader mode="inner" />
      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-14 text-center md:py-16">
          <h1 className="text-4xl font-bold uppercase tracking-[0.2em] text-white md:text-5xl">Gallery</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
            Selected photographic series across landscape, coast, city, forest, and night. This gallery is updated regularly with new work and visual notes.
          </p>
        </section>

        <section aria-label="Gallery albums" className="border-y border-white/10">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/gallery/${album.id}`}
              aria-label={`Open ${album.name} album`}
              className="group relative block border-b border-black/60 last:border-b-0"
            >
              <img
                src={album.cover?.src}
                alt={album.cover?.alt || `${album.name} cover image`}
                className="h-[clamp(300px,48vh,520px)] w-full object-cover object-center md:h-[clamp(360px,56vh,680px)]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 transition duration-300 group-hover:bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                <h2 className="text-[clamp(2rem,11vw,3.2rem)] font-bold uppercase tracking-[0.18em] text-white/85 transition-opacity duration-300 group-hover:text-white/60 md:text-[clamp(2.4rem,6vw,5rem)]">
                  {album.name}
                </h2>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
