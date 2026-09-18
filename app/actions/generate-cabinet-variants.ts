'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CabinetConfig } from '@/components/product/CabinetConfigurator'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export interface CabinetVariant {
  id:             string
  name:           string
  tagline:        string
  description:    string
  highlights:     string[]
  config:         CabinetConfig
  estimatedPrice: number
}

export interface RoomData {
  estLength?: number
  estHeight?: number
  windows?:  number
  doors?:    number
  layout?:   string
}

interface Preferences {
  style:        string
  cabinetColor: string
  countertop:   string
  budget:       string
  features:     string[]
}

const VALID_WIDTHS = [24, 30, 36, 42, 48, 60, 72, 84, 96]

export async function generateCabinetVariants(
  roomData: RoomData,
  preferences: Preferences
): Promise<{ success: boolean; variants?: CabinetVariant[]; error?: string }> {
  const wallWidthFt   = roomData.estLength ?? 12
  const wallHeightFt  = roomData.estHeight ?? 9
  const windows       = roomData.windows   ?? 0
  const doors         = roomData.doors     ?? 1

  const totalWidthIn     = Math.round(wallWidthFt * 12)
  const usedByOpenings   = windows * 32 + doors * 36
  const availableWidthIn = Math.max(36, totalWidthIn - usedByOpenings)
  const maxFitWidth      = VALID_WIDTHS.filter(w => w <= availableWidthIn).pop() ?? 36

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an expert kitchen cabinet designer for Apex Modular Construction.

Room scan data:
- Wall length: ${wallWidthFt} ft (${totalWidthIn}" total, ${availableWidthIn}" available after windows/doors)
- Maximum cabinet width that physically fits: ${maxFitWidth}"
- Ceiling height: ${wallHeightFt} ft
- Windows: ${windows}, Doors: ${doors}
- Layout: ${roomData.layout ?? 'kitchen'}

User preferences:
- Style: ${preferences.style || 'Modern'}
- Color: ${preferences.cabinetColor || 'White'}
- Countertop: ${preferences.countertop || 'Quartz'}
- Budget: ${preferences.budget || '$10,000–$20,000'}
- Requested features: ${preferences.features.join(', ') || 'none'}

Generate exactly 3 meaningfully different variants — one focused on storage, one on aesthetics, one on value.

STRICT CONSTRAINTS — use ONLY these exact string values:
- cabinetColor: "White" | "Black" | "Walnut" | "Oak" | "Custom"
- countertop: "Quartz" | "Granite" | "Marble" | "Wood" | "Concrete"
- style: "Modern" | "Minimalist" | "Scandinavian" | "Traditional" | "Shaker"
- widthInches: one of [24,30,36,42,48,60,72,84,96] and must not exceed ${maxFitWidth}
- doorCount: 1 | 2 | 3 | 4
- doorStyle: "flat" | "shaker" | "glass"
- handleStyle: "bar" | "knob" | "none" | "integrated"

Respond ONLY with a valid JSON array. No markdown, no backticks, no explanation.
Each of the 3 objects must have:
- id: "variant-1" | "variant-2" | "variant-3"
- name: 2-3 word name
- tagline: one punchy line under 8 words
- description: 1 sentence design rationale
- highlights: array of exactly 3 short strings
- config: object with ALL 7 config fields
- estimatedPrice: realistic number in dollars`

    const result = await model.generateContent(prompt)
    const raw    = result.response.text().trim()
    const clean  = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return { success: true, variants: parsed }
  } catch {
    // Fallback variants — always returns something usable
    const color = (preferences.cabinetColor || 'White') as CabinetConfig['cabinetColor']
    const ct    = (preferences.countertop   || 'Quartz') as CabinetConfig['countertop']

    return {
      success: true,
      variants: [
        {
          id: 'variant-1',
          name: 'Storage Maximizer',
          tagline: 'Every inch working for you',
          description: 'Full-width base and upper cabinets squeeze every usable inch from your wall without feeling cramped.',
          highlights: ['Maximum storage capacity', 'Integrated handle groove', 'Deep base drawers'],
          config: { cabinetColor: color, countertop: ct, style: 'Modern', widthInches: maxFitWidth, doorCount: 4, doorStyle: 'flat',   handleStyle: 'integrated' },
          estimatedPrice: 5400,
        },
        {
          id: 'variant-2',
          name: 'Modern Showcase',
          tagline: 'Design that turns heads',
          description: 'Glass-front uppers display your best pieces while flat lowers keep the base clean and contemporary.',
          highlights: ['Glass display doors', 'Bar pull handles', 'Marble countertop'],
          config: { cabinetColor: 'White', countertop: 'Marble', style: 'Modern', widthInches: Math.min(60, maxFitWidth), doorCount: 2, doorStyle: 'glass',  handleStyle: 'bar'  },
          estimatedPrice: 7200,
        },
        {
          id: 'variant-3',
          name: 'Classic Value',
          tagline: 'Timeless style, smart budget',
          description: 'Shaker doors and warm oak tones bring real craftsmanship character at a price that leaves budget for the rest.',
          highlights: ['Shaker frame doors', 'Warm oak finish', 'Best value option'],
          config: { cabinetColor: 'Oak', countertop: 'Quartz', style: 'Shaker', widthInches: Math.min(36, maxFitWidth), doorCount: 2, doorStyle: 'shaker', handleStyle: 'knob' },
          estimatedPrice: 3600,
        },
      ],
    }
  }
}
