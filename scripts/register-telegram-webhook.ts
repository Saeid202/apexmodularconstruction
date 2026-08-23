import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function manageWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not defined in .env.local');
    process.exit(1);
  }

  // Get URL from command line arguments or default to public domain
  let targetUrl = process.argv[2];
  if (!targetUrl) {
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.apexmodularconstruction.com';
    // Ensure the domain starts with https://
    const base = domain.startsWith('http') ? domain : `https://${domain}`;
    targetUrl = `${base}/api/telegram`;
  }

  console.log('\n==================================================');
  console.log('🤖 Telegram Webhook Manager');
  console.log('==================================================');
  console.log(`Bot Token:   ${botToken.substring(0, 10)}... (truncated)`);
  console.log(`Target URL:  ${targetUrl}`);
  console.log('--------------------------------------------------\n');

  try {
    // 1. Get current webhook status
    console.log('⏳ Checking current webhook status...');
    const statusRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    if (!statusRes.ok) {
      throw new Error(`Failed to get webhook info: ${statusRes.statusText}`);
    }
    const statusData = await statusRes.json();
    console.log('📋 Current Webhook Info:', JSON.stringify(statusData.result, null, 2));
    console.log('\n--------------------------------------------------\n');

    // 2. Set new webhook
    console.log(`⏳ Registering new webhook URL: ${targetUrl}...`);
    const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        allowed_updates: ['message', 'edited_message'],
      }),
    });

    if (!setRes.ok) {
      const errorBody = await setRes.text();
      throw new Error(`Failed to set webhook: ${setRes.statusText} - ${errorBody}`);
    }
    const setData = await setRes.json();
    if (setData.ok) {
      console.log('✅ Webhook successfully registered with Telegram!');
      console.log('Response:', setData.description);
    } else {
      console.error('❌ Telegram rejected the webhook registration:');
      console.error(setData);
    }
  } catch (error: any) {
    console.error('❌ Error managing webhook:', error.message);
  }
  console.log('==================================================\n');
}

manageWebhook();
