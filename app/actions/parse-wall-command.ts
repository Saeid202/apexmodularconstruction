'use server'

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function parseWallCommand(command: string, currentBox: { top: number, left: number, width: number, height: number }) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are an AI spatial layout assistant. The user is adjusting a bounding box on a 2D image.
The image canvas is defined as a percentage grid where top-left is (0,0) and bottom-right is (100,100).
The current bounding box is:
top: ${currentBox.top}%
left: ${currentBox.left}%
width: ${currentBox.width}%
height: ${currentBox.height}%

The user issued the following natural language command to adjust the box:
"${command}"

Interpret their intent and calculate the new box dimensions. 
- "left" / "right" usually means shifting 'left' by ~5-10 units.
- "up" / "down" means shifting 'top' by ~5-10 units.
- "wider" / "longer" means increasing 'width'.
- "taller" means increasing 'height'.
- "thinner" / "narrower" means decreasing 'width'.
- "shorter" means decreasing 'height'.
- Be smart about relative terms like "a smidge" (2-3 units), "a lot" (15-20 units), or "fill the wall" (width: 100).

Make sure the box stays within the 0-100 bounds (e.g. left + width <= 100).

Return ONLY a JSON object (no markdown, no backticks) with the following exact structure:
{
  "top": number,
  "left": number,
  "width": number,
  "height": number,
  "reply": "string (A friendly, conversational confirmation of what you just did, e.g. 'I've nudged the cabinet to the left and made it a bit taller!')"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini response
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    return { success: false, error: error.message };
  }
}
