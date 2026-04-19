import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/#work',    label: 'Portfolio' },
  { to: '/about',    label: 'About Me' },
  { to: '/#blog',    label: 'Blog' },
  { to: '/#contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  function handleHashLink(
    e: React.MouseEvent<HTMLAnchorElement>,
    to: string,
  ) {
    if (!to.startsWith('/#')) return
    const id = to.replace('/#', '')
    if (location.pathname === '/') {
      e.preventDefault()
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isAdminRoute = location.pathname.startsWith('/admin')
  if (isAdminRoute) return null

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/8 bg-carbon/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-12">
          <Link
            to="/"
            className="font-display text-base tracking-[0.45em] text-white transition hover:text-white/70"
          >
            SHAWN
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={(e) => handleHashLink(e, to)}
                className={`text-[11px] uppercase tracking-[0.35em] transition ${
                  location.pathname === '/about' && to === '/about'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? '关闭菜单' : '开启菜单'}
            aria-expanded={menuOpen}
            className="flex flex-col justify-center gap-[5px] p-2 md:hidden"
          >
            <span className={`block h-px w-6 bg-white/70 transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-white/70 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-white/70 transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-carbon/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={(e) => { handleHashLink(e, to); setMenuOpen(false) }}
            className="font-display text-3xl tracking-widest text-white/80 transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}
