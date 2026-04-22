import { useSiteContentContext } from '@/hooks/useSiteContentContext'

export default function HeroSection() {
  const { siteContent, hydrated } = useSiteContentContext()
  const h = siteContent.hero
  const showHeroImage = hydrated && Boolean(h.imageSrc)

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {showHeroImage ? (
        <img
          src={h.imageSrc}
          alt={h.imageAlt}
          width={1800}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
        />
      ) : (
        <div className="absolute inset-0 bg-black" aria-hidden="true" />
      )}
      <div className="hero-overlay absolute inset-0" />

      <div className="relative flex min-h-screen items-end px-5 pb-20 pt-32 md:px-8 lg:px-12">
        <div className="max-w-3xl animate-fadeUp">
          <p className="mb-6 text-sm uppercase tracking-[0.5em] text-white/60">
            {h.eyebrow}
          </p>
          <h1 className="font-display text-5xl leading-[1.08] text-white sm:text-6xl lg:text-8xl">
            {h.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/70">
            {h.description}
          </p>
        </div>
      </div>

      <a
        href="#portfolio"
        className="absolute bottom-6 right-6 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/60 transition hover:text-white md:bottom-8 md:right-10 md:gap-2.5 md:text-[11px] md:tracking-[0.32em]"
        aria-label="Scroll to portfolio"
      >
        <span>{h.scrollLabel}</span>
        <span className="animate-floatArrow text-base">↓</span>
      </a>
    </section>
  )
}
