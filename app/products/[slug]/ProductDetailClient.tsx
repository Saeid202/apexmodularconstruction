'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Boxes,
  Check,
  File,
  FileSpreadsheet,
  FileText,
  Download,
  Calculator,
  ShieldCheck,
  type LucideIcon,
  Send,
  Settings,
  ShoppingCart,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react'
import { addToCart } from '@/lib/cart/cartManager'
import { OrderRequestModal } from '@/components/product/OrderRequestModal'
import { WhatsAppLink } from '@/components/layout/WhatsAppLink'
import { RichTextRenderer } from '@/components/product/RichTextRenderer'
import { ProductInclusionsPanel } from '@/components/ProductInclusionsPanel'
import { ProductCustomizer } from '@/components/product/ProductCustomizer'
import { BuildStudioPanel } from '@/components/product/three/BuildStudioPanel'
import {
  ConfiguratorStage,
  type StageMedia,
} from '@/components/product/configurator/ConfiguratorStage'
import { ImageLightbox } from '@/components/product/configurator/ImageLightbox'
import { StagerOverlay } from '@/components/product/configurator/StagerOverlay'
import { VariantPicker } from '@/components/product/configurator/VariantPicker'
import {
  buildSceneDirectives,
  DEFAULT_STUDIO_CONFIG,
  resolveModelUrl,
  type StudioConfig,
} from '@/lib/product/model3d'
import { extractYouTubeId } from '@/lib/youtube'
import type {
  CustomizationGroupWithRelations,
  CustomizationOption,
  ProductWithRelations,
} from '@/types'

const PURPLE = '#1F2937'
const GOLD = '#D4AF37'

type RailTab = 'ready' | 'custom'
type CardTab = 'overview' | 'plans' | 'specs' | 'gallery'
type StagerMode = 'demo' | 'upload' | 'ar'

/**
 * Every group starts on its first option so the 3D preview and the running
 * total open from a complete, valid configuration.
 */
function defaultSelections(
  groups: CustomizationGroupWithRelations[] | undefined
): Record<string, CustomizationOption[]> {
  const initial: Record<string, CustomizationOption[]> = {}
  groups?.forEach((group) => {
    if (group.options && group.options.length > 0) {
      initial[group.id] = [group.options[0]]
    }
  })
  return initial
}

const HIGHLIGHT_ICONS: LucideIcon[] = [Boxes, Zap, Settings, Sparkles]

function splitLines(value?: string): string[] {
  return (value ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

const OVERVIEW_PRIMARY_KEYS = new Set(['Building Type', 'Area', 'Beds', 'Baths'])

/** Key facts for the Overview tab, built from whatever the seller filled in. */
function buildOverviewRows(
  specs: Record<string, string>,
  categoryName: string
): [string, string][] {
  const rows: [string, string][] = []
  const buildingType = specs['Building Type'] || categoryName
  if (buildingType) rows.push(['Building Type', buildingType])
  if (specs.Area) {
    rows.push(['Floor Area', /^[\d.,\s]+$/.test(specs.Area) ? `${specs.Area} sq ft` : specs.Area])
  }
  if (specs.Beds) rows.push(['Bedrooms', specs.Beds])
  if (specs.Baths) rows.push(['Bathrooms', specs.Baths])
  Object.entries(specs).forEach(([key, value]) => {
    if (!value || key.startsWith('_') || key.startsWith('ar_') || key.startsWith('sketchfab')) return
    if (OVERVIEW_PRIMARY_KEYS.has(key)) return
    rows.push([key, value])
  })
  return rows.slice(0, 8)
}

function getPriceTypeLabel(priceType: string): string {
  switch (priceType) {
    case 'sqm':
      return 'per SQM'
    case 'sqf':
      return 'per SQF'
    default:
      return 'per Unit'
  }
}

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const router = useRouter()

  /* ── Imagery ──────────────────────────────────────────────────────── */
  const masterImage = product.images.find((img) => img.isMaster) ?? product.images[0] ?? null
  const allImages = useMemo(() => {
    if (!masterImage) return product.images
    return [masterImage, ...product.images.filter((img) => img.id !== masterImage.id)]
  }, [masterImage, product.images])

  /* ── State ────────────────────────────────────────────────────────── */
  const [activeId, setActiveId] = useState<string | null>(masterImage?.id ?? null)
  const [tab, setTab] = useState<RailTab>('ready')
  const [cardTab, setCardTab] = useState<CardTab>('overview')
  const [readyMedia, setReadyMedia] = useState<StageMedia>('photo')
  const [customMedia, setCustomMedia] = useState<StageMedia>('model3d')
  const [stagerMode, setStagerMode] = useState<StagerMode | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null)
  const [customSelections, setCustomSelections] = useState<Record<string, CustomizationOption[]>>(
    () => defaultSelections(product.customizationGroups)
  )
  const [studio, setStudio] = useState<StudioConfig>(DEFAULT_STUDIO_CONFIG)
  const [discoveredNodes, setDiscoveredNodes] = useState<string[]>([])

  /* ── Derived product data ─────────────────────────────────────────── */
  const categoryName = product.category?.name ?? ''
  const isFurniture = ['sofa', 'furniture'].some((cat) =>
    categoryName.toLowerCase().includes(cat)
  )

  const modelUrl = useMemo(() => resolveModelUrl(product), [product])

  /** Buyer selections translated into show/hide/recolour instructions. */
  const sceneDirectives = useMemo(
    () => buildSceneDirectives(product.customizationGroups ?? [], customSelections),
    [product.customizationGroups, customSelections]
  )

  const activeImage = allImages.find((img) => img.id === activeId) ?? masterImage
  const activePrice = activeImage?.variantPrice ?? product.price
  const activeCode = activeImage?.variantCode ?? null
  const hasVariants = allImages.length > 1
  const inStock = product.stockQuantity > 0
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)

  const optionsTotal = useMemo(
    () =>
      Object.values(customSelections)
        .flat()
        .reduce((acc, opt) => acc + opt.price_modifier, 0),
    [customSelections]
  )
  const selectedOptionCount = useMemo(
    () => Object.values(customSelections).flat().length,
    [customSelections]
  )

  const isCustomTab = tab === 'custom'
  const displayPrice = isCustomTab ? product.price + optionsTotal : activePrice

  const hasAr = Boolean(
    product.specifications?.ar_glb_url || product.specifications?.ar_usdz_url
  )
  const hasSketchfab = Boolean(product.specifications?.sketchfab_embed_url)
  const hasVideo = Boolean(product.youtubeUrl && extractYouTubeId(product.youtubeUrl))

  /* ── Stage media wiring ───────────────────────────────────────────── */
  const mediaOptions = useMemo<StageMedia[]>(() => {
    if (isCustomTab) return ['model3d', 'composite']
    const options: StageMedia[] = ['photo']
    if (hasSketchfab) options.push('sketchfab')
    if (hasVideo) options.push('video')
    return options
  }, [isCustomTab, hasSketchfab, hasVideo])

  const media = isCustomTab ? customMedia : readyMedia

  const handleMediaChange = useCallback(
    (next: StageMedia) => {
      if (next === 'model3d' || next === 'composite') setCustomMedia(next)
      else setReadyMedia(next)
    },
    []
  )

  /* ── Callbacks ────────────────────────────────────────────────────── */

  // Stable identity: the viewer calls this from an effect, so a new function
  // each render would re-fire it every time anything else changed.
  const handlePartsDiscovered = useCallback((nodeNames: string[]) => {
    setDiscoveredNodes((prev) =>
      prev.length === nodeNames.length && prev.every((n, i) => n === nodeNames[i])
        ? prev
        : nodeNames
    )
  }, [])

  const openLightbox = useCallback(() => {
    const idx = allImages.findIndex((img) => img.id === activeId)
    setLightboxIndex(idx >= 0 ? idx : 0)
    setLightboxOpen(true)
  }, [activeId, allImages])

  /* ── Cart ─────────────────────────────────────────────────────────── */
  const buildCartItem = useCallback(() => {
    const customizations: Record<
      string,
      { groupName: string; optionName: string; priceModifier: number }
    > = {}

    if (isCustomTab) {
      Object.entries(customSelections).forEach(([groupId, options]) => {
        const group = product.customizationGroups?.find((g) => g.id === groupId)
        if (!group) return
        customizations[groupId] = {
          groupName: group.name,
          optionName: options.map((opt) => opt.name).join(', '),
          priceModifier: options.reduce((sum, opt) => sum + opt.price_modifier, 0),
        }
      })
    }

    return {
      productId: product.id,
      variantCode: isCustomTab ? 'Custom Build' : activeCode,
      variantImageUrl: isCustomTab
        ? (Object.values(customSelections).flat()[0]?.image_url ?? activeImage?.url ?? null)
        : (activeImage?.url ?? null),
      productName: product.name,
      productPrice: displayPrice,
      customizations: isCustomTab ? customizations : undefined,
    }
  }, [
    isCustomTab,
    customSelections,
    product.customizationGroups,
    product.id,
    product.name,
    activeCode,
    activeImage,
    displayPrice,
  ])

  async function handleAddToCart() {
    if (!inStock || isAddingToCart) return
    setIsAddingToCart(true)
    setCartError(null)

    const { error } = await addToCart(buildCartItem(), 1)
    setIsAddingToCart(false)

    if (error) {
      setCartError(error)
      return
    }

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  async function handleBuyNow() {
    if (!inStock || isAddingToCart) return
    setIsAddingToCart(true)
    setCartError(null)

    const { error } = await addToCart(buildCartItem(), 1)
    setIsAddingToCart(false)

    // Don't send the buyer to checkout if the item never made it into the cart.
    if (error) {
      setCartError(error)
      return
    }

    router.push('/checkout')
  }

  /** Image the stager should composite, following the current configuration. */
  const stagerImageUrl = useMemo(() => {
    const withImage = Object.values(customSelections)
      .flat()
      .find((opt) => opt.image_url)
    return withImage?.image_url ?? activeImage?.url ?? ''
  }, [customSelections, activeImage])

  const priceTypeLabel = getPriceTypeLabel(product.priceType)
  const priceLabel = product.requireOrderRequest
    ? 'Request for a quote'
    : `$${formatMoney(displayPrice)} CAD`

  const specs = (product.specifications ?? {}) as Record<string, string>
  const subtitle = specs._subtitle?.trim() || ''
  const highlights = splitLines(specs._highlights).slice(0, 4)
  const whyChoose = splitLines(specs._why_choose)
  const overviewRows = buildOverviewRows(specs, categoryName)
  const docs = product.documents ?? []
  const hasSpecsContent = Boolean(
    specs._specification_text ||
      specs._specification_file_url ||
      (product.whatIsIncluded && product.whatIsIncluded.length > 0) ||
      (product.certificatesStandards && product.certificatesStandards.length > 0) ||
      Object.keys(specs).some((k) => !k.startsWith('_') && !k.startsWith('ar_'))
  )

  const cardTabs: { id: CardTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    ...(hasVariants ? [{ id: 'plans' as CardTab, label: 'Floor Plans' }] : []),
    ...(hasSpecsContent ? [{ id: 'specs' as CardTab, label: 'Specifications' }] : []),
    ...(hasVariants ? [{ id: 'gallery' as CardTab, label: 'Gallery' }] : []),
  ]

  const amberButton = {
    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    border: '1px solid #D97706',
    color: '#1F2937',
  }

  const purchaseBlock = (
    <div>
      {cartError && (
        <p
          role="alert"
          className="mb-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700"
        >
          {cartError}
        </p>
      )}

      {(isCustomTab || !product.requireOrderRequest) && (
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
              {isCustomTab ? 'Configured total' : 'Total'}
            </span>
            {isCustomTab && selectedOptionCount > 0 && (
              <span className="text-[11px] font-semibold text-gray-500">
                Base ${formatMoney(product.price)}
                {optionsTotal > 0 && (
                  <> + ${formatMoney(optionsTotal)} in {selectedOptionCount} options</>
                )}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tight text-gray-900">
              ${formatMoney(displayPrice)}
            </span>
            <span className="text-[10px] font-bold text-gray-400">{priceTypeLabel}</span>
          </div>
        </div>
      )}

      {product.requireOrderRequest ? (
        requestSuccess ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-semibold text-green-700">
            <Check className="h-4 w-4 shrink-0" />
            <span>
              Request <span className="font-bold">{requestSuccess}</span> submitted. The seller
              will be in touch.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              disabled={!inStock}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={amberButton}
            >
              <Send className="h-4 w-4" />
              {inStock ? 'Request a Quote' : 'Out of Stock'}
            </button>
            <WhatsAppLink
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-[#25D366] bg-white px-3 text-sm font-bold text-[#128C7E] transition-colors hover:bg-green-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </WhatsAppLink>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={addedToCart ? { backgroundColor: '#16a34a', color: '#fff' } : amberButton}
          >
            {addedToCart ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock || isAddingToCart}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-[#F59E0B] bg-white px-3 text-sm font-bold text-gray-900 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <main className="bg-gray-50 pb-28 lg:pb-12">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-500">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">Products</Link>
            {categoryName && (
              <>
                <span>/</span>
                <span>{categoryName}</span>
              </>
            )}
            <span>/</span>
            <span className="font-semibold text-gray-900">{product.name}</span>
          </nav>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
            {/* Gallery: sticky while the info card scrolls */}
            <div className="lg:sticky lg:top-24">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <ConfiguratorStage
                  product={product}
                  images={allImages}
                  activeImage={activeImage}
                  masterImage={masterImage}
                  onSelectImage={setActiveId}
                  media={media}
                  mediaOptions={mediaOptions}
                  onMediaChange={handleMediaChange}
                  onOpenLightbox={openLightbox}
                  onOpenAr={hasAr ? () => setStagerMode('ar') : undefined}
                  selections={customSelections}
                  modelUrl={modelUrl}
                  directives={sceneDirectives}
                  studio={studio}
                  onStudioChange={setStudio}
                  onPartsDiscovered={handlePartsDiscovered}
                  hideThumbnails
                />
              </div>

              {hasVariants && (
                <div
                  className="mt-3 flex gap-2.5 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {allImages.map((img, idx) => {
                    const active = img.id === activeImage?.id
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveId(img.id)}
                        aria-label={`Show image ${img.variantCode ?? idx + 1}`}
                        aria-pressed={active}
                        className="h-16 w-[88px] shrink-0 overflow-hidden rounded-lg bg-white transition-all sm:h-[72px] sm:w-[104px]"
                        style={{
                          border: active ? '2px solid #F59E0B' : '2px solid #E5E7EB',
                          opacity: active ? 1 : 0.85,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-5 pt-5 pb-4 sm:px-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800">
                    <ShieldCheck className="h-3 w-3" />
                    Apex Verified Supplier
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    {product.seller.businessName}
                  </span>
                  {product.showStock && (
                    <>
                      <span className="text-gray-300">·</span>
                      {inStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                          <Check className="h-3.5 w-3.5" />
                          In stock ({product.stockQuantity})
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-500">Out of stock</span>
                      )}
                    </>
                  )}
                </div>

                <h1 className="text-2xl font-black leading-tight tracking-tight text-gray-900 sm:text-[28px]">
                  {product.name}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}

                {highlights.length > 0 && (
                  <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
                    {highlights.map((h, i) => {
                      const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
                      return (
                        <li key={h} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <Icon className="h-4 w-4 shrink-0 text-amber-600" />
                          {h}
                        </li>
                      )
                    })}
                  </ul>
                )}

                {product.requireOrderRequest ? (
                  <div className="mt-4 flex items-center gap-3                   rounded-xl bg-[#EA580C] px-4 py-3 shadow-sm">
                                      <Calculator className="h-5 w-5 shrink-0 text-white" />
                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-wide text-white">
                        Custom Quote
                      </p>
                                        <p className="text-xs text-orange-50">
                        Pricing is based on configuration, quantity and destination.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                    <span className="text-3xl font-black tracking-tight text-gray-900">
                      ${formatMoney(displayPrice)}
                    </span>
                    <span className="pb-1 text-xs font-bold text-gray-400">CAD</span>
                    <span className="mb-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                      {priceTypeLabel}
                    </span>
                    {hasDiscount && !isCustomTab && activeImage?.variantPrice == null && (
                      <span className="mb-1 text-sm text-gray-400 line-through">
                        ${formatMoney(product.compareAtPrice!)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {product.hasCustomization && (
                <div className="border-t border-gray-100 px-5 py-3 sm:px-6">
                  <div className="flex rounded-xl bg-gray-100 p-1">
                    {(['ready', 'custom'] as RailTab[]).map((id) => {
                      const selected = tab === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTab(id)}
                          aria-pressed={selected}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
                            selected ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {id === 'ready' ? (
                            <Zap className="h-3.5 w-3.5" style={{ color: selected ? '#F59E0B' : undefined }} />
                          ) : (
                            <Settings className="h-3.5 w-3.5" style={{ color: selected ? '#F59E0B' : undefined }} />
                          )}
                          {id === 'ready'
                            ? 'Ready to Buy'
                            : isFurniture
                              ? 'Customize Furniture'
                              : 'Customize Build'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {isCustomTab ? (
                <div className="flex flex-col gap-6 border-t border-gray-100 px-5 py-5 sm:px-6">
                  <ProductCustomizer
                    groups={product.customizationGroups ?? []}
                    selections={customSelections}
                    onSelectionChange={setCustomSelections}
                  />
                  <BuildStudioPanel
                    studio={studio}
                    onChange={setStudio}
                    discoveredNodes={discoveredNodes}
                    directives={sceneDirectives}
                  />
                </div>
              ) : (
                <div className="border-t border-gray-100">
                  <div role="tablist" className="flex gap-1 overflow-x-auto px-5 sm:px-6">
                    {cardTabs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={cardTab === t.id}
                        onClick={() => setCardTab(t.id)}
                        className={`shrink-0 border-b-[3px] px-3 py-3 text-sm font-bold transition-colors ${
                          cardTab === t.id
                            ? 'border-[#F59E0B] text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                    {cardTab === 'overview' && (
                      <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
                        {overviewRows.length > 0 ? (
                          <dl className="divide-y divide-gray-100 text-sm">
                            {overviewRows.map(([label, value]) => (
                              <div key={label} className="flex items-center justify-between gap-3 py-2">
                                <dt className="text-gray-500">{label}</dt>
                                <dd className="text-right font-semibold text-gray-900">{value}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="text-sm text-gray-500">
                            The seller has not added key details yet.
                          </p>
                        )}
                        {whyChoose.length > 0 && (
                          <div className="rounded-xl bg-amber-50 p-4">
                            <p className="mb-2 text-xs font-black uppercase tracking-wide text-gray-900">
                              Why choose APEX?
                            </p>
                            <ul className="space-y-1.5">
                              {whyChoose.map((w) => (
                                <li key={w} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {cardTab === 'plans' && hasVariants && (
                      <VariantPicker
                        images={allImages}
                        activeId={activeId}
                        basePrice={product.price}
                        onSelect={setActiveId}
                      />
                    )}

                    {cardTab === 'specs' && (
                      <ProductInclusionsPanel
                        whatIsIncluded={product.whatIsIncluded}
                        certificatesStandards={product.certificatesStandards}
                        specifications={product.specifications}
                      />
                    )}

                    {cardTab === 'gallery' && (
                      <div className="grid grid-cols-3 gap-2">
                        {allImages.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => {
                              setLightboxIndex(idx)
                              setLightboxOpen(true)
                            }}
                            className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {docs.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-gray-900">
                    Download Building Documents
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {docs.map((doc) => {
                      const Icon =
                        doc.fileType === 'excel' ? FileSpreadsheet : doc.fileType === 'other' ? File : FileText
                      return (
                        <a
                          key={doc.id}
                          href={doc.url}
                          download={doc.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-800 transition-colors hover:border-[#F59E0B] hover:bg-amber-50"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-amber-600" />
                          <span className="flex-1 truncate">{doc.name}</span>
                          <Download className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {product.hasCustomization && (
                <div className="border-t border-gray-100 px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setStagerMode('demo')}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-[#F59E0B] bg-amber-50 text-sm font-bold text-gray-900 transition-colors hover:bg-amber-100"
                  >
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    Stage this in your room
                  </button>
                </div>
              )}

              <div className="hidden border-t border-gray-100 bg-gray-50 px-5 py-4 sm:px-6 lg:block">
                {purchaseBlock}
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:px-6">
                <Wrench className="h-4 w-4 text-gray-400" />
                Need installation?
                <Link href="/hire-installers" className="font-bold text-amber-700 hover:underline">
                  Hire an installer
                </Link>
              </div>
            </div>
          </div>

          {product.description && (
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 text-lg font-black text-gray-900">About this product</h2>
              <RichTextRenderer html={product.description} />
            </section>
          )}
        </div>

        {/* Mobile purchase bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
          {purchaseBlock}
        </div>
      </main>
      {/* ── Overlays ─────────────────────────────────────────────────── */}
      {requestModalOpen && (
        <OrderRequestModal
          productId={product.id}
          sellerId={product.sellerId}
          productName={product.name}
          productPrice={displayPrice}
          variantCode={isCustomTab ? 'Custom Build' : activeCode}
          customizations={isCustomTab ? buildCartItem().customizations : undefined}
          onClose={() => setRequestModalOpen(false)}
          onSuccess={(rn) => {
            setRequestModalOpen(false)
            setRequestSuccess(rn)
          }}
        />
      )}

      {stagerMode && (
        <StagerOverlay
          product={product}
          activeImageUrl={stagerImageUrl}
          initialMode={stagerMode}
          onClose={() => setStagerMode(null)}
        />
      )}

      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          index={lightboxIndex}
          productName={product.name}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
