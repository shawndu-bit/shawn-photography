import { Facebook, Globe, Instagram, Mail, Youtube } from 'lucide-react'
import { useEffect, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'

function keepLightTogether(title: string) {
  return title.replace(/\sof light$/i, ' of\u00a0light')
}

function getAboutCopy(paragraphs: string[]) {
  const selected = paragraphs.filter((paragraph) => paragraph.trim().length > 0).slice(0, 2)

  return {
    firstBio:
      selected[0]
      || 'Hi, I’m Shawn, a photographer currently based in Germany. My work focuses on natural and urban landscapes, with a particular interest in quiet light, negative space, and restrained composition.',
    secondBio:
      selected[1]
      || 'Shaped by travels through Australia and New Zealand, my photography is drawn to places where atmosphere, distance, and stillness become part of the image. I often look for simple visual order in complex surroundings.',
    aboutWebsite:
      'This website brings together selected work, field notes, and photography guides. It is both a personal archive and a visual space for exploring how light, place, and memory shape the way we see.',
  }
}

export default function AboutPage() {
  const { siteContent } = useSiteContentContext()
  const { about } = siteContent
  const { firstBio, secondBio, aboutWebsite } = getAboutCopy(about.paragraphs)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <main className="bg-carbon text-white">
        <SiteHeader mode="inner" />

        <section className="relative overflow-hidden border-b border-white/8 pt-22 pb-8 md:pt-24 md:pb-10 lg:pt-28 lg:pb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgba(255,255,255,0.06)_0%,transparent_65%)]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-carbon to-transparent" />

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
            <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/35">About Me</p>
            <h1 className="max-w-5xl text-balance font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {keepLightTogether(about.title)}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/45 sm:text-sm">
              Based in Germany · Landscape · Urban · Nightscape
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-7 md:py-8 lg:px-12 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-10">
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

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.36em] text-white/38">About Shawn /</p>
                <div className="space-y-3 text-base leading-7 text-white/72 sm:text-[17px] sm:leading-8">
                  <p>{firstBio}</p>
                  <p>{secondBio}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.36em] text-white/38">About the Website /</p>
                <p className="text-base leading-7 text-white/66 sm:text-[17px] sm:leading-8">{aboutWebsite}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
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
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
