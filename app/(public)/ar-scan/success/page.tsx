import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ARScanSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center max-w-md w-full bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Scan Completed!</h1>
        <p className="text-gray-400 mb-8">
          The 3D room data has been sent back to your computer. You can look at your computer screen now!
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
