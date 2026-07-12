'use server'

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeKitchenPhotos(base64Images: string[]) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Prepare the parts for the prompt
    const imageParts = base64Images.map(base64Data => {
      // Strip off the data:image/jpeg;base64, prefix if present
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      return {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg"
        }
      };
    });

    const prompt = `You are a professional kitchen architect. Analyze these photos of a kitchen. 
Estimate the dimensions and layout based on standard appliance sizes (a standard fridge is 30-36 inches wide, a stove is 30 inches).
Please return ONLY a JSON object (no markdown, no backticks) with the following exact keys:
{
  "layout": "string (e.g. U-Shaped, L-Shaped, Galley, Island, Single Wall)",
  "estLength": "number (estimated length in feet, e.g. 14)",
  "estWidth": "number (estimated width in feet, e.g. 12)",
  "windows": "number (count of windows visible)",
  "doors": "number (count of doors/entryways visible)",
  "sinkPosition": "string (e.g. 'Under Window', 'On Island', 'Against Wall')",
  "stovePosition": "string (e.g. 'Next to Fridge', 'Opposite Sink')",
  "existingCabinets": "string (e.g. 'Wood Shaker', 'White Modern', 'None')"
}`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanedText);
    return { success: true, data };
    
  } catch (error: any) {
    console.error("Error analyzing photos:", error);
    return { success: false, error: error.message || "Failed to analyze photos" };
  }
}
