'use client'

/**
 * The AI Stager is a wide, multi-panel workspace, so in the configurator it
 * opens as a full-screen overlay rather than being squeezed into the option
 * rail.
 */

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { AIStagerTab } from '@/components/product/AIStagerTab'
import type { ProductWithRelations } from '@/types'

const GOLD = '#D4AF37'

interface Props {
  product: ProductWithRelations
  activeImageUrl?: string
  initialMode?: 'demo' | 'upload' | 'ar'
  onClose: () => void
}

export function StagerOverlay({ product, activeImageUrl, initialMode, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-white animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="AI Stager"
    >
      <div
        className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6"
        style={{
          background:
            'linear-gradient(135deg, var(--brand-chrome-from) 0%, var(--brand-chrome-to) 100%)',
          borderBottom: `1px solid ${GOLD}55`,
        }}
      >
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-black text-white">{product.name}</span>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: GOLD }}
          >
            AI Stager
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold uppercase tracking-widest text-purple-100 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <AIStagerTab
            product={product}
            activeImageUrl={activeImageUrl}
            initialMode={initialMode}
          />
        </div>
      </div>
    </div>
  )
}
