import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import Lightbox from './components/Lightbox'
import { SiteContentContext } from './context/SiteContentContext'
import { useSiteContent } from './hooks/useSiteContent'
import AboutSection from './sections/AboutSection'
import BlogSection from './sections/BlogSection'
import ContactSection from './sections/ContactSection'
import HeroSection from './sections/HeroSection'
import PortfolioSection from './sections/PortfolioSection'
import type { Photo } from './types'

export default function App() {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)
  const { siteContent, hydrated, saveContent, resetContent } = useSiteContent()

  useEffect(() => {
    const preventContext = (event: MouseEvent) => event.preventDefault()
    window.addEventListener('contextmenu', preventContext)
    return () => window.removeEventListener('contextmenu', preventContext)
  }, [])

  return (
    <SiteContentContext.Provider value={{ siteContent, hydrated, saveContent, resetContent }}>
      <div className="bg-carbon text-white">
        <header className="fixed inset-x-0 top-0 z-50 bg-white/[0.02] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8 lg:px-12">
            <a
              href="#home"
              className="font-display text-base tracking-[0.45em] text-white transition hover:text-white/70"
            >
              SHAWN
            </a>
            <nav>
              <ul className="flex items-center gap-5 text-[11px] uppercase tracking-[0.35em] text-white/65 md:gap-8">
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
    </SiteContentContext.Provider>
  )
}
