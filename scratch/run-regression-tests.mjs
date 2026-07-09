import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runRegressionSuite() {
  console.log('🧪 Starting Zoning API HTTP Regression Suite...');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing database credentials! Please check your .env.local file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Fetch test cases from the database
  const { data: testCases, error: fetchError } = await supabase
    .from('test_address_ground_truth')
    .select('*');

  if (fetchError) {
    console.error('❌ Error fetching test cases:', fetchError.message);
    process.exit(1);
  }

  console.log(`Loaded ${testCases.length} regression test cases.`);
  let passed = 0;
  let failed = 0;

  // 2. Iterate through each test case and fetch from local API server
  for (const testCase of testCases) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Address Query: "${testCase.address}"`);
    console.log(`Expected Zone: "${testCase.expected_zone}" (Exception: ${testCase.expected_exception_no || 'None'})`);

    const apiUrl = `http://localhost:3000/api/zoning-lookup?address=${encodeURIComponent(testCase.address)}`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.log(`❌ HTTP Error: Server returned status ${response.status}`);
        failed++;
        continue;
      }

      const data = await response.json();

      if (data.error) {
        console.log(`❌ API Error Response: ${data.error}`);
        failed++;
        continue;
      }

      const zoneCode = data.zoning?.zone_code;
      const exceptionNo = data.exception?.number;
      const isLegacy = data.zoning?.is_legacy;

      console.log(`API Resolved Address: "${data.address}"`);
      console.log(`API Coordinates: Lat ${data.coordinates.lat}, Lon ${data.coordinates.lng}`);
      console.log(`API Matched Zone: "${zoneCode}" (Exception: ${exceptionNo || 'None'}) [Legacy: ${!!isLegacy}]`);

      // Verify Zone Code matches expected
      const zoneMatches = zoneCode === testCase.expected_zone;
      
      // Verify Exception number matches expected
      let exceptionMatches = true;
      if (testCase.expected_exception_no !== null) {
        exceptionMatches = Number(exceptionNo) === Number(testCase.expected_exception_no);
      } else {
        exceptionMatches = !exceptionNo; // Should be null or undefined
      }

      if (zoneMatches && exceptionMatches) {
        console.log('✅ Result: PASS');
        passed++;
      } else {
        console.log(`❌ Result: FAIL`);
        console.log(`   Expected Zone: "${testCase.expected_zone}" (Exception: ${testCase.expected_exception_no})`);
        console.log(`   Actual Zone:   "${zoneCode}" (Exception: ${exceptionNo})`);
        failed++;
      }

    } catch (err) {
      console.error(`❌ HTTP Request Failed for ${testCase.address}:`, err.message);
      failed++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`🏁 QA REGRESSION SUMMARY`);
  console.log(`Total Run: ${testCases.length}`);
  console.log(`Passed:    ${passed}`);
  console.log(`Failed:    ${failed}`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
