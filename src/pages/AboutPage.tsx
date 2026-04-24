import { Facebook, Globe, Instagram, Mail, Youtube } from 'lucide-react'
import { useEffect, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import type { SocialLink } from '@/types'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import Footer from '@/components/Footer'

function keepLightTogether(title: string) {
  return title.replace(/\sof light$/i, ' of\u00a0light')
}

const iconByPlatform: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
}

function getSocialIcon(link: SocialLink) {
  const key = link.platform.trim().toLowerCase()
  return iconByPlatform[key] ?? Globe
}

function isDisplayableLink(link: SocialLink) {
  return link.enabled && link.href.trim().length > 0 && link.href !== '#'
}

export default function AboutPage() {
  const { siteContent } = useSiteContentContext()
  const { about, socialLinks } = siteContent

  const bioParagraphs = about.paragraphs.filter((paragraph) => paragraph.trim().length > 0).slice(0, 2)
  const firstBio =
    bioParagraphs[0]
    || 'Hi, I’m Shawn, a photographer currently based in Germany. My work focuses on natural and urban landscapes, with a particular interest in quiet light, negative space, and restrained composition.'
  const secondBio =
    bioParagraphs[1]
    || 'Shaped by travels through Australia and New Zealand, my photography is drawn to places where atmosphere, distance, and stillness become part of the image. I often look for simple visual order in complex surroundings.'

  const aboutWebsite =
    'This website brings together selected work, field notes, and photography guides. It is both a personal archive and a visual space for exploring how light, place, and memory shape the way we see.'

  const visibleSocials = socialLinks.filter(isDisplayableLink).slice(0, 6)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <main className="min-h-screen bg-carbon text-white">
        <header className="fixed inset-x-0 top-0 z-50 bg-black/55 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8 lg:px-12">
            <Link to="/" aria-label="Shawn Photography 首页" className="shrink-0">
              <img
                src="/logo.png"
                alt="Shawn Photography Logo"
                loading="lazy"
                className="h-10 w-auto object-contain md:h-12"
              />
            </Link>
            <nav>
              <ul className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium uppercase tracking-[0.18em] text-zinc-100 md:gap-6 md:text-base">
                <li><Link to="/" className="transition hover:text-white">Home</Link></li>
                <li><Link to="/#portfolio" className="transition hover:text-white">Portfolio</Link></li>
                <li><Link to="/about" className="transition hover:text-white">About Me</Link></li>
                <li><Link to="/#blog" className="transition hover:text-white">Blog</Link></li>
                <li><Link to="/#contact" className="transition hover:text-white">Contact</Link></li>
              </ul>
            </nav>
          </div>
        </header>

        <section className="relative overflow-hidden border-b border-white/8 pt-24 pb-10 md:pt-28 md:pb-12 lg:pt-32 lg:pb-14">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgba(255,255,255,0.06)_0%,transparent_65%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-carbon to-transparent" />

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-white/35">About Me</p>
            <h1 className="max-w-5xl text-balance font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {keepLightTogether(about.title)}
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-white/45 sm:text-sm">
              Based in Germany · Landscape · Urban · Nightscape
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-12 lg:px-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:self-start">
              {about.portraitImageSrc ? (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                  <img
                    src={about.portraitImageSrc}
                    alt={about.portraitImageAlt}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-3xl border border-dashed border-white/15 bg-white/[0.01]" />
              )}
            </div>

            <div className="space-y-7">
              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.36em] text-white/38">About Shawn /</p>
                <div className="space-y-4 text-base leading-8 text-white/72 sm:text-[17px] sm:leading-8">
                  <p>{firstBio}</p>
                  <p>{secondBio}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.36em] text-white/38">About the Website /</p>
                <p className="text-base leading-8 text-white/66 sm:text-[17px] sm:leading-8">{aboutWebsite}</p>
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/#contact"
                    className="inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-3 text-xs uppercase tracking-[0.3em] text-white/75 transition hover:border-white/40 hover:text-white"
                  >
                    Contact Me
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    to="/#portfolio"
                    className="inline-flex items-center rounded-full border border-white/12 px-6 py-3 text-xs uppercase tracking-[0.28em] text-white/62 transition hover:border-white/30 hover:text-white"
                  >
                    View Portfolio
                  </Link>
                  <Link
                    to="/"
                    className="ml-1 text-xs uppercase tracking-[0.3em] text-white/40 transition hover:text-white/75"
                  >
                    Back to Home
                  </Link>
                </div>

                {visibleSocials.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {visibleSocials.map((link) => {
                      const Icon = getSocialIcon(link)
                      const isMail = link.href.startsWith('mailto:')

                      return (
                        <a
                          key={link.id}
                          href={link.href}
                          aria-label={link.label}
                          title={link.label}
                          target={isMail ? undefined : '_blank'}
                          rel={isMail ? undefined : 'noopener noreferrer'}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition hover:border-white/25 hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
