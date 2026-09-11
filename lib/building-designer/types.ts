export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'office'
  | 'storage'

export type PlanLayer =
  | 'exterior-walls'
  | 'interior-walls'
  | 'doors'
  | 'windows'
  | 'dimensions'
  | 'room-labels'
  | 'furniture'

export interface Point {
  x: number
  y: number
}

export interface BuildingDimensions {
  length: number
  width: number
  height: number
}

export interface Wall {
  id: string
  start: Point
  end: Point
  thickness: number
  height: number
  layer: 'exterior' | 'interior'
  material?: string
}

export interface Room {
  id: string
  type: RoomType
  name: string
  polygon: Point[]
  areaSqFt?: number
  wallIds: string[]
}

export interface PlanOpening {
  id: string
  type: 'door' | 'window'
  wallId: string
  position: number
  width: number
  swing?: 'left' | 'right' | 'none'
}

export interface PlanDimension {
  id: string
  start: Point
  end: Point
  label?: string
}

export interface PlanLayerState {
  id: PlanLayer
  visible: boolean
  locked: boolean
}

export interface BuildingPlan {
  version: 1
  dimensions: BuildingDimensions
  walls: Wall[]
  rooms: Room[]
  openings: PlanOpening[]
  dimensionsAnnotations: PlanDimension[]
  layers: PlanLayerState[]
}

export const defaultPlanLayers: PlanLayerState[] = [
  { id: 'exterior-walls', visible: true, locked: true },
  { id: 'interior-walls', visible: true, locked: false },
  { id: 'doors', visible: true, locked: false },
  { id: 'windows', visible: true, locked: false },
  { id: 'dimensions', visible: true, locked: false },
  { id: 'room-labels', visible: true, locked: false },
  { id: 'furniture', visible: true, locked: false },
]
