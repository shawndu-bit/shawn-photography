import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { createGalleryAlbums, type MediaAsset } from '@/utils/galleryAlbums'

export default function GalleryAlbumPage() {
  const { albumSlug = '' } = useParams()
  const { siteContent } = useSiteContentContext()
  const [managedAssets, setManagedAssets] = useState<MediaAsset[]>([])
  const managedAssetIds = useMemo(() => Object.values(siteContent.portfolio?.albumPhotoIds ?? {}).flat(), [siteContent.portfolio?.albumPhotoIds])
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/admin/media-assets?status=active')
        const data = await res.json() as { ok?: boolean; assets?: MediaAsset[] }
        if (!res.ok || !data.ok || !Array.isArray(data.assets)) return
        if (active) setManagedAssets(data.assets.filter((asset) => managedAssetIds.includes(asset.id)))
      } catch {}
    }
    void load()
    return () => { active = false }
  }, [managedAssetIds])
  const mediaMap = useMemo(() => new Map(managedAssets.map((asset) => [asset.id, asset])), [managedAssets])
  const album = createGalleryAlbums(siteContent.photos, siteContent.portfolio, mediaMap).find((entry) => entry.id === albumSlug)

  return <div className="min-h-screen bg-carbon text-white"><SiteHeader mode="inner" /><main className="mx-auto max-w-5xl px-6 pb-16 pt-28"><Link to="/gallery" className="text-sm uppercase tracking-[0.2em] text-white/75 hover:text-white">← Back to Gallery</Link><h1 className="mt-5 text-4xl font-bold uppercase tracking-[0.16em]">{album?.name || 'Album'}</h1>{album?.cover && <img src={album.cover.src} alt={album.cover.alt || album.name} className="mt-8 h-[clamp(300px,52vh,600px)] w-full object-cover object-center" />}<p className="mt-6 text-white/80">Album detail pages are coming soon. This placeholder route is ready for the next phase.</p></main><Footer /></div>
}
