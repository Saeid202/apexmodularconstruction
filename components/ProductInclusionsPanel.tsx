'use client'

/**
 * Seller-authored detail about the unit: what's in the box, certifications and
 * the specification sheet.
 *
 * Rendered as stacked collapsible sections so it fits the configurator's option
 * rail, where a three-tab header would be too cramped.
 */

import { FileText, ListChecks, Ruler, ShieldCheck } from 'lucide-react'
import { RailSection } from '@/components/product/configurator/RailSection'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface Certificate {
  id: string
  title: string
  description: string
  file_url?: string
}

interface ProductInclusionsPanelProps {
  whatIsIncluded?: string[] | null
  certificatesStandards?: Certificate[] | null
  specifications?: Record<string, string> | null
}

const downloadLinkClass =
  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90'

const downloadLinkStyle = {
  backgroundColor: `${GOLD}15`,
  color: '#8A6D12',
  border: `1px solid ${GOLD}55`,
} as const

export function ProductInclusionsPanel({
  whatIsIncluded,
  certificatesStandards,
  specifications,
}: ProductInclusionsPanelProps) {
  const included = whatIsIncluded ?? []
  const certificates = certificatesStandards ?? []

  const specText = specifications?.['_specification_text'] || ''
  const specFileUrl = specifications?.['_specification_file_url'] || null
  const specFileName = specifications?.['_specification_file_name'] || null

  // The three underscore-prefixed keys are storage for the rich-text and file
  // fields, not real specifications, so they never appear in the table.
  const kvSpecs = Object.entries(specifications ?? {}).filter(
    ([key]) =>
      key !== '_specification_text' &&
      key !== '_specification_file_url' &&
      key !== '_specification_file_name' &&
      key !== 'ar_glb_url' &&
      key !== 'ar_usdz_url' &&
      key !== 'sketchfab_embed_url' &&
      key !== 'id' &&
      key !== 'created_at'
  )

  const hasSpecs = kvSpecs.length > 0 || Boolean(specText) || Boolean(specFileUrl)

  return (
    <div className="flex flex-col gap-3">
      <RailSection
        title="What's Included"
        icon={<ListChecks className="h-5 w-5" />}
        meta={included.length > 0 ? `${included.length} items` : undefined}
      >
        {included.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {included.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <span className="text-sm leading-relaxed text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs italic text-gray-400">
            No inclusions listed by the seller for this unit.
          </p>
        )}
      </RailSection>

      <RailSection
        title="Certificates & Standards"
        icon={<ShieldCheck className="h-5 w-5" />}
        meta={certificates.length > 0 ? `${certificates.length}` : undefined}
      >
        {certificates.length > 0 ? (
          <div className="flex flex-col gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="border-b pb-4 last:border-b-0 last:pb-0"
                style={{ borderColor: `${GOLD}22` }}
              >
                <h4 className="mb-1 text-sm font-black tracking-tight" style={{ color: PURPLE }}>
                  {cert.title}
                </h4>
                <p className="mb-2 text-xs leading-relaxed text-gray-600">{cert.description}</p>
                {cert.file_url && (
                  <a
                    href={cert.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={downloadLinkClass}
                    style={downloadLinkStyle}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Download Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-gray-400">
            No certificates or standards registered by the seller for this unit.
          </p>
        )}
      </RailSection>

      <RailSection title="Specification" icon={<Ruler className="h-5 w-5" />}>
        {hasSpecs ? (
          <div className="flex flex-col gap-4">
            {kvSpecs.length > 0 && (
              <dl className="grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
                {kvSpecs.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col border-b border-gray-100 pb-1.5 last:border-0"
                  >
                    <dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      {key}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-gray-700">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {specText && (
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-600"
                dangerouslySetInnerHTML={{ __html: specText }}
              />
            )}

            {specFileUrl && (
              <a
                href={specFileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={downloadLinkClass}
                style={downloadLinkStyle}
              >
                <FileText className="h-3.5 w-3.5" />
                Specification Sheet ({specFileName || 'PDF'})
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs italic text-gray-400">
            No specifications listed by the seller for this unit.
          </p>
        )}
      </RailSection>
    </div>
  )
}
