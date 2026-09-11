'use client'

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { BufferAttribute, DoubleSide, ExtrudeGeometry, Plane, Raycaster, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3 } from 'three'
import { AlertCircle, Box, Calculator, Check, DoorOpen, ExternalLink, PanelsTopLeft, Ruler, Search, Square, X } from 'lucide-react'
import { getProducts, type ProductWithRelations as CatalogProduct } from '@/app/actions/products'
import { calculatePanelEstimate } from '@/lib/building-designer/panelCalculator'
import { distanceBetweenPoints, planPointToNormalized, snapToGrid } from '@/lib/building-designer/geometry'
import type { Point, RoomType } from '@/lib/building-designer/types'

type ConstructionSystem = 'steel_frame' | 'sandwich_panel'
type DesignerMode = 'exterior' | 'interior'
type FloorPlanTemplate = 'open' | 'one-bedroom' | 'two-bedroom' | 'empty'
type InteriorView = 'floor-plan' | 'walkthrough'
type WalkthroughView = 'overview' | 'inside'
type PartitionOrientation = 'vertical' | 'horizontal'
type OpeningType = 'door' | 'window'
type RoofType = 'gable' | 'single_slope' | 'gambrel'
type RoofPitch = 1 | 2 | 3 | 4 | 5

interface Opening {
  id: number
  type: OpeningType
  wall: 'front' | 'back' | 'left' | 'right'
  width: number
  height: number
  offset: number
  bottom: number
  imageUrl?: string | null
}

type Wall = Opening['wall']
type PlacementPoint = { wall: Wall; point: [number, number, number] }

const wallFinishOptions = [
  { name: 'Ivory', color: '#D8C8A8' },
  { name: 'Sage', color: '#9BAE9B' },
  { name: 'Sky', color: '#8EA9B7' },
  { name: 'Terracotta', color: '#B97861' },
  { name: 'Charcoal', color: '#4B5655' },
  { name: 'White', color: '#E7DED0' },
]

type WallPanelId = 'solid' | 'wood-grain' | 'catalog'
const WALL_PANEL_IMPORT_KEY = 'cargoplus:building-designer:wall-panel'
const WALL_PANEL_SELECTION_KEY = 'cargoplus:building-designer:selected-wall-panel'
const DOOR_IMPORT_KEY = 'cargoplus:building-designer:door'
const WINDOW_IMPORT_KEY = 'cargoplus:building-designer:window'

interface WallPanelOption {
  id: WallPanelId
  name: string
  description: string
  image?: string
}

interface ImportedDoor {
  id: string
  name: string
  specifications?: Record<string, unknown> | null
  product_images?: Array<{ url: string; is_master?: boolean | null }>
}

const wallPanelOptions: readonly WallPanelOption[] = [
  { id: 'solid', name: 'Solid color', description: 'Use the selected wall finish' },
  { id: 'wood-grain', name: 'Wood-grain insulated panel', description: 'Vertical ribbed panel', image: '/wall-panels/wood-panel-texture.png' },
]

function getPanelTextureUrl(product: CatalogProduct) {
  const specifications = product.specifications as Record<string, string> | null
  const textureUrl = specifications?.texture_url || specifications?.panel_texture_url
  const masterImage = product.product_images.find((image) => image.is_master) ?? product.product_images[0]
  return textureUrl || masterImage?.url || null
}

interface InteriorPartition {
  id: number
  orientation: PartitionOrientation
  position: number
  start: number
  end: number
}

interface InteriorRoom {
  id: number
  type: RoomType
  points: Point[]
}

const roomTypeOptions: Array<{ id: RoomType; name: string }> = [
  { id: 'living', name: 'Living room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'office', name: 'Office' },
  { id: 'storage', name: 'Storage' },
]

const floorPlanTemplates: Array<{ id: FloorPlanTemplate; name: string }> = [
  { id: 'open', name: 'Open plan' },
  { id: 'one-bedroom', name: '1 bedroom' },
  { id: 'two-bedroom', name: '2 bedrooms' },
  { id: 'empty', name: 'Empty' },
]

function getTemplatePartitions(template: FloorPlanTemplate): InteriorPartition[] {
  if (template === 'one-bedroom') {
    return [{ id: 1, orientation: 'vertical', position: 0.58, start: 0.06, end: 0.94 }]
  }
  if (template === 'two-bedroom') {
    return [
      { id: 1, orientation: 'vertical', position: 0.5, start: 0.06, end: 0.94 },
      { id: 2, orientation: 'horizontal', position: 0.55, start: 0.5, end: 0.94 },
    ]
  }
  return []
}

function InteriorFloorPlan({
  length,
  width,
}: {
  length: number
  width: number
}) {
  const [template, setTemplate] = useState<FloorPlanTemplate>('one-bedroom')
  const [partitions, setPartitions] = useState<InteriorPartition[]>(() => getTemplatePartitions('one-bedroom'))
  const [selectedPartitionId, setSelectedPartitionId] = useState<number | null>(null)
  const [draggingPartitionId, setDraggingPartitionId] = useState<number | null>(null)
  const [rooms, setRooms] = useState<InteriorRoom[]>([])
  const [roomToolActive, setRoomToolActive] = useState(false)
  const [eraseToolActive, setEraseToolActive] = useState(false)
  const [roomType, setRoomType] = useState<RoomType>('bedroom')
  const [draftRoomPoints, setDraftRoomPoints] = useState<Point[]>([])
  const planWidth = 640
  const planHeight = 400
  const inset = 34
  const planInnerWidth = planWidth - inset * 2
  const planInnerHeight = planHeight - inset * 2

  function chooseTemplate(nextTemplate: FloorPlanTemplate) {
    setTemplate(nextTemplate)
    setPartitions(getTemplatePartitions(nextTemplate))
    setSelectedPartitionId(null)
    setRooms([])
    setDraftRoomPoints([])
    setRoomToolActive(false)
    setEraseToolActive(false)
  }

  function deleteSelectedPartition() {
    if (selectedPartitionId === null) return
    setPartitions((current) => current.filter((partition) => partition.id !== selectedPartitionId))
    setSelectedPartitionId(null)
    setDraggingPartitionId(null)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.isContentEditable) return
      event.preventDefault()
      deleteSelectedPartition()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPartitionId])

  function addPartition(orientation: PartitionOrientation) {
    const nextId = Math.max(0, ...partitions.map((partition) => partition.id)) + 1
    const partition: InteriorPartition = {
      id: nextId,
      orientation,
      position: 0.5,
      start: orientation === 'vertical' ? 0.08 : 0.45,
      end: orientation === 'vertical' ? 0.92 : 0.92,
    }
    setPartitions((current) => [...current, partition])
    setSelectedPartitionId(nextId)
    setTemplate('empty')
  }

  function getPlanPoint(event: React.PointerEvent<SVGSVGElement>): Point {
    const bounds = event.currentTarget.getBoundingClientRect()
    const horizontalRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left - (inset / planWidth) * bounds.width) / Math.max(bounds.width * (1 - (inset * 2) / planWidth), 1)))
    const verticalRatio = Math.max(0, Math.min(1, (event.clientY - bounds.top - (inset / planHeight) * bounds.height) / Math.max(bounds.height * (1 - (inset * 2) / planHeight), 1)))
    return {
      x: snapToGrid(horizontalRatio * length),
      y: snapToGrid(verticalRatio * width),
    }
  }

  function handlePlanPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (!roomToolActive) return
    const point = getPlanPoint(event)
    const firstPoint = draftRoomPoints[0]
    const closesDraft = firstPoint && distanceBetweenPoints(point, firstPoint) < Math.max(0.5, Math.min(length, width) * 0.04)
    if (closesDraft && draftRoomPoints.length >= 3) {
      const nextId = Math.max(0, ...rooms.map((room) => room.id)) + 1
      setRooms((current) => [...current, { id: nextId, type: roomType, points: draftRoomPoints }])
      setDraftRoomPoints([])
      setRoomToolActive(false)
      setTemplate('empty')
      return
    }
    setDraftRoomPoints((current) => [...current, point])
  }

  function updatePartitionPosition(event: React.PointerEvent<SVGSVGElement>) {
    if (draggingPartitionId === null) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left - inset) / planInnerWidth))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top - inset) / planInnerHeight))
    setPartitions((current) => current.map((partition) => partition.id !== draggingPartitionId
      ? partition
      : { ...partition, position: partition.orientation === 'vertical' ? x : y }))
  }

  const roomLabels = template === 'two-bedroom'
    ? [
        { label: 'Living / kitchen', x: 0.25, y: 0.3 },
        { label: 'Bedroom 1', x: 0.75, y: 0.28 },
        { label: 'Bedroom 2', x: 0.75, y: 0.76 },
      ]
    : template === 'one-bedroom'
      ? [{ label: 'Living / kitchen', x: 0.28, y: 0.5 }, { label: 'Bedroom', x: 0.78, y: 0.5 }]
      : template === 'open'
        ? [{ label: 'Open living area', x: 0.5, y: 0.5 }]
        : []

  return (
    <div className="flex h-full flex-col bg-[#F7FAF8] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Interior floor plan</p>
          <p className="mt-1 text-xs text-[#71847E]">Actual footprint: {length}&apos; × {width}&apos;</p>
        </div>
        <div className="flex gap-2 text-xs font-bold text-[#55716A]">
          <button type="button" onClick={() => addPartition('vertical')} className="rounded-lg border border-[#B7D7C8] bg-white px-3 py-2 hover:bg-[#EEF7F2]">+ Vertical wall</button>
          <button type="button" onClick={() => addPartition('horizontal')} className="rounded-lg border border-[#B7D7C8] bg-white px-3 py-2 hover:bg-[#EEF7F2]">+ Horizontal wall</button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {floorPlanTemplates.map((option) => (
          <button key={option.id} type="button" onClick={() => chooseTemplate(option.id)} className={`rounded-lg border px-2 py-2 text-xs font-bold ${template === option.id ? 'border-[#2C8065] bg-[#2C8065] text-white' : 'border-[#D6DFDC] bg-white text-[#55716A] hover:bg-[#EEF7F2]'}`}>
            {option.name}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-[#B7D7C8] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setRoomToolActive((current) => !current); setEraseToolActive(false); setDraftRoomPoints([]) }} className={`rounded-lg px-3 py-2 text-xs font-bold ${roomToolActive ? 'bg-[#A7654B] text-white' : 'border border-[#2C8065] text-[#23634F] hover:bg-[#EEF7F2]'}`}>
            {roomToolActive ? 'Drawing room...' : 'Pencil: draw room'}
          </button>
          <button type="button" onClick={() => { setEraseToolActive((current) => !current); setRoomToolActive(false); setDraftRoomPoints([]) }} className={`rounded-lg px-3 py-2 text-xs font-bold ${eraseToolActive ? 'bg-[#A7654B] text-white' : 'border border-[#D6DFDC] text-[#55716A] hover:bg-[#F5F7F6]'}`}>
            {eraseToolActive ? 'Erase active' : 'Erase'}
          </button>
          <select value={roomType} onChange={(event) => setRoomType(event.target.value as RoomType)} className="rounded-lg border border-[#D6DFDC] px-2 py-2 text-xs font-bold text-[#55716A]">
            {roomTypeOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          {draftRoomPoints.length >= 3 && <button type="button" onClick={() => { const nextId = Math.max(0, ...rooms.map((room) => room.id)) + 1; setRooms((current) => [...current, { id: nextId, type: roomType, points: draftRoomPoints }]); setDraftRoomPoints([]); setRoomToolActive(false); setTemplate('empty') }} className="rounded-lg bg-[#2C8065] px-3 py-2 text-xs font-bold text-white">Finish room</button>}
          {rooms.length > 0 && <button type="button" onClick={() => setRooms([])} className="ml-auto text-xs font-bold text-[#A7654B] hover:underline">Clear rooms</button>}
        </div>
        <p className="mt-2 text-[11px] text-[#71847E]">Choose a room type, activate Pencil, then click around the footprint. Click near the first point or use Finish room.</p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border-2 border-[#55716A] bg-white">
        <div className="relative z-10 h-full">
        <svg viewBox={`0 0 ${planWidth} ${planHeight}`} className={`h-full w-full touch-none ${roomToolActive || eraseToolActive ? 'cursor-crosshair' : 'cursor-default'}`} role="img" aria-label={`Interior floor plan for a ${length} by ${width} foot building`} onPointerDown={handlePlanPointerDown} onPointerMove={updatePartitionPosition} onPointerUp={() => setDraggingPartitionId(null)} onPointerLeave={() => setDraggingPartitionId(null)}>
          <rect x={inset} y={inset} width={planInnerWidth} height={planInnerHeight} fill="#F2EBDD" />
          <path d={`M ${inset + planInnerWidth / 2} ${inset} V ${inset + planInnerHeight}`} stroke="#D6DFDC" strokeDasharray="4 6" />
          <path d={`M ${inset} ${inset + planInnerHeight / 2} H ${inset + planInnerWidth}`} stroke="#D6DFDC" strokeDasharray="4 6" />
          {roomLabels.map((room) => (
            <text key={room.label} x={inset + room.x * planInnerWidth} y={inset + room.y * planInnerHeight} textAnchor="middle" className="fill-[#55716A] text-[13px] font-bold">{room.label}</text>
          ))}
          {rooms.map((room) => {
            const normalizedPoints = room.points.map((point) => planPointToNormalized(point, length, width))
            const points = normalizedPoints.map(({ x, y }) => `${inset + x * planInnerWidth},${inset + y * planInnerHeight}`).join(' ')
            const center = normalizedPoints.reduce((current, point) => ({ x: current.x + point.x / normalizedPoints.length, y: current.y + point.y / normalizedPoints.length }), { x: 0, y: 0 })
            return (
              <g key={room.id}>
                <polygon points={points} fill="#B7D7C8" fillOpacity="0.45" stroke="#23634F" strokeWidth="3" onPointerDown={(event) => { if (!eraseToolActive) return; event.stopPropagation(); setRooms((current) => current.filter((item) => item.id !== room.id)) }} />
                <text x={inset + center.x * planInnerWidth} y={inset + center.y * planInnerHeight} textAnchor="middle" className="pointer-events-none fill-[#23634F] text-[12px] font-bold">{roomTypeOptions.find((option) => option.id === room.type)?.name}</text>
              </g>
            )
          })}
          {draftRoomPoints.length > 0 && <>
            <polyline points={draftRoomPoints.map((point) => { const normalized = planPointToNormalized(point, length, width); return `${inset + normalized.x * planInnerWidth},${inset + normalized.y * planInnerHeight}` }).join(' ')} fill="none" stroke="#A7654B" strokeWidth="4" strokeDasharray="7 5" />
            {draftRoomPoints.map((point, index) => { const normalized = planPointToNormalized(point, length, width); return <circle key={`${point.x}-${point.y}-${index}`} cx={inset + normalized.x * planInnerWidth} cy={inset + normalized.y * planInnerHeight} r="5" fill="#A7654B" /> })}
          </>}
          {partitions.map((partition) => {
            const selected = selectedPartitionId === partition.id
            const line = partition.orientation === 'vertical'
              ? { x1: inset + partition.position * planInnerWidth, y1: inset + partition.start * planInnerHeight, x2: inset + partition.position * planInnerWidth, y2: inset + partition.end * planInnerHeight }
              : { x1: inset + partition.start * planInnerWidth, y1: inset + partition.position * planInnerHeight, x2: inset + partition.end * planInnerWidth, y2: inset + partition.position * planInnerHeight }
            return (
              <g key={partition.id}>
                <line {...line} stroke="transparent" strokeWidth="18" onPointerDown={(event) => { if (roomToolActive) return; event.stopPropagation(); if (eraseToolActive) { setPartitions((current) => current.filter((item) => item.id !== partition.id)); if (selectedPartitionId === partition.id) setSelectedPartitionId(null); return } setSelectedPartitionId(partition.id); setDraggingPartitionId(partition.id) }} />
                <line {...line} stroke={selected ? '#A7654B' : '#2C8065'} strokeWidth={selected ? 8 : 6} strokeLinecap="round" pointerEvents="none" />
              </g>
            )
          })}
          <rect x={inset} y={inset} width={planInnerWidth} height={planInnerHeight} fill="none" stroke="#203238" strokeWidth="5" />
        </svg>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#71847E]">
        <span>{partitions.length} partition wall{partitions.length === 1 ? '' : 's'} · Select and drag a wall to move it.</span>
        {selectedPartitionId !== null && <button type="button" onClick={deleteSelectedPartition} className="font-bold text-[#A7654B] hover:underline">Delete selected wall</button>}
      </div>
    </div>
  )
}

function InteriorWalkthrough({
  length,
  width,
  height,
  wallColor,
  floorColor,
  ceilingColor,
  view,
}: {
  length: number
  width: number
  height: number
  wallColor: string
  floorColor: string
  ceilingColor: string
  view: WalkthroughView
}) {
  const { camera } = useThree()
  const keys = useRef<Set<string>>(new Set())
  const scale = 8 / Math.max(length, width, height * 0.75, 1)
  const buildingLength = length * scale
  const buildingWidth = width * scale
  const buildingHeight = height * scale
  const halfLength = buildingLength / 2
  const halfWidth = buildingWidth / 2

  useEffect(() => {
    if (view === 'overview') {
      camera.position.set(buildingLength * 1.15, buildingHeight * 0.85, buildingWidth * 1.25)
    } else {
      camera.position.set(0, Math.min(buildingHeight * 0.45, 2.2), halfWidth * 0.7)
    }
    camera.rotation.set(0, 0, 0)

    const handleKeyDown = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase())
    const handleKeyUp = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [camera, buildingLength, buildingHeight, buildingWidth, halfWidth, view])

  useFrame((_, delta) => {
    const forward = Number(keys.current.has('w') || keys.current.has('arrowup')) - Number(keys.current.has('s') || keys.current.has('arrowdown'))
    const strafe = Number(keys.current.has('d') || keys.current.has('arrowright')) - Number(keys.current.has('a') || keys.current.has('arrowleft'))
    if (view === 'overview' || (forward === 0 && strafe === 0)) return

    const direction = new Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()
    const right = new Vector3().crossVectors(direction, camera.up).normalize()
    const movement = direction.multiplyScalar(forward).add(right.multiplyScalar(strafe)).normalize().multiplyScalar(delta * 2.8)
    camera.position.add(movement)
    camera.position.x = Math.max(-halfLength + 0.3, Math.min(halfLength - 0.3, camera.position.x))
    camera.position.z = Math.max(-halfWidth + 0.3, Math.min(halfWidth - 0.3, camera.position.z))
    camera.position.y = Math.min(Math.max(1.6, camera.position.y), Math.max(1.6, buildingHeight - 0.35))
  })

  const columnPositions = [-halfLength + 0.25, 0, halfLength - 0.25]

  return (
    <group position={[0, -buildingHeight / 2, 0]}>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[buildingLength, 0.12, buildingWidth]} />
        <meshStandardMaterial color={floorColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, buildingHeight, 0]}>
        <boxGeometry args={[buildingLength, 0.12, buildingWidth]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.92} side={DoubleSide} />
      </mesh>
      <mesh position={[0, buildingHeight / 2, -halfWidth]} receiveShadow>
        <boxGeometry args={[buildingLength, buildingHeight, 0.12]} />
        <meshStandardMaterial color={wallColor} roughness={0.68} side={DoubleSide} />
      </mesh>
      <mesh position={[-halfLength, buildingHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, buildingHeight, buildingWidth]} />
        <meshStandardMaterial color={wallColor} roughness={0.68} side={DoubleSide} />
      </mesh>
      <mesh position={[halfLength, buildingHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, buildingHeight, buildingWidth]} />
        <meshStandardMaterial color={wallColor} roughness={0.68} side={DoubleSide} />
      </mesh>
      {view === 'overview' && (
        <mesh position={[0, buildingHeight / 2, halfWidth]} receiveShadow>
          <boxGeometry args={[buildingLength, buildingHeight, 0.12]} />
          <meshStandardMaterial color={wallColor} roughness={0.68} side={DoubleSide} />
        </mesh>
      )}
      {columnPositions.flatMap((x) => [-halfWidth + 0.2, halfWidth - 0.2].map((z) => (
        <mesh key={`column-${x}-${z}`} position={[x, buildingHeight / 2, z]} castShadow>
          <boxGeometry args={[0.16, buildingHeight, 0.16]} />
          <meshStandardMaterial color="#52656A" metalness={0.72} roughness={0.35} />
        </mesh>
      )))}
      <mesh position={[0, buildingHeight - 0.12, 0]}>
        <boxGeometry args={[buildingLength, 0.16, 0.16]} />
        <meshStandardMaterial color="#52656A" metalness={0.72} roughness={0.35} />
      </mesh>
      {view === 'inside' && <PointerLockControls selector="#interior-walkthrough-canvas" />}
      {view === 'overview' && <OrbitControls enablePan={false} minDistance={6} maxDistance={45} target={[0, buildingHeight * 0.25, 0]} />}
    </group>
  )
}

function parseSpecificationNumber(value: unknown) {
  const match = String(value ?? '').trim().match(/(\d+(?:\.\d+)?)\s*(mm|cm|m|ft|feet|')?/i)
  if (!match) return null

  const number = Number(match[1])
  const unit = match[2]?.toLowerCase()
  if (unit === 'mm') return number / 304.8
  if (unit === 'cm') return number / 30.48
  if (unit === 'm') return number * 3.28084
  return number
}

function getDoorDimension(door: ImportedDoor | null, names: string[]) {
  if (!door?.specifications) return null
  const entries = Object.entries(door.specifications).map(([key, value]) => [key.toLowerCase().replace(/[_-]+/g, ' '), value] as const)
  const value = entries.find(([key]) => names.some((name) => key === name || key.includes(name)))?.[1]
  return parseSpecificationNumber(value)
}

function getPanelCalculationInput(product: CatalogProduct | null) {
  if (!product) return {}

  let specifications: Record<string, unknown> = {}
  if (typeof product.specifications === 'string') {
    try {
      specifications = JSON.parse(product.specifications) as Record<string, unknown>
    } catch {
      specifications = {}
    }
  } else if (product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)) {
    specifications = product.specifications as Record<string, unknown>
  }

  const entries = Object.entries(specifications).map(([key, value]) => [key.trim().toLowerCase().replace(/[_-]+/g, ' '), value] as const)
  const findValue = (patterns: RegExp[]) => entries.find(([key]) => patterns.some((pattern) => pattern.test(key)))?.[1]
  const numericWidth = findValue([/panel width/, /^width$/, /width.*(?:value|dimension)/])
  const numericHeight = findValue([/panel height/, /^height$/, /height.*(?:value|dimension)/])
  const numericLength = findValue([/panel length/, /^length$/, /length.*(?:value|dimension)/])
  const dimensionsValue = findValue([/panel size/, /^size$/, /dimension/])
  const dimensions = String(dimensionsValue ?? '').match(/(\d+(?:\.\d+)?)\s*(mm|cm|m|ft|feet|')?\s*x\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|ft|feet|')?/i)
  const width = parseSpecificationNumber(numericWidth)
    ?? (dimensions ? parseSpecificationNumber(`${dimensions[1]}${dimensions[2] || ''}`) : null)
  const height = parseSpecificationNumber(numericHeight)
    ?? parseSpecificationNumber(numericLength)
    ?? (dimensions ? parseSpecificationNumber(`${dimensions[3]}${dimensions[4] || dimensions[2] || ''}`) : null)

  return {
    width: width ?? undefined,
    height: height ?? undefined,
    pricePerSquareFoot: product.price_type === 'sqf' ? product.price : undefined,
  }
}

function RoofPanel({
  id,
  buildingLength,
  position,
  rotation,
  width,
}: {
  id: string
  buildingLength: number
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
}) {
  return (
    <mesh key={id} position={position} rotation={rotation} castShadow>
      <boxGeometry args={[buildingLength + 0.35, 0.18, width]} />
      <meshStandardMaterial color="#9B5542" metalness={0.2} roughness={0.55} />
    </mesh>
  )
}

function BuildingEnvelope({
  profile,
  length,
  color,
  metalness,
}: {
  profile: [number, number][]
  length: number
  color: string
  metalness: number
}) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    profile.forEach(([z, y], index) => {
      if (index === 0) shape.moveTo(z, y)
      else shape.lineTo(z, y)
    })
    shape.closePath()
    const extruded = new ExtrudeGeometry(shape, { depth: length, bevelEnabled: false })
    extruded.rotateY(-Math.PI / 2)
    extruded.translate(length / 2, 0, 0)
    return extruded
  }, [length, profile])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.65} metalness={metalness} />
    </mesh>
  )
}

function WoodGrainWallPanels({
  profile,
  length,
  width,
  height,
  frontHeight = height,
  backHeight = height,
  texture,
}: {
  profile: [number, number][]
  length: number
  width: number
  height: number
  frontHeight?: number
  backHeight?: number
  texture: Texture
}) {
  const endWallGeometry = useMemo(() => {
    const shape = new Shape()
    profile.forEach(([z, y], index) => {
      if (index === 0) shape.moveTo(z, y)
      else shape.lineTo(z, y)
    })
    shape.closePath()
    const geometry = new ShapeGeometry(shape)
    geometry.computeBoundingBox()
    const position = geometry.getAttribute('position')
    const bounds = geometry.boundingBox
    const width = Math.max((bounds?.max.x ?? 1) - (bounds?.min.x ?? 0), 0.001)
    const height = Math.max((bounds?.max.y ?? 1) - (bounds?.min.y ?? 0), 0.001)
    const uv = new Float32Array(position.count * 2)

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index)
      const y = position.getY(index)
      uv[index * 2] = (x - (bounds?.min.x ?? 0)) / width
      uv[index * 2 + 1] = (y - (bounds?.min.y ?? 0)) / height
    }

    geometry.setAttribute('uv', new BufferAttribute(uv, 2))
    return geometry
  }, [profile])

  return (
    <group>
      <mesh position={[0, frontHeight / 2, width / 2 + 0.012]} receiveShadow>
        <planeGeometry args={[length, frontHeight]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} side={DoubleSide} />
      </mesh>
      <mesh position={[0, backHeight / 2, -width / 2 - 0.012]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[length, backHeight]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} side={DoubleSide} />
      </mesh>
      <mesh geometry={endWallGeometry} position={[length / 2 + 0.012, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} side={DoubleSide} />
      </mesh>
      <mesh geometry={endWallGeometry} position={[-length / 2 - 0.012, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} side={DoubleSide} />
      </mesh>
    </group>
  )
}

function BuildingPreview({
  mode,
  interiorWallColor,
  interiorFloorColor,
  interiorCeilingColor,
  length,
  width,
  height,
  system,
  wallColor,
  wallPanel,
  panelTextureUrl,
  roofType,
  roofPitch,
  openings,
  pendingOpening,
  pendingPlacement,
  draggingOpeningId,
  selectedOpeningId,
  onPlaceOpening,
  onPreviewPlacement,
  onMoveOpening,
  onStartOpeningDrag,
  onSelectOpening,
}: {
  mode: DesignerMode
  interiorWallColor: string
  interiorFloorColor: string
  interiorCeilingColor: string
  length: number
  width: number
  height: number
  system: ConstructionSystem
  wallColor: string
  wallPanel: WallPanelId
  panelTextureUrl: string | null
  roofType: RoofType
  roofPitch: RoofPitch
  openings: Opening[]
  pendingOpening: Omit<Opening, 'id' | 'offset' | 'bottom'> | null
  pendingPlacement: PlacementPoint | null
  draggingOpeningId: number | null
  selectedOpeningId: number | null
  onPlaceOpening: (wall: Wall, point: [number, number, number]) => void
  onPreviewPlacement: (placement: PlacementPoint) => void
  onMoveOpening: (openingId: number, wall: Wall, point: [number, number, number]) => void
  onStartOpeningDrag: (openingId: number) => void
  onSelectOpening: (openingId: number) => void
}) {
  const { camera, gl } = useThree()
  const [wallTexture, setWallTexture] = useState<Texture | null>(null)
  const scale = 8 / Math.max(length, width, height * 0.75)
  const buildingLength = length * scale
  const buildingWidth = width * scale
  const buildingHeight = height * scale
  const frameColor = '#55756D'
  const halfWidth = buildingWidth / 2
  const roofRise = halfWidth * (roofPitch / 12)
  const roofAngle = Math.atan(roofPitch / 12)
  const slopeLength = Math.sqrt(halfWidth ** 2 + roofRise ** 2)
  const roofY = buildingHeight + roofRise / 2
  const singleSlopeRise = buildingWidth * (roofPitch / 12)
  const singleSlopeRoofY = buildingHeight + singleSlopeRise / 2

  useEffect(() => {
    if (wallPanel === 'solid' || !panelTextureUrl) return
    let active = true
    const texture = new TextureLoader().load(panelTextureUrl, (loadedTexture) => {
      loadedTexture.colorSpace = SRGBColorSpace
      loadedTexture.wrapS = RepeatWrapping
      loadedTexture.wrapT = RepeatWrapping
      loadedTexture.repeat.set(3, 1)
      loadedTexture.needsUpdate = true
      if (active) setWallTexture(loadedTexture)
    })

    return () => {
      active = false
      texture.dispose()
    }
  }, [panelTextureUrl, wallPanel])

  useEffect(() => {
    if (draggingOpeningId === null) return

    const opening = openings.find((item) => item.id === draggingOpeningId)
    if (!opening) return

    const raycaster = new Raycaster()
    const pointer = new Vector2()
    const intersection = new Vector3()
    const plane = opening.wall === 'front'
      ? new Plane(new Vector3(0, 0, 1), -(halfWidth + 0.08))
      : opening.wall === 'back'
        ? new Plane(new Vector3(0, 0, 1), halfWidth + 0.08)
        : opening.wall === 'right'
          ? new Plane(new Vector3(1, 0, 0), -(buildingLength / 2 + 0.08))
          : new Plane(new Vector3(1, 0, 0), buildingLength / 2 + 0.08)

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = gl.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        onMoveOpening(opening.id, opening.wall, [intersection.x, intersection.y, intersection.z])
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [camera, gl, draggingOpeningId, openings, onMoveOpening, buildingLength, halfWidth])

  function wallHit(wall: Wall, point: [number, number, number], commit = false) {
    if (pendingOpening && commit) onPlaceOpening(wall, point)
    else if (pendingOpening) onPreviewPlacement({ wall, point })
    else if (draggingOpeningId !== null) onMoveOpening(draggingOpeningId, wall, point)
  }

  const pendingVisual = pendingOpening && pendingPlacement
    ? (() => {
        const span = pendingPlacement.wall === 'front' || pendingPlacement.wall === 'back' ? length : width
        const coordinate = pendingPlacement.wall === 'front' || pendingPlacement.wall === 'back' ? pendingPlacement.point[0] : pendingPlacement.point[2]
        const offset = Math.max(-0.5, Math.min(0.5, coordinate / Math.max(span, 0.01)))
        const bottom = Math.max(0, Math.min(Math.max(0, height - pendingOpening.height), pendingPlacement.point[1] + height / 2 - pendingOpening.height / 2))
        return { ...pendingOpening, wall: pendingPlacement.wall, offset, bottom }
      })()
    : null

  const endWallProfile = roofType === 'gable'
    ? [
        [-halfWidth, 0], [halfWidth, 0], [halfWidth, buildingHeight],
        [0, buildingHeight + roofRise], [-halfWidth, buildingHeight],
      ] as [number, number][]
    : roofType === 'gambrel'
      ? [
          [-halfWidth, 0], [halfWidth, 0], [halfWidth, buildingHeight],
          [halfWidth * 0.55, buildingHeight + roofRise * 0.55],
          [halfWidth * 0.2, buildingHeight + roofRise],
          [-halfWidth * 0.2, buildingHeight + roofRise],
          [-halfWidth * 0.55, buildingHeight + roofRise * 0.55],
          [-halfWidth, buildingHeight],
        ] as [number, number][]
      : [
          [-halfWidth, 0], [halfWidth, 0], [halfWidth, buildingHeight],
          [-halfWidth, buildingHeight + singleSlopeRise],
        ] as [number, number][]

  return (
    <group position={[0, -buildingHeight / 2, 0]}>
      {mode === 'interior' ? (
        <>
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[buildingLength, 0.12, buildingWidth]} />
            <meshStandardMaterial color={interiorFloorColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, buildingHeight, 0]}>
            <boxGeometry args={[buildingLength, 0.1, buildingWidth]} />
            <meshStandardMaterial color={interiorCeilingColor} roughness={0.95} side={DoubleSide} />
          </mesh>
          {[
            [0, buildingHeight / 2, -halfWidth],
            [0, buildingHeight / 2, halfWidth],
            [-buildingLength / 2, buildingHeight / 2, 0],
            [buildingLength / 2, buildingHeight / 2, 0],
          ].map((position, index) => (
            <mesh key={`interior-wall-${index}`} position={position as [number, number, number]}>
              <boxGeometry args={index < 2 ? [buildingLength, buildingHeight, 0.08] : [0.08, buildingHeight, buildingWidth]} />
              <meshStandardMaterial color={interiorWallColor} roughness={0.8} side={DoubleSide} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[buildingLength + 0.35, 0.2, buildingWidth + 0.35]} />
            <meshStandardMaterial color="#B9A98B" roughness={0.9} />
          </mesh>

          <BuildingEnvelope
            profile={endWallProfile}
            length={buildingLength}
            color={wallPanel !== 'solid' ? '#FFFFFF' : wallColor}
            metalness={system === 'steel_frame' ? 0.7 : 0.15}
          />

          {wallPanel !== 'solid' && wallTexture && (
            <WoodGrainWallPanels
              profile={endWallProfile}
              length={buildingLength}
              width={buildingWidth}
              height={buildingHeight}
              frontHeight={roofType === 'single_slope' ? buildingHeight : buildingHeight}
              backHeight={roofType === 'single_slope' ? buildingHeight + singleSlopeRise : buildingHeight}
              texture={wallTexture}
            />
          )}

          {(pendingOpening || draggingOpeningId !== null) && <group>
        {(
          [
            ['front', [0, buildingHeight / 2, halfWidth + 0.08], [buildingLength, buildingHeight, 0.16]],
            ['back', [0, buildingHeight / 2, -halfWidth - 0.08], [buildingLength, buildingHeight, 0.16]],
            ['right', [buildingLength / 2 + 0.08, buildingHeight / 2, 0], [0.16, buildingHeight, buildingWidth]],
            ['left', [-buildingLength / 2 - 0.08, buildingHeight / 2, 0], [0.16, buildingHeight, buildingWidth]],
          ] as [Wall, [number, number, number], [number, number, number]][]
        ).map(([wall, position, size]) => (
          <mesh key={`hit-${wall}`} position={position} onPointerDown={(event) => { event.stopPropagation(); wallHit(wall, [event.point.x, event.point.y, event.point.z], true) }} onPointerUp={(event) => { event.stopPropagation(); if (pendingOpening) wallHit(wall, [event.point.x, event.point.y, event.point.z], true) }} onPointerMove={(event) => { if (pendingOpening || event.buttons === 1) wallHit(wall, [event.point.x, event.point.y, event.point.z]) }}>
            <boxGeometry args={size} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>}

          {system === 'steel_frame' && (
        <>
          {[-buildingLength / 2, 0, buildingLength / 2].map((x, index) => (
            <mesh key={`front-${index}`} position={[x, (roofType === 'single_slope' ? buildingHeight : buildingHeight) / 2, buildingWidth / 2 + 0.03]} castShadow>
              <boxGeometry args={[0.08, roofType === 'single_slope' ? buildingHeight : buildingHeight, 0.08]} />
              <meshStandardMaterial color={frameColor} metalness={0.45} roughness={0.4} />
            </mesh>
          ))}
          {[-buildingWidth / 2, 0, buildingWidth / 2].map((z, index) => {
            const postHeight = roofType === 'single_slope'
              ? buildingHeight + ((-z / Math.max(buildingWidth, 0.001)) + 0.5) * singleSlopeRise
              : buildingHeight
            return (
            <mesh key={`side-${index}`} position={[buildingLength / 2 + 0.03, postHeight / 2, z]} castShadow>
              <boxGeometry args={[0.08, postHeight, 0.08]} />
              <meshStandardMaterial color={frameColor} metalness={0.45} roughness={0.4} />
            </mesh>
            )
          })}
        </>
      )}

          {roofType === 'gable' && (
        <>
          <RoofPanel id="gable-left" buildingLength={buildingLength} position={[0, roofY, -halfWidth / 2]} rotation={[-roofAngle, 0, 0]} width={slopeLength} />
          <RoofPanel id="gable-right" buildingLength={buildingLength} position={[0, roofY, halfWidth / 2]} rotation={[roofAngle, 0, 0]} width={slopeLength} />
        </>
      )}

          {roofType === 'single_slope' && (
        <RoofPanel
          id="single-slope"
          buildingLength={buildingLength}
          position={[0, singleSlopeRoofY, 0]}
          rotation={[roofAngle, 0, 0]}
          width={Math.sqrt(buildingWidth ** 2 + singleSlopeRise ** 2)}
        />
      )}

          {roofType === 'gambrel' && (
        <>
          <RoofPanel id="gambrel-left-lower" buildingLength={buildingLength} position={[0, buildingHeight + roofRise * 0.3, -halfWidth * 0.75]} rotation={[-Math.atan((roofPitch + 2) / 12), 0, 0]} width={slopeLength * 0.55} />
          <RoofPanel id="gambrel-right-lower" buildingLength={buildingLength} position={[0, buildingHeight + roofRise * 0.3, halfWidth * 0.75]} rotation={[Math.atan((roofPitch + 2) / 12), 0, 0]} width={slopeLength * 0.55} />
          <RoofPanel id="gambrel-left-upper" buildingLength={buildingLength} position={[0, buildingHeight + roofRise * 0.85, -halfWidth * 0.22]} rotation={[-Math.atan(Math.max(1, roofPitch - 1) / 12), 0, 0]} width={slopeLength * 0.5} />
          <RoofPanel id="gambrel-right-upper" buildingLength={buildingLength} position={[0, buildingHeight + roofRise * 0.85, halfWidth * 0.22]} rotation={[Math.atan(Math.max(1, roofPitch - 1) / 12), 0, 0]} width={slopeLength * 0.5} />
        </>
      )}

          {openings.map((opening) => {
        const openingWidth = opening.width * scale
        const openingHeight = opening.height * scale
        const centerY = (opening.bottom + opening.height / 2) * scale
        const position = opening.wall === 'front'
          ? [opening.offset * buildingLength, centerY, buildingWidth / 2 + 0.08]
          : opening.wall === 'back'
            ? [opening.offset * buildingLength, centerY, -buildingWidth / 2 - 0.08]
            : opening.wall === 'right'
              ? [buildingLength / 2 + 0.08, centerY, opening.offset * buildingWidth]
              : [-buildingLength / 2 - 0.08, centerY, opening.offset * buildingWidth]
        const size = opening.wall === 'front' || opening.wall === 'back'
          ? [openingWidth, openingHeight, 0.12]
          : [0.12, openingHeight, openingWidth]
        return (
          <DoorOpening
            position={position as [number, number, number]}
            size={size as [number, number, number]}
            imageUrl={opening.imageUrl}
            selected={selectedOpeningId === opening.id}
            onPointerDown={(event) => {
              event.stopPropagation()
              onSelectOpening(opening.id)
              const target = event.nativeEvent.target as HTMLElement
              target.setPointerCapture?.(event.pointerId)
              onStartOpeningDrag(opening.id)
            }}
            onPointerUp={(event) => {
              event.stopPropagation()
              const target = event.nativeEvent.target as HTMLElement
              target.releasePointerCapture?.(event.pointerId)
            }}
          />
          /* <mesh
            key={opening.id}
            position={position as [number, number, number]}
            onPointerDown={(event) => {
              event.stopPropagation()
              onSelectOpening(opening.id)
              const target = event.nativeEvent.target as HTMLElement
              target.setPointerCapture?.(event.pointerId)
              onStartOpeningDrag(opening.id)
            }}
            onPointerUp={(event) => {
              event.stopPropagation()
              const target = event.nativeEvent.target as HTMLElement
              target.releasePointerCapture?.(event.pointerId)
            }}
          >
            <boxGeometry args={size as [number, number, number]} />
            <meshStandardMaterial color={selectedOpeningId === opening.id ? '#D77B4D' : isDoor ? '#A7654B' : '#5FA9A2'} metalness={isDoor ? 0.2 : 0.1} roughness={isDoor ? 0.55 : 0.18} />
          </mesh> */
        )
          })}
        </>
      )}

      {pendingVisual && (() => {
        const openingWidth = pendingVisual.width * scale
        const openingHeight = pendingVisual.height * scale
        const centerY = (pendingVisual.bottom + pendingVisual.height / 2) * scale
        const position = pendingVisual.wall === 'front'
          ? [pendingVisual.offset * buildingLength, centerY, buildingWidth / 2 + 0.1]
          : pendingVisual.wall === 'back'
            ? [pendingVisual.offset * buildingLength, centerY, -buildingWidth / 2 - 0.1]
            : pendingVisual.wall === 'right'
              ? [buildingLength / 2 + 0.1, centerY, pendingVisual.offset * buildingWidth]
              : [-buildingLength / 2 - 0.1, centerY, pendingVisual.offset * buildingWidth]
        const size = pendingVisual.wall === 'front' || pendingVisual.wall === 'back'
          ? [openingWidth, openingHeight, 0.14]
          : [0.14, openingHeight, openingWidth]
        return <DoorOpening position={position as [number, number, number]} size={size as [number, number, number]} imageUrl={pendingVisual.imageUrl} opacity={0.58} />
      })()}
    </group>
  )
}

export default function BuildingDesignerPage() {
  let mode: DesignerMode = 'exterior'
  const [dimensions, setDimensions] = useState({ length: '32', width: '20', height: '10' })
  const [interiorWallColor, setInteriorWallColor] = useState('#D8E4E0')
  const [interiorFloorColor, setInteriorFloorColor] = useState('#D8C8A8')
  const [interiorCeilingColor, setInteriorCeilingColor] = useState('#E7DED0')
  const [interiorView, setInteriorView] = useState<InteriorView>('floor-plan')
  const [walkthroughView, setWalkthroughView] = useState<WalkthroughView>('overview')
  const [system, setSystem] = useState<ConstructionSystem>('steel_frame')
  const [wallColor, setWallColor] = useState('#D8C8A8')
  const [wallPanel, setWallPanel] = useState<WallPanelId>('solid')
  const [selectedWallPanel, setSelectedWallPanel] = useState<CatalogProduct | null>(null)
  const [wallPanelProducts, setWallPanelProducts] = useState<CatalogProduct[]>([])
  const [wallPanelSearch, setWallPanelSearch] = useState('')
  const [wallPanelCenterOpen, setWallPanelCenterOpen] = useState(false)
  const [loadingWallPanels, setLoadingWallPanels] = useState(false)
  const [roofType, setRoofType] = useState<RoofType>('gable')
  const [roofPitch, setRoofPitch] = useState<RoofPitch>(3)
  const [openings, setOpenings] = useState<Opening[]>([])
  const [selectedOpening, setSelectedOpening] = useState<OpeningType>('door')
  const [openingWall, setOpeningWall] = useState<Opening['wall']>('front')
  const [openingWidth, setOpeningWidth] = useState('15')
  const [openingHeight, setOpeningHeight] = useState('10')
  const [openingOffset, setOpeningOffset] = useState(0)
  const [pendingOpening, setPendingOpening] = useState<Omit<Opening, 'id' | 'offset' | 'bottom'> | null>(null)
  const [pendingPlacement, setPendingPlacement] = useState<PlacementPoint | null>(null)
  const [draggingOpeningId, setDraggingOpeningId] = useState<number | null>(null)
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(null)
  const [importedDoor, setImportedDoor] = useState<ImportedDoor | null>(null)
  const [importedWindow, setImportedWindow] = useState<ImportedWindow | null>(null)

  useEffect(() => {
    const releaseDrag = () => setDraggingOpeningId(null)
    window.addEventListener('pointerup', releaseDrag)
    return () => window.removeEventListener('pointerup', releaseDrag)
  }, [])

  useEffect(() => {
    const importedPanel = window.localStorage.getItem(WALL_PANEL_IMPORT_KEY)
    const savedPanel = window.localStorage.getItem(WALL_PANEL_SELECTION_KEY)
    const panelData = importedPanel || savedPanel
    if (!panelData) return

    try {
      const panel = JSON.parse(panelData) as CatalogProduct
      startTransition(() => {
        setSelectedWallPanel(panel)
        setWallPanel('catalog')
      })
    } catch {
      window.localStorage.removeItem(WALL_PANEL_IMPORT_KEY)
    }
    window.localStorage.setItem(WALL_PANEL_SELECTION_KEY, panelData)
    window.localStorage.removeItem(WALL_PANEL_IMPORT_KEY)
  }, [])

  useEffect(() => {
    const importedDoor = window.localStorage.getItem(DOOR_IMPORT_KEY)
    if (importedDoor) {
      try {
        setImportedDoor(JSON.parse(importedDoor) as ImportedDoor)
        setSelectedOpening('door')
      } catch {
        window.localStorage.removeItem(DOOR_IMPORT_KEY)
      }
      window.localStorage.removeItem(DOOR_IMPORT_KEY)
    }

    function receiveImportedDoor(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== DOOR_IMPORT_KEY) return
      setImportedDoor(event.data.door as ImportedDoor)
      setSelectedOpening('door')
    }

    window.addEventListener('message', receiveImportedDoor)
    return () => window.removeEventListener('message', receiveImportedDoor)
  }, [])

  useEffect(() => {
    const importedWindowData = window.localStorage.getItem(WINDOW_IMPORT_KEY)
    if (importedWindowData) {
      try {
        setImportedWindow(JSON.parse(importedWindowData) as ImportedWindow)
        setSelectedOpening('window')
      } catch {
        window.localStorage.removeItem(WINDOW_IMPORT_KEY)
      }
      window.localStorage.removeItem(WINDOW_IMPORT_KEY)
    }

    function receiveImportedWindow(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== WINDOW_IMPORT_KEY) return
      setImportedWindow(event.data.window as ImportedWindow)
      setSelectedOpening('window')
    }

    window.addEventListener('message', receiveImportedWindow)
    return () => window.removeEventListener('message', receiveImportedWindow)
  }, [])

  useEffect(() => {
    function receiveImportedPanel(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== WALL_PANEL_IMPORT_KEY) return
      startTransition(() => {
        setSelectedWallPanel(event.data.panel as CatalogProduct)
        setWallPanel('catalog')
      })
      window.localStorage.setItem(WALL_PANEL_SELECTION_KEY, JSON.stringify(event.data.panel))
    }

    window.addEventListener('message', receiveImportedPanel)
    return () => window.removeEventListener('message', receiveImportedPanel)
  }, [])

  useEffect(() => {
    if (!wallPanelCenterOpen) return

    let active = true
    setLoadingWallPanels(true)
    getProducts({ categorySlug: 'wall-panels', limit: 100 }).then((result) => {
      if (!active) return
      const products = result.data ?? []
      setWallPanelProducts(products)
      setSelectedWallPanel((current) => {
        if (!current) return current
        const refreshed = products.find((product) => product.id === current.id) ?? current
        window.localStorage.setItem(WALL_PANEL_SELECTION_KEY, JSON.stringify(refreshed))
        return refreshed
      })
      setLoadingWallPanels(false)
    }).catch(() => {
      if (active) setLoadingWallPanels(false)
    })

    return () => {
      active = false
    }
  }, [wallPanelCenterOpen, wallPanelProducts.length])

  const designSummary = useMemo(() => {
    const area = Number(dimensions.length || 0) * Number(dimensions.width || 0)
    return `${area.toLocaleString()} sq ft floor area`
  }, [dimensions.length, dimensions.width])

  function updateDimension(name: keyof typeof dimensions, value: string) {
    if (!/^\d*(\.\d*)?$/.test(value)) return
    const previousDimensions = {
      length: Number(dimensions.length || 0),
      width: Number(dimensions.width || 0),
      height: Number(dimensions.height || 0),
    }
    const nextDimensions = { ...dimensions, [name]: value }
    const nextLength = Number(nextDimensions.length || 0)
    const nextWidth = Number(nextDimensions.width || 0)
    const nextHeight = Number(nextDimensions.height || 0)
    setDimensions(nextDimensions)
    setOpenings((current) => current.map((opening) => {
      const previousSpan = opening.wall === 'front' || opening.wall === 'back' ? previousDimensions.length : previousDimensions.width
      const span = opening.wall === 'front' || opening.wall === 'back' ? nextLength : nextWidth
      const spanRatio = previousSpan > 0 ? span / previousSpan : 1
      const heightRatio = previousDimensions.height > 0 ? nextHeight / previousDimensions.height : 1
      const width = Math.min(opening.width * spanRatio, Math.max(0, span))
      const height = Math.min(opening.height * heightRatio, Math.max(0, nextHeight))
      const maxOffset = Math.max(0, (span - width) / Math.max(span, 0.01))
      return {
        ...opening,
        width,
        height,
        offset: Math.max(-maxOffset, Math.min(maxOffset, opening.offset)),
        bottom: Math.max(0, Math.min(Math.max(0, nextHeight - height), opening.bottom * heightRatio)),
      }
    }))
  }

  const previewDimensions = {
    length: Number(dimensions.length || 0),
    width: Number(dimensions.width || 0),
    height: Number(dimensions.height || 0),
  }

  const panelCalculation = useMemo(
    () => calculatePanelEstimate({
      length: Number(dimensions.length || 0),
      width: Number(dimensions.width || 0),
      height: Number(dimensions.height || 0),
    }, getPanelCalculationInput(selectedWallPanel)),
    [dimensions.height, dimensions.length, dimensions.width, selectedWallPanel]
  )

  const filteredWallPanelProducts = wallPanelProducts.filter((product) =>
    product.name.toLowerCase().includes(wallPanelSearch.toLowerCase())
  )

  function selectCatalogWallPanel(product: CatalogProduct) {
    setSelectedWallPanel(product)
    setWallPanel('catalog')
    window.localStorage.setItem(WALL_PANEL_SELECTION_KEY, JSON.stringify(product))
    setWallPanelCenterOpen(false)
  }

  function openWallPanelCenter() {
    if (wallPanelProducts.length === 0) setLoadingWallPanels(true)
    setWallPanelCenterOpen(true)
  }

  function addOpening(openingType: OpeningType = selectedOpening) {
    const importedOpening = openingType === 'door' ? importedDoor : importedWindow
    const enteredWidth = importedOpening
      ? (getDoorDimension(importedOpening, ['door width', 'window width', 'width']) ?? (Number(openingWidth) || 0))
      : Number(openingWidth) || 0
    const enteredHeight = importedOpening
      ? (getDoorDimension(importedOpening, ['door height', 'window height', 'height']) ?? (Number(openingHeight) || 0))
      : Number(openingHeight) || 0
    const width = openingType === 'door' ? Math.min(enteredWidth, enteredHeight) : enteredWidth
    const height = openingType === 'door' ? Math.max(enteredWidth, enteredHeight) : enteredHeight
    const imageUrl = importedOpening
      ? importedOpening.product_images?.find((image) => image.is_master)?.url ?? importedOpening.product_images?.[0]?.url ?? null
      : null
    setPendingOpening({ type: openingType, wall: openingWall, width, height, imageUrl })
    setPendingPlacement(null)
  }

  function selectOpening(openingId: number) {
    const opening = openings.find((item) => item.id === openingId)
    if (!opening) return
    setSelectedOpeningId(openingId)
    setSelectedOpening(opening.type)
    setOpeningWall(opening.wall)
    setOpeningWidth(String(opening.width))
    setOpeningHeight(String(opening.height))
    setOpeningOffset(opening.offset)
  }

  function updateSelectedOpening(field: 'width' | 'height' | 'offset' | 'wall', value: string | number) {
    if (selectedOpeningId === null) return
    setOpenings((current) => current.map((opening) => {
      if (opening.id !== selectedOpeningId) return opening
      if (field === 'wall') return { ...opening, wall: value as Wall }
      if (field === 'width' || field === 'height') return { ...opening, [field]: Math.max(0, Number(value) || 0) }
      return { ...opening, offset: Number(value) }
    }))
  }

  function pointToPlacement(wall: Wall, point: [number, number, number], width: number, height: number) {
    const span = wall === 'front' || wall === 'back' ? previewDimensions.length : previewDimensions.width
    const coordinate = wall === 'front' || wall === 'back' ? point[0] : point[2]
    const offset = Math.max(-0.5, Math.min(0.5, coordinate / Math.max(span, 0.01)))
    const bottom = Math.max(0, Math.min(previewDimensions.height - height, point[1] + previewDimensions.height / 2 - height / 2))
    return { offset, bottom }
  }

  function placeOpening(wall: Wall, point: [number, number, number]) {
    if (!pendingOpening) return
    const placement = pointToPlacement(wall, point, pendingOpening.width, pendingOpening.height)
    setOpenings((current) => [...current, { ...pendingOpening, id: Date.now(), wall, ...placement }])
    setPendingOpening(null)
    setPendingPlacement(null)
  }

  function moveOpening(openingId: number, wall: Wall, point: [number, number, number]) {
    if (!draggingOpeningId || draggingOpeningId !== openingId) return
    setOpenings((current) => current.map((opening) => {
      if (opening.id !== openingId) return opening
      return { ...opening, ...pointToPlacement(wall, point, opening.width, opening.height) }
    }))
  }

  function removeOpening(openingId: number) {
    setOpenings((current) => current.filter((opening) => opening.id !== openingId))
    if (draggingOpeningId === openingId) setDraggingOpeningId(null)
    if (selectedOpeningId === openingId) setSelectedOpeningId(null)
  }

  function updateOpeningValue(setter: (value: string) => void, value: string) {
    if (!/^\d*(\.\d*)?$/.test(value)) return
    setter(value)
    if (selectedOpeningId !== null) {
      const field = setter === setOpeningWidth ? 'width' : 'height'
      updateSelectedOpening(field, value)
    }
  }

  const openingSpan = openingWall === 'front' || openingWall === 'back'
    ? previewDimensions.length
    : previewDimensions.width
  const openingSize = Number(openingWidth || 0)
  const maxOpeningOffset = Math.max(0, (openingSpan - openingSize) / Math.max(openingSpan, 1))

  return (
    <main className="min-h-screen bg-[#F5F7F6] text-[#1B272B]">
      <section className="border-b border-[#D6DFDC] bg-[#203238] px-5 pb-10 pt-28 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#B7D7C8]">Cargoplus Design Studio</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">Design your modular building</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#D8E4E0] sm:text-base">Start with the dimensions, choose the construction system, and shape a visual concept before requesting a quote.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(300px,360px)_1fr]">
        <aside className="space-y-5 rounded-2xl border border-[#D6DFDC] bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">1. Building size</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(['length', 'width', 'height'] as const).map((name) => (
                <label key={name} className="text-xs font-semibold capitalize text-[#55716A]">
                  {name}
                  <input type="text" inputMode="decimal" value={dimensions[name]} onChange={(event) => updateDimension(name, event.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-2 py-2 text-sm font-bold outline-none focus:border-[#2C8065]" />
                </label>
              ))}
            </div>
          </div>

          <>
          <div className="border-t border-[#E3EBE8] pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">2. Construction system</p>
            <div className="mt-3 grid gap-2">
              {[
                ['steel_frame', 'Steel frame', 'Structural steel frame with exterior panels'],
                ['sandwich_panel', 'Sandwich panel', 'Insulated panel shell'],
              ].map(([value, label, description]) => (
                <button key={value} type="button" onClick={() => setSystem(value as ConstructionSystem)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${system === value ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${system === value ? 'bg-[#2C8065] text-white' : 'bg-[#EAF0ED] text-[#55716A]'}`}><Box className="h-4 w-4" /></span>
                  <span className="flex-1"><span className="block text-sm font-bold">{label}</span><span className="block text-xs text-[#71847E]">{description}</span></span>
                  {system === value && <Check className="h-4 w-4 text-[#2C8065]" />}
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-[#E3EBE8] pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Wall finish</p>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#55716A]">
                  Custom
                  <input
                    type="color"
                    value={wallColor}
                    onChange={(event) => setWallColor(event.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-[#C9D7D2] bg-white p-0.5"
                    aria-label="Custom wall color"
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {wallFinishOptions.map((finish) => (
                  <button
                    key={finish.color}
                    type="button"
                    onClick={() => setWallColor(finish.color)}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${wallColor === finish.color ? 'border-[#2C8065] ring-2 ring-[#2C8065]/25' : 'border-white'}`}
                    style={{ backgroundColor: finish.color }}
                    aria-label={`${finish.name} wall finish`}
                    title={finish.name}
                  />
                ))}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Wall panel</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {wallPanelOptions.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => {
                      setWallPanel(panel.id)
                      setSelectedWallPanel(null)
                      window.localStorage.removeItem(WALL_PANEL_SELECTION_KEY)
                    }}
                    className={`overflow-hidden rounded-lg border text-left transition-colors ${wallPanel === panel.id ? 'border-[#2C8065] bg-[#EEF7F2] ring-2 ring-[#2C8065]/15' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}
                  >
                    <div className="h-16 bg-[#D8C8A8]" style={panel.image ? { backgroundImage: `url(${panel.image})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined} />
                    <span className="block px-2 py-2 text-xs font-bold text-[#1B272B]">{panel.name}</span>
                    <span className="block px-2 pb-2 text-[10px] text-[#71847E]">{panel.description}</span>
                  </button>
                ))}
              </div>
              {selectedWallPanel && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#B7D7C8] bg-[#F2FAF6] p-2">
                  <div className="h-12 w-14 shrink-0 overflow-hidden rounded-md bg-[#D8C8A8]">
                    {(selectedWallPanel.product_images[0]?.url || getPanelTextureUrl(selectedWallPanel)) && (
                      <img src={selectedWallPanel.product_images[0]?.url || getPanelTextureUrl(selectedWallPanel) || ''} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#1B272B]">{selectedWallPanel.name}</p>
                    <p className="truncate text-[10px] text-[#55716A]">Imported from Wall Panel Center</p>
                  </div>
                  <Check className="h-4 w-4 shrink-0 text-[#2C8065]" />
                </div>
              )}
              <button
                type="button"
                onClick={openWallPanelCenter}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2C8065] px-3 py-2.5 text-sm font-bold text-[#23634F] transition-colors hover:bg-[#EEF7F2]"
              >
                <Search className="h-4 w-4" />
                Browse Wall Panel Center
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="border-t border-[#E3EBE8] pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">3. Roof system</p>
            <div className="mt-3 grid gap-2">
              {[
                ['gable', 'Gable', 'Two slopes meeting at a ridge'],
                ['single_slope', 'Single slope', 'One continuous roof plane'],
                ['gambrel', 'Gambrel', 'Stepped barn-style roof'],
              ].map(([value, label, description]) => (
                <button key={value} type="button" onClick={() => setRoofType(value as RoofType)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${roofType === value ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${roofType === value ? 'bg-[#2C8065] text-white' : 'bg-[#EAF0ED] text-[#55716A]'}`}>⌂</span>
                  <span className="flex-1"><span className="block text-sm font-bold">{label}</span><span className="block text-xs text-[#71847E]">{description}</span></span>
                  {roofType === value && <Check className="h-4 w-4 text-[#2C8065]" />}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Roof pitch</p>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as RoofPitch[]).map((pitch) => (
                <button key={pitch} type="button" onClick={() => setRoofPitch(pitch)} className={`rounded-lg border px-1 py-2 text-xs font-bold ${roofPitch === pitch ? 'border-[#2C8065] bg-[#2C8065] text-white' : 'border-[#D6DFDC] text-[#55716A] hover:bg-[#EEF7F2]'}`}>{pitch}:12</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#71847E]">The roof rises {roofPitch} foot for every 12 feet of run.</p>
          </div>

          <div className="border-t border-[#E3EBE8] pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">4. Openings</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['door', 'window'] as const).map((type) => (
                <button key={type} type="button" onClick={() => { setSelectedOpening(type); if (selectedOpeningId !== null) setOpenings((current) => current.map((opening) => opening.id === selectedOpeningId ? { ...opening, type } : opening)) }} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold capitalize ${selectedOpening === type ? 'border-[#2C8065] bg-[#EEF7F2] text-[#23634F]' : 'border-[#D6DFDC]'}`}>
                  {type === 'door' ? <DoorOpen className="h-4 w-4" /> : <PanelsTopLeft className="h-4 w-4" />}
                  {type}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-semibold text-[#55716A]">Width
                <input type="text" inputMode="decimal" value={openingWidth} onChange={(event) => updateOpeningValue(setOpeningWidth, event.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-2 py-2 text-sm font-bold outline-none focus:border-[#2C8065]" />
              </label>
              <label className="text-xs font-semibold text-[#55716A]">Height
                <input type="text" inputMode="decimal" value={openingHeight} onChange={(event) => updateOpeningValue(setOpeningHeight, event.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-2 py-2 text-sm font-bold outline-none focus:border-[#2C8065]" />
              </label>
            </div>
            {importedDoor && (
              <div
                className={`mt-3 flex cursor-grab touch-none items-center gap-2 rounded-lg border p-2 active:cursor-grabbing ${selectedOpening === 'door' ? 'border-[#2C8065] bg-[#F2FAF6]' : 'border-[#D6DFDC] bg-white'}`}
                onPointerDown={(event) => {
                  event.preventDefault()
                  setSelectedOpening('door')
                  addOpening('door')
                }}
                title="Drag this door onto a wall in the preview"
              >
                {importedDoor.product_images?.[0]?.url && <img src={importedDoor.product_images[0].url} alt="" className="h-10 w-10 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{importedDoor.name}</p>
                  <p className="text-[10px] text-[#55716A]">Drag onto a wall to place · imported dimensions apply</p>
                </div>
              </div>
            )}
            {selectedOpening === 'window' && importedWindow && (
              <div className="mt-3 flex cursor-grab touch-none items-center gap-2 rounded-lg border border-[#B7D7C8] bg-[#F2FAF6] p-2 active:cursor-grabbing">
                {importedWindow.product_images?.[0]?.url && <img src={importedWindow.product_images[0].url} alt="" className="h-10 w-10 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{importedWindow.name}</p>
                  <p className="text-[10px] text-[#55716A]">Imported window dimensions apply when placed</p>
                </div>
              </div>
            )}
            {selectedOpening === 'door' ? (
              <a href="/doors?returnTo=/building-designer" target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2C8065] px-3 py-2.5 text-sm font-bold text-[#23634F] transition-colors hover:bg-[#EEF7F2]">
                <DoorOpen className="h-4 w-4" /> Browse Door Center <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <a href="/windows?returnTo=/building-designer" target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2C8065] px-3 py-2.5 text-sm font-bold text-[#23634F] transition-colors hover:bg-[#EEF7F2]">
                <PanelsTopLeft className="h-4 w-4" /> Browse Window Center <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Install on wall</p>
            <select value={openingWall} onChange={(event) => { const wall = event.target.value as Opening['wall']; setOpeningWall(wall); updateSelectedOpening('wall', wall) }} className="mt-2 w-full rounded-lg border border-[#C9D7D2] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#2C8065]">
              <option value="front">Front wall</option>
              <option value="back">Back wall</option>
              <option value="left">Left wall</option>
              <option value="right">Right wall</option>
            </select>
            <label className="mt-3 block text-xs font-semibold text-[#55716A]">Position along wall
              <input type="range" min={-maxOpeningOffset} max={maxOpeningOffset} step="0.01" value={openingOffset} onChange={(event) => { const offset = Number(event.target.value); setOpeningOffset(offset); updateSelectedOpening('offset', offset) }} className="mt-2 w-full accent-[#2C8065]" />
            </label>
            <p className="mt-1 text-xs text-[#71847E]">{openingWidth}&apos; × {openingHeight}&apos; · offset {openingOffset.toFixed(2)}</p>
            <button type="button" onClick={() => addOpening()} className={`mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors ${pendingOpening ? 'bg-[#A7654B] hover:bg-[#8E503C]' : 'bg-[#2C8065] hover:bg-[#23634F]'}`}>
              {pendingOpening ? `Click a wall to place ${selectedOpening}` : `Add ${selectedOpening}`}
            </button>
            {pendingOpening && (
              <button
                type="button"
                onClick={() => {
                  setPendingOpening(null)
                  setPendingPlacement(null)
                }}
                className="mt-2 w-full rounded-lg border border-[#D6DFDC] px-4 py-2 text-sm font-bold text-[#55716A] transition-colors hover:bg-[#F5F7F6]"
              >
                Cancel placement
              </button>
            )}
            <p className="mt-2 text-xs text-[#71847E]">{pendingOpening ? 'Choose a wall in the preview. The opening will attach where you click.' : `${openings.length} openings placed in this concept.`}</p>
            {openings.length > 0 && (
              <div className="mt-3 space-y-2">
                {openings.map((opening) => (
                  <div key={opening.id} onClick={() => selectOpening(opening.id)} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${selectedOpeningId === opening.id ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#E3EBE8] bg-[#F7FAF8]'}`}>
                    <span className="flex-1 font-semibold capitalize text-[#55716A]">{opening.type} · {opening.width}&apos; × {opening.height}&apos; · {opening.wall}</span>
                    <button type="button" onClick={() => removeOpening(opening.id)} className="font-bold text-[#A7654B] hover:text-[#7C3F2D]">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>

        </aside>

        <div className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[#D6DFDC] bg-[#DDE9E5] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C8D8D2] bg-white px-5 py-4">
              <div><p className="text-sm font-bold">Live {mode} preview</p><p className="text-xs text-[#71847E]">Drag to orbit, scroll to zoom</p></div>
              <Ruler className="h-5 w-5 text-[#2C8065]" />
            </div>
            <div className="relative h-[420px] sm:h-[560px]">
              <Canvas shadows frameloop="always" gl={{ preserveDrawingBuffer: true }} camera={{ position: [9, 7, 11], fov: 40 }}>
                <color attach="background" args={['#DDE9E5']} />
                <ambientLight intensity={1.8} />
                <directionalLight position={[6, 10, 5]} intensity={3} castShadow />
                <BuildingPreview mode="exterior" interiorWallColor="#D8E4E0" interiorFloorColor="#D8C8A8" interiorCeilingColor="#E7DED0" {...previewDimensions} system={system} wallColor={wallColor} wallPanel={wallPanel} panelTextureUrl={wallPanel === 'catalog' && selectedWallPanel ? getPanelTextureUrl(selectedWallPanel) : wallPanel === 'wood-grain' ? '/wall-panels/wood-panel-texture.png' : null} roofType={roofType} roofPitch={roofPitch} openings={openings} pendingOpening={pendingOpening} pendingPlacement={pendingPlacement} draggingOpeningId={draggingOpeningId} selectedOpeningId={selectedOpeningId} onPlaceOpening={placeOpening} onPreviewPlacement={setPendingPlacement} onMoveOpening={moveOpening} onStartOpeningDrag={setDraggingOpeningId} onSelectOpening={selectOpening} />
                <gridHelper args={[18, 18, '#9AB4AA', '#B9CCC4']} position={[0, -(previewDimensions.height * (8 / Math.max(previewDimensions.length, previewDimensions.width, previewDimensions.height * 0.75, 1))) / 2, 0]} />
                <OrbitControls enablePan={false} minDistance={6} maxDistance={40} target={[0, 0, 0]} />
              </Canvas>
            </div>
          </div>

          <section className="rounded-2xl border border-[#B7D7C8] bg-white p-5 shadow-sm" aria-labelledby="panel-estimate-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Exterior wall materials</p>
                <h2 id="panel-estimate-title" className="mt-1 text-xl font-bold">Panel estimate</h2>
              </div>
              <Calculator className="h-5 w-5 text-[#2C8065]" />
            </div>

            {!selectedWallPanel ? (
              <div className="mt-4 flex gap-3 rounded-xl bg-[#F7FAF8] p-4 text-sm text-[#55716A]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A7654B]" />
                <p>Import a wall panel to calculate the exterior material quantity and price.</p>
              </div>
            ) : panelCalculation.estimate ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#EEF7F2] p-3"><p className="text-xs text-[#55716A]">Complete panels</p><p className="mt-1 text-2xl font-black text-[#23634F]">{panelCalculation.estimate.totalPanels}</p></div>
                  <div className="rounded-xl bg-[#EEF7F2] p-3"><p className="text-xs text-[#55716A]">Estimated cost</p><p className="mt-1 text-2xl font-black text-[#23634F]">${panelCalculation.estimate.totalCost.toLocaleString('en-CA', { maximumFractionDigits: 2 })}</p></div>
                  <div className="rounded-xl bg-[#FFF6EE] p-3"><p className="text-xs text-[#7C5A42]">Potential leftover</p><p className="mt-1 text-2xl font-black text-[#A7654B]">{panelCalculation.estimate.leftoverArea.toLocaleString('en-CA', { maximumFractionDigits: 1 })} sq ft</p></div>
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-[#E3EBE8] pt-4 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-3"><dt className="text-[#71847E]">Exterior wall area</dt><dd className="font-bold">{panelCalculation.estimate.wallArea.toLocaleString('en-CA', { maximumFractionDigits: 1 })} sq ft</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#71847E]">Purchased area</dt><dd className="font-bold">{panelCalculation.estimate.purchasedArea.toLocaleString('en-CA', { maximumFractionDigits: 1 })} sq ft</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#71847E]">Panel size</dt><dd className="font-bold">{panelCalculation.estimate.panelWidth}&apos; × {panelCalculation.estimate.panelHeight}&apos;</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#71847E]">Price</dt><dd className="font-bold">${panelCalculation.estimate.pricePerSquareFoot.toLocaleString('en-CA', { maximumFractionDigits: 2 })} / sq ft</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#71847E]">Calculated leftover</dt><dd className="font-bold">{panelCalculation.estimate.wastePercentage.toLocaleString('en-CA', { maximumFractionDigits: 1 })}%</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#71847E]">Openings</dt><dd className="font-bold">Included in purchase area</dd></div>
                </dl>
                <p className="mt-4 text-xs leading-5 text-[#71847E]">This is a live layout estimate for complete panels around the four exterior walls. Doors and windows remain included because panels are cut on-site; leftover area is shown so the buyer can see potential savings.</p>
              </>
            ) : (
              <div className="mt-4 flex gap-3 rounded-xl bg-[#FFF6EE] p-4 text-sm text-[#7C5A42]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A7654B]" />
                <div>
                  <p className="font-bold">Panel specification needed</p>
                  <p className="mt-1">Add {panelCalculation.missing.join(', ')} to this product before requesting a material quote.</p>
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-4 rounded-2xl border border-[#D6DFDC] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Design summary</p><p className="mt-1 text-lg font-bold">{dimensions.length || 0}&apos; × {dimensions.width || 0}&apos; × {dimensions.height || 0}&apos;</p><p className="text-sm text-[#71847E]">{system === 'steel_frame' ? 'Steel frame' : 'Sandwich panel'} · {roofType.replace('_', ' ')} roof · {roofPitch}:12 pitch · {designSummary}</p></div>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#203238] px-5 py-3 text-sm font-bold text-white hover:bg-[#2C8065]"><Square className="h-4 w-4" /> Request a quote</button>
          </div>
        </div>
      </section>

      {wallPanelCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102126]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="wall-panel-center-title">
          <div className="flex max-h-[min(720px,calc(100vh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D6DFDC] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E3EBE8] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Material catalogue</p>
                <h2 id="wall-panel-center-title" className="mt-1 text-xl font-bold text-[#1B272B]">Wall Panel Center</h2>
                <p className="mt-1 text-sm text-[#71847E]">Choose a seller panel to apply to this building.</p>
              </div>
              <button type="button" onClick={() => setWallPanelCenterOpen(false)} className="rounded-lg p-2 text-[#55716A] hover:bg-[#EEF7F2]" aria-label="Close Wall Panel Center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-[#E3EBE8] px-5 py-3">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80938D]" />
                <input
                  value={wallPanelSearch}
                  onChange={(event) => setWallPanelSearch(event.target.value)}
                  placeholder="Search wall panels"
                  className="w-full rounded-lg border border-[#C9D7D2] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2C8065]"
                  autoFocus
                />
              </label>
            </div>
            <div className="min-h-0 overflow-y-auto p-5">
              {loadingWallPanels ? (
                <p className="py-16 text-center text-sm text-[#71847E]">Loading wall panels...</p>
              ) : filteredWallPanelProducts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredWallPanelProducts.map((product) => {
                    const image = product.product_images.find((item) => item.is_master) ?? product.product_images[0]
                    return (
                      <button key={product.id} type="button" onClick={() => selectCatalogWallPanel(product)} className="overflow-hidden rounded-xl border border-[#D6DFDC] text-left transition hover:border-[#2C8065] hover:bg-[#F2FAF6]">
                        <div className="aspect-[4/3] bg-[#EEF2EF]">
                          {image?.url && <img src={image.url} alt={image.alt_text ?? product.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-2 text-sm font-bold text-[#1B272B]">{product.name}</p>
                          <p className="mt-1 truncate text-xs text-[#71847E]">{product.sellers?.business_name ?? 'Cargoplus seller'}</p>
                          <p className="mt-2 text-sm font-bold text-[#23634F]">{product.price ? `$${product.price.toLocaleString('en-CA')} CAD` : 'Request a quote'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-sm font-semibold text-[#1B272B]">No wall panels found</p>
                  <p className="mt-1 text-sm text-[#71847E]">Ask a seller to publish a Wall Panels product, or adjust your search.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[#E3EBE8] bg-[#F7FAF8] px-5 py-3">
              <span className="text-xs text-[#71847E]">Seller products are managed in the marketplace.</span>
              <a href="/wall-panels?returnTo=/building-designer" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#23634F] hover:underline">
                Open full Wall Panel Center <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function DoorOpening({
  position,
  size,
  imageUrl,
  selected,
  opacity = 1,
  onPointerDown,
  onPointerUp,
}: {
  position: [number, number, number]
  size: [number, number, number]
  imageUrl?: string | null
  selected?: boolean
  opacity?: number
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (event: ThreeEvent<PointerEvent>) => void
}) {
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null)
      return
    }
    let active = true
    const loaded = new TextureLoader().load(imageUrl, (nextTexture) => {
      nextTexture.colorSpace = SRGBColorSpace
      nextTexture.needsUpdate = true
      if (active) setTexture(nextTexture)
    })
    return () => {
      active = false
      loaded.dispose()
    }
  }, [imageUrl])

  return (
    <mesh position={position} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <boxGeometry args={size} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent opacity={opacity} side={DoubleSide} />
      ) : (
        <meshStandardMaterial color={selected ? '#D77B4D' : '#A7654B'} transparent={opacity < 1} opacity={opacity} roughness={0.35} />
      )}
    </mesh>
  )
}

type ImportedWindow = ImportedDoor