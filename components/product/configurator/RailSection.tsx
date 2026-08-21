'use client'

/**
 * Collapsible block used for the secondary content in the option rail
 * (description, documents, variants, help). Keeps the rail scannable in a
 * ~520px column instead of one long wall of text.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface Props {
  title: string
  /** Short right-aligned hint, e.g. a count or the current pick. */
  meta?: string
  icon?: React.ReactNode
  /**
   * Sections start expanded so everything a buyer needs is visible the moment
   * the product opens; collapsing is there for tidying up, not discovery.
   */
  defaultOpen?: boolean
  children: React.ReactNode
}

export function RailSection({ title, meta, icon, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 bg-gray-50 px-4 py-4 text-left transition-colors hover:bg-gray-100 ${
          // Only divide from content that is actually showing, otherwise this
          // doubles up with the card's own bottom border.
          open ? 'border-b border-gray-200' : ''
        }`}
      >
        {icon && (
          <span className="shrink-0" style={{ color: PURPLE }}>
            {icon}
          </span>
        )}
        <span className="flex-1 text-base font-black uppercase tracking-wide text-gray-800">
          {title}
        </span>
        {meta && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${GOLD}1F`, color: '#8A6D12' }}
          >
            {meta}
          </span>
        )}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-4 py-4 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
