'use client'

/**
 * Variant chooser for the option rail.
 *
 * Variants in this marketplace are product images carrying a code and an
 * optional override price, so picking a variant is the same action as picking
 * the photo shown on the stage.
 *
 * Presents the same three fields as the original product page's variant table
 * — code, price in CAD, and master/variant type — laid out on a shared grid so
 * the columns still line up in a narrow rail, with a thumbnail added for
 * recognition.
 */

import { Check } from 'lucide-react'
import type { ProductImageData } from '@/types'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

/**
 * Thumbnail · Code · Price · Type. Shared by the header and every row.
 *
 * The price and type tracks are fixed widths rather than `auto` on purpose:
 * each row is its own grid container, so content-sized tracks would resolve to
 * a different width per row and the columns would not line up with each other
 * or with the header.
 */
const GRID = 'grid grid-cols-[2.25rem_minmax(0,1fr)_6.25rem_4.5rem] items-center gap-x-2.5'

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface Props {
  images: ProductImageData[]
  activeId: string | null
  basePrice: number
  onSelect: (id: string) => void
}

export function VariantPicker({ images, activeId, basePrice, onSelect }: Props) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: `${GOLD}55` }}
    >
      {/* Column headers, mirroring the original variants table */}
      <div
        className={`${GRID} px-3 py-2`}
        style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3A1570 100%)` }}
      >
        <span aria-hidden="true" />
        <span className="text-[10px] font-black uppercase tracking-wider text-white">Code</span>
        <span className="text-right text-[10px] font-black uppercase tracking-wider text-white">
          Price (CAD)
        </span>
        <span className="text-center text-[10px] font-black uppercase tracking-wider text-white">
          Type
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {images.map((img, idx) => {
          const active = img.id === activeId
          const isMaster = idx === 0
          const price = img.variantPrice ?? basePrice
          const code = img.variantCode ?? (isMaster ? 'Main' : `Image ${idx + 1}`)
          // Only meaningful for non-master rows: they inherit the master price.
          const inheritsPrice = img.variantPrice == null && !isMaster

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelect(img.id)}
              aria-pressed={active}
              aria-label={`Select variant ${code}`}
              className={`${GRID} w-full px-3 py-2.5 text-left transition-colors hover:bg-gray-50`}
              style={{ backgroundColor: active ? '#EDE9F6' : 'white' }}
            >
              {/* Thumbnail */}
              <span
                className="relative block h-9 w-9 overflow-hidden rounded-lg"
                style={{
                  border: active ? `2px solid ${GOLD}` : '1px solid #E5E7EB',
                  boxShadow: active ? `0 0 0 1.5px ${PURPLE}` : 'none',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.altText ?? code}
                  className="h-full w-full bg-white object-cover"
                />
                {active && (
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(75,29,143,0.45)' }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
              </span>

              {/* Code */}
              <span
                className="truncate text-sm font-bold"
                style={{ color: isMaster ? GOLD : PURPLE }}
                title={code}
              >
                {code}
              </span>

              {/* Price */}
              <span className="flex min-w-0 flex-col items-end text-right">
                <span className="text-sm font-semibold tabular-nums text-gray-700">
                  ${formatPrice(price)}
                </span>
                {inheritsPrice && (
                  <span className="text-[9px] leading-tight text-gray-400">same as master</span>
                )}
              </span>

              {/* Type */}
              <span
                className="flex w-full items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white"
                style={{ backgroundColor: isMaster ? GOLD : PURPLE }}
              >
                {isMaster ? '★ Master' : 'Variant'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
