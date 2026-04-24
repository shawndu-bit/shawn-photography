import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface SiteHeaderProps {
  mode: 'home' | 'inner'
}

export default function SiteHeader({ mode }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItemClass = 'transition hover:text-white'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/55 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8 lg:px-12">
        {mode === 'home' ? (
          <a href="#home" aria-label="Shawn Photography 首页" className="shrink-0">
            <img
              src="/logo.png"
              alt="Shawn Photography Logo"
              loading="lazy"
              className="h-10 w-auto object-contain md:h-12"
            />
          </a>
        ) : (
          <Link to="/" aria-label="Shawn Photography 首页" className="shrink-0">
            <img
              src="/logo.png"
              alt="Shawn Photography Logo"
              loading="lazy"
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>
        )}

        <nav>
          <ul className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium uppercase tracking-[0.18em] text-zinc-100 md:gap-6 md:text-base">
            {mode === 'home' ? (
              <>
                <li><a href="#home" className={navItemClass}>Home</a></li>
                <li><a href="#portfolio" className={navItemClass}>Portfolio</a></li>
                <li><Link to="/about" className={navItemClass}>About Me</Link></li>
                <li><a href="#blog" className={navItemClass}>Blog</a></li>
                <li><a href="#contact" className={navItemClass}>Contact</a></li>
              </>
            ) : (
              <>
                <li><Link to="/" className={navItemClass}>Home</Link></li>
                <li><Link to="/#portfolio" className={navItemClass}>Portfolio</Link></li>
                <li><Link to="/about" className={navItemClass}>About Me</Link></li>
                <li><Link to="/#blog" className={navItemClass}>Blog</Link></li>
                <li><Link to="/#contact" className={navItemClass}>Contact</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
