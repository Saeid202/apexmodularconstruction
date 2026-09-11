export interface ExteriorBuildingDimensions {
  length: number
  width: number
  height: number
}

export interface PanelSpecification {
  width: number
  height: number
  pricePerSquareFoot: number
}

export interface PanelLayoutEstimate {
  panelWidth: number
  panelHeight: number
  panelsAcrossLongWalls: number
  panelsAcrossShortWalls: number
  panelsHigh: number
  totalPanels: number
  wallArea: number
  purchasedArea: number
  leftoverArea: number
  wastePercentage: number
  pricePerSquareFoot: number
  totalCost: number
}

export interface PanelCalculationResult {
  estimate: PanelLayoutEstimate | null
  missing: string[]
}

function positiveNumber(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function panelLayout(
  dimensions: ExteriorBuildingDimensions,
  panel: PanelSpecification,
  panelWidth: number,
  panelHeight: number,
) {
  const panelsHigh = Math.ceil(dimensions.height / panelHeight)
  const panelsAcrossLongWalls = Math.ceil(dimensions.length / panelWidth)
  const panelsAcrossShortWalls = Math.ceil(dimensions.width / panelWidth)
  const totalPanels = 2 * (panelsAcrossLongWalls + panelsAcrossShortWalls) * panelsHigh
  const purchasedArea = totalPanels * panelWidth * panelHeight
  const wallArea = 2 * (dimensions.length + dimensions.width) * dimensions.height

  return {
    panelWidth,
    panelHeight,
    panelsAcrossLongWalls,
    panelsAcrossShortWalls,
    panelsHigh,
    totalPanels,
    purchasedArea,
    wallArea,
  }
}

export function calculatePanelEstimate(
  dimensions: ExteriorBuildingDimensions,
  panel: Partial<PanelSpecification>,
): PanelCalculationResult {
  const missing: string[] = []
  const length = positiveNumber(dimensions.length)
  const width = positiveNumber(dimensions.width)
  const height = positiveNumber(dimensions.height)
  const panelWidth = positiveNumber(panel.width)
  const panelHeight = positiveNumber(panel.height)
  const pricePerSquareFoot = positiveNumber(panel.pricePerSquareFoot)

  if (!length) missing.push('building length')
  if (!width) missing.push('building width')
  if (!height) missing.push('wall height')
  if (!panelWidth) missing.push('panel width')
  if (!panelHeight) missing.push('panel height')
  if (!pricePerSquareFoot) missing.push('price per square foot')
  if (missing.length > 0 || length === null || width === null || height === null || panelWidth === null || panelHeight === null || pricePerSquareFoot === null) {
    return { estimate: null, missing }
  }

  const building = { length, width, height }
  const specification = { width: panelWidth, height: panelHeight, pricePerSquareFoot }
  const standardLayout = panelLayout(building, specification, panelWidth, panelHeight)
  const rotatedLayout = panelLayout(building, specification, panelHeight, panelWidth)
  const layout = rotatedLayout.totalPanels < standardLayout.totalPanels ? rotatedLayout : standardLayout
  const leftoverArea = Math.max(0, layout.purchasedArea - layout.wallArea)

  return {
    missing: [],
    estimate: {
      ...layout,
      wallArea: layout.wallArea,
      leftoverArea,
      wastePercentage: (leftoverArea / layout.wallArea) * 100,
      pricePerSquareFoot,
      totalCost: layout.purchasedArea * pricePerSquareFoot,
    },
  }
}