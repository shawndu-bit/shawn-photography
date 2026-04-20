import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { Photo, PhotoCategory } from '@/types'

const CATEGORIES: PhotoCategory[] = ['mountains', 'sea_lakes', 'forest', 'nightscape', 'city']

function newPhoto(): Photo {
  return {
    id: Date.now().toString(),
    title: '',
    description: '',
    specifications: '',
    src: '',
    thumbnailSrc: '',
    width: 1400,
    height: 1000,
    category: 'mountains',
    alt: '',
  }
}

export default function PhotosPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [photos, setPhotos] = useState<Photo[]>(siteContent.photos)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setPhotos(siteContent.photos) }, [siteContent.photos])

  function updatePhoto(id: string, key: keyof Photo, val: string | number) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)),
    )
    setDirty(true)
    setSaved(false)
  }

  function addPhoto() {
    setPhotos((prev) => [...prev, newPhoto()])
    setDirty(true)
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setDirty(true)
    setSaved(false)
  }

  function movePhoto(id: string, dir: -1 | 1) {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
    setDirty(true)
    setSaved(false)
  }

  function existingR2Key(path: string) {
    if (!path.startsWith('/uploads/')) return ''
    return decodeURIComponent(path.replace('/uploads/', ''))
  }

  function imageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(objectUrl)
      }
      img.onerror = () => {
        reject(new Error('Unable to read image dimensions'))
        URL.revokeObjectURL(objectUrl)
      }
      img.src = objectUrl
    })
  }

  async function uploadPhotoFile(id: string, file: File) {
    try {
      setUploading((prev) => ({ ...prev, [id]: true }))
      setUploadError((prev) => ({ ...prev, [id]: '' }))

      const current = photos.find((p) => p.id === id)
      if (!current) return

      const dims = await imageDimensions(file)
      const formData = new FormData()
      formData.append('file', file)

      const existingOriginalKey = existingR2Key(current.src)
      const existingThumbKey = existingR2Key(current.thumbnailSrc || '')
      if (existingOriginalKey) formData.append('existingOriginalKey', existingOriginalKey)
      if (existingThumbKey) formData.append('existingThumbKey', existingThumbKey)

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as {
        ok?: boolean
        originalUrl?: string
        thumbnailUrl?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.originalUrl || !data.thumbnailUrl) {
        throw new Error(data.error || 'Upload failed')
      }

      updatePhoto(id, 'src', data.originalUrl)
      updatePhoto(id, 'thumbnailSrc', data.thumbnailUrl)
      updatePhoto(id, 'width', dims.width)
      updatePhoto(id, 'height', dims.height)
    } catch (error) {
      setUploadError((prev) => ({ ...prev, [id]: String(error) }))
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }))
    }
  }

  async function handleSave() {
    await saveContent({ ...siteContent, photos })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setPhotos(siteContent.photos)
    setDirty(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
            <h1 className="font-display text-3xl text-white">图片管理</h1>
          </div>
          <button
            onClick={addPhoto}
            className="rounded-full border border-white/15 px-5 py-2.5 text-[12px] tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            + 添加图片
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              {/* Thumb + controls */}
              <div className="mb-4 flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {photo.src && (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <p className="text-sm text-white">{photo.title || '未命名图片'}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => movePhoto(photo.id, -1)}
                      disabled={idx === 0}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/40 transition hover:text-white/70 disabled:opacity-20"
                      aria-label="上移"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePhoto(photo.id, 1)}
                      disabled={idx === photos.length - 1}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/40 transition hover:text-white/70 disabled:opacity-20"
                      aria-label="下移"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="ml-auto text-[12px] text-white/25 transition hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Field
                  label="标题"
                  value={photo.title}
                  onChange={(e) => updatePhoto(photo.id, 'title', e.target.value)}
                />
                <Field
                  as="textarea"
                  label="描述（Lightbox）"
                  value={photo.description}
                  onChange={(e) => updatePhoto(photo.id, 'description', e.target.value)}
                  rows={3}
                />
                <Field
                  label="照片规格（Lightbox）"
                  value={photo.specifications}
                  onChange={(e) => updatePhoto(photo.id, 'specifications', e.target.value)}
                  placeholder="例如：Sony A7R5 · 24-70mm · ISO 200 · 1/125s"
                />
                <Field
                  label="原图 URL"
                  value={photo.src}
                  onChange={(e) => updatePhoto(photo.id, 'src', e.target.value)}
                  hint="上传后自动生成，可手动覆盖为任意公开图片链接"
                />
                <Field
                  label="缩略图 URL"
                  value={photo.thumbnailSrc || ''}
                  onChange={(e) => updatePhoto(photo.id, 'thumbnailSrc', e.target.value)}
                  hint="自动生成（最长边 640px），用于作品列表展示"
                />
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-white/12 px-4 py-2 text-[12px] text-white/70 transition hover:border-white/30 hover:text-white">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadPhotoFile(photo.id, file)
                        e.currentTarget.value = ''
                      }}
                    />
                    {uploading[photo.id] ? '上传中...' : '上传图片到 R2'}
                  </label>
                  {uploadError[photo.id] && (
                    <span className="text-[12px] text-red-400">{uploadError[photo.id]}</span>
                  )}
                </div>
                <Field
                  label="Alt 描述"
                  value={photo.alt}
                  onChange={(e) => updatePhoto(photo.id, 'alt', e.target.value)}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Field
                    label="宽度 px"
                    type="number"
                    value={String(photo.width)}
                    onChange={(e) => updatePhoto(photo.id, 'width', Number(e.target.value))}
                  />
                  <Field
                    label="高度 px"
                    type="number"
                    value={String(photo.height)}
                    onChange={(e) => updatePhoto(photo.id, 'height', Number(e.target.value))}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">分类</label>
                    <select
                      value={photo.category}
                      onChange={(e) => updatePhoto(photo.id, 'category', e.target.value)}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition focus:border-white/30"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p className="mt-8 text-[13px] text-white/30">暂无图片，点击「添加图片」开始</p>
        )}

        {saved && !dirty && (
          <p className="mt-6 text-[12px] text-green-400">✓ 已保存</p>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
    </AdminLayout>
  )
}
