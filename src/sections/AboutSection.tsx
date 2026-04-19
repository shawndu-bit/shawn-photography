import { useSiteContentContext } from '@/hooks/useSiteContentContext'

export default function AboutSection() {
  const { siteContent } = useSiteContentContext()
  const a = siteContent.about

  return (
    <section id="about" className="border-t border-white/10 px-5 py-24 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="mb-5 text-sm uppercase tracking-[0.5em] text-white/40">{a.eyebrow}</p>
          <h2 className="max-w-3xl font-display text-4xl leading-tight text-white md:text-5xl">
            {a.title}
          </h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-white/68">
          {a.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
