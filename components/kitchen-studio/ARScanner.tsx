'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createRoomScanSession } from '@/app/actions/room-scans'
import { createBrowserClient } from '@/lib/supabase/client'
import { CheckCircle2, Smartphone, Loader2, Maximize } from 'lucide-react'

interface ARScannerProps {
  onComplete?: (data: any) => void;
}

export function ARScanner({ onComplete }: ARScannerProps = {}) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<'pending' | 'scanning' | 'completed' | 'error'>('pending')
  const [roomData, setRoomData] = useState<any>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  
  const supabase = createBrowserClient()

  useEffect(() => {
    async function initSession() {
      const res = await createRoomScanSession()
      if (res.session) {
        setSessionId(res.session.session_id)
      }
    }
    initSession()
  }, [])

  useEffect(() => {
    if (!sessionId) return

    // Subscribe to changes on this specific session
    const channel = supabase
      .channel('room-scan-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_scans',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updatedRecord = payload.new
          setStatus(updatedRecord.status)
          if (updatedRecord.room_data_json) {
            setRoomData(updatedRecord.room_data_json)
          }
          if (updatedRecord.model_url) {
            setModelUrl(updatedRecord.model_url)
          }
          if (updatedRecord.status === 'completed' && onComplete) {
            onComplete(updatedRecord);
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, supabase])

  // Generate the URL that the QR code will point to
  // In production, this would be an App Clip Universal Link or deep link
  const scanUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ar-scan?session_id=${sessionId}`
    : ''

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border border-white/10 rounded-2xl bg-black/40 backdrop-blur-xl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-white/70">Initializing AR session...</p>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-green-500/30 rounded-2xl bg-green-500/5 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Room Scan Complete!</h3>
        <p className="text-white/70 mb-8 text-center max-w-md">
          We successfully received your room measurements and 3D model. We are now generating your Kitchen Studio plan.
        </p>
        
        {modelUrl && (
          <div className="w-full max-w-2xl aspect-video bg-black/60 rounded-xl border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/50 flex items-center gap-2">
                <Maximize className="h-5 w-5" /> 3D Viewer Ready
              </span>
            </div>
            {/* Here we would typically render a <model-viewer> or Three.js canvas using modelUrl */}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-12 p-8 lg:p-12 border border-white/10 rounded-3xl bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl">
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Smartphone className="h-4 w-4" />
          <span>Requires iPhone with LiDAR</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Scan your room to start
        </h2>
        <p className="text-lg text-white/70 leading-relaxed">
          Use your iPhone to scan this QR code. Our native App Clip will launch instantly—no download required. Walk around your kitchen to capture precise walls, windows, and doors.
        </p>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">1</div>
            <p className="text-white/80">Open your iPhone Camera</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">2</div>
            <p className="text-white/80">Point it at the QR code</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">3</div>
            <p className="text-white/80">Follow the AR instructions on screen</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-3xl shadow-2xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-white rounded-2xl p-2">
          <QRCodeSVG 
            value={scanUrl} 
            size={240} 
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
           {/* Center logo overlay for QR */}
           <div className="bg-white p-1 rounded-md">
             <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
