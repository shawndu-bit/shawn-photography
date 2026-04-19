export type PhotoCategory =
  | 'mountains'
  | 'ocean'
  | 'nightscape'
  | 'desert'
  | 'forest'

export interface Photo {
  id: string
  title: string
  src: string
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
  label: string
  href: string
  icon: string
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
  blogPosts: BlogPost[]
  photos: Photo[]
  sectionVisibility: SiteSectionVisibility
}
