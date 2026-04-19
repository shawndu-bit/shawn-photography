import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { HeroContent } from '@/types'

export default function HeroEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [form, setForm] = useState<HeroContent>(siteContent.hero)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(siteContent.hero) }, [siteContent.hero])

  function set<K extends keyof HeroContent>(key: K, val: HeroContent[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
    setSaved(false)
  }

  function handleSave() {
    saveContent({ ...siteContent, hero: form })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setForm(siteContent.hero)
    setDirty(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
        <h1 className="mb-8 font-display text-3xl text-white">Hero 首屏</h1>

        <div className="max-w-2xl space-y-6">
          <Field
            label="眉题（Eyebrow）"
            value={form.eyebrow}
            onChange={(e) => set('eyebrow', e.target.value)}
            placeholder="Fine Art Landscape Photography"
          />
          <Field
            label="主标题"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Light, Silence, and Distance."
          />
          <Field
            as="textarea"
            label="副文案"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
          />
          <Field
            label="滚动提示文字"
            value={form.scrollLabel}
            onChange={(e) => set('scrollLabel', e.target.value)}
            placeholder="Scroll"
          />
          <Field
            label="背景图片 URL"
            value={form.imageSrc}
            onChange={(e) => set('imageSrc', e.target.value)}
            hint="直接填写图片 URL，推荐使用 Cloudflare R2 公开链接"
          />
          <Field
            label="图片 Alt 描述"
            value={form.imageAlt}
            onChange={(e) => set('imageAlt', e.target.value)}
          />

          {/* Preview */}
          {form.imageSrc && (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src={form.imageSrc}
                alt={form.imageAlt}
                className="h-48 w-full object-cover"
              />
              <div className="bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">{form.eyebrow}</p>
                <p className="mt-1 font-display text-xl text-white">{form.title}</p>
                <p className="mt-1 text-[12px] text-white/55">{form.description}</p>
              </div>
            </div>
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
