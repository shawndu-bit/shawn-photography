import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import Footer from '@/components/Footer'

function keepLightTogether(title: string) {
  return title.replace(/\sof light$/i, ' of\u00a0light')
}

export default function AboutPage() {
  const { siteContent } = useSiteContentContext()
  const { about, socialLinks } = siteContent
  const [intro, ...bodyParagraphs] = about.paragraphs

  const visibleSocials = useMemo(
    () => socialLinks.filter((item) => item.enabled && item.href && item.href !== '#').slice(0, 6),
    [socialLinks],
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <main className="min-h-screen bg-carbon text-white">
        <section className="relative overflow-hidden border-b border-white/8 pt-28 pb-14 md:pt-32 md:pb-16 lg:pt-36 lg:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgba(255,255,255,0.06)_0%,transparent_65%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-carbon to-transparent" />

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
            <p className="mb-5 text-xs uppercase tracking-[0.5em] text-white/35">About Me</p>
            <h1 className="max-w-5xl text-balance font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {keepLightTogether(about.title)}
            </h1>
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-white/45 sm:text-sm">
              Based in Germany · Landscape · Urban · Nightscape
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-14 md:py-16 lg:px-12 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
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

            <div className="space-y-10">
              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.36em] text-white/38">About Shawn /</p>
                <div className="space-y-5 text-base leading-8 text-white/72 sm:text-[17px] sm:leading-8">
                  <p>
                    {intro || 'Hi, I’m Shawn, a photographer currently based in Germany. My work focuses on natural and urban landscapes, with a particular interest in quiet light, negative space, and restrained composition.'}
                  </p>
                  {bodyParagraphs.length > 0 ? (
                    bodyParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <>
                      <p>
                        Shaped by travels through Australia and New Zealand, my photography is drawn to
                        places where atmosphere, distance, and stillness become part of the image. I often
                        look for simple visual order in complex surroundings: a mountain line, a city skyline,
                        a reflection on water, or the last light before night.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.36em] text-white/38">About the Website /</p>
                <p className="text-base leading-8 text-white/66 sm:text-[17px] sm:leading-8">
                  This website brings together selected work, field notes, and photography guides. It is
                  both a personal archive and a visual space for exploring how light, place, and memory can
                  shape the way we see.
                </p>
              </div>

              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.36em] text-white/38">Contact /</p>
                <p className="max-w-3xl text-base leading-8 text-white/66 sm:text-[17px] sm:leading-8">
                  For collaborations, image licensing, prints, or selected projects, please feel free to get
                  in touch.
                </p>

                <div className="mt-7 border-t border-white/10 pt-6">
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
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      {visibleSocials.map((item) => (
                        <a
                          key={item.id}
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                          className="text-xs uppercase tracking-[0.26em] text-white/45 transition hover:text-white/85"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
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
