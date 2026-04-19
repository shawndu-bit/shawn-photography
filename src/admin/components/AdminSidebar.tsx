import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuthContext } from '@/admin/context/AdminAuthContext'

const links = [
  { to: '/admin', label: '仓库总览', icon: '⊞' },
  { to: '/admin/hero', label: 'Hero 首屏', icon: '▣' },
  { to: '/admin/about', label: 'About Me', icon: '○' },
  { to: '/admin/blog', label: 'Blog 日志', icon: '≡' },
  { to: '/admin/contact', label: 'Contact', icon: '✉' },
  { to: '/admin/photos', label: '图片管理', icon: '▢' },
  { to: '/admin/visibility', label: '版块开关', icon: '◑' },
]

export default function AdminSidebar() {
  const { logout } = useAdminAuthContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-white/8 bg-[#111111]">
      {/* Brand */}
      <div className="border-b border-white/8 px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/35">Admin Panel</p>
        <p className="mt-1 font-display text-base tracking-widest text-white">SHAWN</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] tracking-wide transition ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`
            }
          >
            <span className="text-base leading-none">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
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
