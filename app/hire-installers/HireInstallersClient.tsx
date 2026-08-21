'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Building2, Award, Clock, ChevronRight, Search } from 'lucide-react'

interface Installer {
  id: string
  full_name: string
  email: string
  phone?: string
  business_name?: string
  website?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  service_types?: string[]
  service_areas?: string[]
  years_experience?: number
  role: string
  avatar_url?: string
}

interface HireInstallersClientProps {
  installers: Installer[]
}

const PROVINCES = [
  'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'PE', 'NS', 'NB', 'NL', 'NT', 'NU', 'YT',
]

export default function HireInstallersClient({ installers }: HireInstallersClientProps) {
  const [selectedProvince, setSelectedProvince] = useState('')
  const [searchCity, setSearchCity] = useState('')

  const filteredInstallers = installers.filter((installer) => {
    const matchesProvince = selectedProvince === '' || (installer.service_areas && installer.service_areas.includes(selectedProvince))
    const matchesCity = searchCity === '' || (installer.city && installer.city.toLowerCase().includes(searchCity.toLowerCase()))
    return matchesProvince && matchesCity
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hire an Installer</h1>
          <p className="text-lg text-gray-600">Find qualified contractors in your area</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
              >
                <option value="">All Provinces</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-gray-500">
                Showing {filteredInstallers.length} of {installers.length} contractors
              </p>
            </div>
          </div>
        </div>

        {/* Contractor List */}
        {filteredInstallers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-lg text-gray-600">No contractors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstallers.map((installer) => (
              <div key={installer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #4B1D8F, #5a2d9f)' }}>
                  <div className="flex items-start gap-4">
                    {installer.avatar_url ? (
                      <img
                        src={installer.avatar_url}
                        alt={installer.business_name || installer.full_name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-white/70" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{installer.business_name || installer.full_name}</h3>
                      <div className="flex items-center gap-2 text-purple-200 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{installer.city && installer.province ? `${installer.city}, ${installer.province}` : installer.city || installer.province || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 space-y-4">
                  {/* Experience */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#EDE9F6' }}>
                      <Clock className="h-5 w-5" style={{ color: '#4B1D8F' }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Experience</p>
                      <p className="text-sm font-semibold text-gray-900">{installer.years_experience || 0} years</p>
                    </div>
                  </div>

                  {/* Services */}
                  {installer.service_types && installer.service_types.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {installer.service_types.map((service, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: '#D4AF37' }}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Areas */}
                  {installer.service_areas && installer.service_areas.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Service Areas</p>
                      <p className="text-sm text-gray-700">{installer.service_areas.join(', ')}</p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{installer.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{installer.email}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <a
                    href={`/hire-installers/${installer.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' }}
                  >
                    View Full Profile
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
