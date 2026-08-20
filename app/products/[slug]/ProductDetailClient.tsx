'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Check,
  File,
  FileSpreadsheet,
  FileText,
  Download,
  MessageSquare,
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
import { ConfiguratorTopBar } from '@/components/product/configurator/ConfiguratorTopBar'
import {
  ConfiguratorStage,
  type StageMedia,
} from '@/components/product/configurator/ConfiguratorStage'
import { ImageLightbox } from '@/components/product/configurator/ImageLightbox'
import { RailSection } from '@/components/product/configurator/RailSection'
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

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

type RailTab = 'ready' | 'custom'
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

  return (
    <>
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
        <ConfiguratorTopBar
          productName={product.name}
          categoryName={categoryName}
          priceLabel={priceLabel}
          priceCaption={product.requireOrderRequest ? null : priceTypeLabel}
        />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* ── Fixed visual stage ──────────────────────────────────── */}
          {/* The 3D viewer carries its own on-canvas controls, so it gets a
              taller slice on phones than the photo gallery needs. */}
          <div
            className={`relative shrink-0 lg:h-full lg:min-h-0 lg:flex-1 ${
              media === 'model3d' ? 'h-[46vh] min-h-[300px]' : 'h-[38vh] min-h-[220px]'
            }`}
          >
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
            />
          </div>

          {/* ── Option rail ─────────────────────────────────────────── */}
          <aside className="flex min-h-0 flex-1 flex-col border-t border-gray-200 bg-white lg:h-full lg:w-[456px] lg:flex-none lg:border-t-0 lg:border-l xl:w-[520px]">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {/* Identity + price */}
              <div className="px-5 pt-5 pb-4 sm:px-6">
                <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Sold by
                  </span>
                  <span className="text-xs font-bold" style={{ color: PURPLE }}>
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

                <h2 className="text-2xl font-black leading-tight tracking-tight text-gray-900 sm:text-[28px]">
                  {product.name}
                </h2>

                <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                  {product.requireOrderRequest ? (
                    <span className="text-xl font-black" style={{ color: GOLD }}>
                      Request for a quote
                    </span>
                  ) : (
                    <>
                      <span
                        className="text-3xl font-black tracking-tight"
                        style={{ color: PURPLE }}
                      >
                        ${formatMoney(displayPrice)}
                      </span>
                      <span className="pb-1 text-xs font-bold text-gray-400">CAD</span>
                      <span
                        className="mb-1 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                        style={{ color: '#8A6D12', backgroundColor: `${GOLD}20` }}
                      >
                        {priceTypeLabel}
                      </span>
                      {hasDiscount && !isCustomTab && activeImage?.variantPrice == null && (
                        <span className="mb-1 text-sm text-gray-400 line-through">
                          ${formatMoney(product.compareAtPrice!)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Mode switcher */}
              {product.hasCustomization && (
                <div className="sticky top-0 z-10 border-y border-gray-100 bg-white/95 px-5 py-2.5 backdrop-blur sm:px-6">
                  <div className="flex rounded-xl bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setTab('ready')}
                      aria-pressed={tab === 'ready'}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
                        tab === 'ready'
                          ? 'bg-white text-[#4B1D8F] shadow'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Zap
                        className="h-3.5 w-3.5"
                        style={{ color: tab === 'ready' ? GOLD : undefined }}
                      />
                      Ready to Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('custom')}
                      aria-pressed={tab === 'custom'}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
                        tab === 'custom'
                          ? 'bg-white text-[#4B1D8F] shadow'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Settings
                        className="h-3.5 w-3.5"
                        style={{ color: tab === 'custom' ? GOLD : undefined }}
                      />
                      {isFurniture ? 'Customize Furniture' : 'Customize Build'}
                    </button>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="flex flex-col gap-3 px-5 py-5 sm:px-6">
                {isCustomTab ? (
                  <div className="flex flex-col gap-6">
                    <ProductCustomizer
                      groups={product.customizationGroups ?? []}
                      selections={customSelections}
                      onSelectionChange={setCustomSelections}
                    />

                    {/* Studio controls are presentation-only, so they sit below
                        the priced options and stay collapsed by default. */}
                    <BuildStudioPanel
                      studio={studio}
                      onChange={setStudio}
                      discoveredNodes={discoveredNodes}
                      directives={sceneDirectives}
                    />
                  </div>
                ) : (
                  <>
                    {product.description && (
                      <RailSection title="Description">
                        <RichTextRenderer html={product.description} />
                      </RailSection>
                    )}

                    {hasVariants && (
                      <RailSection title="Product Variants" meta={`${allImages.length}`}>
                        <VariantPicker
                          images={allImages}
                          activeId={activeId}
                          basePrice={product.price}
                          onSelect={setActiveId}
                        />
                      </RailSection>
                    )}
                  </>
                )}

                {product.documents && product.documents.length > 0 && (
                  <RailSection
                    title="Documents"
                    icon={<FileText className="h-4 w-4" />}
                    meta={`${product.documents.length}`}
                  >
                    <div className="flex flex-col gap-2">
                      {product.documents.map((doc) => {
                        const Icon =
                          doc.fileType === 'excel'
                            ? FileSpreadsheet
                            : doc.fileType === 'other'
                              ? File
                              : FileText
                        return (
                          <a
                            key={doc.id}
                            href={doc.url}
                            download={doc.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-800 transition-colors hover:border-[#D4AF37] hover:bg-gray-50"
                          >
                            <Icon className="h-4 w-4 shrink-0" style={{ color: PURPLE }} />
                            <span className="flex-1 truncate text-left">{doc.name}</span>
                            <Download className="h-4 w-4 shrink-0 text-gray-400" />
                          </a>
                        )
                      })}
                    </div>
                  </RailSection>
                )}

                <ProductInclusionsPanel
                  whatIsIncluded={product.whatIsIncluded}
                  certificatesStandards={product.certificatesStandards}
                  specifications={product.specifications}
                />

                <RailSection title="Tools & Support" icon={<Sparkles className="h-4 w-4" />}>
                  <div className="flex flex-col gap-2">
                    {/* The AI Stager ships with the customization suite, so it
                        is only offered on products that have it enabled. */}
                    {product.hasCustomization && (
                      <button
                        type="button"
                        onClick={() => setStagerMode('demo')}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{
                          background: `linear-gradient(135deg, ${PURPLE} 0%, #30125C 100%)`,
                          border: `1.5px solid ${GOLD}`,
                        }}
                      >
                        <Sparkles className="h-4 w-4" style={{ color: GOLD }} />
                        Stage this in your room
                      </button>
                    )}

                    {hasVariants && activeCode && (
                      <Link
                        href={`/contact?subject=${encodeURIComponent(
                          `Quote request for ${activeCode}`
                        )}`}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-colors hover:bg-[#EDE9F6]"
                        style={{ borderColor: GOLD, color: PURPLE }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Request quote for {activeCode}
                      </Link>
                    )}

                    <Link
                      href="/hire-installers"
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-colors hover:bg-[#EDE9F6]"
                      style={{ borderColor: `${PURPLE}33`, color: PURPLE }}
                    >
                      <Wrench className="h-4 w-4" />
                      Hire an installer
                    </Link>

                    <WhatsAppLink
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#25D366', border: '1.5px solid #128C7E' }}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Chat on WhatsApp
                    </WhatsAppLink>
                  </div>
                </RailSection>
              </div>
            </div>

            {/* ── Purchase footer ───────────────────────────────────── */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] sm:px-6">
              {cartError && (
                <p
                  role="alert"
                  className="mb-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700"
                >
                  {cartError}
                </p>
              )}

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
                  {product.requireOrderRequest ? (
                    <span className="text-lg font-black" style={{ color: GOLD }}>
                      By quote
                    </span>
                  ) : (
                    <>
                      <span className="text-xl font-black tracking-tight" style={{ color: PURPLE }}>
                        ${formatMoney(displayPrice)}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{priceTypeLabel}</span>
                    </>
                  )}
                </div>
              </div>

              {product.requireOrderRequest ? (
                requestSuccess ? (
                  <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-semibold text-green-700">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>
                      Request <span className="font-bold">{requestSuccess}</span> submitted. The
                      seller will be in touch.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={() => setRequestModalOpen(true)}
                      disabled={!inStock}
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
                    >
                      <Send className="h-4 w-4" />
                      {inStock ? 'Submit Order Request' : 'Out of Stock'}
                    </button>

                    <WhatsAppLink
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#25D366', border: '2px solid #128C7E' }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-current"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span className="hidden sm:inline">WhatsApp</span>
                    </WhatsAppLink>
                  </div>
                )
              ) : (
                <div className={`grid gap-2 ${inStock ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock || isAddingToCart}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: addedToCart ? '#16a34a' : PURPLE,
                      border: `2px solid ${GOLD}`,
                    }}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-4 w-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        {!inStock ? 'Out of Stock' : isAddingToCart ? 'Adding…' : 'Add to Cart'}
                      </>
                    )}
                  </button>

                  {inStock && (
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={isAddingToCart}
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: GOLD,
                        color: '#1a1a2e',
                        border: `2px solid ${PURPLE}`,
                      }}
                    >
                      <Zap className="h-4 w-4" />
                      Buy Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

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
