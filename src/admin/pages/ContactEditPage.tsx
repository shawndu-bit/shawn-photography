import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { ContactContent, SocialLink } from '@/types'

function newSocialLink(): SocialLink {
  return {
    id: Date.now().toString(),
    label: '',
    platform: '',
    href: '',
    enabled: true,
  }
}

export default function ContactEditPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [form, setForm] = useState<ContactContent>(siteContent.contact)
  const [links, setLinks] = useState<SocialLink[]>(siteContent.socialLinks)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(siteContent.contact) }, [siteContent.contact])
  useEffect(() => { setLinks(siteContent.socialLinks) }, [siteContent.socialLinks])

  function set<K extends keyof ContactContent>(key: K, val: ContactContent[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
    setSaved(false)
  }

  function updateLink(id: string, key: keyof SocialLink, value: string | boolean) {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [key]: value } : link)))
    setDirty(true)
    setSaved(false)
  }

  function addLink() {
    setLinks((prev) => [...prev, newSocialLink()])
    setDirty(true)
    setSaved(false)
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id))
    setDirty(true)
    setSaved(false)
  }

  function handleSave() {
    saveContent({ ...siteContent, contact: form, socialLinks: links })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setForm(siteContent.contact)
    setLinks(siteContent.socialLinks)
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">社交图标链接</p>
              <button
                onClick={addLink}
                className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
              >
                + 新增链接
              </button>
            </div>

            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={link.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">项目 {index + 1}</p>
                    <button
                      onClick={() => removeLink(link.id)}
                      className="text-[12px] text-white/30 transition hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Field
                      label="平台名称 / Label"
                      value={link.label}
                      onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                      placeholder="Instagram"
                    />
                    <Field
                      label="图标平台标识（platform）"
                      value={link.platform}
                      onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                      placeholder="instagram / facebook / bilibili / email"
                    />
                    <Field
                      label="URL / 超链接"
                      value={link.href}
                      onChange={(e) => updateLink(link.id, 'href', e.target.value)}
                      placeholder="https://..."
                    />
                    <label className="inline-flex items-center gap-2 text-[12px] text-white/60">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => updateLink(link.id, 'enabled', e.target.checked)}
                        className="h-4 w-4 accent-white"
                      />
                      启用该图标
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
