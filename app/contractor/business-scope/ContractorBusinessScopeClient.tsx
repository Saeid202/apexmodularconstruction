'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Briefcase, Save, Check, AlertCircle, Plus, X } from 'lucide-react'

interface ContractorBusinessScopeClientProps {
  user: { id: string; email: string }
  profile: {
    id: string
    service_types?: string[]
    service_areas?: string[]
    years_experience?: number
    certifications?: any[]
  }
}

const SERVICE_TYPES = [
  'Accessory Dwelling Units (ADU)',
  'Light Steel Frame (LSF)',
  'Modular Construction',
  'Other',
]

const PROVINCES = [
  'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'PE', 'NS', 'NB', 'NL', 'NT', 'NU', 'YT',
]

export default function ContractorBusinessScopeClient({ user, profile }: ContractorBusinessScopeClientProps) {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    serviceTypes: profile.service_types || [],
    serviceAreas: profile.service_areas || [],
    yearsExperience: profile.years_experience || 0,
    certifications: profile.certifications || [],
  })

  const [newCertification, setNewCertification] = useState({
    name: '',
    issuedBy: '',
    expiryDate: '',
  })

  const handleServiceTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter(t => t !== type)
        : [...prev.serviceTypes, type]
    }))
  }

  const handleProvinceToggle = (province: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(province)
        ? prev.serviceAreas.filter(p => p !== province)
        : [...prev.serviceAreas, province]
    }))
  }

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuedBy) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }]
      }))
      setNewCertification({ name: '', issuedBy: '', expiryDate: '' })
    }
  }

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          service_types: formData.serviceTypes,
          service_areas: formData.serviceAreas,
          years_experience: formData.yearsExperience,
          certifications: formData.certifications,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business scope')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Scope</h2>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
            <Check className="h-5 w-5 shrink-0" />
            Business scope updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Types */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" style={{ color: '#4B1D8F' }} />
              Service Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleServiceTypeToggle(type)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    formData.serviceTypes.includes(type)
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={formData.serviceTypes.includes(type) ? { backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' } : { border: '2px solid #e5e7eb' }}
                >
                  {formData.serviceTypes.includes(type) && <Check className="h-4 w-4 inline mr-2" />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Service Areas (Provinces)</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {PROVINCES.map((province) => (
                <button
                  key={province}
                  type="button"
                  onClick={() => handleProvinceToggle(province)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    formData.serviceAreas.includes(province)
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={formData.serviceAreas.includes(province) ? { backgroundColor: '#4B1D8F' } : { border: '2px solid #e5e7eb' }}
                >
                  {province}
                </button>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Years of Experience</h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
              />
              <span className="text-sm text-gray-600">years</span>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Certifications</h3>
            
            {/* Add Certification Form */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Certification Name"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors text-sm"
                />
                <input
                  type="text"
                  placeholder="Issued By"
                  value={newCertification.issuedBy}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuedBy: e.target.value }))}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors text-sm"
                />
                <input
                  type="date"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCertification}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#4B1D8F' }}
              >
                <Plus className="h-4 w-4" />
                Add Certification
              </button>
            </div>

            {/* Certifications List */}
            {formData.certifications.length > 0 && (
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-600">Issued by: {cert.issuedBy}</p>
                      {cert.expiryDate && <p className="text-xs text-gray-500">Expires: {cert.expiryDate}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
