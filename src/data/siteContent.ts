import type { SiteContent } from '@/types'
import { heroImage, photos } from '@/data/photos'

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: 'Fine Art Landscape Photography',
    title: 'Light, Silence, and Distance.',
    description:
      '以极简、沉浸、画廊式的视觉语言记录山川、海岸、冰原与夜幕之间稍纵即逝的光线。',
    scrollLabel: 'Scroll',
    imageSrc: heroImage.src,
    imageAlt: heroImage.alt,
  },
  about: {
    eyebrow: 'About Me',
    title: '在极端天气与边界光线中，寻找风景最安静的瞬间。',
    paragraphs: [
      '我专注于山地、海岸、荒野与夜景创作，以大画幅般的秩序感与留白控制，让每一张作品都像展墙上的独立叙事。',
      '网站当前以展示为主，后续可无缝扩展博客、作品管理、访客留言、商业合作表单与会员系统，并接入 Neon 与 Cloudflare R2 形成完整内容架构。',
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: '开放商业合作、品牌拍摄、作品授权与定制印刷。',
    email: 'hello@example.com',
  },
  blogPosts: [
    {
      id: '1',
      category: 'Field Notes',
      title: '暴风雪前的蓝调窗口',
      excerpt: '记录在高海拔等待天气裂开的一小时，以及如何判断山脊上最后一束可用侧光。',
    },
    {
      id: '2',
      category: 'Gear',
      title: '长曝与海岸线构图方法',
      excerpt: '关于 ND 镜、快门时长、前景节奏，以及如何避免“平滑海面”变成没有信息量的空白。',
    },
    {
      id: '3',
      category: 'Travel',
      title: '冰岛冬季路线初稿',
      excerpt: '从追光路线、天气窗口到住宿密度，整理一套更适合摄影师而不是游客的行程逻辑。',
    },
  ],
  photos,
  sectionVisibility: {
    hero: true,
    portfolio: true,
    blog: true,
    contact: true,
  },
}
