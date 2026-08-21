'use client'

/**
 * Full-screen image viewer for the configurator gallery. Extracted from the
 * product page so the page itself stays focused on layout and state.
 */

import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ProductImageData } from '@/types'

const GOLD = '#D4AF37'

interface Props {
  images: ProductImageData[]
  index: number
  productName: string
  onIndexChange: (index: number) => void
  onClose: () => void
}

export function ImageLightbox({
  images,
  index,
  productName,
  onIndexChange,
  onClose,
}: Props) {
  const total = images.length

  const prev = useCallback(() => {
    onIndexChange((index - 1 + total) % total)
  }, [index, total, onIndexChange])

  const next = useCallback(() => {
    onIndexChange((index + 1) % total)
  }, [index, total, onIndexChange])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  const current = images[index]
  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        type="button"
        className="absolute top-4 right-4 rounded-full p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        <X className="h-7 w-7" />
      </button>

      {total > 1 && (
        <button
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-9 w-9" />
        </button>
      )}

      <div
        className="relative flex items-center justify-center"
        style={{ width: 'min(92vw, 1280px)', height: 'min(88vh, 860px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.altText ?? productName}
          className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
          style={{ border: `3px solid ${GOLD}` }}
        />
        {current.variantCode && (
          <span
            className="absolute bottom-3 right-3 rounded-lg px-3 py-1 text-sm font-bold text-white"
            style={{ backgroundColor: 'rgba(75,29,143,0.9)' }}
          >
            {current.variantCode}
          </span>
        )}
      </div>

      {total > 1 && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          aria-label="Next image"
        >
          <ChevronRight className="h-9 w-9" />
        </button>
      )}

      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              className="h-2.5 w-2.5 rounded-full transition-all focus:outline-none"
              style={{
                backgroundColor: idx === index ? GOLD : 'rgba(255,255,255,0.45)',
                transform: idx === index ? 'scale(1.3)' : 'scale(1)',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onIndexChange(idx)
              }}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
