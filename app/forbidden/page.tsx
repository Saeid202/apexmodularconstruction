import { Metadata } from 'next'
import Link from 'next/link'
import { Lock, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: '403 - Forbidden',
  description: 'You do not have permission to access this page',
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4B1D8F] to-[#3a1470] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <span className="text-4xl font-bold text-orange-600">403</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-2 mb-2">
            <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              You do not have the required role or permissions to view this content.
            </p>
          </div>
          <p className="text-xs text-orange-700 mt-2">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#4B1D8F] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#3a1470] transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/account/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Contact support:{' '}
          <a href="mailto:support@cargoplus.ca" className="text-[#4B1D8F] hover:underline">
            support@cargoplus.ca
          </a>
        </p>
      </div>
    </div>
  )
}
