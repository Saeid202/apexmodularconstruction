"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Multi-Modal Zoning & Design Analysis Action
 * Processes property data and design drawings using Vision AI.
 */
export async function getZoningAnalysis(message: string, systemPrompt: string, base64Image?: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
  
  try {
    console.log("--- INITIATING INDUSTRIAL STABLE AI ---");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const parts: any[] = [{ text: `${systemPrompt}\n\nUser Context/Question: ${message}` }];

    // If an image is provided, add it as a vision part
    if (base64Image) {
      console.log("Adding design drawing to Vision analysis...");
      const mimeType = base64Image.split(';')[0].split(':')[1];
      const data = base64Image.split(',')[1];
      parts.push({
        inlineData: {
          mimeType,
          data
        }
      });
      
      parts[0].text += "\n\nIMPORTANT: I have attached a design drawing/site plan. Please analyze it for potential permitting issues, setbacks, and site constraints.";
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }]
    });

    const response = await result.response;
    const text = response.text();

    if (text) {
      return { success: true, response: text };
    }
  } catch (err: any) {
    console.error("DEBUG: Multi-Modal AI Error:", err.message);
    
    // Fallback logic if needed (Simplified for reliability)
    return { success: false, error: err.message };
  }

  return { success: false, error: "AI Connection failed." };
}
