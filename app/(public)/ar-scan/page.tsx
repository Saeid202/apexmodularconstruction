import React from 'react';
import { Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ARScanPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> | { session_id?: string } }) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Session</h1>
          <p className="text-gray-400">No scan session ID was provided.</p>
        </div>
      </div>
    );
  }

  // Verify session exists
  const supabase = await createServerClient();
  const { data: session } = await supabase
    .from('room_scans')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-gray-400">This scanning session has expired or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center shadow-2xl">
        <Smartphone className="w-16 h-16 text-purple-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">App Clip Required</h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          To perform the 3D room scan, you need our iOS App Clip. 
          When this app is published to the App Store, tapping the banner at the top of this screen will instantly launch the native scanner!
        </p>
        
        {/* DEV ONLY: Simulate completion */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Developer Tools</p>
          <form action={async () => {
            'use server';
            const supabase = await createServerClient();
            await supabase.from('room_scans').update({ status: 'completed' }).eq('session_id', sessionId);
            redirect('/ar-scan/success');
          }}>
            <button 
              type="submit"
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Simulate Scan Complete
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">
            Clicking this will trigger the web interface on your computer to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
