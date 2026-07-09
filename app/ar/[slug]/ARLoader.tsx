'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, ArrowLeft, Maximize } from 'lucide-react'

interface ARLoaderProps {
  glbUrl: string
  usdzUrl: string
  productName: string
}

export function ARLoader({ glbUrl, usdzUrl, productName }: ARLoaderProps) {
  const modelRef = useRef<any>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  useEffect(() => {
    // Dynamically load the model-viewer script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    script.type = 'module'
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleLaunchAR = () => {
    if (modelRef.current && modelRef.current.activateAR) {
      modelRef.current.activateAR()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-between p-6 z-50 text-white overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-purple-900/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <button 
          onClick={() => window.history.back()}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
          AR Viewer
        </span>
        <div className="w-9" /> {/* spacer for alignment */}
      </div>

      {/* Title & Status */}
      <div className="flex flex-col items-center gap-3 mt-8 z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-yellow-400" />
          True Scale 1:1
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {productName}
        </h1>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Point your camera at an empty space on your floor to see how it fits.
        </p>
      </div>

      {/* 3D Model Hidden/Preview Container */}
      <div className="flex-1 w-full flex items-center justify-center z-10">
        <model-viewer
          ref={modelRef}
          src={glbUrl}
          ios-src={usdzUrl}
          alt={productName}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '300px' }}
          onLoad={() => setIsModelLoaded(true)}
        >
          {/* Custom invisible AR button so we can trigger it via our own big button */}
          <button
            slot="ar-button"
            id="hidden-ar-btn"
            style={{ display: 'none' }}
          >
            AR
          </button>
        </model-viewer>
      </div>

      {/* Main Action Button */}
      <div className="w-full max-w-md mb-8 z-10">
        <button
          onClick={handleLaunchAR}
          className="w-full py-5 rounded-2xl bg-white text-gray-900 font-extrabold text-lg flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Maximize className="h-5 w-5" />
          Launch in Your Room
        </button>
      </div>
    </div>
  )
}
