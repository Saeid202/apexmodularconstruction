'use client'

import React from 'react'
import Link from 'next/link'
import { Building, MapPin, Mail, Phone, Star, ShieldCheck, Image as ImageIcon } from 'lucide-react'

interface SellerStorefrontProps {
  seller: any
  products: any[]
}

export default function SellerStorefrontClient({ seller, products }: SellerStorefrontProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Header Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="h-48 bg-gradient-to-r from-purple-900 to-[#1A1A2E] w-full relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {seller.logo_url ? (
                    <img src={seller.logo_url} alt={seller.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-12 h-12 text-purple-200" />
                  )}
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-gray-900">{seller.business_name}</h1>
                    {seller.status === 'active' && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                        <ShieldCheck className="w-3 h-3" /> Verified Partner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                    {seller.business_address && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {seller.business_address}</span>
                    )}
                    <span className="flex items-center gap-1 text-yellow-500"><Star className="w-4 h-4 fill-current" /> 4.8 Rating</span>
                  </div>
                </div>
              </div>
              <div className="mb-2 flex gap-3">
                <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                  Contact Factory
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About the Manufacturer</h3>
                <p className="text-gray-600 leading-relaxed">
                  {seller.description || "This factory is a verified partner of Apex Modular Construction. They specialize in high-quality materials and direct-to-consumer manufacturing, ensuring you get the best pricing for your projects."}
                </p>
                
                {seller.specialties && seller.specialties.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {seller.specialties.map((spec: string) => (
                        <span key={spec} className="bg-gray-100 text-gray-700 font-bold text-sm px-3 py-1 rounded-full border border-gray-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Contact Info</h3>
                <div className="space-y-4">
                  {seller.business_email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <a href={`mailto:${seller.business_email}`} className="hover:text-purple-600 font-medium">{seller.business_email}</a>
                    </div>
                  )}
                  {seller.business_phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <a href={`tel:${seller.business_phone}`} className="hover:text-purple-600 font-medium">{seller.business_phone}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-medium">{seller.category || 'Manufacturer'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Factory Catalog</h2>
              <p className="text-gray-500 font-medium mt-1">Browse and customize products directly from the source.</p>
            </div>
            <span className="bg-purple-100 text-purple-800 text-sm font-bold px-4 py-1.5 rounded-full">
              {products.length} Products
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-gray-800 shadow-sm">
                      {seller.category || 'Direct'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-xl font-black text-gray-900">${product.price.toLocaleString()}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase">/{product.price_type}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products published yet</h3>
              <p className="text-gray-500">This factory partner is currently setting up their digital catalog.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
