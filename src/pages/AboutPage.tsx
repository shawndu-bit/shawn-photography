import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const { siteContent } = useSiteContentContext()
  const { about } = siteContent

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])

  return (
    <>
      <main className="min-h-screen bg-carbon">
        {/* ── Hero banner ────────────────────────────────── */}
        <section className="relative flex min-h-[55vh] items-end overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-carbon via-carbon/60 to-carbon" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

          <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-32 lg:px-12">
            <p className="mb-3 text-xs uppercase tracking-[0.55em] text-white/30">
              {about.eyebrow}
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
              {about.title}
            </h1>
          </div>
        </section>

        {/* ── Body ───────────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
            {/* Sidebar nav / decoration */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="h-px w-12 bg-white/20" />
                <nav className="mt-8 flex flex-col gap-4">
                  <a
                    href="#story"
                    className="text-sm uppercase tracking-[0.35em] text-white/35 transition hover:text-white/70"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Story
                  </a>
                  <a
                    href="#approach"
                    className="text-sm uppercase tracking-[0.35em] text-white/35 transition hover:text-white/70"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('approach')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Approach
                  </a>
                  <Link
                    to="/#contact"
                    className="text-sm uppercase tracking-[0.35em] text-white/35 transition hover:text-white/70"
                  >
                    Contact
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main paragraphs */}
            <div id="story">
              <div className="space-y-7">
                {about.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className={`leading-relaxed text-white/70 ${
                      i === 0
                        ? 'text-lg sm:text-xl'
                        : 'text-base sm:text-[17px]'
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Divider */}
              <div className="my-16 h-px w-full bg-white/8" />

              {/* Approach block */}
              <div id="approach">
                <p className="mb-4 text-xs uppercase tracking-[0.5em] text-white/30">Approach</p>
                <p className="max-w-prose text-base leading-relaxed text-white/55">
                  Every image begins long before the shutter fires — in the stillness of waiting,
                  in the study of light across a landscape, in the patience to let a scene reveal
                  itself. I work with available light, minimal gear, and maximum presence.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-16">
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-3.5 text-sm uppercase tracking-[0.35em] text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Get in Touch
                  <span className="text-white/40">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Selected work teaser ───────────────────────── */}
        <section className="border-t border-white/8 py-16 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="flex items-end justify-between">
              <p className="text-xs uppercase tracking-[0.5em] text-white/30">Selected Work</p>
              <Link
                to="/#work"
                className="text-sm uppercase tracking-[0.35em] text-white/40 transition hover:text-white"
              >
                View All →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
