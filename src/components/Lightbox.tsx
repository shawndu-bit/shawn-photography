import { useEffect } from 'react'
import type { Photo } from '@/types'

interface LightboxProps {
  photo: Photo
  onClose: () => void
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 md:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
    >
      <button
        className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        ✕
      </button>
      <figure
        className="flex max-h-full max-w-[96vw] flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="max-h-[86vh] w-auto max-w-full object-contain"
        />
        <figcaption className="w-full max-w-3xl space-y-2 px-1 text-white/70">
          <p className="text-center text-[12px] uppercase tracking-[0.35em] text-white/70">
            {photo.title || 'Untitled'}
          </p>
          <p className="text-left text-[13px] leading-6 text-white/60">
            {photo.description?.trim() || '—'}
          </p>
          <p className="text-left text-[12px] tracking-[0.08em] text-white/50">
            {photo.specifications?.trim() || '—'}
          </p>
        </figcaption>
      </figure>
    </div>
  )
}
