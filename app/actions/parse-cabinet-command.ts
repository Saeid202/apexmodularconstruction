'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CabinetConfig } from '@/components/product/CabinetConfigurator'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function parseCabinetCommand(
  command: string,
  currentConfig: CabinetConfig
): Promise<{
  success: boolean
  data?: { updates: Partial<CabinetConfig>; reply: string }
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an AI kitchen cabinet design assistant for Apex Modular Construction.
The user wants to modify their cabinet design using natural language.

Current configuration:
${JSON.stringify(currentConfig, null, 2)}

Available options — you MUST use only these exact values:
- cabinetColor: "White" | "Black" | "Walnut" | "Oak" | "Custom"
- countertop: "Quartz" | "Granite" | "Marble" | "Wood" | "Concrete"
- style: "Modern" | "Minimalist" | "Scandinavian" | "Traditional" | "Shaker"
- widthInches: 24 | 30 | 36 | 42 | 48 | 60 | 72 | 84 | 96
- doorCount: 1 | 2 | 3 | 4
- doorStyle: "flat" | "shaker" | "glass"
- handleStyle: "bar" | "knob" | "none" | "integrated"

User request: "${command}"

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation outside the JSON.
The JSON must contain exactly two keys:
1. "updates" — an object with only the fields that need to change (use exact values from the lists above)
2. "reply" — a short, friendly one-sentence confirmation of what changed

Example format:
{"updates": {"cabinetColor": "Black", "doorStyle": "shaker"}, "reply": "Done! Switched to sleek black cabinets with classic shaker doors."}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return {
      success: true,
      data: {
        updates: parsed.updates ?? {},
        reply: parsed.reply ?? 'Updated your cabinet design!',
      },
    }
  } catch (err) {
    return {
      success: false,
      error: String(err),
    }
  }
}
