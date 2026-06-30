"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Product Vision Action
 * Reads a spec-sheet image (URL or Base64) and extracts structured data.
 */
export async function enrichProductFromImage(imageInput: { url?: string, base64?: string }) {
  const apiKey = "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let imageData = "";
    if (imageInput.base64) {
      imageData = imageInput.base64;
    } else if (imageInput.url) {
      const response = await fetch(imageInput.url);
      const buffer = await response.arrayBuffer();
      imageData = Buffer.from(buffer).toString('base64');
    }

    const prompt = `
      You are a Technical Data Specialist for Apex Modular Construction.
      Look at this product image or specification sheet and extract all technical data.
      FOCUS ON: Dimensions, sizes, weights, materials, and technical model numbers.
      
      RETURN ONLY A JSON OBJECT with keys and values.
      Format: { "specs": [ {"key": "...", "value": "..."}, ... ] }
      Example: { "specs": [ {"key": "Material", "value": "Galvanized Steel"}, {"key": "Size", "value": "12m x 3m"} ] }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    
    return { 
      success: true, 
      specs: parsed.specs || []
    };
  } catch (err: any) {
    console.error("Vision Error:", err.message);
    return { success: false, error: err.message };
  }
}
