import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { AboutContent } from '@/types'

export default function AboutEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [form, setForm] = useState<AboutContent>(siteContent.about)
  const [uploadingPortrait, setUploadingPortrait] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(siteContent.about) }, [siteContent.about])

  function set<K extends keyof AboutContent>(key: K, val: AboutContent[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
    setSaved(false)
  }

  function setParagraph(index: number, val: string) {
    const next = [...form.paragraphs]
    next[index] = val
    set('paragraphs', next)
  }

  function addParagraph() {
    set('paragraphs', [...form.paragraphs, ''])
  }

  function removeParagraph(index: number) {
    set('paragraphs', form.paragraphs.filter((_, i) => i !== index))
  }

  function existingR2Key(path: string) {
    if (!path.startsWith('/uploads/')) return ''
    return decodeURIComponent(path.replace('/uploads/', ''))
  }

  async function uploadPortrait(file: File) {
    try {
      setUploadingPortrait(true)
      setUploadError('')

      const formData = new FormData()
      formData.append('file', file)

      const existingOriginalKey = existingR2Key(form.portraitImageSrc)
      if (existingOriginalKey) formData.append('existingOriginalKey', existingOriginalKey)

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as {
        ok?: boolean
        originalUrl?: string
        error?: string
      }

      if (!res.ok || !data.ok || !data.originalUrl) {
        throw new Error(data.error || 'Upload failed')
      }

      set('portraitImageSrc', data.originalUrl)
      if (!form.portraitImageAlt.trim()) {
        set('portraitImageAlt', 'Portrait photo')
      }
    } catch (error) {
      setUploadError(String(error))
    } finally {
      setUploadingPortrait(false)
    }
  }

  async function handleSave() {
    await saveContent({ ...siteContent, about: form })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setForm(siteContent.about)
    setDirty(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
        <h1 className="mb-8 font-display text-3xl text-white">About Me 页面</h1>

        <div className="max-w-2xl space-y-6">
          <Field
            label="眉题（Eyebrow）"
            value={form.eyebrow}
            onChange={(e) => set('eyebrow', e.target.value)}
          />
          <Field
            label="主标题"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
          <Field
            label="肖像图片 URL"
            value={form.portraitImageSrc}
            onChange={(e) => set('portraitImageSrc', e.target.value)}
            hint="可手动输入 URL，或使用下方按钮上传到 R2"
          />
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-full border border-white/12 px-4 py-2 text-[12px] text-white/70 transition hover:border-white/30 hover:text-white">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadPortrait(file)
                  e.currentTarget.value = ''
                }}
              />
              {uploadingPortrait ? '上传中...' : '上传肖像图到 R2'}
            </label>
            {uploadError && (
              <span className="text-[12px] text-red-400">{uploadError}</span>
            )}
          </div>
          <Field
            label="肖像图片 Alt 描述"
            value={form.portraitImageAlt}
            onChange={(e) => set('portraitImageAlt', e.target.value)}
          />

          {form.portraitImageSrc && (
            <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] p-2">
              <img
                src={form.portraitImageSrc}
                alt={form.portraitImageAlt}
                className="h-28 w-28 rounded-full object-cover object-center"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">正文段落</label>
              <button
                onClick={addParagraph}
                className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
              >
                + 新增段落
              </button>
            </div>
            {form.paragraphs.map((para, i) => (
              <div key={i} className="relative">
                <textarea
                  value={para}
                  rows={3}
                  onChange={(e) => setParagraph(i, e.target.value)}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]"
                />
                {form.paragraphs.length > 1 && (
                  <button
                    onClick={() => removeParagraph(i)}
                    className="absolute right-3 top-3 text-white/25 transition hover:text-red-400"
                    aria-label="删除此段落"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {saved && !dirty && (
            <p className="text-[12px] text-green-400">✓ 已保存</p>
          )}
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
    </AdminLayout>
  )
}
