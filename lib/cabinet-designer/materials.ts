import type { CabinetMaterialOption, CountertopOption } from './types'

export const CABINET_MATERIALS: CabinetMaterialOption[] = [
  { id: 'white',      name: 'White',        color: '#F5F4F0', roughness: 0.35, metalness: 0.02, pricePerLinearFoot: 200 },
  { id: 'black',      name: 'Matte Black',  color: '#1C1C1E', roughness: 0.4,  metalness: 0.05, pricePerLinearFoot: 220 },
  { id: 'walnut',     name: 'Walnut',       color: '#6B3F25', roughness: 0.5,  metalness: 0,    pricePerLinearFoot: 260 },
  { id: 'oak',        name: 'Oak',          color: '#C8A882', roughness: 0.55, metalness: 0,    pricePerLinearFoot: 250 },
  { id: 'sage',       name: 'Sage Green',   color: '#9BAE9B', roughness: 0.4,  metalness: 0,    pricePerLinearFoot: 230 },
  { id: 'navy',       name: 'Navy Blue',    color: '#2E3A59', roughness: 0.35, metalness: 0.03, pricePerLinearFoot: 235 },
]

export const COUNTERTOP_MATERIALS: CountertopOption[] = [
  { id: 'quartz',   name: 'Quartz',   color: '#D8D4CF', pricePerLinearFoot: 85 },
  { id: 'granite',  name: 'Granite',  color: '#3D3D3D', pricePerLinearFoot: 75 },
  { id: 'marble',   name: 'Marble',   color: '#F0EDE8', pricePerLinearFoot: 120 },
  { id: 'wood',     name: 'Wood',     color: '#8B5E3C', pricePerLinearFoot: 65 },
  { id: 'concrete', name: 'Concrete', color: '#9E9E9E', pricePerLinearFoot: 55 },
]

export const DOOR_STYLE_PRICES: Record<string, number> = {
  flat: 0,
  shaker: 40,
  glass: 55,
}

export const HANDLE_STYLE_PRICES: Record<string, number> = {
  none: 0,
  bar: 10,
  knob: 6,
  integrated: 25,
}

export function getMaterial(materialId: string): CabinetMaterialOption {
  return CABINET_MATERIALS.find((material) => material.id === materialId) ?? CABINET_MATERIALS[0]
}

export function getCountertop(countertopId: string): CountertopOption {
  return COUNTERTOP_MATERIALS.find((countertop) => countertop.id === countertopId) ?? COUNTERTOP_MATERIALS[0]
}
