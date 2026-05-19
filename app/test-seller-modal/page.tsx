"use client";

import { useState } from "react";

export default function TestSellerModalPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSellerAuthModal = () => {
    addResult("Testing seller auth modal trigger...");
    
    // Test the custom event
    window.dispatchEvent(new CustomEvent("open-seller-auth-modal", { detail: "register" }));
    addResult("Dispatched 'open-seller-auth-modal' event with 'register' mode");
    
    setTimeout(() => {
      addResult("Modal should be open now. Check if the seller auth modal appears.");
    }, 100);
  };

  const testSellerAuthModalLogin = () => {
    addResult("Testing seller auth modal with login mode...");
    
    window.dispatchEvent(new CustomEvent("open-seller-auth-modal", { detail: "login" }));
    addResult("Dispatched 'open-seller-auth-modal' event with 'login' mode");
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Seller Auth Modal</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">What to test:</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Click "Sell on Apex Modular Construction" in the navigation - should open modal with "Become a Seller" tab</li>
          <li>2. Click the buttons below to test modal triggers programmatically</li>
          <li>3. Test switching between "Seller Login" and "Become a Seller" tabs</li>
          <li>4. Test form submissions (they should work as before)</li>
          <li>5. Test closing the modal with X button, Escape key, or backdrop</li>
        </ul>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testSellerAuthModal}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Test Seller Auth Modal (Register Mode)
        </button>
        
        <button
          onClick={testSellerAuthModalLogin}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Test Seller Auth Modal (Login Mode)
        </button>
        
        <button
          onClick={clearResults}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Test Results
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Manual Testing Checklist:</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>"Sell on Apex Modular Construction" link in main navigation opens modal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>"Sell on Apex Modular Construction" link in mobile menu opens modal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>"Sell on Apex Modular Construction" link in footer opens modal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Modal defaults to "Become a Seller" tab</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Can switch between "Seller Login" and "Become a Seller" tabs</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Forms work correctly (registration and login)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Modal closes with X button, Escape key, or backdrop click</span>
          </label>
        </div>
      </div>
    </div>
  );
}
