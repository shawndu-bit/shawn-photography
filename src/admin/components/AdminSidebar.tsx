import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuthContext } from '@/admin/context/AdminAuthContext'

type TopLevelLink = {
  to: string
  label: string
  icon: string
  children?: { to: string; label: string }[]
}

const links: TopLevelLink[] = [
  { to: '/admin', label: 'Dashboard 总览', icon: '⊞' },
  {
    to: '/admin/homepage',
    label: 'Homepage 首页',
    icon: '⌂',
    children: [
      { to: '/admin/hero', label: 'Hero 首屏' },
      { to: '/admin/photos', label: 'Portfolio Preview' },
      { to: '/admin/blog', label: 'Blog Preview (from posts)' },
      { to: '/admin/contact', label: 'Contact 联系' },
      { to: '/admin/visibility', label: 'Settings 设置' },
    ],
  },
  { to: '/admin/about', label: 'About 关于', icon: '○' },
  { to: '/admin/portfolio', label: 'Portfolio 作品集', icon: '▦' },
  { to: '/admin/blog', label: 'Blog 日志', icon: '≡' },
  { to: '/admin/photos-library', label: 'Photos 图片管理', icon: '▢' },
]

export default function AdminSidebar() {
  const { logout } = useAdminAuthContext()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/8 bg-[#111111]">
      <div className="border-b border-white/8 px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/35">Admin Panel</p>
        <p className="mt-1 font-display text-base tracking-widest text-white">SHAWN</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          if (link.children) {
            const groupActive = link.children.some(
              (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
            )
            return (
              <div key={link.label} className="rounded-xl border border-white/5 bg-white/[0.015] p-2">
                <p className={`mb-1 flex items-center gap-3 px-2 py-1 text-[12px] tracking-wide ${groupActive ? 'text-white' : 'text-white/50'}`}>
                  <span className="text-base leading-none">{link.icon}</span>
                  {link.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end
                      className={({ isActive }) =>
                        `ml-5 flex items-center rounded-lg px-3 py-2 text-[12px] tracking-wide transition ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] tracking-wide transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`
              }
            >
              <span className="text-base leading-none">{link.icon}</span>
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/8 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] tracking-wide text-white/40 transition hover:bg-white/5 hover:text-white/70"
        >
          <span className="text-base leading-none">↵</span>
          退出登录
        </button>
        <NavLink
          to="/"
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] tracking-wide text-white/40 transition hover:bg-white/5 hover:text-white/70"
        >
          <span className="text-base leading-none">↗</span>
          查看网站
        </NavLink>
      </div>
    </aside>
  )
}
