import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { defaultSiteContent } from '@/data/siteContent'
import type { AboutContent, AboutPageContent, AboutPageGear } from '@/types'

export default function AboutEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [form, setForm] = useState<AboutContent>(siteContent.about)
  const [uploadingPortrait, setUploadingPortrait] = useState(false)
  const [uploadingGearIndex, setUploadingGearIndex] = useState<number | null>(null)
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

  function ensurePage(content: AboutContent): AboutPageContent {
    return {
      ...defaultSiteContent.about.page,
      ...content.page,
      bioParagraphs: content.page?.bioParagraphs ?? defaultSiteContent.about.page?.bioParagraphs ?? [],
      gear: {
        ...defaultSiteContent.about.page?.gear,
        ...content.page?.gear,
        items: content.page?.gear?.items ?? defaultSiteContent.about.page?.gear?.items ?? [],
      },
    } as AboutPageContent
  }

  function setPage<K extends keyof AboutPageContent>(key: K, val: AboutPageContent[K]) {
    setForm((f) => {
      const nextPage = ensurePage(f)
      return {
        ...f,
        page: {
          ...nextPage,
          [key]: val,
        },
      }
    })
    setDirty(true)
    setSaved(false)
  }

  function setPageParagraph(index: number, val: string) {
    const current = ensurePage(form)
    const next = [...current.bioParagraphs]
    next[index] = val
    setPage('bioParagraphs', next)
  }

  function addPageParagraph() {
    const current = ensurePage(form)
    setPage('bioParagraphs', [...current.bioParagraphs, ''])
  }

  function removePageParagraph(index: number) {
    const current = ensurePage(form)
    setPage('bioParagraphs', current.bioParagraphs.filter((_, i) => i !== index))
  }

  function ensureGear(content: AboutContent): AboutPageGear {
    const page = ensurePage(content)
    return {
      ...defaultSiteContent.about.page?.gear,
      ...page.gear,
      items: page.gear?.items ?? defaultSiteContent.about.page?.gear?.items ?? [],
    } as AboutPageGear
  }

  function setGear<K extends keyof AboutPageGear>(key: K, val: AboutPageGear[K]) {
    const current = ensureGear(form)
    setPage('gear', {
      ...current,
      [key]: val,
    })
  }

  function setGearItem(index: number, key: 'name' | 'description' | 'imageUrl' | 'imageAlt', value: string) {
    const current = ensureGear(form)
    const next = [...current.items]
    const target = next[index]

    if (!target) return

    next[index] = {
      ...target,
      [key]: value,
    }
    setGear('items', next)
  }

  function addGearItem() {
    const current = ensureGear(form)
    setGear('items', [
      ...current.items,
      {
        id: `gear-${Date.now()}`,
        name: '',
        description: '',
        imageUrl: '',
        imageAlt: '',
      },
    ])
  }

  function removeGearItem(index: number) {
    const current = ensureGear(form)
    setGear('items', current.items.filter((_, i) => i !== index))
  }

  function existingR2Key(path: string) {
    if (!path.startsWith('/uploads/')) return ''
    return decodeURIComponent(path.replace('/uploads/', ''))
  }

  async function uploadToR2(file: File, existingOriginalKey = '') {
    const formData = new FormData()
    formData.append('file', file)
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

    return data.originalUrl
  }

  async function uploadPortrait(file: File) {
    try {
      setUploadingPortrait(true)
      setUploadError('')

      const existingOriginalKey = existingR2Key(form.portraitImageSrc)
      const originalUrl = await uploadToR2(file, existingOriginalKey)

      set('portraitImageSrc', originalUrl)
      if (!form.portraitImageAlt.trim()) {
        set('portraitImageAlt', 'Portrait photo')
      }
    } catch (error) {
      setUploadError(String(error))
    } finally {
      setUploadingPortrait(false)
    }
  }

  async function uploadGearImage(index: number, file: File) {
    try {
      setUploadingGearIndex(index)
      setUploadError('')

      const gear = ensureGear(form)
      const target = gear.items[index]
      const existingOriginalKey = target ? existingR2Key(target.imageUrl) : ''
      const originalUrl = await uploadToR2(file, existingOriginalKey)

      setGearItem(index, 'imageUrl', originalUrl)
      if (!target?.imageAlt.trim()) {
        setGearItem(index, 'imageAlt', target?.name || 'Gear photo')
      }
    } catch (error) {
      setUploadError(String(error))
    } finally {
      setUploadingGearIndex(null)
    }
  }

  async function handleSave() {
    await saveContent({ ...siteContent, about: { ...form, page: ensurePage(form) } })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setForm(siteContent.about)
    setDirty(false)
  }

  const page = ensurePage(form)
  const gear = ensureGear(form)

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
        <h1 className="mb-8 font-display text-3xl text-white">About Me 页面</h1>

        <div className="max-w-3xl space-y-10">
          <section className="space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/35">Homepage Preview</p>
              <p className="mt-1 text-sm text-white/45">首页 About 预览区内容</p>
            </div>

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
                <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">预览正文段落</label>
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
          </section>

          <section className="space-y-6 border-t border-white/10 pt-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/35">About Page</p>
              <p className="mt-1 text-sm text-white/45">独立 /about 页面内容</p>
            </div>

            <Field label="页面 Eyebrow" value={page.eyebrow} onChange={(e) => setPage('eyebrow', e.target.value)} />
            <Field label="页面标题" value={page.title} onChange={(e) => setPage('title', e.target.value)} />
            <Field label="页面副标题" value={page.subtitle} onChange={(e) => setPage('subtitle', e.target.value)} />

            <Field
              label="Bio 标题（例如 ABOUT SHAWN /）"
              value={page.bioHeading}
              onChange={(e) => setPage('bioHeading', e.target.value)}
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">Bio 段落</label>
                <button
                  onClick={addPageParagraph}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
                >
                  + 新增段落
                </button>
              </div>
              {page.bioParagraphs.map((para, i) => (
                <div key={i} className="relative">
                  <textarea
                    value={para}
                    rows={3}
                    onChange={(e) => setPageParagraph(i, e.target.value)}
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]"
                  />
                  {page.bioParagraphs.length > 1 && (
                    <button
                      onClick={() => removePageParagraph(i)}
                      className="absolute right-3 top-3 text-white/25 transition hover:text-red-400"
                      aria-label="删除此段落"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Field
              label="Website 标题（例如 ABOUT THE WEBSITE /）"
              value={page.websiteHeading}
              onChange={(e) => setPage('websiteHeading', e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">Website 正文</label>
              <textarea
                value={page.websiteParagraph}
                rows={3}
                onChange={(e) => setPage('websiteParagraph', e.target.value)}
                className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Contact 按钮文案"
                value={page.contactButtonText}
                onChange={(e) => setPage('contactButtonText', e.target.value)}
              />
              <Field
                label="Contact 按钮链接"
                value={page.contactButtonLink}
                onChange={(e) => setPage('contactButtonLink', e.target.value)}
              />
              <Field
                label="Portfolio 按钮文案"
                value={page.portfolioButtonText}
                onChange={(e) => setPage('portfolioButtonText', e.target.value)}
              />
              <Field
                label="Portfolio 按钮链接"
                value={page.portfolioButtonLink}
                onChange={(e) => setPage('portfolioButtonLink', e.target.value)}
              />
              <Field
                label="Back 链接文案"
                value={page.backLinkText}
                onChange={(e) => setPage('backLinkText', e.target.value)}
              />
              <Field
                label="Back 链接 URL"
                value={page.backLinkUrl}
                onChange={(e) => setPage('backLinkUrl', e.target.value)}
              />
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <Field label="Gear 区块标题" value={gear.title} onChange={(e) => setGear('title', e.target.value)} />
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">Gear 区块简介</label>
                <textarea
                  value={gear.intro}
                  rows={2}
                  onChange={(e) => setGear('intro', e.target.value)}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">Gear 项目</label>
                <button
                  onClick={addGearItem}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
                >
                  + 新增 Gear
                </button>
              </div>

              {gear.items.map((item, index) => (
                <div key={item.id || index} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Item {index + 1}</p>
                    <button
                      onClick={() => removeGearItem(index)}
                      className="text-xs text-white/35 transition hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>

                  <Field
                    label="名称"
                    value={item.name}
                    onChange={(e) => setGearItem(index, 'name', e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">描述</label>
                    <textarea
                      value={item.description}
                      rows={2}
                      onChange={(e) => setGearItem(index, 'description', e.target.value)}
                      className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]"
                    />
                  </div>
                  <Field
                    label="图片 URL"
                    value={item.imageUrl}
                    onChange={(e) => setGearItem(index, 'imageUrl', e.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center rounded-full border border-white/12 px-4 py-2 text-[12px] text-white/70 transition hover:border-white/30 hover:text-white">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadGearImage(index, file)
                          e.currentTarget.value = ''
                        }}
                      />
                      {uploadingGearIndex === index ? '上传中...' : '上传 Gear 图片到 R2'}
                    </label>
                  </div>
                  <Field
                    label="图片 Alt"
                    value={item.imageAlt}
                    onChange={(e) => setGearItem(index, 'imageAlt', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {uploadError && (
            <p className="text-[12px] text-red-400">{uploadError}</p>
          )}

          {saved && !dirty && (
            <p className="text-[12px] text-green-400">✓ 已保存</p>
          )}
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
    </AdminLayout>
  )
}
