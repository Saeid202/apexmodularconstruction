import Link from 'next/link'
import { ArrowLeft, Home, PackageX } from 'lucide-react'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

/**
 * Route-scoped 404. The configurator hides the site header and footer, so this
 * page has to carry its own way back to the rest of the site.
 */
export default function ProductNotFound() {
  return (
    <div
      className="flex h-[100dvh] w-full flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, #FFFFFF 0%, #F5F2FB 45%, #E7E0F4 100%)',
      }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg"
        style={{ border: `2px solid ${GOLD}` }}
      >
        <PackageX className="h-8 w-8" style={{ color: PURPLE }} />
      </div>

      <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
        This product isn&apos;t available
      </h1>
      <p className="mt-2 max-w-md text-sm font-medium text-gray-600">
        It may have been removed by the seller, or the link might be out of date.
      </p>

      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href="/products"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
        >
          <ArrowLeft className="h-4 w-4" />
          Browse all products
        </Link>
        <Link
          href="/"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 bg-white px-6 text-sm font-bold transition-colors hover:bg-[#EDE9F6]"
          style={{ borderColor: `${PURPLE}33`, color: PURPLE }}
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  )
}
