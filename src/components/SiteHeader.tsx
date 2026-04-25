import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface SiteHeaderProps {
  mode: 'home' | 'inner'
}

export default function SiteHeader({ mode }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const navItemClass = 'transition hover:text-white'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen ? 'bg-black/55 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8 lg:px-12">
        {mode === 'home' ? (
          <a href="#home" aria-label="Shawn Photography 首页" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <img
              src="/logo.png"
              alt="Shawn Photography Logo"
              loading="lazy"
              className="h-10 w-auto object-contain md:h-12"
            />
          </a>
        ) : (
          <Link to="/" aria-label="Shawn Photography 首页" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <img
              src="/logo.png"
              alt="Shawn Photography Logo"
              loading="lazy"
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>
        )}

        <nav className="hidden md:block">
          <ul className="flex items-center justify-center gap-4 text-sm font-medium uppercase tracking-[0.18em] text-zinc-100 md:gap-6 md:text-base">
            {mode === 'home' ? (
              <>
                <li><a href="#home" className={navItemClass}>Home</a></li>
                <li><a href="#portfolio" className={navItemClass}>Portfolio</a></li>
                <li><Link to="/about" className={navItemClass}>About Me</Link></li>
                <li><Link to="/blog" className={navItemClass}>Blog</Link></li>
                <li><a href="#contact" className={navItemClass}>Contact</a></li>
              </>
            ) : (
              <>
                <li><Link to="/" className={navItemClass}>Home</Link></li>
                <li><Link to="/#portfolio" className={navItemClass}>Portfolio</Link></li>
                <li><Link to="/about" className={navItemClass}>About Me</Link></li>
                <li><Link to="/blog" className={navItemClass}>Blog</Link></li>
                <li><Link to="/#contact" className={navItemClass}>Contact</Link></li>
              </>
            )}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-black/80 px-5 py-4 text-sm uppercase tracking-[0.22em] text-zinc-100 md:hidden">
          <ul className="flex flex-col gap-4">
            {mode === 'home' ? (
              <>
                <li><a href="#home" className={navItemClass} onClick={() => setMobileOpen(false)}>Home</a></li>
                <li><a href="#portfolio" className={navItemClass} onClick={() => setMobileOpen(false)}>Portfolio</a></li>
                <li><Link to="/about" className={navItemClass} onClick={() => setMobileOpen(false)}>About Me</Link></li>
                <li><Link to="/blog" className={navItemClass} onClick={() => setMobileOpen(false)}>Blog</Link></li>
                <li><a href="#contact" className={navItemClass} onClick={() => setMobileOpen(false)}>Contact</a></li>
              </>
            ) : (
              <>
                <li><Link to="/" className={navItemClass} onClick={() => setMobileOpen(false)}>Home</Link></li>
                <li><Link to="/#portfolio" className={navItemClass} onClick={() => setMobileOpen(false)}>Portfolio</Link></li>
                <li><Link to="/about" className={navItemClass} onClick={() => setMobileOpen(false)}>About Me</Link></li>
                <li><Link to="/#blog" className={navItemClass} onClick={() => setMobileOpen(false)}>Blog</Link></li>
                <li><Link to="/#contact" className={navItemClass} onClick={() => setMobileOpen(false)}>Contact</Link></li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
