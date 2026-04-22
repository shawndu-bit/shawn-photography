export type PhotoCategory =
  | 'mountains'
  | 'sea_lakes'
  | 'nightscape'
  | 'forest'
  | 'city'

export interface Photo {
  id: string
  title: string
  description: string
  specifications: string
  src: string
  thumbnailSrc: string
  width: number
  height: number
  category: PhotoCategory
  alt: string
}

export interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export interface SocialLink {
  id: string
  label: string
  href: string
  platform: string
  enabled: boolean
}

export interface HeroContent {
  eyebrow: string
  title: string
  description: string
  scrollLabel: string
  imageSrc: string
  imageAlt: string
}

export interface AboutContent {
  eyebrow: string
  title: string
  portraitImageSrc: string
  portraitImageAlt: string
  paragraphs: string[]
}

export interface ContactContent {
  eyebrow: string
  title: string
  email: string
}

export interface BlogContent {
  eyebrow: string
  title: string
}

export interface BlogPost {
  id: string
  category: string
  title: string
  excerpt: string
}

export interface SiteSectionVisibility {
  hero: boolean
  portfolio: boolean
  blog: boolean
  contact: boolean
}

export interface SiteContent {
  hero: HeroContent
  about: AboutContent
  contact: ContactContent
  blog: BlogContent
  socialLinks: SocialLink[]
  blogPosts: BlogPost[]
  photos: Photo[]
  sectionVisibility: SiteSectionVisibility
}
