import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from './components/Footer'
import Lightbox from './components/Lightbox'
import SiteHeader from './components/SiteHeader'
import { useSiteContentContext } from './hooks/useSiteContentContext'
import AboutSection from './sections/AboutSection'
import BlogSection from './sections/BlogSection'
import ContactSection from './sections/ContactSection'
import HeroSection from './sections/HeroSection'
import PortfolioSection from './sections/PortfolioSection'
import type { Photo } from './types'

export default function App() {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)
  const { siteContent } = useSiteContentContext()

  useEffect(() => {
    const preventContext = (event: MouseEvent) => event.preventDefault()
    window.addEventListener('contextmenu', preventContext)
    return () => window.removeEventListener('contextmenu', preventContext)
  }, [])

  return (
    <div className="bg-carbon text-white">
      <SiteHeader mode="home" />

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
