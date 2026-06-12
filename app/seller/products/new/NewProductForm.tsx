'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/app/actions/seller'
import { uploadProductImage } from '@/lib/uploadProductImage'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Category } from '@/types/database'
import {
  Tag,
  DollarSign,
  Layers,
  Hash,
  FileText,
  ChevronDown,
  Sparkles,
  Wand2,
  RefreshCcw,
  Settings,
} from 'lucide-react'
import { LuxuryButton } from '@/components/seller/LuxuryButton'
import { SpecificationsEditor } from '@/components/seller/SpecificationsEditor'
import {
  DraggableVariantGrid,
  newSlot,
  type VariantSlot,
} from '@/components/seller/DraggableVariantGrid'
import { RichTextEditor } from '@/components/seller/RichTextEditor'
import { ProductDocumentsEditor, type DocSlot } from '@/components/seller/ProductDocumentsEditor'
import { extractYouTubeId, getYouTubeEmbedUrl, isValidYouTubeUrl } from '@/lib/youtube'
import { saveProductDocuments } from '@/app/actions/product-documents'
import { enrichProductFromImage } from '@/app/actions/product-enrichment'
import { CustomizationSuiteSimple } from '@/components/seller/customization/CustomizationSuiteSimple'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'
const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:border-transparent transition-shadow'

function Field({
  label,
  hint,
  required,
  icon: Icon,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ backgroundColor: '#EDE9F6' }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: PURPLE }} />
          </span>
        )}
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && (
            <span className="ml-1 font-bold" style={{ color: GOLD }}>
              *
            </span>
          )}
        </label>
      </div>
      {children}
      {hint && <p className="text-xs text-gray-400 pl-8">{hint}</p>}
    </div>
  )
}

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(to right, ${GOLD}55, transparent)` }}
      />
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
        {title}
      </span>
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(to left, ${GOLD}55, transparent)` }}
      />
    </div>
  )
}

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [variants, setVariants] = useState<VariantSlot[]>([newSlot(true)])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [requireOrderRequest, setRequireOrderRequest] = useState(false)
  const [showStock, setShowStock] = useState(true)
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [docs, setDocs] = useState<DocSlot[]>([])
  const [userId, setUserId] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [hasCustomization, setHasCustomization] = useState(false)
  const [customGroups, setCustomGroups] = useState<any[]>([])
  const [configuratorType, setConfiguratorType] = useState<'none' | 'house'>('none')

  const handleAiScan = async () => {
    const mainImage = variants.find((v) => v.file || v.existingUrl)
    if (!mainImage) {
      setError('Please upload an image first to scan for specifications.')
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      let imageInput: { url?: string; base64?: string } = {}

      if (mainImage.file) {
        // Convert local file to base64
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1]) // Remove the data:image/jpeg;base64, part
          }
        })
        reader.readAsDataURL(mainImage.file)
        imageInput.base64 = await base64Promise
      } else if (mainImage.existingUrl) {
        imageInput.url = mainImage.existingUrl
      }

      const result = await enrichProductFromImage(imageInput)

      if (result.success && result.specs) {
        // Merge AI specs with existing ones (avoiding duplicates)
        setSpecs((prev) => {
          const newSpecs = [...prev]
          result.specs.forEach((aiSpec: { key: string; value: string }) => {
            if (!newSpecs.find((s) => s.key.toLowerCase() === aiSpec.key.toLowerCase())) {
              newSpecs.push(aiSpec)
            }
          })
          return newSpecs
        })
        setStatus('Specifications extracted successfully!')
        setTimeout(() => setStatus(''), 3000)
      } else {
        throw new Error(result.error || 'AI could not read specifications from this image.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsScanning(false)
    }
  }

  // Get userId on mount for document uploads
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createBrowserClient }) => {
      createBrowserClient()
        .auth.getUser()
        .then(({ data: { user } }) => {
          if (user) setUserId(user.id)
        })
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Capture form element immediately — before any await (React nullifies the event after)
    const formEl = e.currentTarget

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Upload images directly browser → Supabase (no Next.js in the middle)
      const slotsWithImages = variants.filter((v) => v.file || v.existingUrl)
      if (slotsWithImages.length > 0) setStatus('Uploading images…')

      const uploadedVariants = await Promise.all(
        variants.map(async (v, i) => {
          const url = v.file
            ? await uploadProductImage(v.file, user.id, i)
            : (v.existingUrl ?? null)
          return {
            url,
            code: v.code,
            price: v.price ? parseFloat(v.price) : null,
            isMaster: v.isMaster,
          }
        })
      )

      // 2. Call server action with URLs only (no file bytes)
      setStatus('Saving product…')
      const formData = new FormData(formEl)
      const specObj: Record<string, string> = {}
      specs.forEach(({ key, value }) => {
        if (key && value) specObj[key] = value
      })
      formData.set('specifications', JSON.stringify(specObj))
      formData.set('variantsJson', JSON.stringify(uploadedVariants))
      formData.set('requireOrderRequest', requireOrderRequest ? 'true' : 'false')
      formData.set('showStock', showStock ? 'true' : 'false')
      formData.set('description', descriptionHtml)
      formData.set('youtubeUrl', youtubeUrl.trim())
      formData.set('configuratorType', configuratorType)

      if (hasCustomization && customGroups.length > 0) {
        formData.set('customizationsJson', JSON.stringify(customGroups))
      }

      const result = await createProduct(formData)
      if (result.error) throw new Error(result.error)

      // Save documents if any
      if (result.data && docs.length > 0) {
        const readyDocs = docs.filter((d) => d.url && !d.uploading && !d.error)
        await saveProductDocuments(result.data.id, readyDocs)
      }

      // If it's a house, redirect seller to the visual configurator builder instead of product list
      if (configuratorType === 'house' && result.data) {
        router.push(`/seller/products/${result.data.id}/visual-configurator`)
      } else {
        router.push('/seller/products')
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="mt-0.5 shrink-0">⚠</span> {error}
        </div>
      )}

      <Section title="Product Images & Variants" />
      <DraggableVariantGrid variants={variants} onChange={setVariants} />

      <Section title="Product Details" />
      <Field label="Product Name" required icon={Tag}>
        <input
          name="name"
          type="text"
          required
          className={inputClass}
          placeholder="e.g., Premium Flooring Collection"
        />
      </Field>
      <Field label="Description" required icon={FileText}>
        <RichTextEditor
          value={descriptionHtml}
          onChange={setDescriptionHtml}
          placeholder="Describe your product — materials, dimensions, key features, use cases…"
        />
      </Field>

      <Section title="Pricing & Inventory" />
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Category" required icon={Layers}>
          <div className="relative">
            <select name="categoryId" required className={`${inputClass} appearance-none pr-9`}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </Field>
        <Field label="Master Price (CAD)" required icon={DollarSign}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
              $
            </span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              className={`${inputClass} pl-7`}
              placeholder="299.99"
            />
          </div>
          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Price Type</label>
            <div className="relative">
              <select
                name="priceType"
                required
                className={`${inputClass} appearance-none pr-9 text-sm`}
              >
                <option value="unit">per Unit</option>
                <option value="sqm">per SQM (Square Meter)</option>
                <option value="sqf">per SQF (Square Foot)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          {/* Require Order Request + Show Stock toggles */}
          <div
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 mt-1"
            style={{
              borderColor: requireOrderRequest ? PURPLE : `${GOLD}44`,
              background: requireOrderRequest ? '#EDE9F6' : '#fdfbf7',
            }}
          >
            <div className="flex-1 pr-3">
              <p className="text-xs font-semibold text-gray-800">Require Order Request</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                Buyers must submit a request instead of buying directly.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={requireOrderRequest}
              onClick={() => setRequireOrderRequest((v) => !v)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
              style={{
                backgroundColor: requireOrderRequest ? PURPLE : '#D1D5DB',
                borderColor: requireOrderRequest ? PURPLE : '#D1D5DB',
              }}
            >
              <span
                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
                style={{
                  transform: requireOrderRequest ? 'translateX(19px)' : 'translateX(1px)',
                  marginTop: 1,
                }}
              />
            </button>
          </div>
          <div
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 mt-1"
            style={{
              borderColor: showStock ? `${GOLD}44` : '#E5E7EB',
              background: showStock ? '#fdfbf7' : '#F9FAFB',
            }}
          >
            <div className="flex-1 pr-3">
              <p className="text-xs font-semibold text-gray-800">Show Stock Status</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                Display "In Stock / Out of Stock" on the product page.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showStock}
              onClick={() => setShowStock((v) => !v)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
              style={{
                backgroundColor: showStock ? PURPLE : '#D1D5DB',
                borderColor: showStock ? PURPLE : '#D1D5DB',
              }}
            >
              <span
                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
                style={{
                  transform: showStock ? 'translateX(19px)' : 'translateX(1px)',
                  marginTop: 1,
                }}
              />
            </button>
          </div>
        </Field>
        <Field
          label="Compare at Price (CAD)"
          icon={DollarSign}
          hint="Original price — shows a discount badge"
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
              $
            </span>
            <input
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} pl-7`}
              placeholder="349.99"
            />
          </div>
        </Field>
        <Field label="Stock Quantity" required icon={Hash}>
          <input
            name="stockQuantity"
            type="number"
            min="0"
            required
            className={inputClass}
            placeholder="100"
          />
        </Field>
      </div>

      <Section title="Specifications" />
      <div className="bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-800">Smart AI Spec Entry</p>
            <p className="text-xs text-gray-400">
              Save time! Let the AI read your product image to find sizes and materials.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{
              background: `linear-gradient(135deg, ${PURPLE}, #6B46C1)`,
            }}
          >
            {isScanning ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            )}
            <span>{isScanning ? 'Reading Image...' : 'Scan Image with AI'}</span>
          </button>
        </div>
      </div>
      <SpecificationsEditor specs={specs} onChange={setSpecs} />

      <Section title="Product Documents" />
      <ProductDocumentsEditor userId={userId} docs={docs} onChange={setDocs} />

      <Section title="Product Video" />
      <Field
        label="YouTube Video URL"
        hint="Paste any YouTube link — watch, youtu.be, or Shorts. The video is hosted on YouTube, not uploaded here."
      >
        <input
          name="youtubeUrl"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className={inputClass}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {youtubeUrl && !isValidYouTubeUrl(youtubeUrl) && (
          <p className="text-xs text-red-500 pl-8 mt-1">
            That doesn&apos;t look like a valid YouTube URL.
          </p>
        )}
        {youtubeUrl &&
          isValidYouTubeUrl(youtubeUrl) &&
          (() => {
            const id = extractYouTubeId(youtubeUrl)!
            return (
              <div
                className="mt-3 rounded-2xl overflow-hidden"
                style={{ border: `1.5px solid ${GOLD}55` }}
              >
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(id)}
                    title="Product video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-2" style={{ backgroundColor: '#fdfbf7' }}>
                  <p className="text-xs font-bold text-green-700">
                    ✓ Valid YouTube video — preview above
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 break-all">{youtubeUrl.trim()}</p>
                </div>
              </div>
            )
          })()}
      </Field>

      <Section title="Customization Options" />
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2.5 mb-4"
        style={{
          borderColor: hasCustomization ? PURPLE : `${GOLD}44`,
          background: hasCustomization ? '#EDE9F6' : '#fdfbf7',
        }}
      >
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" style={{ color: hasCustomization ? PURPLE : GOLD }} />
            <p className="text-xs font-bold text-gray-800">Enable Customization Suite</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
            Allow buyers to select custom doors, windows, flooring, colors, etc. (Like topping on a
            pizza!)
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={hasCustomization}
          onClick={() => setHasCustomization(!hasCustomization)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
          style={{
            backgroundColor: hasCustomization ? PURPLE : '#D1D5DB',
            borderColor: hasCustomization ? PURPLE : '#D1D5DB',
          }}
        >
          <span
            className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
            style={{
              transform: hasCustomization ? 'translateX(19px)' : 'translateX(1px)',
              marginTop: 1,
            }}
          />
        </button>
      </div>

      {hasCustomization && (
        <CustomizationSuiteSimple productId="new" userId={userId} initialEnabled={true} />
      )}

      <Section title="Interactive Configurator" />
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2.5 mb-4"
        style={{
          borderColor: configuratorType === 'house' ? PURPLE : `${GOLD}44`,
          background: configuratorType === 'house' ? '#EDE9F6' : '#fdfbf7',
        }}
      >
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-2">
            <Layers
              className="h-4 w-4"
              style={{ color: configuratorType === 'house' ? PURPLE : GOLD }}
            />
            <p className="text-xs font-bold text-gray-800">Enable Interactive Building Engine</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
            Designate this product as a customizable prefab house. After saving, sellers can define
            doors, windows, and wall color regions on the base image.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={configuratorType === 'house'}
          onClick={() => setConfiguratorType(configuratorType === 'house' ? 'none' : 'house')}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
          style={{
            backgroundColor: configuratorType === 'house' ? PURPLE : '#D1D5DB',
            borderColor: configuratorType === 'house' ? PURPLE : '#D1D5DB',
          }}
        >
          <span
            className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
            style={{
              transform: configuratorType === 'house' ? 'translateX(19px)' : 'translateX(1px)',
              marginTop: 1,
            }}
          />
        </button>
      </div>

      {/* Publish status */}
      <div
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ borderColor: `${GOLD}44`, background: '#fdfbf7' }}
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">Publish Status</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Draft saves the product without making it visible to buyers
          </p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="publishStatus"
              value="active"
              defaultChecked
              className="sr-only peer"
            />
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors peer-checked:bg-green-500 peer-checked:text-white text-gray-500 hover:bg-gray-50">
              ● Publish
            </span>
          </label>
          <label className="cursor-pointer border-l border-gray-200">
            <input type="radio" name="publishStatus" value="draft" className="sr-only peer" />
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors peer-checked:bg-gray-500 peer-checked:text-white text-gray-500 hover:bg-gray-50">
              ○ Draft
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 border-t pt-4" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>
          Cancel
        </LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? status || 'Working…' : 'Create Product'}
        </LuxuryButton>
      </div>
    </form>
  )
}
