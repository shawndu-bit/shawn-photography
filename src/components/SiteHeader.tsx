import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'

const PORTFOLIO_ALBUM_IDS = ['featured', 'mountains', 'sea_lakes', 'city', 'forest', 'nightscape'] as const
const PORTFOLIO_FALLBACK_LABELS: Record<string, string> = {
  featured: 'Featured Works',
  mountains: 'Mountains',
  sea_lakes: 'Sea & Lakes',
  city: 'City',
  forest: 'Forest',
  nightscape: 'Nightscape',
}

function formatAlbumId(albumId: string) {
  return albumId.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getPortfolioAlbumLabel(albumId: string, details: Record<string, { title?: string; albumName?: string }>) {
  const detail = details[albumId]
  return (
    detail?.title?.trim()
    || detail?.albumName?.trim()
    || PORTFOLIO_FALLBACK_LABELS[albumId]
    || formatAlbumId(albumId)
  )
}

interface SiteHeaderProps {
  mode: 'home' | 'inner'
}

export default function SiteHeader({ mode }: SiteHeaderProps) {
  const { siteContent } = useSiteContentContext()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false)
  const portfolioDetails = siteContent.portfolio?.albumDetails ?? {}

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
        setMobilePortfolioOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!mobileOpen) setMobilePortfolioOpen(false)
  }, [mobileOpen])

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
                <li className="group relative">
                  <Link to="/portfolio" className={navItemClass}>Portfolio</Link>
                  <div className="invisible absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-xl border border-white/15 bg-[#131313]/95 p-2 opacity-0 shadow-xl shadow-black/35 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-white/85">
                      {PORTFOLIO_ALBUM_IDS.map((albumId) => (
                        <li key={albumId}>
                          <Link
                            to={`/portfolio?album=${albumId}`}
                            className="block rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-white"
                          >
                            {getPortfolioAlbumLabel(albumId, portfolioDetails)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li><Link to="/about" className={navItemClass}>About Me</Link></li>
                <li><Link to="/blog" className={navItemClass}>Blog</Link></li>
                <li><a href="#contact" className={navItemClass}>Contact</a></li>
              </>
            ) : (
              <>
                <li><Link to="/" className={navItemClass}>Home</Link></li>
                <li className="group relative">
                  <Link to="/portfolio" className={navItemClass}>Portfolio</Link>
                  <div className="invisible absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-xl border border-white/15 bg-[#131313]/95 p-2 opacity-0 shadow-xl shadow-black/35 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-white/85">
                      {PORTFOLIO_ALBUM_IDS.map((albumId) => (
                        <li key={albumId}>
                          <Link
                            to={`/portfolio?album=${albumId}`}
                            className="block rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-white"
                          >
                            {getPortfolioAlbumLabel(albumId, portfolioDetails)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
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
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left transition hover:text-white"
                    onClick={() => setMobilePortfolioOpen((value) => !value)}
                    aria-expanded={mobilePortfolioOpen}
                  >
                    <span>Portfolio</span>
                    <span className="text-xs">{mobilePortfolioOpen ? '−' : '+'}</span>
                  </button>
                  {mobilePortfolioOpen && (
                    <ul className="mt-2 space-y-2 border-l border-white/15 pl-4 text-[11px]">
                      {PORTFOLIO_ALBUM_IDS.map((albumId) => (
                        <li key={albumId}>
                          <Link
                            to={`/portfolio?album=${albumId}`}
                            className={navItemClass}
                            onClick={() => {
                              setMobileOpen(false)
                              setMobilePortfolioOpen(false)
                            }}
                          >
                            {getPortfolioAlbumLabel(albumId, portfolioDetails)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                <li><Link to="/about" className={navItemClass} onClick={() => setMobileOpen(false)}>About Me</Link></li>
                <li><Link to="/blog" className={navItemClass} onClick={() => setMobileOpen(false)}>Blog</Link></li>
                <li><a href="#contact" className={navItemClass} onClick={() => setMobileOpen(false)}>Contact</a></li>
              </>
            ) : (
              <>
                <li><Link to="/" className={navItemClass} onClick={() => setMobileOpen(false)}>Home</Link></li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left transition hover:text-white"
                    onClick={() => setMobilePortfolioOpen((value) => !value)}
                    aria-expanded={mobilePortfolioOpen}
                  >
                    <span>Portfolio</span>
                    <span className="text-xs">{mobilePortfolioOpen ? '−' : '+'}</span>
                  </button>
                  {mobilePortfolioOpen && (
                    <ul className="mt-2 space-y-2 border-l border-white/15 pl-4 text-[11px]">
                      {PORTFOLIO_ALBUM_IDS.map((albumId) => (
                        <li key={albumId}>
                          <Link
                            to={`/portfolio?album=${albumId}`}
                            className={navItemClass}
                            onClick={() => {
                              setMobileOpen(false)
                              setMobilePortfolioOpen(false)
                            }}
                          >
                            {getPortfolioAlbumLabel(albumId, portfolioDetails)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
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
