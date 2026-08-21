'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Settings, Save, Check, AlertCircle, Lock, Mail, User } from 'lucide-react'

interface ContractorSettingsClientProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string } }
  profile: { id: string; full_name?: string }
}

export default function ContractorSettingsClient({ user, profile }: ContractorSettingsClientProps) {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Email change form
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: '',
  })

  // Name change form
  const [nameForm, setNameForm] = useState({
    fullName: profile.full_name || user.user_metadata?.full_name || '',
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      if (passwordForm.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      // Update password using Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) throw updateError

      setSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Update email using Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      })

      if (updateError) throw updateError

      setSuccess(true)
      setEmailForm({ currentPassword: '', newEmail: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: nameForm.fullName,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: nameForm.fullName }
      })

      if (authError) throw authError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
            <Check className="h-5 w-5 shrink-0" />
            Settings updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Change Name */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: '#4B1D8F' }} />
            Change Username
          </h3>
          <form onSubmit={handleNameChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={nameForm.fullName}
                onChange={(e) => setNameForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' }}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" style={{ color: '#4B1D8F' }} />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' }}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Email */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" style={{ color: '#4B1D8F' }} />
            Change Email
          </h3>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Email</label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={emailForm.currentPassword}
                onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B1D8F] focus:outline-none transition-colors"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' }}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
