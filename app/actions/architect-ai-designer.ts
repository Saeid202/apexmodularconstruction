"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIDesignerResponse {
  title?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  heroBgType?: "color" | "image" | "slider";
  heroTextAlignment?: "left" | "center";
  heroOverlayOpacity?: number; // 0 to 100
  ctaText?: string;
  ctaLink?: string;
}

export async function generateStudioDesign(prompt: string, currentConfig: Record<string, any>) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash"
    });

    const systemPrompt = `You are an expert AI Web Designer and Portfolio Consultant for high-end modular home architects.
Your task is to analyze the user's design request and generate updated visual branding parameters for their studio storefront page.

Current configuration context:
${JSON.stringify(currentConfig, null, 2)}

You MUST return a JSON object with any of the following fields you want to update based on the user's request. Only return these keys:
{
  "title": "string (the studio/firm name)",
  "tagline": "string (short description/motto, max 100 characters)",
  "primaryColor": "string (hex code for primary buttons/accents, choose beautiful, premium matching colors like gold, deep green, emerald, navy, sleek dark slate, etc.)",
  "secondaryColor": "string (hex code for dark backgrounds/overlays, matching primaryColor)",
  "heroBgType": "color" | "image" | "slider",
  "heroTextAlignment": "left" | "center",
  "heroOverlayOpacity": number (integer between 0 and 90, representing the darkness overlay percentage)",
  "ctaText": "string (text for main button, e.g. 'View Catalog', 'Inquire Today')",
  "ctaLink": "string (link destination, default is '#portfolio')"
}

Ensure all color hex codes are valid, matching, and look extremely premium (avoid plain red/blue/green; use sophisticated custom colors). Do not write any markdown or text explanations, output ONLY the raw JSON object.`;

    const result = await model.generateContent([systemPrompt, `User Request: ${prompt}`]);
    const text = result.response.text();
    
    if (!text) {
      return { success: false, error: "Empty response from AI model" };
    }

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedData = JSON.parse(cleanedText) as AIDesignerResponse;
    return { success: true, design: parsedData };
  } catch (err: any) {
    console.error("AI Designer Error:", err.message);
    return { success: false, error: err.message };
  }
}
