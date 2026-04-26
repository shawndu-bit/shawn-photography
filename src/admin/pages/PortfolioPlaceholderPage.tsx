import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { defaultSiteContent } from '@/data/siteContent'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { PortfolioAlbumDetail } from '@/types'

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
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const albumIds = useMemo(() => {
    const categories = [...new Set(siteContent.photos.map((photo) => photo.category))]
    return ['featured', ...categories]
  }, [siteContent.photos])

  useEffect(() => {
    setAlbumDetails(mergeAlbumDetailsWithDefaults(siteContent.portfolio?.albumDetails))
  }, [siteContent.portfolio?.albumDetails])

  useEffect(() => {
    if (!albumIds.includes(activeAlbumId)) {
      setActiveAlbumId(albumIds[0] ?? 'featured')
    }
  }, [activeAlbumId, albumIds])

  const current = albumDetails[activeAlbumId] ?? {}

  function updateField<K extends keyof PortfolioAlbumDetail>(key: K, value: PortfolioAlbumDetail[K]) {
    setAlbumDetails((prev) => ({
      ...prev,
      [activeAlbumId]: {
        ...(prev[activeAlbumId] ?? {}),
        [key]: value,
      },
    }))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const mergedAlbumDetails = mergeAlbumDetailsWithDefaults(albumDetails)
      await saveContent({
        ...siteContent,
        portfolio: {
          ...siteContent.portfolio,
          albumDetails: mergedAlbumDetails,
        },
      })
      setDirty(false)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setAlbumDetails(mergeAlbumDetailsWithDefaults(siteContent.portfolio?.albumDetails))
    setDirty(false)
    setSaved(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Manage</p>
        <h1 className="font-display text-3xl text-white">Portfolio Series Notes</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
          Edit text content shown below the public portfolio carousel for each album.
        </p>
        {saved && <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-300/80">Saved</p>}

        <div className="mt-8 grid gap-6 xl:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/40">Album</p>
            <div className="space-y-2">
              {albumIds.map((albumId) => (
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
                  {albumId}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/40">Detail Content</p>
            <div className="space-y-4">
              <Field label="Eyebrow" value={current.eyebrow ?? ''} onChange={(e) => updateField('eyebrow', e.target.value)} />
              <Field label="Title" value={current.title ?? ''} onChange={(e) => updateField('title', e.target.value)} />
              <Field as="textarea" rows={3} label="Subtitle" value={current.subtitle ?? ''} onChange={(e) => updateField('subtitle', e.target.value)} />
              <Field
                as="textarea"
                rows={10}
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
          </section>
        </div>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onReset={handleReset} />
    </AdminLayout>
  )
}
