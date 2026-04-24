import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const { siteContent } = useSiteContentContext()
  const { about } = siteContent
  const [intro, ...bodyParagraphs] = about.paragraphs

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <main className="min-h-screen bg-carbon text-white">
        <section className="relative overflow-hidden border-b border-white/8 pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgba(255,255,255,0.06)_0%,transparent_65%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-carbon to-transparent" />

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
            <p className="mb-5 text-xs uppercase tracking-[0.5em] text-white/35">About Me</p>
            <h1 className="max-w-4xl font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {about.title}
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-14 md:py-16 lg:px-12 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(260px,320px)_1fr] lg:gap-16">
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

            <div>
              {intro && (
                <p className="max-w-3xl text-lg leading-8 text-white/82 sm:text-xl sm:leading-9">
                  {intro}
                </p>
              )}

              {bodyParagraphs.length > 0 && (
                <div className="mt-8 space-y-5 text-base leading-8 text-white/68 sm:text-[17px]">
                  {bodyParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}

              <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                <p className="mb-3 text-xs uppercase tracking-[0.42em] text-white/35">Visual Approach</p>
                <p className="max-w-3xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                  I focus on patient observation, natural light, and restrained compositions. The goal is
                  to preserve the atmosphere of a place rather than forcing spectacle—images that stay
                  calm on first look and reveal more detail over time.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-4">
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-3 text-xs uppercase tracking-[0.3em] text-white/75 transition hover:border-white/40 hover:text-white"
                >
                  Contact Me
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/"
                  className="text-xs uppercase tracking-[0.3em] text-white/45 transition hover:text-white/80"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
