'use client'

/**
 * The fixed visual half of the configurator.
 *
 * This pane never scrolls. It fills the viewport beside the option rail and
 * swaps between every visual representation the product has: photography,
 * a Sketchfab embed, the product video, the interactive 3D studio, and the
 * mask-composited preview of the buyer's current colour choices.
 */

import { useMemo } from 'react'
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Expand,
  Image as ImageIcon,
  Play,
  Sparkles,
  Layers,
} from 'lucide-react'
import { Build3DPreview } from '@/components/product/three/Build3DPreview'
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/youtube'
import type { SceneDirectives, StudioConfig } from '@/lib/product/model3d'
import type { CustomizationOption, ProductImageData, ProductWithRelations } from '@/types'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

export type StageMedia = 'photo' | 'sketchfab' | 'video' | 'model3d' | 'composite'

type IconComponent = React.ComponentType<{
  className?: string
  style?: React.CSSProperties
}>

const MEDIA_META: Record<StageMedia, { label: string; icon: IconComponent }> = {
  photo: { label: 'Photos', icon: ImageIcon },
  sketchfab: { label: '3D Tour', icon: Box },
  video: { label: 'Video', icon: Play },
  model3d: { label: '3D Model', icon: Box },
  composite: { label: 'Preview', icon: Layers },
}

/**
 * Inline SVG masks are stored unencoded, which browsers reject inside
 * `mask-image: url(...)`. Percent-encode just that case.
 */
function getSafeMaskUrl(url: string | null | undefined): string {
  if (!url) return 'none'
  if (url.startsWith('data:image/svg+xml;utf8,')) {
    const rawSvg = url.substring('data:image/svg+xml;utf8,'.length)
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`
  }
  return url
}

interface Props {
  product: ProductWithRelations
  images: ProductImageData[]
  activeImage: ProductImageData | null
  onSelectImage: (id: string) => void
  media: StageMedia
  /** Which media buttons to offer, in display order. */
  mediaOptions: StageMedia[]
  onMediaChange: (media: StageMedia) => void
  onOpenLightbox: () => void
  /** Omitted when the product has no AR assets. */
  onOpenAr?: () => void
  /** Current customisation picks, used by the composite preview. */
  selections: Record<string, CustomizationOption[]>
  masterImage: ProductImageData | null
  modelUrl: string | null
  directives: SceneDirectives
  studio: StudioConfig
  onStudioChange: (next: StudioConfig) => void
  onPartsDiscovered: (nodeNames: string[]) => void
}

export function ConfiguratorStage({
  product,
  images,
  activeImage,
  onSelectImage,
  media,
  mediaOptions,
  onMediaChange,
  onOpenLightbox,
  onOpenAr,
  selections,
  masterImage,
  modelUrl,
  directives,
  studio,
  onStudioChange,
  onPartsDiscovered,
}: Props) {
  const activeIndex = Math.max(
    0,
    images.findIndex((img) => img.id === activeImage?.id)
  )
  const hasGallery = images.length > 1

  const videoId = useMemo(
    () => (product.youtubeUrl ? extractYouTubeId(product.youtubeUrl) : null),
    [product.youtubeUrl]
  )

  function step(delta: number) {
    if (images.length === 0) return
    const next = images[(activeIndex + delta + images.length) % images.length]
    onSelectImage(next.id)
  }

  return (
    <section
      data-stage="configurator"
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, #FFFFFF 0%, #F5F2FB 45%, #E7E0F4 100%)',
      }}
      aria-label={`${product.name} visuals`}
    >
      {/* ── Media ─────────────────────────────────────────────────────── */}
      {media === 'photo' && activeImage && (
        <button
          type="button"
          onClick={onOpenLightbox}
          className="group absolute inset-0 block h-full w-full cursor-zoom-in"
          aria-label="Enlarge image"
        >
          {/* Fills the stage edge to edge. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage.url}
            alt={activeImage.altText ?? product.name}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
          {/* Scrim so the thumbnail rail, counter and variant badge stay legible
              over a full-bleed photo. */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span
              className="rounded-full p-3.5 shadow-xl"
              style={{ backgroundColor: 'rgba(75,29,143,0.78)' }}
            >
              <Expand className="h-6 w-6 text-white" />
            </span>
          </span>
        </button>
      )}

      {media === 'photo' && !activeImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
          <ImageIcon className="h-10 w-10" />
          <span className="text-xs font-black uppercase tracking-widest">No imagery yet</span>
        </div>
      )}

      {media === 'sketchfab' && product.specifications?.sketchfab_embed_url && (
        <iframe
          title={`${product.name} 3D tour`}
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src={product.specifications.sketchfab_embed_url}
          className="absolute inset-0 h-full w-full border-0 bg-white"
        />
      )}

      {media === 'video' && videoId && (
        <div className="absolute inset-0 bg-black">
          <iframe
            src={getYouTubeEmbedUrl(videoId)}
            title={`${product.name} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="h-full w-full border-0"
          />
        </div>
      )}

      {media === 'model3d' && (
        <div className="absolute inset-0">
          <Build3DPreview
            fill
            modelUrl={modelUrl}
            productName={product.name}
            directives={directives}
            studio={studio}
            onStudioChange={onStudioChange}
            onPartsDiscovered={onPartsDiscovered}
          />
        </div>
      )}

      {media === 'composite' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Fills the stage, which also keeps the zone masks below aligned:
              they are stretched to the stage box, not to a letterboxed image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={masterImage?.url ?? activeImage?.url ?? ''}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          {/* One tinted layer per zone-bound selection. */}
          {Object.entries(selections).map(([groupId, selectedOptions]) => {
            const group = product.customizationGroups?.find((g) => g.id === groupId)
            const targetZoneId = group?.target_zone_id
            if (!group || !targetZoneId) return null

            const zone = product.customizationZones?.find((z) => z.id === targetZoneId)
            if (!zone?.mask_url) return null

            const opt = selectedOptions[0]
            if (!opt) return null

            return (
              <div
                key={groupId}
                className="pointer-events-none absolute inset-0 transition-all duration-300"
                style={{
                  maskImage: `url("${getSafeMaskUrl(zone.mask_url)}")`,
                  WebkitMaskImage: `url("${getSafeMaskUrl(zone.mask_url)}")`,
                  maskSize: '100% 100%',
                  WebkitMaskSize: '100% 100%',
                  backgroundColor: opt.color_hex || 'transparent',
                  backgroundImage: opt.image_url ? `url("${opt.image_url}")` : 'none',
                  backgroundSize: 'cover',
                  mixBlendMode: opt.image_url ? 'normal' : 'multiply',
                  opacity: opt.image_url ? 0.95 : 0.8,
                }}
              />
            )
          })}
        </div>
      )}

      {/* ── Media switcher ────────────────────────────────────────────── */}
      {mediaOptions.length > 1 && (
        <div className="pointer-events-auto absolute top-3 left-3 z-20 flex rounded-2xl bg-white/85 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-md sm:top-4 sm:left-4">
          {mediaOptions.map((option) => {
            const meta = MEDIA_META[option]
            const Icon = meta.icon
            const active = media === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onMediaChange(option)}
                aria-pressed={active}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all sm:px-3"
                style={{
                  backgroundColor: active ? PURPLE : 'transparent',
                  color: active ? '#fff' : '#6B7280',
                  boxShadow: active ? `0 2px 10px ${PURPLE}44` : 'none',
                }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: active ? GOLD : undefined }} />
                <span className="hidden sm:inline">{meta.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── AR launcher ───────────────────────────────────────────────── */}
      {onOpenAr && (
        <button
          type="button"
          onClick={onOpenAr}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:top-4 sm:right-4"
          style={{
            background: `linear-gradient(135deg, ${PURPLE} 0%, #30125C 100%)`,
            borderColor: GOLD,
          }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
          View in AR
        </button>
      )}

      {/* ── Gallery navigation ────────────────────────────────────────── */}
      {media === 'photo' && hasGallery && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous image"
            className="absolute top-1/2 left-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white hover:text-[#4B1D8F] active:scale-95 sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next image"
            className="absolute top-1/2 right-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white hover:text-[#4B1D8F] active:scale-95 sm:right-4"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <span className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-black tracking-widest text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        </>
      )}

      {/* Variant code of the visible photo */}
      {media === 'photo' && activeImage?.variantCode && (
        <span
          className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-lg px-2.5 py-1 text-xs font-black text-white shadow-lg"
          style={{ backgroundColor: 'rgba(75,29,143,0.88)', border: `1px solid ${GOLD}` }}
        >
          {activeImage.variantCode}
        </span>
      )}

      {/* ── Thumbnail rail ───────────────────────────────────────────── */}
      {media === 'photo' && hasGallery && (
        <div className="absolute bottom-14 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 justify-center sm:bottom-16">
          <div
            className="flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-white/85 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-md"
            style={{ scrollbarWidth: 'thin' }}
          >
            {images.map((img, idx) => {
              const active = img.id === activeImage?.id
              const label = img.variantCode ?? `#${idx + 1}`
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => onSelectImage(img.id)}
                  title={label}
                  aria-label={`Show image ${label}`}
                  aria-pressed={active}
                  className="group/thumb flex shrink-0 flex-col items-center gap-1"
                >
                  <span
                    className="block h-11 w-11 overflow-hidden rounded-xl transition-transform sm:h-14 sm:w-14"
                    style={{
                      border: active ? `2px solid ${GOLD}` : '2px solid transparent',
                      boxShadow: active ? `0 0 0 2px ${PURPLE}` : 'none',
                      transform: active ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={label}
                      className="h-full w-full bg-white object-cover"
                    />
                  </span>
                  {img.variantCode && (
                    <span
                      className="hidden max-w-[64px] truncate text-[9px] font-bold sm:block"
                      style={{ color: active ? PURPLE : '#9CA3AF' }}
                    >
                      {img.variantCode}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
