import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Facebook,
  Instagram,
  Mail,
  PlaySquare,
  Sparkles,
  Tv,
  Video,
  Waves
} from 'lucide-react';

type Photo = {
  title: string;
  alt: string;
  url: string;
};

const photos: Photo[] = [
  { title: 'Icelandic Sunset', alt: '冰岛日落', url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1500&q=80' },
  { title: 'Glacial Silence', alt: '冰川和山峰', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Moonlit Peaks', alt: '月夜雪山', url: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Morning Fjord', alt: '峡湾晨雾', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1300&q=80' },
  { title: 'Northern Veil', alt: '极光', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80' },
  { title: 'Desert Waves', alt: '沙漠纹理', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80' },
  { title: 'Emerald Coast', alt: '海岸浪花', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1500&q=80' },
  { title: 'Valley Echo', alt: '山谷', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Frozen River', alt: '冰河', url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1100&q=80' }
];

export default function App() {
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    const preventContext = (event: MouseEvent) => event.preventDefault();
    const preventDrag = (event: DragEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'IMG') {
        event.preventDefault();
      }
    };

    window.addEventListener('contextmenu', preventContext);
    window.addEventListener('dragstart', preventDrag);

    return () => {
      window.removeEventListener('contextmenu', preventContext);
      window.removeEventListener('dragstart', preventDrag);
    };
  }, []);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selected]);

  const socialLinks = useMemo(
    () => [
      { label: 'Instagram', icon: Instagram },
      { label: 'Facebook', icon: Facebook },
      { label: 'YouTube', icon: PlaySquare },
      { label: 'Bilibili', icon: Tv },
      { label: '小红书', icon: Sparkles },
      { label: 'Email', icon: Mail, href: 'mailto:hello@shawnphotography.com' },
      { label: 'Behance', icon: BadgeCheck },
      { label: '500px', icon: Waves }
    ],
    []
  );

  return (
    <div className="bg-carbon text-white">
      <header className="fixed inset-x-0 top-0 z-30 flex flex-col items-center justify-between gap-2 bg-transparent px-4 py-4 backdrop-blur-[1px] md:flex-row md:px-8">
        <a href="#home" aria-label="Shawn Photography 首页" className="shrink-0">
          <img
            src="/logo.png"
            alt="Shawn Photography Logo"
            loading="lazy"
            className="h-9 w-auto object-contain md:h-10"
          />
        </a>
        <nav>
          <ul className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase text-zinc-200 md:gap-4">
            <li><a href="#home" className="hover:text-white">Home</a></li>
            <li className="group relative">
              <a href="#portfolio" className="hover:text-white">Portfolio</a>
              <ul className="invisible absolute left-0 top-5 min-w-32 border border-white/10 bg-carbon/90 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <li><a href="#portfolio" className="block px-3 py-2 hover:bg-white/5">Mountains</a></li>
                <li><a href="#portfolio" className="block px-3 py-2 hover:bg-white/5">Seascapes</a></li>
                <li><a href="#portfolio" className="block px-3 py-2 hover:bg-white/5">Aurora</a></li>
              </ul>
            </li>
            <li><a href="#about" className="hover:text-white">About Me</a></li>
            <li><a href="#blog" className="hover:text-white">Blog</a></li>
            <li><a href="#contact" className="hover:text-white">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="home" className="relative h-screen min-h-[32rem] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80"
            alt="雪山与云海"
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35" />
          <button
            className="absolute bottom-5 left-1/2 -translate-x-1/2 animate-breathe text-2xl"
            aria-label="向下滚动到作品集"
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ↓
          </button>
        </section>

        <section id="portfolio" className="columns-1 gap-1 bg-carbonSoft p-1 sm:columns-2 xl:columns-4">
          {photos.map((photo) => (
            <button
              key={photo.title}
              type="button"
              className="group relative mb-1 block w-full cursor-zoom-in break-inside-avoid overflow-hidden bg-transparent p-0 text-left"
              onClick={() => setSelected(photo)}
            >
              <img src={photo.url} alt={photo.alt} loading="lazy" className="w-full" />
              <span className="absolute inset-0 grid place-items-center bg-black/40 text-base opacity-0 transition group-hover:opacity-100">
                {photo.title}
              </span>
            </button>
          ))}
        </section>

        <section id="about" className="mx-auto max-w-5xl border-t border-white/10 px-5 py-20 text-zinc-200">
          <h2 className="mb-3 text-xl text-white">About Me</h2>
          <p>风光摄影师，专注自然与光影叙事。</p>
        </section>

        <section id="blog" className="mx-auto max-w-5xl border-t border-white/10 px-5 py-20 text-zinc-200">
          <h2 className="mb-3 text-xl text-white">Blog</h2>
          <p>近期拍摄日志与创作思考。</p>
        </section>

        <section id="contact" className="mx-auto max-w-5xl border-t border-white/10 px-5 py-20 text-zinc-200">
          <h2 className="mb-3 text-xl text-white">Contact</h2>
          <p>邮箱：hello@shawnphotography.com</p>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-10 text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-3">
          {socialLinks.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href ?? '#'}
              aria-label={label}
              className="flex items-center gap-1.5 text-zinc-400 transition hover:text-white"
            >
              <Icon size={15} />
              <span className="text-sm">{label}</span>
            </a>
          ))}
        </div>
        <p className="text-xs text-zinc-400">© 2026 Shawn Photography. All Rights Reserved.</p>
      </footer>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4 py-8"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.currentTarget === event.target) {
              setSelected(null);
            }
          }}
        >
          <button
            className="absolute right-4 top-4 text-4xl leading-none text-white"
            aria-label="关闭"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <img src={selected.url} alt={selected.alt} className="max-h-[84vh] max-w-[95vw] object-contain" />
          <p className="mt-3 text-zinc-300">{selected.title}</p>
        </div>
      )}
    </div>
  );
}
