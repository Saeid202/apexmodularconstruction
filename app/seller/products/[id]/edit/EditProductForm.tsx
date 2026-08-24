'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/app/actions/seller'
import { uploadProductImage } from '@/lib/uploadProductImage'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SellerProduct } from '@/app/actions/seller'
import type { Category } from '@/types/database'
import {
  X,
  Tag,
  DollarSign,
  Layers,
  Hash,
  FileText,
  ChevronDown,
  Settings,
  Plus,
  File,
  Upload,
  LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { LuxuryButton } from '@/components/seller/LuxuryButton'
import { CustomizationSuiteSimple } from '@/components/seller/customization/CustomizationSuiteSimple'
import {
  DraggableVariantGrid,
  newSlot,
  type VariantSlot,
} from '@/components/seller/DraggableVariantGrid'
import { SpecificationsEditor } from '@/components/seller/SpecificationsEditor'
import { RichTextEditor } from '@/components/seller/RichTextEditor'
import { ProductDocumentsEditor, type DocSlot } from '@/components/seller/ProductDocumentsEditor'
import { saveProductDocuments } from '@/app/actions/product-documents'
import { extractYouTubeId, getYouTubeEmbedUrl, isValidYouTubeUrl } from '@/lib/youtube'

interface EditProductFormProps {
  product: SellerProduct
  categories: Category[]
}

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

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
  icon?: LucideIcon
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

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:border-transparent transition-shadow'

export function EditProductForm({
  product,
  categories,
  initialDocuments,
  userId: propUserId,
}: EditProductFormProps & { initialDocuments?: any[]; userId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Saving Changes...')
  const [error, setError] = useState<string | null>(null)
  const [variants, setVariants] = useState<VariantSlot[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [requireOrderRequest, setRequireOrderRequest] = useState<boolean>(
    (product as any).require_order_request ?? false
  )

  const orderedCategories = useMemo(() => {
    const topLevel = categories.filter((c) => !c.parent_id)
    const result: typeof categories = []
    topLevel.forEach((parent) => {
      result.push(parent)
      const subs = categories.filter((c) => c.parent_id === parent.id)
      result.push(...subs)
    })
    categories.forEach((c) => {
      if (!result.find((r) => r.id === c.id)) {
        result.push(c)
      }
    })
    return result
  }, [categories])
  const [showStock, setShowStock] = useState<boolean>((product as any).show_stock ?? true)
  const [descriptionHtml, setDescriptionHtml] = useState<string>(product.description ?? '')
  const [docs, setDocs] = useState<DocSlot[]>([])
  const [affiliateEnabled, setAffiliateEnabled] = useState<boolean>(
    (product as any).affiliate_enabled ?? false
  )
  const [affiliateCommissionType, setAffiliateCommissionType] = useState<'percentage' | 'fixed_amount'>(
    (product as any).affiliate_commission_type ?? 'percentage'
  )
  const [affiliateCommissionValue, setAffiliateCommissionValue] = useState<string>(
    (product as any).affiliate_commission_value != null
      ? String((product as any).affiliate_commission_value)
      : ''
  )
  const [affiliateAvailability, setAffiliateAvailability] = useState<'all_partners' | 'selected_partners'>(
    (product as any).affiliate_availability ?? 'all_partners'
  )
  const [userId, setUserId] = useState<string>(propUserId || '')
  const [youtubeUrl, setYoutubeUrl] = useState<string>((product as any).youtube_url ?? '')
  const [hasCustomization, setHasCustomization] = useState<boolean>(
    product.has_customization ?? false
  )
  const [customGroups, setCustomGroups] = useState<any[]>([])

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product.category_id)
  const [whatIsIncluded, setWhatIsIncluded] = useState<string[]>([])
  const [certificatesStandards, setCertificatesStandards] = useState<
    Array<{ id: string; title: string; description: string; file_url: string | null; file?: File }>
  >([])
  const [certificateFileInputs, setCertificateFileInputs] = useState<Map<string, File | null>>(
    new Map()
  )
  const [specText, setSpecText] = useState<string>('')
  const [specFile, setSpecFile] = useState<{ url: string | null; name: string | null; file?: File | null }>({
    url: null,
    name: null,
    file: null,
  })
  const [arGlbUrl, setArGlbUrl] = useState<string>('')
  const [arUsdzUrl, setArUsdzUrl] = useState<string>('')
  const [arGlbFile, setArGlbFile] = useState<File | null>(null)
  const [arUsdzFile, setArUsdzFile] = useState<File | null>(null)
  const [beds, setBeds] = useState<string>('')
  const [baths, setBaths] = useState<string>('')
  const [sqft, setSqft] = useState<string>('')
  const [frameMaterial, setFrameMaterial] = useState<string>('')
  const [glassType, setGlassType] = useState<string>('')
  const [openingStyle, setOpeningStyle] = useState<string>('')
  const [doorWindowDimensions, setDoorWindowDimensions] = useState<string>('')
  const [hardware, setHardware] = useState<string>('')

  useEffect(() => {
    if (product.product_images.length > 0) {
      const sorted = [...product.product_images].sort((a, b) => a.position - b.position)
      const hasMaster = sorted.some((img) => (img as any).is_master === true)
      setVariants(
        sorted.map((img, idx) => ({
          id: img.id,
          file: null,
          preview: null,
          existingUrl: img.url,
          code: (img as any).variant_code ?? '',
          price: (img as any).variant_price != null ? String((img as any).variant_price) : '',
          isMaster: hasMaster ? (img as any).is_master === true : idx === 0,
        }))
      )
    } else {
      setVariants([newSlot(true)])
    }
    const specObj = product.specifications as Record<string, string>
    if (specObj && Object.keys(specObj).length > 0) {
      const filteredSpecs = Object.entries(specObj)
        .filter(([key]) =>
          key !== '_specification_text' &&
          key !== '_specification_file_url' &&
          key !== '_specification_file_name' &&
          key !== 'Beds' &&
          key !== 'Baths' &&
          key !== 'Area' &&
          key !== 'Frame Material' &&
          key !== 'Glass Type' &&
          key !== 'Opening Style' &&
          key !== 'Dimensions' &&
          key !== 'Hardware'
        )
        .map(([key, value]) => ({ key, value }))
      setSpecs(filteredSpecs)

      setSpecText(specObj['_specification_text'] || '')
      setSpecFile({
        url: specObj['_specification_file_url'] || null,
        name: specObj['_specification_file_name'] || null,
        file: null,
      })
      setArGlbUrl(specObj['ar_glb_url'] || '')
      setArUsdzUrl(specObj['ar_usdz_url'] || '')
      setBeds(specObj['Beds'] || '')
      setBaths(specObj['Baths'] || '')
      setSqft(specObj['Area'] || '')
      setFrameMaterial(specObj['Frame Material'] || '')
      setGlassType(specObj['Glass Type'] || '')
      setOpeningStyle(specObj['Opening Style'] || '')
      setDoorWindowDimensions(specObj['Dimensions'] || '')
      setHardware(specObj['Hardware'] || '')
    }

    // Load existing customizations
    if (product.product_customization_groups?.length > 0) {
      setCustomGroups(
        product.product_customization_groups.map((g) => ({
          id: g.id,
          name: g.name,
          visualType: (g as any).visual_type ?? 'generic',
          targetAnchorId: (g as any).target_anchor_id ?? null,
          options: g.options.map((o) => ({
            id: o.id,
            name: o.name,
            priceModifier: String(o.price_modifier),
            imageUrl: o.image_url ?? '',
            description: o.description ?? null,
            colorHex: (o as any).color_hex ?? null,
          })),
        }))
      )
    }

    // Load initial documents from props
    if (initialDocuments) {
      setDocs(
        initialDocuments.map((d: any) => ({
          id: d.id,
          name: d.name,
          url: d.url,
          file_type: d.file_type,
          storage_path: d.storage_path,
          position: d.position,
        }))
      )
    }

    // Load existing what's included and certificates
    if ((product as any).what_is_included) {
      setWhatIsIncluded((product as any).what_is_included)
    }
    if ((product as any).certificates_standards) {
      setCertificatesStandards((product as any).certificates_standards)
    }
  }, [])

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs]
    updated[i][field] = val
    setSpecs(updated)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Capture form element immediately — before any await
    const formEl = e.currentTarget
    const formData = new FormData(formEl)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      console.log('🚀 Starting product save process...')
      console.log('📦 hasCustomization:', hasCustomization)
      console.log('📦 customGroups length:', customGroups.length)
      console.log('📦 variants state:', JSON.stringify(variants, null, 2))

      // Upload new images before saving
      const slotsWithImages = variants.filter((v) => v.file || v.existingUrl)
      console.log('📸 Variants to process:', variants.length)
      console.log('📸 Slots with images:', slotsWithImages.length)
      console.log(
        '📸 Variants detail:',
        slotsWithImages.map((v, i) => ({
          index: i,
          hasFile: !!v.file,
          fileName: v.file?.name,
          existingUrl: v.existingUrl,
          code: v.code,
          isMaster: v.isMaster,
        }))
      )

      if (slotsWithImages.length > 0) setLoadingMsg('Uploading images…')

      const uploadedVariants = await Promise.all(
        variants.map(async (v, i) => {
          try {
            console.log(`⬆️ Processing variant ${i}:`, {
              hasFile: !!v.file,
              existingUrl: !!v.existingUrl,
            })
            const url = v.file
              ? await uploadProductImage(v.file, user.id, i)
              : (v.existingUrl ?? null)
            console.log(`✅ Variant ${i} done:`, { url })
            return {
              url,
              code: v.code,
              price: v.price ? parseFloat(v.price) : null,
              isMaster: v.isMaster,
            }
          } catch (err) {
            console.error(`❌ Error uploading variant ${i}:`, err)
            setError(
              `Error uploading image ${i + 1}: ${err instanceof Error ? err.message : String(err)}`
            )
            setLoading(false)
            throw err
          }
        })
      )
      console.log('✅ All variants uploaded:', uploadedVariants)

      // Upload specification file if a new file is chosen
      let finalSpecFileUrl = specFile.url
      let finalSpecFileName = specFile.name
      if (specFile.file) {
        setLoadingMsg('Uploading specification document…')
        const fileExt = specFile.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`documents/${user.id}/${fileName}`, specFile.file)
        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(`documents/${user.id}/${fileName}`)
          finalSpecFileUrl = publicData.publicUrl
          finalSpecFileName = specFile.file.name
        } else {
          console.error('Error uploading spec document:', uploadError)
        }
      }

      // Upload GLB AR file if a new file is chosen
      let finalArGlbUrl = arGlbUrl
      if (arGlbFile) {
        setLoadingMsg('Uploading GLB 3D model…')
        const fileExt = arGlbFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`models/${user.id}/${fileName}`, arGlbFile)
        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(`models/${user.id}/${fileName}`)
          finalArGlbUrl = publicData.publicUrl
        } else {
          console.error('Error uploading GLB:', uploadError)
        }
      }

      // Upload USDZ AR file if a new file is chosen
      let finalArUsdzUrl = arUsdzUrl
      if (arUsdzFile) {
        setLoadingMsg('Uploading USDZ 3D model…')
        const fileExt = arUsdzFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`models/${user.id}/${fileName}`, arUsdzFile)
        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(`models/${user.id}/${fileName}`)
          finalArUsdzUrl = publicData.publicUrl
        } else {
          console.error('Error uploading USDZ:', uploadError)
        }
      }

      const specObj: Record<string, string> = {}
      specs.forEach(({ key, value }) => {
        if (key && value) specObj[key] = value
      })
      if (beds) specObj['Beds'] = beds
      if (baths) specObj['Baths'] = baths
      if (sqft) specObj['Area'] = sqft
      if (frameMaterial) specObj['Frame Material'] = frameMaterial
      if (glassType) specObj['Glass Type'] = glassType
      if (openingStyle) specObj['Opening Style'] = openingStyle
      if (doorWindowDimensions) specObj['Dimensions'] = doorWindowDimensions
      if (hardware) specObj['Hardware'] = hardware

      if (specText) {
        specObj['_specification_text'] = specText
      }
      if (finalSpecFileUrl) {
        specObj['_specification_file_url'] = finalSpecFileUrl
      }
      if (finalSpecFileName) {
        specObj['_specification_file_name'] = finalSpecFileName
      }
      if (finalArGlbUrl) {
        specObj['ar_glb_url'] = finalArGlbUrl
      }
      if (finalArUsdzUrl) {
        specObj['ar_usdz_url'] = finalArUsdzUrl
      }
      formData.set('specifications', JSON.stringify(specObj))
      formData.set('affiliateEnabled', affiliateEnabled ? 'true' : 'false')
      formData.set('affiliateCommissionType', affiliateCommissionType)
      formData.set('affiliateCommissionValue', affiliateCommissionValue || '0')
      formData.set('affiliateAvailability', affiliateAvailability)

      if (hasCustomization && customGroups.length > 0) {
        const customizationsJson = JSON.stringify(customGroups)
        console.log('customizationsJson size:', customizationsJson.length)
        formData.set('customizationsJson', customizationsJson)
      } else {
        formData.set('customizationsJson', '[]')
      }

      // Filter out empty what's included items
      const filteredWhatIsIncluded = whatIsIncluded.filter((item) => item.trim())
      formData.set('whatIsIncluded', JSON.stringify(filteredWhatIsIncluded))

      // Upload certificates and prepare certificate data
      if (certificatesStandards.length > 0) {
        setLoadingMsg('Uploading certificates…')
        const uploadedCertificates = await Promise.all(
          certificatesStandards.map(async (cert) => {
            let file_url = cert.file_url
            // Upload new certificate file if provided
            if (cert.file) {
              const fileExt = cert.file.name.split('.').pop()
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
              const { error: uploadError } = await supabase.storage
                .from('certificates')
                .upload(`${user.id}/${product.id}/${fileName}`, cert.file)
              if (!uploadError) {
                const { data: publicData } = supabase.storage
                  .from('certificates')
                  .getPublicUrl(`${user.id}/${product.id}/${fileName}`)
                file_url = publicData.publicUrl
              }
            }
            return {
              id: cert.id,
              title: cert.title,
              description: cert.description,
              file_url,
            }
          })
        )
        formData.set('certificatesStandards', JSON.stringify(uploadedCertificates))
      } else {
        formData.set('certificatesStandards', JSON.stringify([]))
      }

      const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
      const isPrefab = selectedCategory?.slug === 'pre-fabricated'

      formData.set('variantsJson', JSON.stringify(uploadedVariants))
      formData.set('configuratorType', 'none')
      console.log('💾 Calling updateProduct with variants:', uploadedVariants.length)
      setLoadingMsg('Saving changes...')
      const result = await updateProduct(product.id, formData)
      console.log('💾 updateProduct result:', result)

      if (result.error) {
        console.error('❌ updateProduct error:', result.error)
        setError(result.error)
        setLoading(false)
        return
      }

      console.log('Product updated successfully, saving documents...')
      // Save documents
      const readyDocs = docs.filter((d) => d.url && !d.uploading && !d.error)
      await saveProductDocuments(product.id, readyDocs)
      console.log('Documents saved')

      console.log('Save process completed')
      setLoading(false)
      router.refresh()
    } catch (error) {
      console.error('Error during save:', error)
      setError('An error occurred while saving. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
          <span className="mt-0.5 shrink-0">⚠</span> {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">Current status:</span>
        <span
          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
            product.status === 'active'
              ? 'bg-green-100 text-green-700'
              : product.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : product.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
          }`}
        >
          {product.status}
        </span>
      </div>

      {/* Card 1: Images & Variants */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="1. Product Images & Variants" />
        <DraggableVariantGrid variants={variants} onChange={setVariants} />
      </div>

      {/* Card 2: Customization Options */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="2. Customization Options" />
        <div
          className="flex items-center justify-between rounded-xl border px-3 py-2.5"
          style={{
            borderColor: hasCustomization ? PURPLE : `${GOLD}44`,
            background: hasCustomization ? '#EDE9F6' : '#fdfbf7',
          }}
        >
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" style={{ color: hasCustomization ? PURPLE : GOLD }} />
              <p className="text-xs font-bold text-gray-800">2.1 Enable Customization Suite</p>
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
          <CustomizationSuiteSimple
            productId={product.id}
            userId={userId}
            initialEnabled={true}
            customGroups={customGroups}
            onCustomGroupsChange={setCustomGroups}
            variants={variants}
          />
        )}
      </div>

      {/* Card 3: Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="3. Product Details" />
        <Field label="3.1 Product Name" required icon={Tag}>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product.name}
            className={inputClass}
          />
        </Field>
        <Field label="3.2 Description" required icon={FileText}>
          <RichTextEditor
            value={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder="Describe your product — materials, dimensions, key features, use cases…"
          />
        </Field>
      </div>

      {/* Card 4: Pricing & Inventory */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="4. Pricing & Inventory" />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="4.1 Category" required icon={Layers}>
            <div className="relative">
              <select
                id="categoryId"
                name="categoryId"
                required
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className={`${inputClass} appearance-none pr-9`}
              >
                <option value="">Select a category</option>
                {orderedCategories.map((c) => {
                  const isSub = !!c.parent_id
                  const label = c.slug === 'pre-fabricated'
                    ? 'Prefabricated Houses'
                    : isSub
                      ? `— ${c.name}`
                      : c.name
                  return (
                    <option key={c.id} value={c.id}>
                      {label}
                    </option>
                  )
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </Field>
          <Field label="4.2 Master Price (CAD)" required icon={DollarSign}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                $
              </span>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={product.price}
                className={`${inputClass} pl-7`}
              />
            </div>
            <div className="mt-3">
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">Price Type</label>
              <div className="relative">
                <select
                  id="priceType"
                  name="priceType"
                  required
                  defaultValue={product.price_type || 'unit'}
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
            label="4.3 Compare at Price (CAD)"
            icon={DollarSign}
            hint="Original price — used to show a discount badge"
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                $
              </span>
              <input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.compare_at_price ?? ''}
                className={`${inputClass} pl-7`}
              />
            </div>
          </Field>
          <Field label="4.4 Stock Quantity" required icon={Hash}>
            <input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              required
              defaultValue={product.stock_quantity}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Card 4.5: House Specifications (Only for Prefab) */}
      {categories.find((c) => c.id === selectedCategoryId)?.slug === 'pre-fabricated' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <Section title="4.5 House Layout & Details" />
          <div className="grid sm:grid-cols-3 gap-5">
            <Field label="Bedrooms" icon={FileText} hint="e.g. 2">
              <input
                type="number"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className={inputClass}
                placeholder="2"
              />
            </Field>
            <Field label="Bathrooms" icon={FileText} hint="e.g. 1.5">
              <input
                type="number"
                step="0.5"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                className={inputClass}
                placeholder="1"
              />
            </Field>
            <Field label="Total Area (sqft)" icon={Layers} hint="e.g. 420">
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className={inputClass}
                placeholder="420"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Card 4.6: Door & Window Specifications (Only for Door/Window products) */}
      {(() => {
        const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
        const isDoorOrWindow = selectedCategory && (
          selectedCategory.slug === 'doors-windows' ||
          selectedCategory.slug === 'exterior-doors' ||
          selectedCategory.slug === 'interior-doors' ||
          selectedCategory.slug === 'entry-doors' ||
          selectedCategory.slug === 'sliding-patio-doors' ||
          selectedCategory.slug === 'windows' ||
          selectedCategory.slug === 'skylights' ||
          selectedCategory.slug === 'door-window-hardware' ||
          selectedCategory.parent_id === categories.find(c => c.slug === 'doors-windows')?.id
        );
        
        if (!isDoorOrWindow) return null;
        
        return (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <Section title="4.6 Door & Window Details" />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Frame Material" icon={Layers} hint="e.g. Aluminum, Wood, PVC">
                <input
                  type="text"
                  value={frameMaterial}
                  onChange={(e) => setFrameMaterial(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Aluminum"
                />
              </Field>
              <Field label="Glazing / Glass Type" icon={Layers} hint="e.g. Double Glazed, Triple Glazed, Low-E">
                <input
                  type="text"
                  value={glassType}
                  onChange={(e) => setGlassType(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Double Glazed Low-E"
                />
              </Field>
              <Field label="Opening Style" icon={Layers} hint="e.g. Sliding, Swing, Fixed, Tilt-Turn">
                <input
                  type="text"
                  value={openingStyle}
                  onChange={(e) => setOpeningStyle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Sliding"
                />
              </Field>
              <Field label="Dimensions (Width x Height)" icon={FileText} hint="e.g. 900mm x 2100mm">
                <input
                  type="text"
                  value={doorWindowDimensions}
                  onChange={(e) => setDoorWindowDimensions(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 900mm x 2100mm"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Hardware Included" icon={Layers} hint="e.g. Handles, Locks, Hinges">
                  <input
                    type="text"
                    value={hardware}
                    onChange={(e) => setHardware(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Handles, locks, and hinges included"
                  />
                </Field>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Card 4.8: Affiliate Marketing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="Affiliate Marketing" />
        <div
          className="flex items-center justify-between rounded-xl border px-3 py-2.5"
          style={{
            borderColor: affiliateEnabled ? PURPLE : `${GOLD}44`,
            background: affiliateEnabled ? '#EDE9F6' : '#fdfbf7',
          }}
        >
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: affiliateEnabled ? PURPLE : GOLD }} />
              <p className="text-xs font-bold text-gray-800">Enable Affiliate Promotion</p>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              Allow registered affiliate partners to promote this product and earn commissions.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={affiliateEnabled}
            onClick={() => setAffiliateEnabled(!affiliateEnabled)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
            style={{
              backgroundColor: affiliateEnabled ? PURPLE : '#D1D5DB',
              borderColor: affiliateEnabled ? PURPLE : '#D1D5DB',
            }}
          >
            <span
              className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
              style={{
                transform: affiliateEnabled ? 'translateX(19px)' : 'translateX(1px)',
                marginTop: 1,
              }}
            />
          </button>
        </div>

        {affiliateEnabled && (
          <div className="grid sm:grid-cols-3 gap-5 pt-2 animate-in fade-in duration-300">
            <Field label="Commission Type" icon={Layers}>
              <div className="relative">
                <select
                  value={affiliateCommissionType}
                  onChange={(e) => setAffiliateCommissionType(e.target.value as any)}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (CAD)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>

            <Field 
              label={affiliateCommissionType === 'percentage' ? 'Commission Percentage (%)' : 'Commission Amount (CAD)'} 
              icon={DollarSign}
              required
            >
              <div className="relative">
                {affiliateCommissionType === 'fixed_amount' && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    $
                  </span>
                )}
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={affiliateCommissionValue}
                  onChange={(e) => setAffiliateCommissionValue(e.target.value)}
                  className={`${inputClass} ${affiliateCommissionType === 'fixed_amount' ? 'pl-7' : ''}`}
                  placeholder={affiliateCommissionType === 'percentage' ? 'e.g. 5' : 'e.g. 5000'}
                />
                {affiliateCommissionType === 'percentage' && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    %
                  </span>
                )}
              </div>
            </Field>

            <Field label="Affiliate Availability" icon={Settings}>
              <div className="relative">
                <select
                  value={affiliateAvailability}
                  onChange={(e) => setAffiliateAvailability(e.target.value as any)}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="all_partners">All Partners</option>
                  <option value="selected_partners">Selected Partners Only</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>
          </div>
        )}
      </div>

      {/* Card 5: Documents */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="5. Product Documents" />
        <ProductDocumentsEditor userId={userId} docs={docs} onChange={setDocs} />
      </div>

      {/* Card 6: Video */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="6. Product Video" />
        <Field
          label="6.1 YouTube Video URL"
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
      </div>

      {/* Card 7: What's Included */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="7. What's Included" />
        <Field label="7.1 Inclusions Bullet Points" hint="List what's included with your product.">
          <div className="space-y-2">
            {whatIsIncluded.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...whatIsIncluded]
                    updated[idx] = e.target.value
                    setWhatIsIncluded(updated)
                  }}
                  placeholder={`Item ${idx + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setWhatIsIncluded(whatIsIncluded.filter((_, i) => i !== idx))}
                  className="flex items-center justify-center h-10.5 w-10.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors shrink-0"
                  style={{ color: '#DC2626' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setWhatIsIncluded([...whatIsIncluded, ''])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all hover:bg-gray-50"
              style={{
                borderColor: GOLD,
                color: PURPLE,
              }}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </Field>
      </div>

      {/* Card 8: Certificates & Standards */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="8. Certificates & Standards" />
        <Field label="8.1 Certificates & Standards" hint="Add certifications and standards your product meets.">
          <div className="space-y-4">
            {certificatesStandards.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1.5px solid ${GOLD}55`,
                      }}
                    >
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Title</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Description</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">File</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificatesStandards.map((cert) => (
                      <tr
                        key={cert.id}
                        style={{
                          borderBottom: `1px solid ${GOLD}22`,
                        }}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => {
                              const updated = certificatesStandards.map((c) =>
                                c.id === cert.id ? { ...c, title: e.target.value } : c
                              )
                              setCertificatesStandards(updated)
                            }}
                            placeholder="e.g., ISO 9001"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <textarea
                            value={cert.description}
                            onChange={(e) => {
                              const updated = certificatesStandards.map((c) =>
                                c.id === cert.id ? { ...c, description: e.target.value } : c
                              )
                              setCertificatesStandards(updated)
                            }}
                            placeholder="Certificate description"
                            rows={1}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs resize-none"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {cert.file_url && !certificateFileInputs.get(cert.id) && (
                              <a
                                href={cert.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <File className="h-3 w-3" />
                                View File
                              </a>
                            )}
                            {certificateFileInputs.get(cert.id) && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                ✓ {certificateFileInputs.get(cert.id)!.name}
                              </span>
                            )}
                            <label className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 cursor-pointer">
                              <Upload className="h-3 w-3" />
                              {certificateFileInputs.get(cert.id) ? 'Change' : 'Upload'}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const newInputs = new Map(certificateFileInputs)
                                    newInputs.set(cert.id, e.target.files[0])
                                    setCertificateFileInputs(newInputs)
                                    // Update the certificate with the file
                                    const updated = certificatesStandards.map((c) =>
                                      c.id === cert.id ? { ...c, file: e.target.files![0] } : c
                                    )
                                    setCertificatesStandards(updated)
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setCertificatesStandards(
                                certificatesStandards.filter((c) => c.id !== cert.id)
                              )
                              const newInputs = new Map(certificateFileInputs)
                              newInputs.delete(cert.id)
                              setCertificateFileInputs(newInputs)
                            }}
                            className="flex items-center justify-center h-8 w-8 rounded hover:bg-red-50 transition-colors"
                            style={{ color: '#DC2626' }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                const newCert = {
                  id: `cert-${Date.now()}`,
                  title: '',
                  description: '',
                  file_url: null,
                }
                setCertificatesStandards([...certificatesStandards, newCert])
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all hover:bg-gray-50"
              style={{
                borderColor: GOLD,
                color: PURPLE,
              }}
            >
              <Plus className="h-4 w-4" />
              Add Certificate
            </button>
          </div>
        </Field>
      </div>

      {/* Card 9: Specifications */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="9. Specifications" />
        <Field label="9.1 Technical Specifications" hint="Add structured key-value specifications (e.g., Width: 3m, Height: 2.8m).">
          <SpecificationsEditor specs={specs} onChange={setSpecs} />
        </Field>
        
        <Field label="9.2 Specifications Detail" hint="Write a freeform description of specifications (materials, finishes, layout, etc.).">
          <RichTextEditor
            value={specText}
            onChange={setSpecText}
            placeholder="Write specification description..."
          />
        </Field>

        <Field label="9.3 Specification Sheet (PDF/Doc)" hint="Upload a specification document for the buyer to download.">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed" style={{ borderColor: `${GOLD}66`, backgroundColor: '#FDFBF7' }}>
            <div className="flex-1">
              {specFile.name ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <File className="h-4 w-4 text-purple-600" />
                  <span>{specFile.name}</span>
                  {specFile.url && (
                    <a
                      href={specFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline font-normal"
                    >
                      (View Existing)
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No specification sheet uploaded.</p>
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors" style={{ borderColor: `${PURPLE}44` }}>
                <Upload className="h-3.5 w-3.5" />
                Upload File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSpecFile({
                        url: specFile.url,
                        name: file.name,
                        file: file,
                      })
                    }
                  }}
                  className="hidden"
                />
              </label>
              {specFile.name && (
                <button
                  type="button"
                  onClick={() => setSpecFile({ url: null, name: null, file: null })}
                  className="flex items-center justify-center p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </Field>
      </div>

      {/* Card 10: Augmented Reality (AR) Assets */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <Section title="10. Augmented Reality (AR) Assets" />
        <p className="text-xs text-gray-500 leading-relaxed">
          Optional: Upload 3D models of this product so customers can visualize it at 1:1 scale in their own rooms using their smartphone camera (similar to oakfurnitureland.co.uk). Works best for furniture items.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field 
            label="10.1 Android / Web 3D Model (.glb)" 
            hint="Upload a GLB file containing the 3D model"
          >
            <div className="flex flex-col gap-2">
              {arGlbFile ? (
                <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-800">
                  <span className="truncate max-w-[200px]">✓ {arGlbFile.name}</span>
                  <button type="button" onClick={() => setArGlbFile(null)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ) : arGlbUrl ? (
                <div className="flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-sm font-bold text-purple-800">
                  <span className="truncate max-w-[200px]">Existing: {arGlbUrl.split('/').pop()}</span>
                  <button type="button" onClick={() => { setArGlbUrl(''); setArGlbFile(null); }} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">Select GLB File</span>
                  <input type="file" accept=".glb" onChange={(e) => setArGlbFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              )}
            </div>
          </Field>

          <Field 
            label="10.2 iOS / Safari 3D Model (.usdz)" 
            hint="Upload a USDZ file for Apple AR Quick Look"
          >
            <div className="flex flex-col gap-2">
              {arUsdzFile ? (
                <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-800">
                  <span className="truncate max-w-[200px]">✓ {arUsdzFile.name}</span>
                  <button type="button" onClick={() => setArUsdzFile(null)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ) : arUsdzUrl ? (
                <div className="flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-sm font-bold text-purple-800">
                  <span className="truncate max-w-[200px]">Existing: {arUsdzUrl.split('/').pop()}</span>
                  <button type="button" onClick={() => { setArUsdzUrl(''); setArUsdzFile(null); }} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">Select USDZ File</span>
                  <input type="file" accept=".usdz" onChange={(e) => setArUsdzFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              )}
            </div>
          </Field>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>
          Cancel
        </LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? loadingMsg : 'Save Changes'}
        </LuxuryButton>
      </div>
    </form>
  )
}
