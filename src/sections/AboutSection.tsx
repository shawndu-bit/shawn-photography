import { useSiteContentContext } from '@/hooks/useSiteContentContext'

export default function AboutSection() {
  const { siteContent } = useSiteContentContext()
  const a = siteContent.about

  return (
    <section id="about" className="border-t border-white/10 px-5 py-24 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:gap-12 lg:grid-cols-[1fr_auto_1.1fr] lg:items-center lg:gap-16">
        <div className="lg:pr-4">
          <p className="mb-5 text-sm uppercase tracking-[0.5em] text-white/40">{a.eyebrow}</p>
          <h2 className="max-w-xl font-display text-3xl leading-tight text-white md:text-4xl">
            {a.title}
          </h2>
        </div>

        {a.portraitImageSrc ? (
          <div className="mx-auto h-44 w-44 overflow-hidden rounded-full border border-white/15 bg-white/[0.03] sm:h-52 sm:w-52 lg:h-56 lg:w-56">
            <img
              src={a.portraitImageSrc}
              alt={a.portraitImageAlt}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="mx-auto hidden h-44 w-44 rounded-full border border-dashed border-white/10 sm:h-52 sm:w-52 lg:block lg:h-56 lg:w-56" />
        )}

        <div className="space-y-5 text-base leading-8 text-white/68 lg:pl-2">
          {a.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
