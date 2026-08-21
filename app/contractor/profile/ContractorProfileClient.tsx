'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { User, Save, Check, AlertCircle, Upload, X, Camera } from 'lucide-react'

interface ContractorProfileClientProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string } }
  profile: {
    id: string
    full_name?: string
    email?: string
    role?: string
    avatar_url?: string
    business_name?: string
    website?: string
    phone?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
  }
}

export default function ContractorProfileClient({ user, profile }: ContractorProfileClientProps) {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)

  const [formData, setFormData] = useState({
    fullName: profile.full_name || user.user_metadata?.full_name || '',
    email: user.email,
    businessName: profile.business_name || '',
    website: profile.website || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    province: profile.province || '',
    postalCode: profile.postal_code || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Error uploading avatar:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let avatarUrl = profile.avatar_url || null

      // Upload new avatar if selected
      if (avatarFile) {
        setUploading(true)
        avatarUrl = await uploadAvatar(avatarFile)
        setUploading(false)

        if (!avatarUrl) {
          throw new Error('Failed to upload avatar')
        }
      }

      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          avatar_url: avatarUrl,
          business_name: formData.businessName,
          website: formData.website,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
            <Check className="h-5 w-5 shrink-0" />
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" style={{ color: '#4B1D8F' }} />
              Profile Photo
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-[#4B1D8F] transition-colors">
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {avatarFile ? avatarFile.name : 'Choose a photo...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: '#4B1D8F' }} />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Use Settings to update email.</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="Street address"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="Province"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                  placeholder="Postal Code"
                />
              </div>
            </div>
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
