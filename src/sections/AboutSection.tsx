import { Link } from 'react-router-dom'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'

export default function AboutSection() {
  const { siteContent } = useSiteContentContext()
  const a = siteContent.about

  const intro = a.paragraphs[0] ?? ''

  return (
    <section id="about" className="border-t border-white/10 px-5 py-24 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:gap-12 lg:grid-cols-[1fr_auto_1.1fr] lg:items-center lg:gap-16">
        <div className="lg:pr-4">
          <p className="mb-5 text-sm uppercase tracking-[0.5em] text-white/40">{a.eyebrow}</p>
          <h2 className="max-w-xl font-display text-3xl leading-tight text-white md:text-4xl">
            <Link to="/about" className="transition hover:text-white/85">
              {a.title}
            </Link>
          </h2>
        </div>

        {a.portraitImageSrc ? (
          <Link
            to="/about"
            className="mx-auto block h-44 w-44 overflow-hidden rounded-full border border-white/15 bg-white/[0.03] transition hover:border-white/35 sm:h-52 sm:w-52 lg:h-56 lg:w-56"
            aria-label="Read more about me"
          >
            <img
              src={a.portraitImageSrc}
              alt={a.portraitImageAlt}
              className="h-full w-full object-cover object-center"
            />
          </Link>
        ) : (
          <Link
            to="/about"
            aria-label="Read more about me"
            className="mx-auto hidden h-44 w-44 rounded-full border border-dashed border-white/10 transition hover:border-white/30 sm:h-52 sm:w-52 lg:block lg:h-56 lg:w-56"
          />
        )}

        <div className="space-y-5 text-base leading-8 text-white/68 lg:pl-2">
          <p>{intro}</p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/55 transition hover:text-white"
          >
            Read more about me
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
