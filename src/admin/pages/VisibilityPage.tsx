import { useState, useEffect } from 'react'
import AdminLayout from '@/admin/components/AdminLayout'
import Toggle from '@/admin/components/ui/Toggle'
import SaveBar from '@/admin/components/ui/SaveBar'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { SiteSectionVisibility } from '@/types'

const SECTIONS: { key: keyof SiteSectionVisibility; label: string; desc: string }[] = [
  { key: 'hero', label: 'Hero 首屏', desc: '全屏背景大图与主标题区域' },
  { key: 'portfolio', label: '作品集瀑布流', desc: '首页 Masonry 图片墙' },
  { key: 'blog', label: 'Blog 日志', desc: '三栏日志卡片区域' },
  { key: 'contact', label: 'Contact 联系', desc: '联系标题与 Email 按钮' },
]

export default function VisibilityPage() {
  const { siteContent, saveContent } = useSiteContentContext()
  const [vis, setVis] = useState<SiteSectionVisibility>(siteContent.sectionVisibility)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setVis(siteContent.sectionVisibility) }, [siteContent.sectionVisibility])

  function toggle(key: keyof SiteSectionVisibility) {
    setVis((v) => ({ ...v, [key]: !v[key] }))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    await saveContent({ ...siteContent, sectionVisibility: vis })
    setDirty(false)
    setSaved(true)
  }

  function handleReset() {
    setVis(siteContent.sectionVisibility)
    setDirty(false)
  }

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">控制</p>
        <h1 className="mb-2 font-display text-3xl text-white">版块开关</h1>
        <p className="mb-8 text-[13px] text-white/40">控制首页各版块的显示与隐藏，修改后点击保存立即生效。</p>

        <div className="max-w-xl space-y-3">
          {SECTIONS.map((s) => (
            <Toggle
              key={s.key}
              label={s.label}
              description={s.desc}
              checked={vis[s.key]}
              onChange={() => toggle(s.key)}
            />
          ))}
        </div>

        {saved && !dirty && (
          <p className="mt-6 text-[12px] text-green-400">✓ 已保存，刷新首页即可查看效果</p>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
    </AdminLayout>
  )
}
