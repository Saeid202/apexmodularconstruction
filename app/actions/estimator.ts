"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TakeoffResult {
  footprint: {
    length_ft: number;
    width_ft: number;
    total_area_sqft: number;
  };
  exterior_walls: {
    total_length_ft: number;
    gross_area_sqft: number;
    net_area_sqft: number;
  };
  openings: {
    windows: {
      count: number;
      total_area_sqft: number;
    };
    doors: {
      count: number;
      total_area_sqft: number;
    };
  };
  rooms: {
    bedrooms: number;
    bathrooms: number;
    powder_rooms: number;
    other_rooms_count: number;
  };
  confidence_score: number;
  extracted_notes: string;
}

/**
 * Server action to process floor plan with Gemini Vision API
 * @param base64Image Base64 encoded image or PDF of the floor plan
 * @param wallHeight Exterior wall height in feet
 */
export async function getEstimationTakeoff(
  base64Image: string,
  wallHeight: number
): Promise<{ success: boolean; data?: TakeoffResult; error?: string }> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";

  try {
    console.log("--- INITIATING AI ESTIMATION TAKEOFF ---");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-1.5-flash or gemini-2.5-flash if available, fallback to gemini-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Parse mime type and clean base64 data
    const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return { success: false, error: "Invalid image format. Must be base64 data URI." };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const systemPrompt = `You are a professional construction estimator and quantity takeoff specialist.
Your task is to analyze the uploaded floor plan image and calculate structural quantities.
Be precise and look for annotations, dimensions (e.g., 28'x56', 30'x40'), walls, windows, and doors.

The client specifies that the exterior wall height is: ${wallHeight} feet.

Using this drawing and the wall height:
1. Estimate the building footprint dimensions (length, width, and area). If the building has irregular shape, estimate the equivalent rectangular footprint or total footprint area.
2. Calculate the total length of the exterior walls in feet.
3. Calculate the gross exterior wall area (total exterior wall length * ${wallHeight} ft).
4. Identify the count and total area (sq ft) of windows and exterior doors.
   - If exact door/window sizes aren't labeled, use standard assumptions: Windows = 15 sq ft each, Doors = 20 sq ft each.
5. Deduct openings (windows + doors) from the gross exterior wall area to calculate the net exterior wall area.
6. Count the number of bedrooms, bathrooms, powder rooms, and other rooms.
7. Assess your confidence score (0 to 100) based on drawing clarity.

You must respond ONLY with a JSON object. Do not include markdown formatting or backticks.
The JSON object must strictly match the following typescript structure:
{
  "footprint": {
    "length_ft": number,
    "width_ft": number,
    "total_area_sqft": number
  },
  "exterior_walls": {
    "total_length_ft": number,
    "gross_area_sqft": number,
    "net_area_sqft": number
  },
  "openings": {
    "windows": {
      "count": number,
      "total_area_sqft": number
    },
    "doors": {
      "count": number,
      "total_area_sqft": number
    }
  },
  "rooms": {
    "bedrooms": number,
    "bathrooms": number,
    "powder_rooms": number,
    "other_rooms_count": number
  },
  "confidence_score": number,
  "extracted_notes": "string"
}`;

    const parts = [
      { text: systemPrompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      return { success: false, error: "Empty response from Gemini." };
    }

    console.log("AI Estimate Raw Response:", responseText);

    // Parse the JSON output
    const parsedData: TakeoffResult = JSON.parse(responseText.trim());
    return { success: true, data: parsedData };
  } catch (err: any) {
    console.error("AI Estimation Error:", err);
    return { success: false, error: err.message || "Failed to analyze floor plan." };
  }
}
