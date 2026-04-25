import { useEffect, useMemo, useState } from 'react'

export interface MediaPickerAsset {
  id: string
  originalUrl: string
  thumbnailUrl: string | null
  title: string
  alt: string
  filename: string | null
  usageType: string
  category: string
}

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaPickerAsset) => void
  title?: string
}

export default function MediaPicker({ open, onClose, onSelect, title = 'Choose from Media Library' }: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaPickerAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [usageType, setUsageType] = useState('all')

  useEffect(() => {
    if (!open) return

    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('/api/admin/media-assets?status=active', { method: 'GET' })
        const data = await res.json() as {
          ok?: boolean
          assets?: Array<{
            id: string
            originalUrl: string
            thumbnailUrl: string | null
            title: string
            alt: string
            filename: string | null
            usageType: string
            category: string
          }>
          error?: string
        }
        if (!res.ok || !data.ok || !Array.isArray(data.assets)) {
          throw new Error(data.error || 'Failed to load media assets')
        }
        if (!active) return
        setAssets(data.assets)
      } catch (loadError) {
        if (!active) return
        setError(String(loadError))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [open])

  const usageOptions = useMemo(() => {
    const set = new Set<string>()
    for (const asset of assets) set.add(asset.usageType || 'general')
    return ['all', ...Array.from(set).sort()]
  }, [assets])

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase()
    return assets.filter((asset) => {
      if (usageType !== 'all' && (asset.usageType || 'general') !== usageType) return false
      if (!query) return true
      const stack = [asset.title, asset.filename || '', asset.alt, asset.category].join('\n').toLowerCase()
      return stack.includes(query)
    })
  }, [assets, search, usageType])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[160] bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-12 w-[min(1100px,92vw)] rounded-2xl border border-white/10 bg-[#131313] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Media Picker</p>
            <p className="mt-1 text-sm text-white">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3 border-b border-white/10 px-5 py-4 md:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title / filename / alt / description"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-white/25"
          />
          <select
            value={usageType}
            onChange={(e) => setUsageType(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-white/25"
          >
            {usageOptions.map((option) => (
              <option key={option} value={option} className="bg-[#1a1a1a]">
                {option === 'all' ? 'All usage types' : option}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {loading && (
            <p className="text-sm text-white/55">Loading assets...</p>
          )}
          {error && (
            <p className="text-sm text-red-300">{error}</p>
          )}
          {!loading && !error && filteredAssets.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-8 text-center text-sm text-white/45">
              No active media assets found.
            </div>
          )}

          {!loading && !error && filteredAssets.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => onSelect(asset)}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.045]"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-white/[0.05]">
                    {asset.thumbnailUrl || asset.originalUrl ? (
                      <img
                        src={asset.thumbnailUrl || asset.originalUrl}
                        alt={asset.alt || asset.title || asset.filename || 'media'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-white/35">No preview</div>
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs text-white">
                    {asset.title?.trim() || asset.filename || 'Untitled'}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-white/45">{asset.usageType || 'general'}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
