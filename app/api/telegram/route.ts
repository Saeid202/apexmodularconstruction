import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Telnyx Model specified in requirements
const TELNYX_MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct';
const TELNYX_API_URL = 'https://api.telnyx.com/v2/ai/chat/completions';

/**
 * POST /api/telegram
 * Webhook handler for Telegram Bot
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let chatId: string | number | undefined;

  try {
    // 1. Validate and Parse POST request
    const body = await request.json().catch(() => null);
    
    if (!body) {
      console.error('[Telegram Webhook] Empty or invalid JSON body received');
      return NextResponse.json({ success: false, error: 'Empty body' }, { status: 200 });
    }

    // Extract message object (handles standard messages and edits)
    const messageObj = body.message || body.edited_message;
    chatId = messageObj?.chat?.id;
    const text = messageObj?.text;

    console.log(`[Telegram Webhook] Received update ID: ${body.update_id}, Chat ID: ${chatId}`);

    // If chat_id is missing, we cannot respond
    if (!chatId) {
      console.warn('[Telegram Webhook] Missing chat_id in incoming update');
      return NextResponse.json({ success: false, error: 'Missing chat_id' }, { status: 200 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telnyxApiKey = process.env.TELNYX_API_KEY;

    // Validate environment variables
    if (!botToken) {
      console.error('[Telegram Webhook] TELEGRAM_BOT_TOKEN is not configured in environment variables');
      return NextResponse.json({ success: false, error: 'Server misconfiguration: bot token missing' }, { status: 200 });
    }

    if (!telnyxApiKey) {
      console.error('[Telegram Webhook] TELNYX_API_KEY is not configured in environment variables');
      // Send error to user so they are not left wondering
      await sendTelegramMessage(botToken, chatId, "⚠️ Bot configuration error: Telnyx API key is missing. Please contact the administrator.");
      return NextResponse.json({ success: false, error: 'Server misconfiguration: Telnyx key missing' }, { status: 200 });
    }

    // 2. Handle cases where message.text is empty
    if (!text || text.trim() === '') {
      console.log('[Telegram Webhook] Message text is empty (e.g. photo, sticker, document, or inline interaction)');
      
      // Let's send a friendly fallback warning if they send something we can't parse,
      // but only if it's an actual message update type.
      if (messageObj) {
        await sendTelegramMessage(
          botToken, 
          chatId, 
          "👋 Hi! I'm Boardy, your AI assistant. Currently, I can only understand text messages. Please type a question or prompt!"
        );
      }
      return NextResponse.json({ success: true, message: 'Skipped empty message' }, { status: 200 });
    }

    // Initialize Supabase Admin Client to bypass RLS policies
    const supabase = createAdminClient();
    if (!supabase) {
      console.warn('[Telegram Webhook] Supabase Admin Client could not be initialized. Operating without conversation history.');
    }

    // 3. Fetch conversation history from Supabase (retrieve last 10 messages)
    let history: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('telegram_messages')
          .select('role, content')
          .eq('chat_id', String(chatId))
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('[Telegram Webhook] Error fetching chat history from Supabase:', error);
        } else if (data && data.length > 0) {
          // data is newest-first, we reverse it to chronological order (oldest-first)
          history = data.reverse().map((msg: any) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }));
        }
      } catch (dbError) {
        console.error('[Telegram Webhook] Exception occurred while fetching history:', dbError);
      }
    }

    // 3.5. Fetch active products catalog from Supabase to provide live context to the bot
    let productsCatalog = '';
    if (supabase) {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('name, price, description')
          .eq('status', 'active');
        
        if (productsError) {
          console.error('[Telegram Webhook] Error fetching products for bot context:', productsError);
        } else if (productsData && productsData.length > 0) {
          productsCatalog = productsData
            .map((p: any) => {
              // Strip HTML tags from description and clean up whitespace
              const cleanDesc = p.description
                ? p.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                : 'No detailed description available.';
              return `- Model/Product: ${p.name}\n  Price: ${p.price > 0 ? `$${p.price}` : 'Contact Sales'}\n  Description: ${cleanDesc}`;
            })
            .join('\n\n');
        }
      } catch (catalogError) {
        console.error('[Telegram Webhook] Exception while fetching product catalog:', catalogError);
      }
    }

    // 4. Construct messages payload for Telnyx AI
    const baseInstructions = (process.env.TELEGRAM_SYSTEM_PROMPT || '')
      .trim()
      .replace(/^"(.*)"$/, '$1'); // Clean up any wrapping double quotes

    const defaultInstructions = `You are Boardy, the official AI Assistant for Apex Modular Construction.
You engage in helpful, polite, and friendly conversations with users via Telegram.
Your primary role is to answer questions about products, pricing, and services from Apex Modular Construction.`;

    const systemPrompt = `${baseInstructions || defaultInstructions}

CRITICAL RULES & KNOWLEDGE BASE:
1. COMPANY IDENTITY: Always represent our company as "Apex Modular Construction" or "Apex". NEVER refer to us as "Apex Modular Homes" or "Apex Homes" (which are different companies).
2. OFFICIAL WEBSITE & CONTACT: Only refer users to our official website: https://www.apexmodularconstruction.com. Official Phone & WhatsApp: +1 289 816 8314. Official Email: support@apexmodularconstruction.com. Never link to or suggest any other contact details.
3. INVENTORY & PRODUCTS: You must ONLY talk about the products and models in our official catalog listed below. If a user asks about any other cabin, modular house, or granny flat, politely explain that it is not in our catalog, but suggest they check our website or contact support@apexmodularconstruction.com or call +1 289 816 8314.
4. ESTIMATES & PRICING: Refer to the pricing in the catalog below. If a price is listed as "Contact Sales" or $0, or if they ask for custom quotes, guide them to contact support@apexmodularconstruction.com (+1 289 816 8314) or use the contact forms on our website.
5. NO HALLUCINATIONS: Do not make up product models, specifications, dimensions, or features that are not listed in our catalog.

OFFICIAL PRODUCT CATALOG:
${productsCatalog || '- Folding Granny Flat – Zenith 802\n- Foldable House 735\n- Foldable house Riviera House,MH4094\n- Foldable house Vera House 2222\n- Foldable house Vincent House modular prefab light steel frame house 2117\n- APEX LAKEWOOD™ Model A-3937\n- Foldable cabin Sunrise House929\n- 20 FT folding house ($10,000)\n- 40 FT folding house ($18,000)\n- Double Layer Folding House'}

Guidelines:
1. Keep replies concise, helpful, and natural (ideal for Telegram chat bubbles).
2. If users ask for detailed property analysis (zoning, permits, lot feasibility), encourage them to visit our website and use the Property Feasibility Analysis tool at https://www.apexmodularconstruction.com.
3. Keep the formatting clean and readable using plain text or standard Telegram Markdown (bold, italic). Avoid complex HTML tags.
4. If you do not know the answer, politely suggest they contact the sales or support team at support@apexmodularconstruction.com or +1 289 816 8314.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: text }
    ];

    // 5. Call Telnyx AI API
    console.log('[Telegram Webhook] Sending prompt to Telnyx AI API...');
    const telnyxStartTime = Date.now();
    const telnyxResponse = await fetch(TELNYX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${telnyxApiKey}`
      },
      body: JSON.stringify({
        model: TELNYX_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!telnyxResponse.ok) {
      const errorText = await telnyxResponse.text();
      console.error(`[Telegram Webhook] Telnyx API error: ${telnyxResponse.status} - ${errorText}`);
      await sendTelegramMessage(botToken, chatId, "Sorry, I am having trouble thinking right now. Please try again in a few moments!");
      return NextResponse.json({ success: false, error: 'Telnyx AI failure' }, { status: 200 });
    }

    const telnyxData = await telnyxResponse.json();
    console.log(`[Telegram Webhook] Telnyx responded in ${Date.now() - telnyxStartTime}ms`);

    // 6. Extract AI response from Telnyx response
    const aiResponseText = telnyxData.choices?.[0]?.message?.content;

    if (!aiResponseText) {
      console.error('[Telegram Webhook] Empty response from Telnyx AI:', JSON.stringify(telnyxData));
      await sendTelegramMessage(botToken, chatId, "I received an empty response. Please try sending your message again.");
      return NextResponse.json({ success: false, error: 'Empty AI response' }, { status: 200 });
    }

    // 7. Send response to Telegram via sendMessage API
    await sendTelegramMessage(botToken, chatId, aiResponseText);

    // 8. Save messages to Supabase database for context
    if (supabase) {
      try {
        const { error: insertError } = await supabase
          .from('telegram_messages')
          .insert([
            { chat_id: String(chatId), role: 'user', content: text },
            { chat_id: String(chatId), role: 'assistant', content: aiResponseText }
          ]);

        if (insertError) {
          console.error('[Telegram Webhook] Failed to save conversation to Supabase:', insertError);
        } else {
          console.log(`[Telegram Webhook] Saved conversation history for Chat ID: ${chatId}`);
        }
      } catch (saveError) {
        console.error('[Telegram Webhook] Exception occurred while saving history:', saveError);
      }
    }

    console.log(`[Telegram Webhook] Completed request in ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    // 9. Error Handling - Log errors for debugging
    console.error('[Telegram Webhook] Fatal error in route handler:', error);

    // Always return 200 OK to Telegram to prevent infinite retry loops
    if (chatId) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
          await sendTelegramMessage(
            botToken, 
            chatId, 
            "⚠️ An unexpected error occurred while processing your message. Our team has been notified. Please try again later."
          );
        }
      } catch (telegramSendError) {
        console.error('[Telegram Webhook] Failed to send error notification back to Telegram user:', telegramSendError);
      }
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

/**
 * Helper function to send messages back to Telegram API
 */
async function sendTelegramMessage(botToken: string, chatId: string | number, text: string) {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Telegram Helper] Failed to send message to Telegram user: ${res.status} - ${errorText}`);
    } else {
      console.log(`[Telegram Helper] Successfully sent message to Chat ID: ${chatId}`);
    }
  } catch (err) {
    console.error('[Telegram Helper] Exception when sending message to Telegram:', err);
  }
}
