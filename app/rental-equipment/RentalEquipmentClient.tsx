'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Building2, Search, Info
} from 'lucide-react'

interface RentalEquipmentClientProps {
  initialProducts: any[]
}

export default function RentalEquipmentClient({ initialProducts }: RentalEquipmentClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeller, setSelectedSeller] = useState('')

  // Normalize data (handling database properties)
  const normalizedProducts = useMemo(() => {
    const list = initialProducts || []
    return list.map((p) => {
      // Find image URL
      let imageUrl = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80'
      if (p.product_images && p.product_images.length > 0) {
        imageUrl = p.product_images[0].url
      }

      // Specifications
      let specs: Record<string, string> = {}
      if (p.specifications) {
        specs = typeof p.specifications === 'string' 
          ? JSON.parse(p.specifications) 
          : p.specifications
      }

      // Seller name
      const sellerName = p.sellers?.business_name || p.sellers?.businessName || 'Verified Partner'

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || '',
        description: p.description,
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        priceType: p.price_type || p.priceType || 'day',
        imageUrl,
        sellerName,
        specs
      }
    })
  }, [initialProducts])

  // Extract unique sellers for filtering
  const uniqueSellers = useMemo(() => {
    const sellers = new Set<string>()
    normalizedProducts.forEach((p) => {
      if (p.sellerName) sellers.add(p.sellerName)
    })
    return Array.from(sellers)
  }, [normalizedProducts])

  // Filtered product listing
  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeller = selectedSeller === '' || p.sellerName === selectedSeller
      return matchesSearch && matchesSeller
    })
  }, [normalizedProducts, searchQuery, selectedSeller])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation / Back Button */}
        <div>
          <Link 
            href="/hire-installers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B1D8F] hover:text-[#3A1570] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Installers List
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#4B1D8F] via-[#5a2d9f] to-[#3a1470] text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <span className="absolute top-0 right-0 h-96 w-96 bg-white/5 rounded-full translate-x-24 -translate-y-24 pointer-events-none" />
          <span className="absolute bottom-0 left-0 h-64 w-64 bg-white/5 rounded-full -translate-x-12 translate-y-12 pointer-events-none" />
          
          <div className="max-w-3xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Heavy Machinery Rentals
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Construction Equipment Rental</h1>
            <p className="text-purple-100 text-base md:text-lg leading-relaxed">
              Browse fully certified heavy equipment listed by our verified contractors and sellers. Rent cranes, telehandlers, and lifts specifically suited for modular assembly projects.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4B1D8F] focus:outline-none text-sm transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 min-w-[280px]">
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4B1D8F] focus:outline-none text-sm bg-white"
            >
              <option value="">All Vendors</option>
              {uniqueSellers.map((seller) => (
                <option key={seller} value={seller}>{seller}</option>
              ))}
            </select>

            <div className="flex items-center justify-center bg-purple-50 text-[#4B1D8F] px-4 py-2 rounded-xl text-xs font-bold shrink-0">
              {filteredProducts.length} items found
            </div>
          </div>
        </div>

        {/* Page Content Layout */}
        <div className="space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <Info className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">No Equipment Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Try adjusting your search keywords or choosing a different vendor from the dropdown options.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group h-full duration-300"
                >
                  <div className="space-y-4">
                    {/* Equipment Image */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-[#4B1D8F] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        Rent
                      </div>
                    </div>

                    {/* Equipment Info */}
                    <div className="px-6 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 uppercase tracking-wide">
                        <Building2 className="h-3 w-3" />
                        <span>{product.sellerName}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#4B1D8F] transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed h-12">{product.description}</p>
                    </div>

                    {/* Specifications Block */}
                    {Object.keys(product.specs).length > 0 && (
                      <div className="px-6">
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl min-h-[70px]">
                          {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="text-[10px] leading-tight">
                              <span className="text-gray-500 font-semibold">{key}: </span>
                              <span className="text-gray-800 font-bold">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action */}
                  <div className="p-6 border-t border-gray-50 flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Rate</p>
                      <p className="text-lg font-extrabold text-[#4B1D8F]">
                        ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-xs font-medium text-gray-500"> / {product.priceType}</span>
                      </p>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b8960f] text-gray-900 font-extrabold rounded-xl transition-all shadow-sm text-xs hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center"
                    >
                      Request Rental
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
