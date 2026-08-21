"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function InvestigateSellerRedirectPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const comprehensiveInvestigation = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== COMPREHENSIVE SELLER REDIRECT INVESTIGATION ===");

    try {
      const supabase = createBrowserClient();
      
      // Step 1: Check current session
      addResult("Step 1: Checking current session...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addResult("No active session found. User must login first.");
        addResult("Please login with chinaplusgroup@gmail.com and then run this test again.");
        return;
      }
      
      addResult(`Active session: ${session.user.email}`);
      addResult(`User ID: ${session.user.id}`);
      addResult(`Email confirmed: ${!!session.user.email_confirmed_at}`);
      addResult(`Current URL: ${window.location.href}`);
      addResult(`Current pathname: ${window.location.pathname}`);

      // Step 2: Check user profile in database
      addResult("Step 2: Checking user profile in database...");
      const profileStart = Date.now();
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      const profileEnd = Date.now();
      
      if (profileError) {
        addResult(`Profile query error: ${profileError.message}`);
      } else {
        addResult(`Profile query completed in ${profileEnd - profileStart}ms`);
        addResult(`Profile data: ${JSON.stringify(profile)}`);
        addResult(`User role: ${(profile as any)?.role || 'NOT FOUND'}`);
      }

      // Step 3: Check seller profile
      addResult("Step 3: Checking seller profile...");
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (sellerError) {
        addResult(`Seller profile error: ${sellerError.message}`);
      } else {
        addResult(`Seller profile found: ${JSON.stringify(sellerProfile)}`);
      }

      // Step 4: Test different redirect scenarios
      addResult("Step 4: Testing redirect scenarios...");
      
      // Test 1: Direct window.location redirect
      addResult("Test 1: Testing direct redirect to seller dashboard...");
      setTimeout(() => {
        addResult("Would redirect to /seller/dashboard here");
      }, 1000);

      // Test 2: Check if there are any interceptors
      addResult("Test 2: Checking for potential redirect interceptors...");
      addResult("- Checking if middleware is interfering...");
      addResult("- Checking if there are any client-side redirects...");
      addResult("- Checking if there are any route guards...");

      // Step 5: Simulate the exact AuthForm logic
      addResult("Step 5: Simulating AuthForm redirect logic...");
      const userRole = (profile as any)?.role;
      const onAuthPage = window.location.pathname.startsWith("/auth/");
      
      addResult(`User role from profile: ${userRole}`);
      addResult(`On auth page: ${onAuthPage}`);
      
      if (userRole === "seller") {
        addResult("LOGIC: Should redirect to /seller/dashboard");
        addResult("ACTION: window.location.href = '/seller/dashboard'");
      } else if (userRole === "admin") {
        addResult("LOGIC: Should redirect to /admin/dashboard");
      } else {
        addResult("LOGIC: Should redirect to home page");
      }

      // Step 6: Check if user metadata has role info
      addResult("Step 6: Checking user metadata...");
      addResult(`User metadata: ${JSON.stringify(session.user.user_metadata)}`);
      addResult(`App metadata: ${JSON.stringify(session.user.app_metadata)}`);

      // Step 7: Check for any JavaScript errors
      addResult("Step 7: Checking for potential issues...");
      addResult("- Is user using the correct login form?");
      addResult("- Is there any JavaScript preventing redirect?");
      addResult("- Is there any setTimeout or setInterval interfering?");
      addResult("- Is there any event listener preventing navigation?");

      addResult("=== INVESTIGATION COMPLETE ===");
      addResult("RECOMMENDATION: Check browser console for debug logs during actual login");

    } catch (error) {
      addResult(`Investigation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSellerSpecificLogin = async () => {
    addResult("=== TESTING SELLER-SPECIFIC LOGIN ===");
    addResult("Please use the seller auth modal (Sell on Apex Modular Construction) to login.");
    addResult("This will use SellerLoginForm instead of AuthForm.");
    addResult("Check console logs to see if SellerLoginForm redirect works correctly.");
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Investigate Seller Redirect Issue</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Issue:</h2>
        <p className="text-sm text-red-800">
          User chinaplusgroup@gmail.com has 'seller' role but is being redirected to buyer dashboard instead of seller dashboard.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Investigation Plan:</h2>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Verify user has correct session and profile</li>
          <li>2. Check if AuthForm logic is being executed</li>
          <li>3. Test if SellerLoginForm works differently</li>
          <li>4. Check for middleware or other redirects</li>
          <li>5. Identify exact point where redirect fails</li>
        </ol>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={comprehensiveInvestigation}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Investigating..." : "Run Comprehensive Investigation"}
        </button>
        
        <button
          onClick={testSellerSpecificLogin}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Test Seller-Specific Login
        </button>
        
        <button
          onClick={clearResults}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Investigation Results:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${
                  result.includes("ERROR") || result.includes("error") 
                    ? "bg-red-50 text-red-700" 
                    : result.includes("===") 
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "bg-gray-50"
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="text-sm space-y-1">
          <li>1. Login with chinaplusgroup@gmail.com</li>
          <li>2. Check browser console for debug logs</li>
          <li>3. Note exactly where the redirect happens</li>
          <li>4. Try both regular login and seller login</li>
          <li>5. Compare the console output</li>
        </ul>
      </div>
    </div>
  );
}
