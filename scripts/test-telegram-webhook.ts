import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Test script to simulate incoming Telegram updates to the local webhook
 * Run with: npx tsx scripts/test-telegram-webhook.ts [optional message]
 */
async function testWebhook() {
  const messageText = process.argv[2] || "Hello! Tell me about Apex Modular Construction products.";
  const localUrl = 'http://localhost:3000/api/telegram';
  const mockChatId = 123456789; // Static mock chat ID for testing

  console.log('\n==================================================');
  console.log('🤖 Telegram Webhook Mock Tester');
  console.log('==================================================');
  console.log(`Sending message: "${messageText}"`);
  console.log(`Target URL:      ${localUrl}`);
  console.log(`Mock Chat ID:    ${mockChatId}`);
  console.log('--------------------------------------------------\n');

  // Construct a standard Telegram Message Update payload
  const mockUpdatePayload = {
    update_id: Math.floor(Math.random() * 1000000),
    message: {
      message_id: Math.floor(Math.random() * 1000),
      from: {
        id: 99999999,
        is_bot: false,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "en"
      },
      chat: {
        id: mockChatId,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: messageText
    }
  };

  try {
    console.log('⏳ Sending POST request to local webhook...');
    const response = await fetch(localUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Optional secret header if they use it in the future
        'X-Telegram-Bot-Api-Secret-Token': 'test-secret-token'
      },
      body: JSON.stringify(mockUpdatePayload)
    });

    console.log(`📡 Status Code: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = null;
    }

    if (response.ok) {
      console.log('✅ Local Webhook responded successfully!');
      console.log('Response body:', JSON.stringify(parsedData || responseText, null, 2));
      console.log('\n💡 Note: Make sure "npm run dev" is running in another terminal window.');
      console.log('Check that terminal\'s console logs to see the Telnyx request and Supabase saving actions.');
    } else {
      console.error('❌ Local Webhook request failed.');
      console.error('Response:', responseText);
    }
  } catch (error: any) {
    console.error('❌ Connection error: Could not reach the local server.');
    console.error('Details:', error.message);
    console.log('\n👉 Make sure your Next.js local server is running by executing: npm run dev');
  }
  console.log('==================================================\n');
}

testWebhook();
