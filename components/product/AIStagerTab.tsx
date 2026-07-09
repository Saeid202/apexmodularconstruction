'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, 
  Upload, 
  Layers, 
  CheckCircle2, 
  Mail, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Download, 
  Maximize2, 
  Sliders, 
  Eye, 
  RefreshCw, 
  SlidersHorizontal,
  FlipHorizontal,
  FlipVertical,
  Undo,
  Info,
  ShoppingCart
} from 'lucide-react'
import type { ProductWithRelations } from '@/types'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface AIStagerTabProps {
  product?: ProductWithRelations
  activeImageUrl?: string
}

export function AIStagerTab({ product, activeImageUrl }: AIStagerTabProps) {
  // Mode selection: 'demo', 'upload', or 'ar'
  const [stageMode, setStageMode] = useState<'demo' | 'upload' | 'ar'>('demo')
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(window.location.href)}`)
      
      const handleSwitch = () => {
        setStageMode('ar')
      }
      window.addEventListener('switch-to-ar-tab', handleSwitch)
      return () => {
        window.removeEventListener('switch-to-ar-tab', handleSwitch)
      }
    }
  }, [])

  useEffect(() => {
    if (stageMode !== 'ar') return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    script.type = 'module'
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [stageMode])
  
  // Before/After slider (for demo mode)
  const [sliderPosition, setSliderPosition] = useState(50)
  
  // Waitlist email form
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Upload/Stager state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  
  // Product overlay adjustments
  const [productPosition, setProductPosition] = useState({ x: 120, y: 80 })
  const [scale, setScale] = useState(0.8)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [opacity, setOpacity] = useState(100)
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'screen' | 'overlay'>('normal')
  const [isFlippedH, setIsFlippedH] = useState(false)
  const [isFlippedV, setIsFlippedV] = useState(false)
  const [hasShadow, setHasShadow] = useState(true)
  const [showOriginal, setShowOriginal] = useState(false)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const productRef = useRef<HTMLDivElement>(null)

  // Fallback product image URL
  const productImageUrl = activeImageUrl || (product?.images && product.images.length > 0 ? product.images[0].url : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80')

  // Sample room images for quick testing
  const sampleRooms = [
    {
      id: 'cozy',
      name: 'Modern Empty Living Room',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80'
    },
    {
      id: 'loft',
      name: 'Sunlight Loft Space',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=80'
    },
    {
      id: 'studio',
      name: 'Bright Wooden Bedroom',
      url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200&q=80'
    }
  ]

  const processingSteps = [
    'Uploading room photo...',
    'Analyzing room layout and perspective bounds...',
    'Removing existing background furniture with AI...',
    'Evaluating lighting directions and shadow maps...',
    'Placing your customized product into the room...'
  ]

  // Handle Waitlist Subscribe
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubscribed(true)
      setEmail('')
    }, 1000)
  }

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          triggerStaging(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger simulated AI staging sequence
  const triggerStaging = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setIsProcessing(true)
    setProcessingProgress(0)
    setActiveStep(0)
  }

  useEffect(() => {
    if (!isProcessing) return

    const duration = 3800 // 3.8 seconds
    const intervalTime = 40
    const stepsCount = processingSteps.length
    const increment = 100 / (duration / intervalTime)

    let currentProgress = 0
    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(timer)
        setTimeout(() => {
          setIsProcessing(false)
          // Center the product when staging completes
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setProductPosition({
              x: Math.max(20, rect.width / 2 - 120),
              y: Math.max(20, rect.height / 2 - 100)
            })
          }
        }, 500)
      }
      setProcessingProgress(Math.round(currentProgress))

      // Update active step dynamically
      const stepIdx = Math.min(
        Math.floor((currentProgress / 100) * stepsCount),
        stepsCount - 1
      )
      setActiveStep(stepIdx)
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isProcessing])

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (showOriginal) return
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (showOriginal || e.touches.length !== 1) return
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    setIsDragging(true)
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      
      let newX = e.clientX - containerRect.left - dragStart.x
      let newY = e.clientY - containerRect.top - dragStart.y

      // Bound within container roughly
      newX = Math.max(-100, Math.min(newX, containerRect.width - 50))
      newY = Math.max(-100, Math.min(newY, containerRect.height - 50))

      setProductPosition({ x: newX, y: newY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1 || !containerRef.current) return
      const touch = e.touches[0]
      const containerRect = containerRef.current.getBoundingClientRect()

      let newX = touch.clientX - containerRect.left - dragStart.x
      let newY = touch.clientY - containerRect.top - dragStart.y

      newX = Math.max(-100, Math.min(newX, containerRect.width - 50))
      newY = Math.max(-100, Math.min(newY, containerRect.height - 50))

      setProductPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, dragStart])

  // Canvas composite download
  const handleDownload = () => {
    if (!uploadedImage || !productImageUrl) return

    const canvas = document.createElement('canvas')
    const bgImg = new Image()
    const prodImg = new Image()

    bgImg.crossOrigin = 'anonymous'
    prodImg.crossOrigin = 'anonymous'

    bgImg.onload = () => {
      canvas.width = bgImg.naturalWidth
      canvas.height = bgImg.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw background room
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

      // Load product image next
      prodImg.onload = () => {
        ctx.save()

        // Calculate scaling from screen container to actual image pixels
        if (!containerRef.current || !productRef.current) {
          ctx.restore()
          return
        }
        const containerRect = containerRef.current.getBoundingClientRect()
        const productRect = productRef.current.getBoundingClientRect()
        
        const scaleX = canvas.width / containerRect.width
        const scaleY = canvas.height / containerRect.height

        const drawW = productRect.width * scaleX
        const drawH = productRect.height * scaleY

        // Target placement center in canvas coordinates
        const targetCenterX = (productPosition.x + productRect.width / 2) * scaleX
        const targetCenterY = (productPosition.y + productRect.height / 2) * scaleY

        ctx.translate(targetCenterX, targetCenterY)
        ctx.rotate((rotation * Math.PI) / 180)

        // Apply flip factors
        const finalFlipX = isFlippedH ? -1 : 1
        const finalFlipY = isFlippedV ? -1 : 1
        ctx.scale(finalFlipX, finalFlipY)

        // Apply image filters
        let filterString = `brightness(${brightness}%) contrast(${contrast}%) opacity(${opacity}%)`
        ctx.filter = filterString

        // Draw shadow on canvas if enabled
        if (hasShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
          ctx.shadowBlur = 15
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 10
        }

        // Draw product centered on its translated location
        ctx.drawImage(prodImg, -drawW / 2, -drawH / 2, drawW, drawH)

        ctx.restore()

        try {
          const link = document.createElement('a')
          link.download = `staged-${product?.slug || 'my-room'}.png`
          link.href = canvas.toDataURL('image/png')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } catch (e) {
          console.error(e)
          alert('Canvas download completed! (If image failed to save due to cross-origin server headers, you can take a screenshot of your beautiful room creation!)')
        }
      }
      prodImg.src = productImageUrl
    }
    bgImg.src = uploadedImage
  }

  // Reset stager settings
  const handleReset = () => {
    setScale(0.8)
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setOpacity(100)
    setBlendMode('normal')
    setIsFlippedH(false)
    setIsFlippedV(false)
    setHasShadow(true)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setProductPosition({
        x: rect.width / 2 - 120,
        y: rect.height / 2 - 100
      })
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. Header Area */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white uppercase tracking-wider"
              style={{ 
                background: `linear-gradient(135deg, ${PURPLE} 0%, #6830be 100%)`,
                boxShadow: `0 0 12px ${PURPLE}44`
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-spin duration-1000" />
              AI Stager
            </span>
            <span 
              className="rounded-full px-2.5 py-0.5 text-xs font-bold border uppercase tracking-widest bg-green-50 text-green-700 border-green-200"
            >
              Live Beta
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setStageMode('demo')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stageMode === 'demo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Interactive Demo
            </button>
            <button
              onClick={() => setStageMode('upload')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                stageMode === 'upload'
                  ? 'bg-white text-[#4B1D8F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Upload className="h-3 w-3" />
              Upload Your Room
            </button>
            {(product?.specifications?.ar_glb_url || product?.specifications?.ar_usdz_url) && (
              <button
                onClick={() => setStageMode('ar')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  stageMode === 'ar'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-purple-700'
                }`}
              >
                <Sparkles className="h-3 w-3 text-[#D4AF37] animate-pulse" />
                View in AR (3D)
              </button>
            )}
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {stageMode === 'demo' ? 'AI-powered home staging' : stageMode === 'upload' ? 'Visualize in your actual room' : 'View in Your Room (Augmented Reality)'}
        </h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
          {stageMode === 'demo'
            ? 'Drag the slider to clear out a messy room and stage it with high-end furniture. See the difference AI makes in real-time!'
            : stageMode === 'upload'
            ? 'Upload a picture of your room, or choose a sample template. Our AI Stager will scan boundaries and let you style your selected product.'
            : 'Point your smartphone at your floor to visualize this furniture model in real-time at 1:1 true scale, or interact with the 3D model below.'}
        </p>
      </div>

      {/* 2. Main Content Canvas Area */}
      {stageMode === 'ar' ? (
        /* AR / 3D MODEL VIEWER */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full bg-gray-50 p-6 rounded-3xl border border-gray-200/50 shadow-sm animate-in fade-in duration-300">
          <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[500px] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-inner flex items-center justify-center">
            {/* Loading model viewer web component via CDN */}
            <model-viewer
              src={product?.specifications?.ar_glb_url}
              ios-src={product?.specifications?.ar_usdz_url}
              alt={product?.name || "Product 3D Model"}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              poster={productImageUrl}
              shadow-intensity="1.5"
              exposure="1"
              environment-image="legacy"
              style={{ width: '100%', height: '100%', outline: 'none' }}
            >
              {/* Custom AR Button */}
              <button
                slot="ar-button"
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300/80 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                View in Your Room
              </button>
            </model-viewer>
          </div>

          <div className="flex flex-col justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                Web AR Compatibility
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-outfit">Scan & View in Your Space</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Use your mobile phone's built-in AR engine to project this furniture model at 1:1 true scale directly onto your floor. See how it fits and matches your room style.
              </p>

              {/* QR Code Container */}
              {qrUrl ? (
                <div className="flex flex-col items-center gap-2 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 w-fit mx-auto mt-2">
                  <img src={qrUrl} alt="Scan QR code" className="w-72 h-72 object-contain rounded-xl shadow-md border bg-white p-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Scan with Smartphone</span>
                </div>
              ) : (
                <div className="w-72 h-72 bg-gray-100 animate-pulse rounded-xl mx-auto mt-2" />
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">How to use:</div>
              <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                <li>Scan the QR code with your iPhone, iPad, or Android device.</li>
                <li>Tap <strong className="text-purple-700">"View in Your Space"</strong> on your device screen.</li>
                <li>Point camera to an open floor and move it slightly to place model.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : stageMode === 'demo' ? (
        /* INTERACTIVE SLIDER (DEMO MODE) */
        <div 
          className="relative w-full aspect-[16/9] overflow-hidden rounded-3xl bg-gray-900 select-none shadow-2xl group border-2"
          style={{ borderColor: `${PURPLE}22` }}
        >
          {/* Underlay: Before Image */}
          <img 
            src="/stager_room_before.png" 
            alt="Original room (Before)" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              // Fallback if local image not found
              e.currentTarget.src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80'
            }}
          />
          <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            <span className="text-xs font-extrabold text-white uppercase tracking-widest">Before: Messy Room</span>
          </div>

          {/* Overlay: After Image (Clipped) */}
          <img 
            src="/stager_room_after.png" 
            alt="AI Staged room (After)" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
            }}
            onError={(e) => {
              // Fallback if local image not found
              e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
            }}
          />
          <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: GOLD }}>After: Staged Sofa</span>
          </div>

          {/* Range Input controller positioned on top of everything */}
          <input 
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            aria-label="Before/After Slider"
          />

          {/* The Slider separator line */}
          <div 
            className="absolute top-0 bottom-0 w-1 pointer-events-none z-20 shadow-lg"
            style={{ 
              left: `${sliderPosition}%`, 
              background: `linear-gradient(to bottom, ${GOLD}, ${PURPLE}, ${GOLD})` 
            }}
          >
            {/* Slider Handle button */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ 
                backgroundColor: 'white', 
                borderColor: PURPLE, 
                boxShadow: `0 0 15px ${PURPLE}55`
              }}
            >
              <div className="flex gap-1 items-center justify-center text-gray-800">
                <ChevronLeft className="h-4 w-4" style={{ color: PURPLE }} />
                <ChevronRight className="h-4 w-4" style={{ color: PURPLE }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* UPLOAD & INTERACTIVE PLACER MODE */
        <div className="flex flex-col gap-6">
          {!uploadedImage ? (
            /* UPLOAD PORTAL & TEMPLATE SELECTOR */
            <div className="flex flex-col gap-6">
              {/* Drag/Drop Zone */}
              <div 
                className="border-3 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-purple-50/30 group"
                style={{ borderColor: `${PURPLE}44` }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${PURPLE}15 0%, ${GOLD}15 100%)`,
                    border: `1px solid ${PURPLE}22` 
                  }}
                >
                  <Upload className="h-8 w-8" style={{ color: PURPLE }} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Upload your room photo</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                    Take a photo of your empty or cluttered room. Drag and drop it here, or click to choose from files.
                  </p>
                </div>

                <label 
                  className="px-6 py-2.5 rounded-xl text-sm font-extrabold text-white cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #2f125a 100%)` }}
                >
                  Choose Room File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>

                <span className="text-xs text-gray-400">Supports JPG, PNG (Max 10MB)</span>
              </div>

              {/* Quick Sample Selector */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <Info className="h-4 w-4" style={{ color: PURPLE }} />
                  Don't have a photo? Try one of our room templates:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sampleRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => triggerStaging(room.url)}
                      className="group flex flex-col gap-2 p-2.5 rounded-2xl border text-left bg-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ borderColor: `${PURPLE}11` }}
                    >
                      <div className="aspect-[3/2] w-full rounded-xl overflow-hidden bg-gray-100 relative">
                        <img 
                          src={room.thumbnail} 
                          alt={room.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-black text-white bg-black/60 px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-wider scale-95 group-hover:scale-100 transition-all">
                            Use Template
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-800 tracking-tight leading-tight px-1 block truncate">
                        {room.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isProcessing ? (
            /* AI PROCESSING ENGINE PANEL */
            <div 
              className="relative w-full aspect-[16/9] overflow-hidden rounded-3xl bg-gray-950 flex items-center justify-center shadow-2xl border border-white/10"
            >
              {/* Blurred Room background */}
              <img 
                src={uploadedImage} 
                alt="Room Staging" 
                className="absolute inset-0 w-full h-full object-cover filter blur-md brightness-50 opacity-60 scale-105 pointer-events-none" 
              />
              
              {/* High-tech Scanning laser line */}
              <div 
                className="absolute left-0 right-0 h-1 z-15 pointer-events-none animate-scan shadow-[0_0_15px_#D4AF37]"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` 
                }} 
              />

              {/* Progress Card */}
              <div className="z-10 bg-black/75 backdrop-blur-md p-8 rounded-2xl border border-white/15 max-w-md w-[90%] flex flex-col gap-6 shadow-3xl text-center">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse" 
                      style={{ backgroundColor: GOLD }} 
                    />
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-900 border border-white/20 animate-spin duration-3000"
                    >
                      <Sparkles className="h-6 w-6 text-yellow-300" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-black text-white uppercase tracking-wider">Cargoplus AI Stager v2.0</h4>
                  <p className="text-xs text-yellow-200 font-medium">Reimagining space context...</p>
                </div>

                {/* Stepper display */}
                <div className="flex flex-col gap-2 text-left">
                  {processingSteps.map((step, idx) => {
                    const isDone = idx < activeStep
                    const isCurrent = idx === activeStep
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        <div 
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                            isDone 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                                ? 'bg-yellow-400 text-gray-900 animate-pulse' 
                                : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`truncate font-semibold ${isDone ? 'text-gray-300' : isCurrent ? 'text-yellow-300 font-bold' : 'text-gray-600'}`}>
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-white font-extrabold">
                    <span>PROGRESS</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-100"
                      style={{ 
                        width: `${processingProgress}%`,
                        background: `linear-gradient(90deg, ${PURPLE} 0%, ${GOLD} 100%)`,
                        boxShadow: `0 0 10px ${GOLD}88` 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE WORKSPACE (STAGING RUNNING) */
            <div className="flex flex-col gap-6">
              {/* Workspace Container */}
              <div 
                ref={containerRef}
                id="staging-canvas-container"
                className="relative w-full aspect-[16/9] overflow-hidden rounded-3xl bg-gray-950 select-none shadow-2xl border-2 cursor-crosshair group"
                style={{ borderColor: `${PURPLE}22` }}
              >
                {/* Background Room */}
                <img 
                  src={uploadedImage} 
                  alt="Staging Background" 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                />

                {/* Shadow/Overlay Guidelines */}
                {!showOriginal && (
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg text-[10px] text-gray-300 font-semibold pointer-events-none">
                    🎯 DRAG PRODUCT TO PLACE • USE SLIDERS TO SCALE & BLEND
                  </div>
                )}

                {/* Active Product overlay */}
                {!showOriginal && (
                  <div
                    ref={productRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className={`absolute select-none cursor-move transition-shadow duration-300 ${
                      isDragging ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black/50' : 'hover:ring-1 hover:ring-white/30'
                    }`}
                    style={{
                      left: `${productPosition.x}px`,
                      top: `${productPosition.y}px`,
                      transform: `rotate(${rotation}deg) scale(${scale * (isFlippedH ? -1 : 1)}, ${scale * (isFlippedV ? -1 : 1)})`,
                      filter: `
                        brightness(${brightness}%) 
                        contrast(${contrast}%) 
                        opacity(${opacity}%)
                        ${hasShadow ? 'drop-shadow(0 15px 20px rgba(0,0,0,0.55))' : ''}
                      `,
                      mixBlendMode: blendMode,
                      transformOrigin: 'center center'
                    }}
                  >
                    <img
                      src={productImageUrl}
                      alt={product?.name || 'Product'}
                      className="w-48 sm:w-60 h-auto pointer-events-none object-contain max-h-[220px]"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Compare Original Button */}
                <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                  <button
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="bg-black/75 hover:bg-black/95 text-white backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Press and hold to view original room"
                  >
                    <Eye className="h-4 w-4" />
                    Hold to Compare
                  </button>
                </div>
              </div>

              {/* Workspace Adjustments Controls Panel */}
              <div 
                className="p-6 rounded-3xl border flex flex-col gap-6 bg-white"
                style={{ borderColor: `${PURPLE}15` }}
              >
                <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" style={{ color: PURPLE }} />
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Stager Workspace Controls</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                      title="Reset Position & Settings"
                    >
                      <Undo className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 border hover:bg-gray-50 transition-all"
                    >
                      Upload Different Room
                    </button>
                  </div>
                </div>

                {/* Adjustment Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column: Dimensions */}
                  <div className="flex flex-col gap-5">
                    {/* Scale */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>PRODUCT SIZE</span>
                        <span>{Math.round(scale * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.2" 
                        max="2" 
                        step="0.05"
                        value={scale} 
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full accent-[#4B1D8F] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Rotation */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>PERSPECTIVE ANGLE</span>
                        <span>{rotation}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={rotation} 
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full accent-[#4B1D8F] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Flip and Shadow Quick Toggles */}
                    <div className="flex gap-3 flex-wrap pt-2">
                      <button
                        onClick={() => setIsFlippedH(!isFlippedH)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isFlippedH 
                            ? 'bg-purple-50 text-[#4B1D8F]' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{ borderColor: isFlippedH ? PURPLE : '#E2E8F0' }}
                      >
                        <FlipHorizontal className="h-4 w-4" />
                        Flip Horizontal
                      </button>
                      <button
                        onClick={() => setIsFlippedV(!isFlippedV)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isFlippedV 
                            ? 'bg-purple-50 text-[#4B1D8F]' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{ borderColor: isFlippedV ? PURPLE : '#E2E8F0' }}
                      >
                        <FlipVertical className="h-4 w-4" />
                        Flip Vertical
                      </button>
                      <button
                        onClick={() => setHasShadow(!hasShadow)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          hasShadow 
                            ? 'bg-purple-50 text-[#4B1D8F]' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{ borderColor: hasShadow ? PURPLE : '#E2E8F0' }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-black/60 shadow-sm" />
                        Ambient Shadow
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Lighting & Blending */}
                  <div className="flex flex-col gap-5">
                    {/* Brightness */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>AMBIENT LIGHT BRIGHTNESS</span>
                        <span>{brightness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={brightness} 
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-[#4B1D8F] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>CONTRAST ADJUSTMENT</span>
                        <span>{contrast}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={contrast} 
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-[#4B1D8F] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Blend Mode Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-gray-700">LIGHT BLENDING TECHNIQUE</span>
                      <select
                        value={blendMode}
                        onChange={(e) => setBlendMode(e.target.value as any)}
                        className="w-full px-3.5 py-2 text-xs font-bold border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="normal">Normal Placement</option>
                        <option value="multiply">Multiply (Darks Blended - Good for white background)</option>
                        <option value="overlay">Overlay (Combines shadows & highlights)</option>
                        <option value="screen">Screen (Lightens room details)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex gap-4 border-t pt-5 mt-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={handleDownload}
                    className="flex-1 min-h-[48px] px-6 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/10 cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #2f125a 100%)` }}
                  >
                    <Download className="h-5 w-5" />
                    Download Staged Design
                  </button>

                  <button
                    onClick={() => {
                      // Trigger Add to Cart on parent if available (simulate clicking details Buy button)
                      const cartBtn = document.querySelector('button[onClick*="handleAddToCart"]') as HTMLButtonElement
                      if (cartBtn) {
                        cartBtn.click()
                      } else {
                        alert('Adding staged configuration to your checkout options!')
                      }
                    }}
                    className="flex-1 min-h-[48px] px-6 rounded-xl font-extrabold text-sm border-2 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer bg-white"
                    style={{ borderColor: GOLD, color: PURPLE }}
                  >
                    <ShoppingCart className="h-5 w-5" style={{ color: GOLD }} />
                    Cart Staged Product
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Three Columns Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div 
          className="flex flex-col gap-3 p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: `${PURPLE}15`,
            boxShadow: `0 4px 20px rgba(75, 29, 143, 0.03)`
          }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${PURPLE}0C` }}
          >
            <Upload className="h-6 w-6" style={{ color: PURPLE }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your photo, your room</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Shoppers upload a photo of their existing space and AI removes the furniture automatically — no setup, no software, no styling expertise.
          </p>
        </div>

        {/* Card 2 */}
        <div 
          className="flex flex-col gap-3 p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: `${PURPLE}15`,
            boxShadow: `0 4px 20px rgba(75, 29, 143, 0.03)`
          }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${GOLD}10` }}
          >
            <Layers className="h-6 w-6" style={{ color: GOLD }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Styled with your products</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Drop in your 3D products, so shoppers see how a piece looks against their palette, their light, their room — not a generic showroom.
          </p>
        </div>

        {/* Card 3 */}
        <div 
          className="flex flex-col gap-3 p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: `${PURPLE}15`,
            boxShadow: `0 4px 20px rgba(75, 29, 143, 0.03)`
          }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${PURPLE}0C` }}
          >
            <CheckCircle2 className="h-6 w-6" style={{ color: PURPLE }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Confidence to commit</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Removes the biggest barrier to buying high-consideration furniture online: uncertainty about how it'll actually look at home.
          </p>
        </div>

      </div>

      {/* 4. Notify Me Container */}
      <div 
        className="relative overflow-hidden rounded-2xl p-8 border flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ 
          background: `linear-gradient(135deg, ${PURPLE} 0%, #2f125a 100%)`,
          borderColor: GOLD,
          boxShadow: `0 8px 30px ${PURPLE}33`
        }}
      >
        {/* Dynamic Glow decoration */}
        <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full blur-3xl opacity-20" style={{ backgroundColor: GOLD }} />

        <div className="flex flex-col gap-1.5 z-10 text-center md:text-left">
          <h4 className="text-xl font-bold text-white">Be the first to experience AI Staging</h4>
          <p className="text-sm text-purple-100 max-w-md">
            Join the waitlist to receive updates and get early access when the AI Staging launch begins.
          </p>
        </div>

        <div className="w-full md:w-auto min-w-[280px] z-10">
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 text-green-200 px-6 py-3.5 rounded-xl font-bold text-sm animate-in zoom-in duration-300">
              <Check className="h-5 w-5 text-green-300" />
              <span>You're on the list! Stay tuned.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-purple-400/30 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl font-extrabold text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ 
                  backgroundColor: GOLD, 
                  color: '#1a1a2e',
                  boxShadow: `0 4px 12px ${GOLD}55`
                }}
              >
                {isSubmitting ? 'Joining...' : 'Notify Me'}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
