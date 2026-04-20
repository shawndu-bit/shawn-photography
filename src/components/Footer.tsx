import {
  Circle,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Youtube,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { SocialLink } from '@/types'
import { useSiteContentContext } from '@/hooks/useSiteContentContext'

const PUBLIC_SOCIAL_ORDER = ['instagram', 'tiktok', 'facebook', 'youtube', 'email'] as const
const PUBLIC_SOCIAL_SET = new Set<string>(PUBLIC_SOCIAL_ORDER)

const iconByPlatform: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: TikTokIcon,
  facebook: Facebook,
  youtube: Youtube,
  bilibili: BilibiliIcon,
  xiaohongshu: XiaohongshuIcon,
  behance: BehanceIcon,
  '500px': FiveHundredPxIcon,
  email: Mail,
}

function XiaohongshuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M7.2 9.2h2.5L8.5 14" />
      <path d="M12.1 9.2h2.6l-2.1 4.8h3.2" />
      <path d="M15.5 16h1.3" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.2 5v8.7a4.1 4.1 0 1 1-3-3.9" />
      <path d="M13.2 6.2c.9 1.3 2 2.2 3.8 2.4V12c-1.6 0-2.9-.4-3.8-1.2" />
    </svg>
  )
}

function BilibiliIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 5.5 7.2 3.7M15 5.5l1.8-1.8" />
      <rect x="4" y="6.5" width="16" height="12" rx="3" />
      <path d="M9 12h.01M15 12h.01" />
      <path d="M8.5 15c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2" />
    </svg>
  )
}

function BehanceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 8.5h6a2.5 2.5 0 0 1 0 5H4z" />
      <path d="M4 13.5h6.5a2.5 2.5 0 0 1 0 5H4z" />
      <path d="M13.2 10h6.2M13 16.2c.6 1.2 1.8 1.8 3.2 1.8 1.3 0 2.4-.5 3.2-1.4" />
      <path d="M13.2 14.3h6.1c0-2.1-1.2-3.5-3.1-3.5s-3 1.4-3 3.6v.5z" />
    </svg>
  )
}

function FiveHundredPxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 9.5h3.7v2.2H5.8v2h1.7c1.4 0 2.3.9 2.3 2.2 0 1.4-1 2.3-2.4 2.3H4.2" />
      <circle cx="12.5" cy="15.1" r="3.1" />
      <path d="M16.3 8.8h4.4M18.5 8.8V19" />
      <path d="M21 14.4h-2.5" />
    </svg>
  )
}

function getIcon(link: SocialLink) {
  const key = link.platform.trim().toLowerCase()
  return iconByPlatform[key] ?? (key ? Globe : Circle)
}

function isDisplayableLink(link: SocialLink) {
  return link.enabled && link.href.trim().length > 0
}

export default function Footer() {
  const { siteContent } = useSiteContentContext()
  const links = siteContent.socialLinks.filter(isDisplayableLink)

  return (
    <footer className="border-t border-white/10 px-5 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
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
                className="group relative inline-flex h-11 w-11 items-center justify-center text-white/60 transition hover:text-white"
              >
                <Icon className="h-8 w-8" />
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
