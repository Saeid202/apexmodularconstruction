/**
 * Pure configuration + binding layer for the 3D build configurator.
 *
 * Deliberately free of any `three` import so it stays cheap to load and easy to
 * reason about. Everything here maps seller-authored customization data onto
 * abstract "tokens" that both the real GLTF model and the procedural fallback
 * home resolve against by name.
 */

import type { CustomizationGroupWithRelations, CustomizationOption } from '@/types'

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

export const SURFACE_KEYS = [
  'siding',
  'trim',
  'roof',
  'door',
  'window',
  'deck',
  'foundation',
] as const

export type SurfaceKey = (typeof SURFACE_KEYS)[number]

export interface SurfaceDefinition {
  key: SurfaceKey
  label: string
  /** Node-name tokens in the model that this surface paints. */
  tokens: string[]
  /** Curated palette shown as swatches. */
  swatches: string[]
  defaultColor: string
}

export const SURFACES: SurfaceDefinition[] = [
  {
    key: 'siding',
    label: 'Exterior Siding',
    tokens: ['siding', 'wall', 'exterior', 'cladding'],
    swatches: ['#EDE9E3', '#D8D2C7', '#9AA5A0', '#5F6B68', '#3C4442', '#7C6A55', '#2E3338'],
    defaultColor: '#EDE9E3',
  },
  {
    key: 'trim',
    label: 'Trim & Fascia',
    tokens: ['trim', 'fascia', 'corner', 'accent', 'soffit', 'batten'],
    swatches: ['#FFFFFF', '#F2EFE9', '#2E3338', '#4B1D8F', '#D4AF37', '#8C6239', '#6B7280'],
    defaultColor: '#FFFFFF',
  },
  {
    key: 'roof',
    label: 'Roofing',
    tokens: ['roof', 'shingle', 'metalroof', 'ridge', 'cap'],
    swatches: ['#3A3F44', '#22262A', '#5A4636', '#7A2E2E', '#4B5D67', '#8A8F94', '#1F2933'],
    defaultColor: '#3A3F44',
  },
  {
    key: 'door',
    label: 'Front Door',
    tokens: ['door', 'entry', 'entrance'],
    swatches: ['#4B1D8F', '#1F3A5F', '#7A2E2E', '#2F4F3E', '#D4AF37', '#3A3F44', '#F2EFE9'],
    defaultColor: '#4B1D8F',
  },
  {
    key: 'window',
    label: 'Window Frames',
    tokens: ['window', 'frame', 'mullion', 'sash', 'glazing'],
    swatches: ['#2E3338', '#FFFFFF', '#8C6239', '#6B7280', '#B8A88A', '#1F2933', '#D4AF37'],
    defaultColor: '#2E3338',
  },
  {
    key: 'deck',
    label: 'Deck & Stairs',
    tokens: ['deck', 'stair', 'porch', 'patio', 'railing', 'step'],
    swatches: ['#9A7B4F', '#7C6A55', '#5C4634', '#B8A88A', '#3C4442', '#8A8F94', '#2E3338'],
    defaultColor: '#9A7B4F',
  },
  {
    key: 'foundation',
    label: 'Foundation & Skirting',
    tokens: ['foundation', 'skirt', 'base', 'plinth', 'footing'],
    swatches: ['#6B7280', '#4A5057', '#8A8F94', '#3C4442', '#A8A29E', '#2E3338', '#D6D3D1'],
    defaultColor: '#6B7280',
  },
]

const SURFACE_BY_KEY = new Map(SURFACES.map((s) => [s.key, s]))

export function getSurface(key: SurfaceKey): SurfaceDefinition {
  // Every SurfaceKey is derived from SURFACES, so this is total.
  return SURFACE_BY_KEY.get(key) as SurfaceDefinition
}

/* ------------------------------------------------------------------ *
 * Finishes
 * ------------------------------------------------------------------ */

export interface FinishPreset {
  id: string
  label: string
  roughness: number
  metalness: number
  /** Multiplier applied to clearcoat-ish sheen; used for the environment blend. */
  envIntensity: number
}

export const FINISH_PRESETS: FinishPreset[] = [
  { id: 'matte', label: 'Matte', roughness: 0.95, metalness: 0.0, envIntensity: 0.6 },
  { id: 'satin', label: 'Satin', roughness: 0.6, metalness: 0.02, envIntensity: 0.9 },
  { id: 'gloss', label: 'Semi-Gloss', roughness: 0.3, metalness: 0.06, envIntensity: 1.2 },
  { id: 'metallic', label: 'Metallic', roughness: 0.32, metalness: 0.85, envIntensity: 1.4 },
]

export function getFinish(id: string): FinishPreset {
  return FINISH_PRESETS.find((f) => f.id === id) ?? FINISH_PRESETS[1]
}

/* ------------------------------------------------------------------ *
 * Lighting environments
 *
 * Each preset is a fully local light rig — no HDRI is fetched from a CDN, so
 * the viewer renders identically offline and behind strict CSP.
 * ------------------------------------------------------------------ */

export interface EnvironmentPreset {
  id: string
  label: string
  /** Page-level background gradient behind the canvas. */
  background: string
  keyColor: string
  keyIntensity: number
  keyPosition: [number, number, number]
  fillColor: string
  fillIntensity: number
  skyColor: string
  groundColor: string
  ambientIntensity: number
  shadowOpacity: number
  /** Colour of the large softbox in the generated environment map. */
  lightformerColor: string
  lightformerIntensity: number
}

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  {
    id: 'midday',
    label: 'Midday',
    background: 'linear-gradient(180deg, #CFE4F5 0%, #EDF4FA 55%, #E4E9EC 100%)',
    keyColor: '#FFF6E5',
    keyIntensity: 2.6,
    keyPosition: [7, 11, 6],
    fillColor: '#CFE4F5',
    fillIntensity: 0.7,
    skyColor: '#DCEBFA',
    groundColor: '#B7AE9E',
    ambientIntensity: 0.5,
    shadowOpacity: 0.42,
    lightformerColor: '#FFFFFF',
    lightformerIntensity: 2.2,
  },
  {
    id: 'golden',
    label: 'Golden Hour',
    background: 'linear-gradient(180deg, #F7C88B 0%, #F3DCC0 50%, #E6D6C4 100%)',
    keyColor: '#FFC680',
    keyIntensity: 3.2,
    keyPosition: [-9, 4.5, 5],
    fillColor: '#9BBEE0',
    fillIntensity: 0.8,
    skyColor: '#F6D5A8',
    groundColor: '#A98D6B',
    ambientIntensity: 0.62,
    shadowOpacity: 0.45,
    lightformerColor: '#FFD9A0',
    lightformerIntensity: 2.6,
  },
  {
    id: 'overcast',
    label: 'Overcast',
    background: 'linear-gradient(180deg, #DDE3E8 0%, #E9EDF0 60%, #DFE3E6 100%)',
    keyColor: '#E8EDF2',
    keyIntensity: 1.5,
    keyPosition: [4, 12, 8],
    fillColor: '#D3DAE0',
    fillIntensity: 0.9,
    skyColor: '#E6EBEF',
    groundColor: '#AAB0B5',
    ambientIntensity: 0.85,
    shadowOpacity: 0.22,
    lightformerColor: '#EEF2F6',
    lightformerIntensity: 1.8,
  },
  {
    id: 'dusk',
    label: 'Dusk',
    background: 'linear-gradient(180deg, #2B2A4A 0%, #4A3C63 55%, #6B5570 100%)',
    keyColor: '#9BB4FF',
    keyIntensity: 1.1,
    keyPosition: [-6, 7, -5],
    fillColor: '#FFB56B',
    fillIntensity: 1.1,
    skyColor: '#3C3A63',
    groundColor: '#241F33',
    ambientIntensity: 0.28,
    shadowOpacity: 0.55,
    lightformerColor: '#B9C6FF',
    lightformerIntensity: 1.2,
  },
  {
    id: 'studio',
    label: 'Studio',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 60%, #E7E7EB 100%)',
    keyColor: '#FFFFFF',
    keyIntensity: 2.2,
    keyPosition: [5, 8, 7],
    fillColor: '#FFFFFF',
    fillIntensity: 1.0,
    skyColor: '#FFFFFF',
    groundColor: '#D8D8DC',
    ambientIntensity: 0.7,
    shadowOpacity: 0.35,
    lightformerColor: '#FFFFFF',
    lightformerIntensity: 2.8,
  },
]

export function getEnvironment(id: string): EnvironmentPreset {
  return ENVIRONMENT_PRESETS.find((e) => e.id === id) ?? ENVIRONMENT_PRESETS[0]
}

/* ------------------------------------------------------------------ *
 * Camera views
 * ------------------------------------------------------------------ */

export interface CameraView {
  id: string
  label: string
  /** Direction the camera sits in, normalised by the fitted model radius. */
  direction: [number, number, number]
}

export const CAMERA_VIEWS: CameraView[] = [
  { id: 'corner', label: 'Corner', direction: [1, 0.55, 1.25] },
  { id: 'front', label: 'Front', direction: [0, 0.32, 1.9] },
  { id: 'side', label: 'Side', direction: [1.9, 0.32, 0] },
  { id: 'rear', label: 'Rear', direction: [-0.7, 0.45, -1.6] },
  { id: 'top', label: 'Aerial', direction: [0.2, 2.0, 0.9] },
]

/* ------------------------------------------------------------------ *
 * Optional parts the studio can add/remove
 * ------------------------------------------------------------------ */

export interface OptionalPart {
  id: string
  label: string
  /** Node-name tokens matched against the model. */
  tokens: string[]
  /** Whether the part is present before the buyer touches anything. */
  defaultOn: boolean
  /**
   * Part this one is physically mounted on. Removing the parent removes this
   * too, so a railing never ends up floating where its deck used to be.
   */
  requires?: string
}

export const OPTIONAL_PARTS: OptionalPart[] = [
  { id: 'deck', label: 'Front Deck', tokens: ['deck', 'porch'], defaultOn: true },
  { id: 'stairs', label: 'Entry Stairs', tokens: ['stair', 'step'], defaultOn: true, requires: 'deck' },
  {
    id: 'railing',
    label: 'Deck Railing',
    tokens: ['railing', 'balustrade'],
    defaultOn: true,
    requires: 'deck',
  },
  { id: 'pergola', label: 'Pergola Shade', tokens: ['pergola', 'can opy'], defaultOn: false },
  { id: 'solar', label: 'Solar Array', tokens: ['solar', 'photovoltaic'], defaultOn: false },
  { id: 'skylight', label: 'Skylights', tokens: ['skylight'], defaultOn: false },
  { id: 'chimney', label: 'Chimney', tokens: ['chimney', 'flue'], defaultOn: false },
  { id: 'carport', label: 'Carport', tokens: ['carport', 'garage'], defaultOn: false },
  {
    id: 'planter',
    label: 'Planter Boxes',
    tokens: ['planter', 'garden'],
    defaultOn: false,
    requires: 'deck',
  },
]

const PART_BY_ID = new Map(OPTIONAL_PARTS.map((p) => [p.id, p]))

/**
 * Whether a part actually appears: its own toggle must be on, and so must
 * every part it is mounted on. The chain is walked with a visited set so a
 * mis-authored cycle degrades to `false` instead of hanging.
 */
export function isPartEnabled(partId: string, studio: StudioConfig): boolean {
  const seen = new Set<string>()
  let current: OptionalPart | undefined = PART_BY_ID.get(partId)

  while (current) {
    if (seen.has(current.id)) return false
    seen.add(current.id)

    if (!(studio.parts[current.id] ?? current.defaultOn)) return false
    current = current.requires ? PART_BY_ID.get(current.requires) : undefined
  }

  return true
}

/* ------------------------------------------------------------------ *
 * Studio configuration
 * ------------------------------------------------------------------ */

export interface StudioConfig {
  colors: Record<SurfaceKey, string>
  /**
   * Surfaces the buyer has explicitly recoloured. Until a surface is touched,
   * a seller-configured colour option wins over the studio default.
   */
  touched: Record<SurfaceKey, boolean>
  parts: Record<string, boolean>
  finish: string
  environment: string
  showGround: boolean
  autoRotate: boolean
  wireframe: boolean
  view: string
}

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  colors: SURFACES.reduce(
    (acc, s) => {
      acc[s.key] = s.defaultColor
      return acc
    },
    {} as Record<SurfaceKey, string>
  ),
  touched: SURFACE_KEYS.reduce(
    (acc, k) => {
      acc[k] = false
      return acc
    },
    {} as Record<SurfaceKey, boolean>
  ),
  parts: OPTIONAL_PARTS.reduce(
    (acc, p) => {
      acc[p.id] = p.defaultOn
      return acc
    },
    {} as Record<string, boolean>
  ),
  finish: 'satin',
  environment: 'midday',
  showGround: true,
  autoRotate: false,
  wireframe: false,
  view: 'corner',
}

/* ------------------------------------------------------------------ *
 * Model URL resolution
 * ------------------------------------------------------------------ */

interface ModelUrlSource {
  specifications?: Record<string, string> | null
}

/**
 * Resolves the product's 3D model path. `ar_glb_url` is the field sellers
 * already populate (see NewProductForm/EditProductForm), with `model_3d_url`
 * reserved for a dedicated configurator model.
 */
export function resolveModelUrl(product: ModelUrlSource): string | null {
  // return '/models/expandable-container-house.glb'.trim()
  const specs = product.specifications
  if (!specs) return null
  for (const key of ['model_3d_url', 'model_url', 'glb_url', 'ar_glb_url']) {
    const value = specs[key]
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }
  return null
}

/* ------------------------------------------------------------------ *
 * Token matching
 * ------------------------------------------------------------------ */

const MIN_TOKEN_LENGTH = 3

/** Lowercases and strips everything that isn't a letter or digit. */
export function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Loose containment match in either direction, so a group named
 * "Roof Colour" binds to a mesh named `Roof_Panel_01`.
 */
export function matchesNode(nodeName: string, token: string): boolean {
  const node = normalizeToken(nodeName)
  const needle = normalizeToken(token)
  if (needle.length < MIN_TOKEN_LENGTH || node.length < MIN_TOKEN_LENGTH) return false
  return node.includes(needle) || needle.includes(node)
}

export function matchesAnyToken(nodeName: string, tokens: string[]): boolean {
  return tokens.some((token) => matchesNode(nodeName, token))
}

/** Which painted surface, if any, a node belongs to. First match wins. */
export function surfaceForNode(nodeName: string): SurfaceKey | null {
  for (const surface of SURFACES) {
    if (matchesAnyToken(nodeName, surface.tokens)) return surface.key
  }
  return null
}

/* ------------------------------------------------------------------ *
 * Colour extraction
 * ------------------------------------------------------------------ */

const HEX_RE = /#([0-9a-f]{6}|[0-9a-f]{3})\b/i

/**
 * Pulls a colour out of an option. Prefers the dedicated `color_hex` column,
 * then falls back to a hex embedded in the name or description — the same
 * loose convention ProductCustomizer already honours.
 */
export function colorFromOption(option: CustomizationOption): string | null {
  if (option.color_hex && HEX_RE.test(option.color_hex)) return option.color_hex
  for (const field of [option.description, option.name]) {
    if (!field) continue
    const match = field.match(HEX_RE)
    if (match) return match[0]
  }
  return null
}

/* ------------------------------------------------------------------ *
 * Group → model binding
 * ------------------------------------------------------------------ */

const NODE_DIRECTIVE_RE = /\bnode\s*:\s*([A-Za-z0-9_\-.]+)/i

const VISUAL_TYPE_TOKENS: Record<string, string> = {
  door: 'door',
  window: 'window',
  'wall-color': 'wall',
}

const COLOR_GROUP_RE = /colou?r|paint|finish|stain|shade|hue/i

/** A group either recolours something or adds/removes something. */
export function isColorGroup(group: CustomizationGroupWithRelations): boolean {
  return group.visual_type === 'wall-color' || COLOR_GROUP_RE.test(group.name)
}

/** Explicit `node:Foo` escape hatch, checked on the option then the group. */
function explicitNode(text: string | null | undefined): string | null {
  if (!text) return null
  const match = text.match(NODE_DIRECTIVE_RE)
  return match ? match[1] : null
}

/**
 * The node token a whole group targets, in precedence order:
 * explicit directive → target_anchor_id → visual_type → slug of the name.
 */
export function tokenForGroup(group: CustomizationGroupWithRelations): string {
  const explicit = explicitNode(group.description)
  if (explicit) return explicit

  const anchor = group.target_anchor_id
  if (anchor && anchor.trim().length > 0) return anchor.trim()

  const byVisualType = group.visual_type ? VISUAL_TYPE_TOKENS[group.visual_type] : undefined
  if (byVisualType) return byVisualType

  return group.name
}

/** The node token a single option targets, for add/remove groups. */
export function tokenForOption(
  group: CustomizationGroupWithRelations,
  option: CustomizationOption
): string {
  return explicitNode(option.description) ?? option.name
}

export interface SceneDirectives {
  /** Tokens whose matching nodes must be shown. */
  visibleTokens: string[]
  /** Tokens whose matching nodes must be hidden. */
  hiddenTokens: string[]
  /** Node token → hex colour, from seller-configured colour groups. */
  colorByToken: Record<string, string>
  /** Painted surface → hex colour, when a colour group maps onto a surface. */
  colorBySurface: Partial<Record<SurfaceKey, string>>
}

export const EMPTY_DIRECTIVES: SceneDirectives = {
  visibleTokens: [],
  hiddenTokens: [],
  colorByToken: {},
  colorBySurface: {},
}

/**
 * Translates the buyer's selections into instructions the model can apply.
 *
 * Colour groups recolour their target node/surface. Every other group is an
 * add/remove group: each of its options maps to a node, selected options are
 * shown and unselected ones hidden. That covers both variant swapping
 * (single-select: gable vs flat roof) and true add-ons (multi-select extras).
 */
export function buildSceneDirectives(
  groups: CustomizationGroupWithRelations[],
  selections: Record<string, CustomizationOption[]>
): SceneDirectives {
  const visibleTokens: string[] = []
  const hiddenTokens: string[] = []
  const colorByToken: Record<string, string> = {}
  const colorBySurface: Partial<Record<SurfaceKey, string>> = {}

  for (const group of groups) {
    const selected = selections[group.id] ?? []
    const selectedIds = new Set(selected.map((o) => o.id))

    if (isColorGroup(group)) {
      const option = selected[0]
      if (!option) continue
      const color = colorFromOption(option)
      if (!color) continue

      const token = tokenForGroup(group)
      colorByToken[token] = color

      const surface = surfaceForNode(token)
      if (surface) colorBySurface[surface] = color
      continue
    }

    for (const option of group.options ?? []) {
      const token = tokenForOption(group, option)
      if (selectedIds.has(option.id)) {
        visibleTokens.push(token)
        // An add/remove option can still carry a colour (e.g. "Cedar Deck").
        const color = colorFromOption(option)
        if (color) colorByToken[token] = color
      } else {
        hiddenTokens.push(token)
      }
    }
  }

  return { visibleTokens, hiddenTokens, colorByToken, colorBySurface }
}

/* ------------------------------------------------------------------ *
 * Resolved per-node appearance
 * ------------------------------------------------------------------ */

export interface NodeAppearance {
  visible: boolean
  color: string | null
}

/**
 * Final say on how one node renders, folding together seller selections,
 * studio colours, and studio part toggles.
 *
 * Visibility precedence: an explicit seller selection (visible/hidden) always
 * beats the studio's part toggle, because the buyer picked it in the priced
 * configurator. Colour precedence: a touched studio surface beats the seller
 * colour; an untouched one yields to it.
 */
export function resolveNodeAppearance(
  nodeName: string,
  directives: SceneDirectives,
  studio: StudioConfig
): NodeAppearance {
  let visible = true

  // Studio part toggles first — lowest priority.
  for (const part of OPTIONAL_PARTS) {
    if (matchesAnyToken(nodeName, part.tokens)) {
      visible = isPartEnabled(part.id, studio)
      break
    }
  }

  // Seller selections override.
  if (directives.hiddenTokens.some((token) => matchesNode(nodeName, token))) visible = false
  if (directives.visibleTokens.some((token) => matchesNode(nodeName, token))) visible = true

  // Colour: seller-configured value, then studio override if touched.
  let color: string | null = null

  for (const [token, hex] of Object.entries(directives.colorByToken)) {
    if (matchesNode(nodeName, token)) {
      color = hex
      break
    }
  }

  const surface = surfaceForNode(nodeName)
  if (surface) {
    if (!color && directives.colorBySurface[surface]) {
      color = directives.colorBySurface[surface] as string
    }
    if (studio.touched[surface]) {
      color = studio.colors[surface]
    } else if (!color) {
      color = studio.colors[surface]
    }
  }

  return { visible, color }
}

/**
 * Optional parts worth offering for a given model — the intersection of the
 * catalogue above with node names the loaded model actually contains, so the
 * panel never shows a toggle that does nothing. Before any node is discovered
 * (model still loading) the full catalogue is returned.
 */
export function availableParts(discoveredNodes: string[]): OptionalPart[] {
  if (discoveredNodes.length === 0) return OPTIONAL_PARTS
  return OPTIONAL_PARTS.filter((part) =>
    discoveredNodes.some((node) => matchesAnyToken(node, part.tokens))
  )
}

/**
 * Surfaces worth offering colour controls for, filtered the same way.
 */
export function availableSurfaces(discoveredNodes: string[]): SurfaceDefinition[] {
  if (discoveredNodes.length === 0) return SURFACES
  const found = SURFACES.filter((surface) =>
    discoveredNodes.some((node) => matchesAnyToken(node, surface.tokens))
  )
  return found.length > 0 ? found : SURFACES
}
