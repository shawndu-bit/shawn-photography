import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Field from '@/admin/components/ui/Field'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { ContactContent, SocialLink } from '@/types'
import { defaultSiteContent } from '@/data/siteContent'

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
  const [recommendedApplied, setRecommendedApplied] = useState(false)

  useEffect(() => { setForm(siteContent.contact) }, [siteContent.contact])
  useEffect(() => { setLinks(siteContent.socialLinks) }, [siteContent.socialLinks])
  useEffect(() => {
    if (!dirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

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

  async function handleSave() {
    await saveContent({ ...siteContent, contact: form, socialLinks: links })
    setDirty(false)
    setSaved(true)
    setRecommendedApplied(false)
  }

  function handleReset() {
    setForm(siteContent.contact)
    setLinks(siteContent.socialLinks)
    setDirty(false)
    setRecommendedApplied(false)
  }

  function applyRecommendedLinks() {
    setLinks(defaultSiteContent.socialLinks)
    setDirty(true)
    setSaved(false)
    setRecommendedApplied(true)
  }

  const enabledPlatforms = links
    .filter((link) => link.enabled)
    .map((link) => link.label || link.platform || '(未命名平台)')

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">编辑</p>
        <h1 className="mb-8 font-display text-3xl text-white">Contact 联系</h1>

        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">保存状态</p>
            <p className={`mt-2 text-[12px] ${dirty ? 'text-amber-300' : 'text-emerald-300'}`}>
              {dirty ? '有未保存修改：当前改动尚未同步到公开页。' : '当前内容已保存并同步。'}
            </p>
            {saved && !dirty && (
              <p className="mt-1 text-[12px] text-green-400">✓ 保存成功，公开页将使用此配置。</p>
            )}
          </div>

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
              <div className="flex items-center gap-2">
                <button
                  onClick={applyRecommendedLinks}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
                >
                  应用推荐平台配置
                </button>
                <button
                  onClick={addLink}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
                >
                  + 新增链接
                </button>
              </div>
            </div>
            <p className="mb-3 text-[12px] text-white/50">
              推荐配置会默认启用 Instagram / TikTok / Facebook / YouTube / Email，并将其他平台重置为未启用。
            </p>
            {recommendedApplied && (
              <div className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-[12px] text-amber-100">
                已应用推荐配置：Bilibili、Xiaohongshu、Behance、500px 等非默认平台会被重置为未启用。若需公开显示，请手动重新启用并点击“保存修改”。
              </div>
            )}

            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.015] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">公开页将显示（保存后）</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/75">
                {enabledPlatforms.length > 0 ? enabledPlatforms.join(' · ') : '当前没有启用的平台'}
              </p>
              {dirty && (
                <p className="mt-1 text-[11px] text-amber-300/90">以上为待保存状态，需点击底部“保存修改”后才会生效。</p>
              )}
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
                      placeholder="instagram / tiktok / facebook / youtube / email"
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
