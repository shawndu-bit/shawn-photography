import { useSiteContentContext } from '@/hooks/useSiteContentContext'
import type { Photo } from '@/types'

interface Props {
  onPhotoClick: (photo: Photo) => void
}

export default function PortfolioSection({ onPhotoClick }: Props) {
  const { siteContent } = useSiteContentContext()
  const photos = siteContent.photos

  return (
    <section id="portfolio" className="bg-carbon px-1 pb-1 pt-1">
      <div className="masonry">
        {photos.map((photo) => (
          <article
            key={photo.id}
            className="masonry-item group relative cursor-zoom-in overflow-hidden"
            onClick={() => onPhotoClick(photo)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onPhotoClick(photo)
            }}
            tabIndex={0}
            role="button"
            aria-label={`Open ${photo.title}`}
          >
            <div className="relative overflow-hidden">
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/45" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
                <span className="font-body text-[11px] uppercase tracking-[0.38em] text-white">
                  {photo.title}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
