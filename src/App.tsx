import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import Lightbox from './components/Lightbox'
import { useSiteContentContext } from './hooks/useSiteContentContext'
import AboutSection from './sections/AboutSection'
import BlogSection from './sections/BlogSection'
import ContactSection from './sections/ContactSection'
import HeroSection from './sections/HeroSection'
import PortfolioSection from './sections/PortfolioSection'
import type { Photo } from './types'

export default function App() {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { siteContent } = useSiteContentContext()

  useEffect(() => {
    const preventContext = (event: MouseEvent) => event.preventDefault()
    window.addEventListener('contextmenu', preventContext)
    return () => window.removeEventListener('contextmenu', preventContext)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-carbon text-white">
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
            scrolled ? 'bg-black/55 backdrop-blur-xl' : 'bg-transparent'
          }`}
        >
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8 lg:px-12">
            <a href="#home" aria-label="Shawn Photography 首页" className="shrink-0">
              <img
                src="/logo.png"
                alt="Shawn Photography Logo"
                loading="lazy"
                className="h-10 w-auto object-contain md:h-12"
              />
            </a>
            <nav>
              <ul className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium uppercase tracking-[0.18em] text-zinc-100 md:gap-6 md:text-base">
                <li><a href="#home" className="transition hover:text-white">Home</a></li>
                <li><a href="#portfolio" className="transition hover:text-white">Portfolio</a></li>
                <li><a href="#about" className="transition hover:text-white">About Me</a></li>
                <li><a href="#blog" className="transition hover:text-white">Blog</a></li>
                <li><a href="#contact" className="transition hover:text-white">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <main>
          {siteContent.sectionVisibility.hero && <HeroSection />}
          {siteContent.sectionVisibility.portfolio && (
            <PortfolioSection onPhotoClick={setActivePhoto} />
          )}
          <AboutSection />
          {siteContent.sectionVisibility.blog && <BlogSection />}
          {siteContent.sectionVisibility.contact && <ContactSection />}
        </main>

        <Footer />

        {activePhoto && (
          <Lightbox
            photo={activePhoto}
            onClose={() => setActivePhoto(null)}
          />
        )}
    </div>
  )
}
