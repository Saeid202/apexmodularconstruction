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

    const prompt = `You are an AI spatial analysis engine. Analyze these photos of a room.
Estimate the dimensions and locate key objects (like doors, windows, signs, appliances).
CRITICAL: You MUST detect the primary 'Wall' face as a distinct object. The bounding box for the 'Wall' type MUST exactly trace the physical edges of the main wall visible (from the left corner to the right corner, and from the floor baseboard up to the ceiling).
For any key objects found, provide a 2D bounding box as relative percentages [0-100] of the image dimensions.
Please return ONLY a JSON object (no markdown, no backticks) with the following exact structure:
{
  "layout": "string (e.g. U-Shaped, Single Wall, Utility Room)",
  "estLength": "number (estimated total length of the visible wall in feet, e.g. 14)",
  "estHeight": "number (estimated height of the room in feet, e.g. 9)",
  "windows": "number (count of windows visible)",
  "doors": "number (count of doors/entryways visible)",
  "sinkPosition": "string or 'None'",
  "stovePosition": "string or 'None'",
  "existingCabinets": "string or 'None'",
  "detectedObjects": [
    {
      "type": "string (MUST include 'Wall', plus 'Door', 'Window', 'Sign', 'Appliance' etc.)",
      "confidence": "number (0.0 to 1.0)",
      "box": {
        "top": "number (percentage 0-100)",
        "left": "number (percentage 0-100)",
        "width": "number (percentage 0-100)",
        "height": "number (percentage 0-100)"
      }
    }
  ]
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
