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

export interface AboutGearItem {
  id: string
  name: string
  description: string
  imageUrl: string
  imageAlt: string
}

export interface AboutPageGear {
  title: string
  intro: string
  items: AboutGearItem[]
}

export interface AboutPageContent {
  eyebrow: string
  title: string
  subtitle: string
  bioHeading: string
  bioParagraphs: string[]
  websiteHeading: string
  websiteParagraph: string
  contactButtonText: string
  contactButtonLink: string
  portfolioButtonText: string
  portfolioButtonLink: string
  backLinkText: string
  backLinkUrl: string
  gear?: AboutPageGear
}

export interface AboutContent {
  eyebrow: string
  title: string
  portraitImageSrc: string
  portraitImageAlt: string
  paragraphs: string[]
  page?: AboutPageContent
}

export interface ContactContent {
  eyebrow: string
  title: string
  email: string
}

export interface BlogContent {
  eyebrow: string
  title: string
  subtitle: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  coverImageAlt: string
  content: string
  category: string
  published: boolean
  featuredOnHomepage: boolean
  publishedAt: string
  updatedAt: string
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
