import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai-assistant/chat
 * General Apex AI Assistant for product and company questions
 */

const systemPrompt = `You are the Apex AI Assistant, a helpful expert on modular construction and prefabricated buildings from Apex Modular Construction.

Your primary role is to answer questions about:
- Products and modular home models
- Pricing and costs
- Shipping and delivery to different countries
- Installation and setup
- Customization options
- Company information
- Building specifications and features
- International orders
- Timelines and project planning

KEY GUIDELINES:
1. Be friendly, concise, and knowledgeable
2. Always provide accurate information about our products
3. When asked about technical requirements or property-specific issues (zoning, permits, bylaws, setbacks, lot analysis), acknowledge the question but suggest they use our Property Feasibility Analysis tool
4. Example: "For a detailed analysis of your property's zoning and permit requirements, I recommend using our Property Feasibility Analysis tool where you can upload site plans and get a comprehensive report."
5. If user mentions a Canadian property (Ontario, British Columbia, etc.), you can offer: "I can also help with property analysis through our specialized tool if you'd like to analyze your specific site's zoning and permit requirements."
6. Never make up product specifications - if unsure, say "I don't have that specific information, but our sales team can help"
7. Keep responses under 150 words for chat clarity
8. Use a warm, professional tone

IMPORTANT:
- This is a general assistant, not a specialist property analyzer
- Direct property-specific questions to the Property Feasibility tool
- Focus on products, pricing, shipping, and general company questions`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Build conversation history for context
    const conversationContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map((msg: { role: string; content: string }) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      )
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\n${conversationContext}\n\nUser: ${message}`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    const assistantMessage =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({
      message: assistantMessage,
      success: true,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
