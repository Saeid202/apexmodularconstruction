'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

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

export function ProductInclusionsPanel({
  whatIsIncluded,
  certificatesStandards,
  specifications,
}: ProductInclusionsPanelProps) {
  // Use custom content if available, otherwise default to empty arrays
  const finalIncluded = whatIsIncluded || [];
  const finalCertificates = certificatesStandards || [];

  // Parse specifications fields
  const specText = specifications?.['_specification_text'] || '';
  const specFileUrl = specifications?.['_specification_file_url'] || null;
  const specFileName = specifications?.['_specification_file_name'] || null;

  // Filter out the text and file keys from standard key-value specifications
  const kvSpecs = Object.entries(specifications || {}).filter(
    ([key]) =>
      key !== '_specification_text' &&
      key !== '_specification_file_url' &&
      key !== '_specification_file_name' &&
      key !== 'id' &&
      key !== 'created_at'
  );

  const tabs = [
    { id: 'included', label: "What's Included in the Unit?" },
    { id: 'certificates', label: 'Certificates and Standards' },
    { id: 'specifications', label: 'Specification' },
  ];

  const [activeTab, setActiveTab] = useState<string>('included')

  return (
    <div
      className="rounded-2xl overflow-hidden border mt-6"
      style={{
        borderColor: `${GOLD}55`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      }}
    >
      {/* Tab Headers */}
      <div className="flex border-b" style={{ borderColor: `${GOLD}33` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-4 py-3 text-xs sm:text-sm font-semibold transition-all duration-200"
            style={{
              color: activeTab === tab.id ? PURPLE : '#666666',
              backgroundColor: activeTab === tab.id ? `${PURPLE}08` : 'white',
              borderBottom: activeTab === tab.id ? `3px solid ${GOLD}` : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* What's Included Tab */}
        {activeTab === 'included' && (
          <div className="space-y-3">
            {finalIncluded.length > 0 ? (
              <ul className="space-y-2">
                {finalIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-2"
                      style={{ backgroundColor: GOLD }}
                    />
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm italic">No inclusions listed by the seller for this unit.</p>
            )}
          </div>
        )}

        {/* Certificates & Standards Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-5">
            {finalCertificates.length > 0 ? (
              finalCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="pb-5 border-b last:pb-0 last:border-b-0"
                  style={{ borderColor: `${GOLD}22` }}
                >
                  <h3 className="font-bold text-base mb-2" style={{ color: PURPLE }}>
                    {cert.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{cert.description}</p>
                  {cert.file_url && (
                    <a
                      href={cert.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
                      style={{
                        backgroundColor: `${GOLD}15`,
                        color: GOLD,
                        border: `1px solid ${GOLD}44`,
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Download Certificate
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm italic">No certificates or standards registered by the seller for this unit.</p>
            )}
          </div>
        )}

        {/* Specification Tab */}
        {activeTab === 'specifications' && (
          <div className="space-y-6">
            {/* Key-Value Specifications */}
            {kvSpecs.length > 0 && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                {kvSpecs.map(([key, value]) => (
                  <div key={key} className="flex flex-col pb-2 border-b border-gray-100 last:border-0">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{key}</span>
                    <span className="text-sm font-semibold text-gray-700 mt-0.5">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rich Text Specifications Description */}
            {specText ? (
              <div
                className="prose prose-sm max-w-none text-gray-600 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: specText }}
              />
            ) : (
              kvSpecs.length === 0 && !specFileUrl && (
                <p className="text-gray-400 text-sm italic">No specifications listed by the seller for this unit.</p>
              )
            )}

            {/* Document Download Link */}
            {specFileUrl && (
              <div className="pt-2">
                <a
                  href={specFileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 shadow-sm"
                  style={{
                    backgroundColor: `${GOLD}15`,
                    color: GOLD,
                    border: `1.5px solid ${GOLD}44`,
                  }}
                >
                  <FileText className="h-4.5 w-4.5" />
                  Download Specification Sheet ({specFileName || 'PDF'})
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
