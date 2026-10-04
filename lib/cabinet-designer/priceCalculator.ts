import { DOOR_STYLE_PRICES, getCountertop, getMaterial, HANDLE_STYLE_PRICES } from './materials'
import type { CabinetDesign, CabinetUnit } from './types'

export interface UnitPriceBreakdown {
  unitId: string
  linearFeet: number
  materialCost: number
  doorCost: number
  handleCost: number
  countertopCost: number
  total: number
}

export interface CabinetPriceResult {
  units: UnitPriceBreakdown[]
  installFee: number
  subtotal: number
  total: number
}

const INSTALL_FEE = 400

function unitPrice(unit: CabinetUnit, countertopId: string): UnitPriceBreakdown {
  const linearFeet = unit.widthInches / 12
  const material = getMaterial(unit.materialId)

  const materialCost = linearFeet * material.pricePerLinearFoot
  const doorCost = unit.doorCount * (DOOR_STYLE_PRICES[unit.doorStyle] ?? 0)
  const handleCost = unit.doorCount * (HANDLE_STYLE_PRICES[unit.handleStyle] ?? 0)
  const countertopCost = unit.hasCountertop ? linearFeet * getCountertop(countertopId).pricePerLinearFoot : 0

  return {
    unitId: unit.id,
    linearFeet,
    materialCost,
    doorCost,
    handleCost,
    countertopCost,
    total: materialCost + doorCost + handleCost + countertopCost,
  }
}

export function calculateCabinetDesignPrice(design: CabinetDesign): CabinetPriceResult {
  const units = design.units.map((unit) => unitPrice(unit, design.countertopId))
  const subtotal = units.reduce((sum, unit) => sum + unit.total, 0)
  const installFee = design.units.length > 0 ? INSTALL_FEE : 0

  return {
    units,
    installFee,
    subtotal,
    total: Math.round(subtotal + installFee),
  }
}
