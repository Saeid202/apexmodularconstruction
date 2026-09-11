"use client"

import { Check, ExternalLink, Search } from "lucide-react"
import { useState } from "react"
import type { ProductWithRelations } from "@/app/actions/products"

const IMPORT_KEY = "cargoplus:building-designer:window"

export function WindowCenter({ products, returnTo }: { products: ProductWithRelations[]; returnTo: string }) {
  const [search, setSearch] = useState("")
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.description ?? ""} ${product.sellers?.business_name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  )

  function importWindow(product: ProductWithRelations) {
    const windowProduct = {
      id: product.id,
      name: product.name,
      specifications: product.specifications,
      product_images: product.product_images,
    }
    window.localStorage.setItem(IMPORT_KEY, JSON.stringify(windowProduct))
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: IMPORT_KEY, window: windowProduct }, window.location.origin)
      window.close()
      return
    }
    window.location.assign(returnTo)
  }

  return (
    <main className="min-h-screen bg-[#F5F7F6] text-[#1B272B]">
      <section className="border-b border-[#D6DFDC] bg-[#203238] px-5 pb-10 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#B7D7C8]">Cargoplus Materials</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Window Center</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#D8E4E0] sm:text-base">Browse seller-listed windows, then import one directly into your building design.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#D6DFDC] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#55716A]">{filteredProducts.length} window{filteredProducts.length === 1 ? "" : "s"} available</p>
          <label className="relative block w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80938D]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search windows or sellers" className="w-full rounded-lg border border-[#C9D7D2] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2C8065]" />
          </label>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const image = product.product_images.find((item) => item.is_master) ?? product.product_images[0]
              return (
                <article key={product.id} className="overflow-hidden rounded-2xl border border-[#D6DFDC] bg-white shadow-sm">
                  <div className="aspect-[4/3] bg-[#EEF2EF]">{image?.url ? <img src={image.url} alt={image.alt_text ?? product.name} className="h-full w-full object-cover" /> : null}</div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-base font-bold">{product.name}</h2>
                    <p className="mt-1 truncate text-xs text-[#71847E]">{product.sellers?.business_name ?? "Cargoplus seller"}</p>
                    <div className="mt-4 flex gap-2">
                      <a href={`/products/${product.slug}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#C9D7D2] px-3 py-2 text-xs font-bold text-[#55716A] hover:bg-[#F2FAF6]">View details <ExternalLink className="h-3.5 w-3.5" /></a>
                      <button type="button" onClick={() => importWindow(product)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#2C8065] px-3 py-2 text-xs font-bold text-white hover:bg-[#23634F]"><Check className="h-3.5 w-3.5" /> Import</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#B7D7C8] bg-white py-20 text-center">
            <p className="font-semibold">No windows found</p>
            <p className="mt-1 text-sm text-[#71847E]">Sellers can publish windows by choosing the Windows category in Seller Centre.</p>
          </div>
        )}
      </section>
    </main>
  )
}
