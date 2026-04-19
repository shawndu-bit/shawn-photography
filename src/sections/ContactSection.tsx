import { useSiteContentContext } from '@/hooks/useSiteContentContext'

export default function ContactSection() {
  const { siteContent } = useSiteContentContext()
  const c = siteContent.contact

  return (
    <section id="contact" className="border-t border-white/10 px-5 py-24 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-5 text-[11px] uppercase tracking-[0.5em] text-white/40">{c.eyebrow}</p>
          <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">{c.title}</h2>
        </div>
        <a
          href={`mailto:${c.email}`}
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-4 text-sm uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
        >
          {c.email}
        </a>
      </div>
    </section>
  )
}
