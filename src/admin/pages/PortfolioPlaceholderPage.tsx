import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import MediaPicker, { type MediaPickerAsset } from '@/admin/components/MediaPicker'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { defaultSiteContent } from '@/data/siteContent'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { PortfolioAlbumDetail } from '@/types'

interface MediaAsset {
  id: string
  originalUrl: string
  thumbnailUrl: string | null
  title: string
  alt: string
  description: string
  filename: string | null
  usageType: string
  category: string
  width: number | null
  height: number | null
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_]+/g, '_')
    .replace(/_+/g, '_')
}

function getFallbackAlbumIds(photoCategories: string[]) {
  return ['featured', ...photoCategories.filter((category) => category !== 'featured')]
}

function mergeAlbumDetailsWithDefaults(details: Record<string, PortfolioAlbumDetail> | undefined) {
  const defaults = defaultSiteContent.portfolio?.albumDetails ?? {}
  const incoming = details ?? {}

  const merged: Record<string, PortfolioAlbumDetail> = { ...defaults }
  Object.entries(incoming).forEach(([albumId, detail]) => {
    merged[albumId] = {
      ...(defaults[albumId] ?? {}),
      ...detail,
    }
  })

  return merged
}

export default function PortfolioPlaceholderPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [activeAlbumId, setActiveAlbumId] = useState('featured')
  const [albumDetails, setAlbumDetails] = useState<Record<string, PortfolioAlbumDetail>>({})
  const [albumOrder, setAlbumOrder] = useState<string[]>([])
  const [albumPhotoIds, setAlbumPhotoIds] = useState<Record<string, string[]>>({})
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [metadataDrafts, setMetadataDrafts] = useState<Record<string, { title: string; alt: string; description: string; category: string }>>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fallbackAlbumIds = useMemo(() => {
    const categories = [...new Set(siteContent.photos.map((photo) => photo.category))]
    return getFallbackAlbumIds(categories)
  }, [siteContent.photos])

  useEffect(() => {
    setAlbumDetails(mergeAlbumDetailsWithDefaults(siteContent.portfolio?.albumDetails))
    const incomingOrder = siteContent.portfolio?.albumOrder?.length ? siteContent.portfolio.albumOrder : fallbackAlbumIds
    const normalizedOrder = incomingOrder.filter((albumId, index, list) => !!albumId && list.indexOf(albumId) === index)
    const knownIds = new Set([...normalizedOrder, ...Object.keys(siteContent.portfolio?.albumDetails ?? {}), ...Object.keys(siteContent.portfolio?.albumPhotoIds ?? {}), ...fallbackAlbumIds])
    const nextOrder = [...normalizedOrder, ...Array.from(knownIds).filter((id) => !normalizedOrder.includes(id))]
    setAlbumOrder(nextOrder)

    const incomingPhotoIds = siteContent.portfolio?.albumPhotoIds ?? {}
    const mergedPhotoIds = nextOrder.reduce<Record<string, string[]>>((acc, albumId) => {
      acc[albumId] = Array.isArray(incomingPhotoIds[albumId])
        ? incomingPhotoIds[albumId].filter((id, index, list) => !!id && list.indexOf(id) === index)
        : []
      return acc
    }, {})
    setAlbumPhotoIds(mergedPhotoIds)
    setMetadataDrafts({})
    setDirty(false)
    setSaved(false)
    setSaveError('')
  }, [fallbackAlbumIds, siteContent.portfolio?.albumDetails, siteContent.portfolio?.albumOrder, siteContent.portfolio?.albumPhotoIds])

  useEffect(() => {
    if (!albumOrder.includes(activeAlbumId)) {
      setActiveAlbumId(albumOrder[0] ?? 'featured')
    }
  }, [activeAlbumId, albumOrder])

  async function loadMediaAssets() {
    setLoadingAssets(true)
    try {
      const res = await fetch('/api/admin/media-assets?status=active')
      const data = await res.json() as {
        ok?: boolean
        assets?: MediaAsset[]
        error?: string
      }
      if (!res.ok || !data.ok || !Array.isArray(data.assets)) {
        throw new Error(data.error || 'Failed to load media assets')
      }
      setMediaAssets(data.assets)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to load media assets')
    } finally {
      setLoadingAssets(false)
    }
  }

  useEffect(() => {
    void loadMediaAssets()
  }, [])

  const mediaById = useMemo(() => {
    const map = new Map<string, MediaAsset>()
    mediaAssets.forEach((asset) => map.set(asset.id, asset))
    return map
  }, [mediaAssets])

  const current = albumDetails[activeAlbumId] ?? {}
  const activeAlbumAssetIds = albumPhotoIds[activeAlbumId] ?? []

  const activeAlbumAssets = useMemo(
    () => activeAlbumAssetIds.map((id) => ({ id, asset: mediaById.get(id) ?? null })),
    [activeAlbumAssetIds, mediaById],
  )

  const albumLabel = (albumId: string) => {
    const detail = albumDetails[albumId] ?? {}
    const fallback = albumId.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    return detail.title?.trim() || detail.albumName?.trim() || fallback || albumId
  }

  function markDirty() {
    setDirty(true)
    setSaved(false)
    setSaveError('')
  }

  function updateField<K extends keyof PortfolioAlbumDetail>(key: K, value: PortfolioAlbumDetail[K]) {
    setAlbumDetails((prev) => ({
      ...prev,
      [activeAlbumId]: {
        ...(prev[activeAlbumId] ?? {}),
        [key]: value,
      },
    }))
    markDirty()
  }

  function addPhotoToActiveAlbum(assetId: string) {
    setAlbumPhotoIds((prev) => {
      const existing = prev[activeAlbumId] ?? []
      if (existing.includes(assetId)) return prev
      return {
        ...prev,
        [activeAlbumId]: [...existing, assetId],
      }
    })
    markDirty()
  }

  function handleSelectFromLibrary(asset: MediaPickerAsset) {
    if (!asset.id) {
      setSaveError('Selected asset does not include an id.')
      return
    }
    addPhotoToActiveAlbum(asset.id)
    setPickerOpen(false)
  }

  async function handleUploadFile(file: File) {
    if (!file || !activeAlbumId) return

    setUploading(true)
    setSaveError('')

    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('usageType', 'portfolio_album')
      formData.set('uploadedFrom', 'admin_portfolio')
      formData.set('category', activeAlbumId)

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as {
        ok?: boolean
        assetId?: string | null
        error?: string
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (!data.assetId) {
        throw new Error('Upload succeeded but no asset id was returned.')
      }

      addPhotoToActiveAlbum(data.assetId)
      await loadMediaAssets()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function movePhoto(assetId: string, direction: -1 | 1) {
    setAlbumPhotoIds((prev) => {
      const ids = [...(prev[activeAlbumId] ?? [])]
      const currentIndex = ids.indexOf(assetId)
      if (currentIndex < 0) return prev

      const targetIndex = currentIndex + direction
      if (targetIndex < 0 || targetIndex >= ids.length) return prev

      const [moved] = ids.splice(currentIndex, 1)
      ids.splice(targetIndex, 0, moved)

      return {
        ...prev,
        [activeAlbumId]: ids,
      }
    })
    markDirty()
  }

  function removeFromAlbum(assetId: string) {
    setAlbumPhotoIds((prev) => ({
      ...prev,
      [activeAlbumId]: (prev[activeAlbumId] ?? []).filter((id) => id !== assetId),
    }))
    markDirty()
  }

  function updateMetadataDraft(assetId: string, key: 'title' | 'alt' | 'description' | 'category', value: string) {
    const base = mediaById.get(assetId)
    setMetadataDrafts((prev) => ({
      ...prev,
      [assetId]: {
        title: prev[assetId]?.title ?? base?.title ?? '',
        alt: prev[assetId]?.alt ?? base?.alt ?? '',
        description: prev[assetId]?.description ?? base?.description ?? '',
        category: prev[assetId]?.category ?? base?.category ?? activeAlbumId,
        [key]: value,
      },
    }))
  }

  async function saveMetadata(assetId: string) {
    const draft = metadataDrafts[assetId]
    if (!draft) return

    try {
      const res = await fetch(`/api/admin/media-assets/${assetId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update metadata')
      }
      await loadMediaAssets()
      setMetadataDrafts((prev) => {
        const next = { ...prev }
        delete next[assetId]
        return next
      })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update metadata')
    }
  }

  function handleAddAlbum() {
    const raw = window.prompt('New album title or id')?.trim()
    if (!raw) return

    let nextId = toSlug(raw)
    if (!nextId) nextId = `album_${Date.now()}`

    if (albumOrder.includes(nextId)) {
      setSaveError(`Album "${nextId}" already exists.`)
      return
    }

    setAlbumOrder((prev) => [...prev, nextId])
    setAlbumDetails((prev) => ({
      ...prev,
      [nextId]: {
        albumName: raw,
        title: raw,
      },
    }))
    setAlbumPhotoIds((prev) => ({ ...prev, [nextId]: [] }))
    setActiveAlbumId(nextId)
    markDirty()
  }

  function handleDeleteAlbum() {
    if (!activeAlbumId) return
    const confirmed = window.confirm(`Delete album "${activeAlbumId}"? This only removes album references, not media assets.`)
    if (!confirmed) return

    setAlbumOrder((prev) => prev.filter((id) => id !== activeAlbumId))
    setAlbumDetails((prev) => {
      const next = { ...prev }
      delete next[activeAlbumId]
      return next
    })
    setAlbumPhotoIds((prev) => {
      const next = { ...prev }
      delete next[activeAlbumId]
      return next
    })
    setActiveAlbumId((prev) => (prev === activeAlbumId ? albumOrder.find((id) => id !== activeAlbumId) ?? 'featured' : prev))
    markDirty()
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const mergedAlbumDetails = mergeAlbumDetailsWithDefaults(albumDetails)
      const normalizedOrder = albumOrder.filter((albumId, index, list) => !!albumId && list.indexOf(albumId) === index)
      const normalizedPhotoIds = normalizedOrder.reduce<Record<string, string[]>>((acc, albumId) => {
        acc[albumId] = (albumPhotoIds[albumId] ?? []).filter((id, index, list) => !!id && list.indexOf(id) === index)
        return acc
      }, {})

      await saveContent({
        ...siteContent,
        portfolio: {
          ...siteContent.portfolio,
          albumDetails: mergedAlbumDetails,
          albumOrder: normalizedOrder,
          albumPhotoIds: normalizedPhotoIds,
        },
      })

      setAlbumDetails(mergedAlbumDetails)
      setAlbumOrder(normalizedOrder)
      setAlbumPhotoIds(normalizedPhotoIds)
      setDirty(false)
      setSaved(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save portfolio albums.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    const merged = mergeAlbumDetailsWithDefaults(siteContent.portfolio?.albumDetails)
    setAlbumDetails(merged)
    const nextOrder = siteContent.portfolio?.albumOrder?.length ? siteContent.portfolio.albumOrder : fallbackAlbumIds
    setAlbumOrder(nextOrder)
    setAlbumPhotoIds(siteContent.portfolio?.albumPhotoIds ?? {})
    setDirty(false)
    setSaved(false)
    setSaveError('')
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Manage</p>
        <h1 className="font-display text-3xl text-white">Portfolio Album Manager</h1>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/65">
          Manage album details and album photos. Photos are assigned by media asset id and used by the public portfolio carousel when available.
        </p>
        {saved && <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-300/80">Saved</p>}
        {saveError && <p className="mt-3 text-sm text-red-300/90">{saveError}</p>}

        <div className="mt-8 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Albums</p>
              <button
                type="button"
                onClick={handleAddAlbum}
                className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:border-white/35 hover:text-white"
              >
                + Add Album
              </button>
            </div>
            <div className="space-y-2">
              {albumOrder.map((albumId) => (
                <button
                  key={albumId}
                  type="button"
                  onClick={() => setActiveAlbumId(albumId)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs uppercase tracking-[0.2em] transition ${
                    activeAlbumId === albumId
                      ? 'border-white/45 bg-white/10 text-white'
                      : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white/85'
                  }`}
                >
                  {albumLabel(albumId)}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Detail Content</p>
                <button
                  type="button"
                  onClick={handleDeleteAlbum}
                  className="rounded-full border border-red-400/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-red-200 transition hover:bg-red-400/15"
                >
                  Delete Album
                </button>
              </div>
              <div className="space-y-4">
                <Field label="Album Display Name" value={current.albumName ?? ''} onChange={(e) => updateField('albumName', e.target.value)} />
                <Field label="Eyebrow" value={current.eyebrow ?? ''} onChange={(e) => updateField('eyebrow', e.target.value)} />
                <Field label="Title" value={current.title ?? ''} onChange={(e) => updateField('title', e.target.value)} />
                <Field as="textarea" rows={3} label="Subtitle" value={current.subtitle ?? ''} onChange={(e) => updateField('subtitle', e.target.value)} />
                <Field
                  as="textarea"
                  rows={8}
                  label="Body"
                  hint="Supports simple markdown-style text rendered by MarkdownContent."
                  value={current.body ?? ''}
                  onChange={(e) => updateField('body', e.target.value)}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Blog Button Label" value={current.blogLabel ?? ''} onChange={(e) => updateField('blogLabel', e.target.value)} />
                  <Field label="Blog Button Link" value={current.blogHref ?? ''} onChange={(e) => updateField('blogHref', e.target.value)} />
                  <Field label="Contact Button Label" value={current.contactLabel ?? ''} onChange={(e) => updateField('contactLabel', e.target.value)} />
                  <Field label="Contact Button Link" value={current.contactHref ?? ''} onChange={(e) => updateField('contactHref', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Album Photos ({activeAlbumAssetIds.length})</p>
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:border-white/35 hover:text-white">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void handleUploadFile(file)
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:border-white/35 hover:text-white"
                  >
                    Choose from library
                  </button>
                </div>
              </div>

              {loadingAssets && <p className="mb-3 text-sm text-white/55">Loading media assets...</p>}

              {activeAlbumAssets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-8 text-center text-sm text-white/45">
                  No photos assigned to this album yet.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeAlbumAssets.map(({ id: assetId, asset }, index) => {
                    const draft = metadataDrafts[assetId]
                    const titleValue = draft?.title ?? asset?.title ?? ''
                    const altValue = draft?.alt ?? asset?.alt ?? ''
                    const descriptionValue = draft?.description ?? asset?.description ?? ''
                    const categoryValue = draft?.category ?? asset?.category ?? activeAlbumId
                    return (
                      <article key={assetId} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <div className="flex gap-3">
                          <div className="h-20 w-20 overflow-hidden rounded-lg bg-white/[0.05]">
                            {(asset?.thumbnailUrl || asset?.originalUrl) ? (
                              <img
                                src={asset?.thumbnailUrl || asset?.originalUrl}
                                alt={asset?.alt || asset?.title || asset?.filename || 'media'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-white/40">Missing</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">{asset?.title?.trim() || asset?.filename || assetId}</p>
                            <p className="truncate text-[11px] text-white/45">{asset?.category || activeAlbumId}</p>
                            <p className="text-[11px] text-white/45">{asset?.width && asset?.height ? `${asset.width} × ${asset.height}` : 'Unknown dimensions'}</p>
                            <p className="mt-1 text-[10px] text-white/35">Asset ID: {assetId}</p>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          <Field label="Title" value={titleValue} onChange={(event) => updateMetadataDraft(assetId, 'title', event.target.value)} />
                          <Field label="Alt" value={altValue} onChange={(event) => updateMetadataDraft(assetId, 'alt', event.target.value)} />
                          <Field label="Category" value={categoryValue} onChange={(event) => updateMetadataDraft(assetId, 'category', event.target.value)} />
                          <Field label="Description" value={descriptionValue} onChange={(event) => updateMetadataDraft(assetId, 'description', event.target.value)} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => movePhoto(assetId, -1)}
                            disabled={index === 0}
                            className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 disabled:opacity-40"
                          >
                            Move up
                          </button>
                          <button
                            type="button"
                            onClick={() => movePhoto(assetId, 1)}
                            disabled={index === activeAlbumAssets.length - 1}
                            className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 disabled:opacity-40"
                          >
                            Move down
                          </button>
                          <button
                            type="button"
                            onClick={() => void saveMetadata(assetId)}
                            className="rounded-full border border-emerald-300/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200"
                          >
                            Save metadata
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromAlbum(assetId)}
                            className="rounded-full border border-red-400/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-red-200"
                          >
                            Remove from album
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onReset={handleReset} />
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectFromLibrary}
        title={`Choose photo for ${albumLabel(activeAlbumId)}`}
      />
    </AdminLayout>
  )
}
