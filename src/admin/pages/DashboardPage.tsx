import AdminLayout from '@/admin/components/AdminLayout'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import { Link } from 'react-router-dom'

const cards = [
  { to: '/admin/hero', title: 'Hero 首屏', desc: 'Homepage 首屏内容编辑' },
  { to: '/admin/about', title: 'About 关于', desc: '关于页内容编辑（已接入公开 /about）' },
  { to: '/admin/blog', title: 'Blog 日志', desc: '博客管理、文章列表、写作入口' },
  { to: '/admin/contact', title: 'Contact 联系', desc: 'Homepage 联系模块内容编辑' },
  { to: '/admin/photos-preview', title: 'Portfolio Preview', desc: 'Homepage 作品预览图片与排序' },
  { to: '/admin/visibility', title: 'Settings 设置', desc: 'Homepage 版块显示开关' },
  { to: '/admin/portfolio', title: 'Portfolio 作品集', desc: '独立作品集页面管理（占位）' },
  { to: '/admin/photos', title: 'Photos 图片管理', desc: '媒体库管理（上传、筛选、编辑元数据）' },
]

export default function DashboardPage() {
  const { siteContent } = useSiteContentContext()
  const v = siteContent.sectionVisibility
  const photoCount = siteContent.photos.length
  const postCount = siteContent.blogPosts.length

  const stats = [
    { label: '作品图片', value: photoCount },
    { label: 'Blog 条目', value: postCount },
    { label: '已启用版块', value: Object.values(v).filter(Boolean).length },
  ]

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Admin Panel</p>
        <h1 className="mb-8 font-display text-3xl text-white">Dashboard 总览</h1>

        <div className="mb-8 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-3xl font-light text-white">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <p className="text-base font-medium text-white">{card.title}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/45">{card.desc}</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-white/30 transition group-hover:text-white/60">
                编辑 →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
