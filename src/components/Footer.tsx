import {
  Aperture,
  Briefcase,
  Circle,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MonitorPlay,
  Sparkles,
  Youtube,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { SocialLink } from '@/types'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'

const iconByPlatform: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  bilibili: MonitorPlay,
  xiaohongshu: Sparkles,
  behance: Briefcase,
  '500px': Aperture,
  email: Mail,
}

function getIcon(link: SocialLink) {
  const key = link.platform.trim().toLowerCase()
  return iconByPlatform[key] ?? (key ? Globe : Circle)
}

export default function Footer() {
  const { siteContent } = useSiteContentContext()
  const links = siteContent.socialLinks.filter((link) => link.enabled)

  return (
    <footer className="border-t border-white/10 px-5 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
          {links.map((link) => {
            const Icon = getIcon(link)
            const isMail = link.href.startsWith('mailto:')

            return (
              <a
                key={link.id}
                href={link.href}
                aria-label={link.label}
                title={link.label}
                target={isMail ? undefined : '_blank'}
                rel={isMail ? undefined : 'noopener noreferrer'}
                className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/55 transition hover:border-white/25 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70 opacity-0 transition group-hover:opacity-100">
                  {link.label}
                </span>
              </a>
            )
          })}
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">
          &copy; 2026 Shawn Photography. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}
