const socials = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'Bilibili', href: '#' },
  { label: '小红书', href: '#' },
  { label: 'Behance', href: '#' },
  { label: '500px', href: '#' },
  { label: 'Email', href: 'mailto:hello@example.com' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="text-sm text-white/50 transition hover:text-white"
            >
              {s.label}
            </a>
          ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">
          &copy; 2026 Shawn Photography. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}
