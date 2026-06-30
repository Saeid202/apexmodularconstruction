import { Metadata } from 'next'
import Link from 'next/link'
import { LogIn, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: '401 - Unauthorized',
  description: 'You must be logged in to access this page',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4B1D8F] to-[#3a1470] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <span className="text-4xl font-bold text-red-600">401</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h1>
          <p className="text-gray-600">
            You need to be logged in to access this page.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-800">
            Please log in to your account to continue. If you don't have an account, you can create one.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#4B1D8F] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#3a1470] transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Log In
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full text-gray-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
