'use client'

/**
 * DOM-side shell around the 3D canvas: framing, toolbar, loading skeleton and
 * error notice. The canvas itself is code-split so three.js never lands in the
 * initial bundle for the product page.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  TriangleAlert,
  Camera,
  Compass,
  Grid3x3,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Boxes,
} from 'lucide-react'
import type { WebGLRenderer } from 'three'
import { CAMERA_VIEWS, type SceneDirectives, type StudioConfig } from '@/lib/product/model3d'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

// `ssr: false` is only legal inside a Client Component, which this file is.
const ModelViewer3D = dynamic(() => import('./ModelViewer3D'), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
})

function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-gray-50 to-gray-100">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-t-transparent"
        style={{ borderColor: `${GOLD} transparent ${PURPLE} ${PURPLE}` }}
      />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        Preparing 3D studio
      </span>
    </div>
  )
}

interface Props {
  modelUrl: string | null
  productName: string
  directives: SceneDirectives
  studio: StudioConfig
  onStudioChange: (next: StudioConfig) => void
  onPartsDiscovered: (nodeNames: string[]) => void
}

interface ToolButtonProps {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolButton({ label, active = false, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 shadow-sm transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: active ? PURPLE : 'rgba(255,255,255,0.92)',
        borderColor: active ? GOLD : `${PURPLE}33`,
        color: active ? '#fff' : PURPLE,
      }}
    >
      {children}
    </button>
  )
}

export function Build3DPreview({
  modelUrl,
  productName,
  directives,
  studio,
  onStudioChange,
  onPartsDiscovered,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

  const patch = useCallback(
    (next: Partial<StudioConfig>) => onStudioChange({ ...studio, ...next }),
    [studio, onStudioChange]
  )

  const handleCanvasReady = useCallback((renderer: WebGLRenderer) => {
    rendererRef.current = renderer
  }, [])

  const handleSnapshot = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    const link = document.createElement('a')
    link.href = renderer.domElement.toDataURL('image/png')
    link.download = `${productName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-3d.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [productName])

  const toggleFullscreen = useCallback(() => {
    const node = wrapperRef.current
    if (!node) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void node.requestFullscreen?.()
    }
  }, [])

  // Escape exits fullscreen without going through our button, so track the
  // browser's own state rather than assuming ours stayed in sync.
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-white ${
        isFullscreen ? 'h-screen' : 'aspect-[16/10]'
      }`}
      style={{ boxShadow: `0 0 0 1px ${PURPLE}, 0 0 0 4px ${GOLD}, 0 0 0 5px ${PURPLE}` }}
    >
      <ModelViewer3D
        modelUrl={modelUrl}
        directives={directives}
        studio={studio}
        resetKey={resetKey}
        onPartsDiscovered={onPartsDiscovered}
        onCanvasReady={handleCanvasReady}
        onModelError={setModelError}
      />

      {/* View presets — bottom left */}
      <div className="pointer-events-auto absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {CAMERA_VIEWS.map((view) => {
          const active = studio.view === view.id
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => patch({ view: view.id })}
              className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: active ? PURPLE : 'rgba(255,255,255,0.92)',
                color: active ? '#fff' : PURPLE,
                border: `1.5px solid ${active ? GOLD : `${PURPLE}33`}`,
              }}
            >
              {view.label}
            </button>
          )
        })}
      </div>

      {/* Tools — top right */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <ToolButton
          label={studio.autoRotate ? 'Stop turntable' : 'Start turntable'}
          active={studio.autoRotate}
          onClick={() => patch({ autoRotate: !studio.autoRotate })}
        >
          <RotateCw className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Reset view" onClick={() => setResetKey((k) => k + 1)}>
          <RotateCcw className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label={studio.showGround ? 'Hide site' : 'Show site'}
          active={studio.showGround}
          onClick={() => patch({ showGround: !studio.showGround })}
        >
          <Grid3x3 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label={studio.wireframe ? 'Exit framing view' : 'Framing view'}
          active={studio.wireframe}
          onClick={() => patch({ wireframe: !studio.wireframe })}
        >
          <Boxes className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Download snapshot" onClick={handleSnapshot}>
          <Camera className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </ToolButton>
      </div>

      {/* Orbit hint — top left */}
      <div
        className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #30125C 100%)` }}
      >
        <Compass className="h-3.5 w-3.5" style={{ color: GOLD }} />
        Drag to orbit · Scroll to zoom
      </div>

      {/* Non-blocking notice when the product's own model could not be loaded */}
      {modelError && (
        <div className="pointer-events-none absolute bottom-3 right-3 flex max-w-[260px] items-start gap-2 rounded-xl border-2 border-amber-300 bg-amber-50/95 px-3 py-2 shadow-lg">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[11px] font-semibold leading-snug text-amber-800">
            This product&apos;s 3D model could not be loaded. Showing a reference layout instead.
          </p>
        </div>
      )}
    </div>
  )
}
