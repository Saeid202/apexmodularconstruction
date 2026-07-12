import { ARScanner } from '@/components/kitchen-studio/ARScanner'

export const metadata = {
  title: 'Kitchen Studio | AI Planning',
  description: 'Plan your perfect kitchen using our AR scanning tools.',
}

export default function KitchenStudioPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16">
      {/* Background ambient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dream Kitchen</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Start by capturing your real-world space. Our Apple RoomPlan integration seamlessly builds a 3D model of your room in seconds.
            </p>
          </div>

          <ARScanner />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
               <h3 className="text-xl font-semibold mb-2">1. Scan Room</h3>
               <p className="text-white/60 text-sm">Use your iPhone LiDAR to instantly measure walls, doors, and windows with millimeter precision.</p>
             </div>
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
               <h3 className="text-xl font-semibold mb-2">2. AI Layout</h3>
               <p className="text-white/60 text-sm">Our system analyzes your space and suggests optimal cabinet and island configurations.</p>
             </div>
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
               <h3 className="text-xl font-semibold mb-2">3. Instant Quote</h3>
               <p className="text-white/60 text-sm">Review your design in 3D and get an immediate manufacturing and shipping quote.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
