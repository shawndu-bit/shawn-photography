import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/#home',    label: 'Home' },
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
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="ml-auto flex flex-col justify-center gap-[5px] p-2 md:hidden"
          >
            <span className={`block h-px w-6 bg-white/70 transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-white/70 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-white/70 transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        className={`fixed right-5 top-[4.5rem] z-40 w-[calc(100%-2.5rem)] rounded-2xl border border-white/12 bg-carbon/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 md:hidden ${
          menuOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => { handleHashLink(e, to); setMenuOpen(false) }}
              className="rounded-xl px-3 py-3 text-[12px] uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
