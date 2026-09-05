'use client'

/**
 * The architect and affiliate sign-up flows are auth modals owned by the Header,
 * opened via window CustomEvents — the same mechanism the Footer already uses.
 * Isolating them in this small client component keeps PartnerPanel a server
 * component.
 */

import { ArrowRight } from 'lucide-react'

const LINKS = [
  { label: 'Join as an architect', event: 'open-architect-auth-modal' },
  { label: 'Join as an affiliate', event: 'open-affiliate-auth-modal' },
]

export function PartnerModalLinks() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {LINKS.map(({ label, event }) => (
        <button
          key={event}
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(event, { detail: 'register' }))
          }
          className="group inline-flex min-h-6 cursor-pointer items-center gap-1.5 py-1 text-[13px] font-semibold text-neutral-900 underline decoration-transparent underline-offset-4 transition-colors hover:text-[#4B1D8F] hover:decoration-current focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {label}
          <ArrowRight
            aria-hidden
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      ))}
    </div>
  )
}
