import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { ContactContent } from '@/types'

export default function ContactEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [form, setForm] = useState<ContactContent>(siteContent.contact)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(siteContent.contact) }, [siteContent.contact])

  function set<K extends keyof ContactContent>(key: K, val: ContactContent[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
    setSaved(false)
  }

  function handleSave() {
    saveContent({ ...siteContent, contact: form })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setForm(siteContent.contact)
    setDirty(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
        <h1 className="mb-8 font-display text-3xl text-white">Contact 联系</h1>

        <div className="max-w-2xl space-y-6">
          <Field
            label="眉题（Eyebrow）"
            value={form.eyebrow}
            onChange={(e) => set('eyebrow', e.target.value)}
          />
          <Field
            as="textarea"
            label="主标题"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            rows={3}
          />
          <Field
            label="Email 地址"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="hello@example.com"
          />

          {/* Preview */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">{form.eyebrow}</p>
            <p className="mt-2 font-display text-2xl text-white">{form.title}</p>
            <span className="mt-4 inline-block rounded-full border border-white/15 px-5 py-2 text-[12px] text-white/70">
              {form.email || 'hello@example.com'}
            </span>
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
