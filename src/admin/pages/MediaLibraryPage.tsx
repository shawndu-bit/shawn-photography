import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'

interface MediaAsset {
  id: string
  kind: string
  usageType: string
  uploadedFrom: string
  originalKey: string
  originalUrl: string
  thumbnailKey: string | null
  thumbnailUrl: string | null
  filename: string | null
  mimeType: string | null
  fileSizeBytes: number | null
  width: number | null
  height: number | null
  title: string
  alt: string
  description: string
  category: string
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
}

interface AssetDraft {
  title: string
  alt: string
  description: string
  usageType: string
  category: string
  tags: string
  status: string
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function tagsToDraft(tags: string[]) {
  return tags.join(', ')
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [usageFilter, setUsageFilter] = useState('all')
  const [uploadedFromFilter, setUploadedFromFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active')
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [copyHint, setCopyHint] = useState('')
  const [drafts, setDrafts] = useState<Record<string, AssetDraft>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function loadAssets() {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      params.set('status', statusFilter)

      const url = `/api/admin/media-assets${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url, { method: 'GET' })
      const data = await res.json() as {
        ok?: boolean
        assets?: MediaAsset[]
        error?: string
      }

      if (!res.ok || !data.ok || !Array.isArray(data.assets)) {
        throw new Error(data.error || 'Failed to load media assets')
      }

      setAssets(data.assets)
      setDrafts((prev) => {
        const next = { ...prev }
        for (const asset of data.assets) {
          next[asset.id] = next[asset.id] || {
            title: asset.title || '',
            alt: asset.alt || '',
            description: asset.description || '',
            usageType: asset.usageType || 'general',
            category: asset.category || 'general',
            tags: tagsToDraft(asset.tags || []),
            status: asset.status || 'active',
          }
        }
        return next
      })
    } catch (loadError) {
      setError(String(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const usageOptions = useMemo(() => {
    const set = new Set<string>()
    for (const asset of assets) set.add(asset.usageType || 'general')
    return ['all', ...Array.from(set).sort()]
  }, [assets])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const asset of assets) set.add(asset.category || 'general')
    return ['all', ...Array.from(set).sort()]
  }, [assets])

  const uploadedFromOptions = useMemo(() => {
    const set = new Set<string>()
    for (const asset of assets) set.add(asset.uploadedFrom || 'unknown')
    return ['all', ...Array.from(set).sort()]
  }, [assets])

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase()
    return assets.filter((asset) => {
      if (usageFilter !== 'all' && (asset.usageType || 'general') !== usageFilter) return false
      if (uploadedFromFilter !== 'all' && (asset.uploadedFrom || 'unknown') !== uploadedFromFilter) return false
      if (categoryFilter !== 'all' && (asset.category || 'general') !== categoryFilter) return false
      if (!query) return true
      const stack = [
        asset.title || '',
        asset.filename || '',
        asset.alt || '',
        asset.description || '',
      ].join('\n').toLowerCase()
      return stack.includes(query)
    })
  }, [assets, search, usageFilter, uploadedFromFilter, categoryFilter])

  function updateDraft(id: string, key: keyof AssetDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          title: '',
          alt: '',
          description: '',
          usageType: 'general',
          category: 'general',
          tags: '',
          status: 'active',
        }),
        [key]: value,
      },
    }))
  }

  async function saveAsset(asset: MediaAsset) {
    const draft = drafts[asset.id]
    if (!draft) return

    try {
      setSavingId(asset.id)
      setError('')

      const res = await fetch(`/api/admin/media-assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          alt: draft.alt,
          description: draft.description,
          usageType: draft.usageType,
          category: draft.category,
          tags: draft.tags,
          status: draft.status,
        }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update media asset')
      }
      await loadAssets()
    } catch (saveError) {
      setError(String(saveError))
    } finally {
      setSavingId(null)
    }
  }

  async function archiveAsset(asset: MediaAsset) {
    if (asset.status === 'archived') return

    const confirmed = window.confirm(
      'Archive this asset? It will be hidden from the default Active view but the R2 file will NOT be deleted.',
    )
    if (!confirmed) return

    try {
      setSavingId(asset.id)
      setError('')

      const res = await fetch(`/api/admin/media-assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to archive media asset')
      }
      await loadAssets()
    } catch (archiveError) {
      setError(String(archiveError))
    } finally {
      setSavingId(null)
    }
  }

  async function copyToClipboard(label: string, value: string | null) {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopyHint(`${label} copied`)
    setTimeout(() => setCopyHint(''), 1600)
  }

  function imageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(objectUrl)
      }
      img.onerror = () => {
        resolve({ width: 0, height: 0 })
        URL.revokeObjectURL(objectUrl)
      }
      img.src = objectUrl
    })
  }

  async function uploadImage(file: File) {
    try {
      setUploading(true)
      setError('')

      const dims = await imageDimensions(file)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('usageType', 'general')
      formData.append('uploadedFrom', 'admin_photos')
      formData.append('category', 'general')
      if (dims.width > 0) formData.append('width', String(dims.width))
      if (dims.height > 0) formData.append('height', String(dims.height))

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      await loadAssets()
    } catch (uploadError) {
      setError(String(uploadError))
    } finally {
      setUploading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Media Library</p>
            <h1 className="font-display text-3xl text-white">Photos 图片管理</h1>
            <p className="mt-2 text-sm text-white/55">Browse uploaded media, update metadata, and archive assets.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadAssets()}
              className="rounded-full border border-white/15 px-5 py-2 text-[12px] tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-white/15 px-5 py-2 text-[12px] tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void uploadImage(file)
                e.currentTarget.value = ''
              }}
            />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] text-white/50">
            {filteredAssets.length} assets shown
          </p>
          <p className="text-[11px] text-white/35">
            Archive only hides metadata from active view. It does not delete files from R2.
          </p>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.28em] text-white/45">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title / filename / alt / description"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.28em] text-white/45">Usage Type</label>
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            >
              {usageOptions.map((item) => <option key={item} value={item} className="bg-[#1a1a1a]">{item === 'all' ? 'All usage types' : item}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.28em] text-white/45">Uploaded From</label>
            <select
              value={uploadedFromFilter}
              onChange={(e) => setUploadedFromFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            >
              {uploadedFromOptions.map((item) => <option key={item} value={item} className="bg-[#1a1a1a]">{item === 'all' ? 'All sources' : item}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.28em] text-white/45">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            >
              {categoryOptions.map((item) => <option key={item} value={item} className="bg-[#1a1a1a]">{item === 'all' ? 'All categories' : item}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.28em] text-white/45">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'active' | 'archived')}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            >
              <option value="active" className="bg-[#1a1a1a]">Active</option>
              <option value="archived" className="bg-[#1a1a1a]">Archived</option>
            </select>
          </div>
        </div>

        {copyHint && <p className="mb-4 text-[12px] text-green-400">{copyHint}</p>}
        {error && <p className="mb-4 text-[12px] text-red-400">{error}</p>}

        {assets.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-10 text-center text-sm text-white/45">
            No media assets loaded yet. Click Refresh to load current assets.
          </div>
        ) : filteredAssets.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-10 text-center text-sm text-white/45">
            No assets match the current filters. Try adjusting search or filter options.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredAssets.map((asset) => {
              const draft = drafts[asset.id]
              const expanded = expandedAssetId === asset.id
              return (
                <article key={asset.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="aspect-square overflow-hidden rounded-xl bg-white/[0.05]">
                    {asset.thumbnailUrl || asset.originalUrl ? (
                      <img
                        src={asset.thumbnailUrl || asset.originalUrl}
                        alt={asset.alt || asset.title || asset.filename || 'media'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-white/30">No image</div>
                    )}
                  </div>
                  <div className="mt-3 min-w-0 space-y-2">
                    <p className="truncate text-sm text-white">{asset.title?.trim() || asset.filename || 'Untitled asset'}</p>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-white/65">{asset.usageType || 'general'}</span>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-white/65">{asset.category || 'general'}</span>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-white/65">{asset.status || 'active'}</span>
                    </div>
                    <p className="truncate text-[11px] text-white/40" title={asset.uploadedFrom || 'unknown'}>
                      source: {asset.uploadedFrom || 'unknown'}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => void copyToClipboard('Original URL', asset.originalUrl)}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] text-white/65 transition hover:border-white/30 hover:text-white"
                    >
                      Copy original URL
                    </button>
                    <button
                      onClick={() => void copyToClipboard('Thumbnail URL', asset.thumbnailUrl)}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] text-white/65 transition hover:border-white/30 hover:text-white"
                    >
                      Copy thumbnail URL
                    </button>
                    <button
                      onClick={() => setExpandedAssetId((prev) => (prev === asset.id ? null : asset.id))}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] text-white/65 transition hover:border-white/30 hover:text-white"
                    >
                      {expanded ? 'Close edit' : 'Edit'}
                    </button>
                    {asset.status !== 'archived' && (
                      <button
                        onClick={() => void archiveAsset(asset)}
                        disabled={savingId === asset.id}
                        className="rounded-full border border-amber-500/30 px-3 py-1.5 text-[11px] text-amber-200/80 transition hover:border-amber-400/50 hover:text-amber-100 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                  </div>

                  {expanded && draft && (
                    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                      <div className="space-y-1 text-[12px] text-white/45">
                        <p>Filename: {asset.filename || '—'}</p>
                        <p>Dimensions: {asset.width && asset.height ? `${asset.width} × ${asset.height}` : '—'}</p>
                        <p>Size: {formatFileSize(asset.fileSizeBytes)}</p>
                        <p>Created: {formatDate(asset.createdAt)}</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          value={draft.title}
                          onChange={(e) => updateDraft(asset.id, 'title', e.target.value)}
                          placeholder="Title"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        />
                        <input
                          value={draft.alt}
                          onChange={(e) => updateDraft(asset.id, 'alt', e.target.value)}
                          placeholder="Alt text"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        />
                        <input
                          value={draft.usageType}
                          onChange={(e) => updateDraft(asset.id, 'usageType', e.target.value)}
                          placeholder="usageType"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        />
                        <input
                          value={draft.category}
                          onChange={(e) => updateDraft(asset.id, 'category', e.target.value)}
                          placeholder="category"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        />
                        <input
                          value={draft.tags}
                          onChange={(e) => updateDraft(asset.id, 'tags', e.target.value)}
                          placeholder="tags (comma separated)"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25 md:col-span-2"
                        />
                        <select
                          value={draft.status}
                          onChange={(e) => updateDraft(asset.id, 'status', e.target.value)}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        >
                          <option value="active" className="bg-[#1a1a1a]">active</option>
                          <option value="archived" className="bg-[#1a1a1a]">archived</option>
                        </select>
                      </div>
                      <textarea
                        value={draft.description}
                        onChange={(e) => updateDraft(asset.id, 'description', e.target.value)}
                        placeholder="Description"
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                      />
                      <button
                        onClick={() => void saveAsset(asset)}
                        disabled={savingId === asset.id}
                        className="rounded-full border border-white/15 px-4 py-2 text-[12px] tracking-wide text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
                      >
                        {savingId === asset.id ? 'Saving...' : 'Save metadata'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
