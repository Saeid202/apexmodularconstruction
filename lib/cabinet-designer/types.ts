export type CabinetType = 'base' | 'wall' | 'tall' | 'corner'

export type DoorStyle = 'flat' | 'shaker' | 'glass'
export type HandleStyle = 'bar' | 'knob' | 'integrated' | 'none'

export interface CabinetMaterialOption {
  id: string
  name: string
  color: string
  roughness: number
  metalness: number
  pricePerLinearFoot: number
}

export interface CountertopOption {
  id: string
  name: string
  color: string
  pricePerLinearFoot: number
}

/** A single cabinet unit placed within a run (e.g. one base cabinet next to a tall pantry). */
export interface CabinetUnit {
  id: string
  type: CabinetType
  widthInches: number
  heightInches: number
  depthInches: number
  doorCount: number
  doorStyle: DoorStyle
  handleStyle: HandleStyle
  materialId: string
  hasCountertop: boolean
}

export interface CabinetDesign {
  units: CabinetUnit[]
  countertopId: string
}

export const CABINET_TYPE_LABELS: Record<CabinetType, string> = {
  base: 'Base cabinet',
  wall: 'Wall cabinet',
  tall: 'Tall / pantry',
  corner: 'Corner cabinet',
}

/** Default dimensions (inches) used when a unit's type changes. */
export const CABINET_TYPE_DEFAULTS: Record<CabinetType, Pick<CabinetUnit, 'widthInches' | 'heightInches' | 'depthInches' | 'doorCount' | 'hasCountertop'>> = {
  base:   { widthInches: 36, heightInches: 34.5, depthInches: 24, doorCount: 2, hasCountertop: true },
  wall:   { widthInches: 36, heightInches: 30,   depthInches: 13, doorCount: 2, hasCountertop: false },
  tall:   { widthInches: 24, heightInches: 84,   depthInches: 24, doorCount: 2, hasCountertop: false },
  corner: { widthInches: 36, heightInches: 34.5, depthInches: 36, doorCount: 1, hasCountertop: true },
}
