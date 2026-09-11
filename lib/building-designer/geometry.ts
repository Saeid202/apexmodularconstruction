import type { Point } from './types'

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

export function snapToGrid(value: number, gridSize = 0.5) {
  if (!Number.isFinite(value) || gridSize <= 0) return value
  return Math.round(value / gridSize) * gridSize
}

export function screenToPlanPoint(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  buildingLength: number,
  buildingWidth: number,
  padding = 0,
  gridSize = 0.5,
): Point {
  const horizontalRatio = clamp((clientX - bounds.left - padding) / Math.max(bounds.width - padding * 2, 1), 0, 1)
  const verticalRatio = clamp((clientY - bounds.top - padding) / Math.max(bounds.height - padding * 2, 1), 0, 1)

  return {
    x: snapToGrid(horizontalRatio * buildingLength, gridSize),
    y: snapToGrid(verticalRatio * buildingWidth, gridSize),
  }
}

export function planPointToNormalized(point: Point, buildingLength: number, buildingWidth: number): Point {
  return {
    x: clamp(point.x / Math.max(buildingLength, 0.01), 0, 1),
    y: clamp(point.y / Math.max(buildingWidth, 0.01), 0, 1),
  }
}

export function distanceBetweenPoints(start: Point, end: Point) {
  return Math.hypot(end.x - start.x, end.y - start.y)
}
