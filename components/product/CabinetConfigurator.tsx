'use client'

import { useMemo, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CabinetConfig {
  cabinetColor: string
  countertop:   string
  style:        string
  widthInches:  number
  doorCount:    number
  doorStyle:    'flat' | 'shaker' | 'glass'
  handleStyle:  'bar' | 'knob' | 'none' | 'integrated'
}

export interface RoomData {
  estLength?: number
  estHeight?: number
  windows?:  number
  doors?:    number
}

interface CatalogItem {
  id:    string
  name:  string
  image: string
  color: string
}

// ── Real catalog options (photos live in /public/kitchen-furniture) ──────────

const TABLE_OPTIONS: CatalogItem[] = [
  { id: 'andora',     name: 'Andora',             image: '/kitchen-furniture/table-andora.png',              color: '#C69A5E' },
  { id: 'mulholland', name: 'Mulholland Pedestal', image: '/kitchen-furniture/table-mulholland-pedestal.png', color: '#D4B481' },
  { id: 'oslo',       name: 'Oslo Pedestal',       image: '/kitchen-furniture/table-oslo-pedestal.png',       color: '#2B2622' },
]

const CHAIR_OPTIONS: CatalogItem[] = [
  { id: 'arno',         name: 'Arno',         image: '/kitchen-furniture/chair-arno.png',         color: '#E8E0D2' },
  { id: 'nicola-slope',  name: 'Nicola Slope', image: '/kitchen-furniture/chair-nicola-slope.png', color: '#8B5A34' },
  { id: 'nicola-track',  name: 'Nicola Track', image: '/kitchen-furniture/chair-nicola-track.png', color: '#D9CFC0' },
]

const TALL_CABINET_OPTIONS: CatalogItem[] = [
  { id: 'byron',       name: 'Byron',            image: '/kitchen-furniture/cabinet-byron.png',      color: '#C9A876' },
  { id: 'ligne',        name: 'Ligné',            image: '/kitchen-furniture/cabinet-ligne.png',      color: '#DCC49E' },
  { id: 'mulholland-c', name: 'Mulholland',       image: '/kitchen-furniture/cabinet-mulholland.png', color: '#E3D3B8' },
]

// ── Base cabinet color + style maps ───────────────────────────────────────────

const CABINET_COLORS: Record<string, string> = {
  White:  '#F5F4F0',
  Black:  '#1C1C1E',
  Walnut: '#6B3F25',
  Oak:    '#C8A882',
  Custom: '#4B1D8F',
}

const COUNTERTOP_COLORS: Record<string, string> = {
  Quartz:   '#D8D4CF',
  Granite:  '#3D3D3D',
  Marble:   '#F0EDE8',
  Wood:     '#8B5E3C',
  Concrete: '#9E9E9E',
}

const STYLE_FINISH: Record<string, { roughness: number; metalness: number }> = {
  Modern:       { roughness: 0.15, metalness: 0.10 },
  Minimalist:   { roughness: 0.10, metalness: 0.05 },
  Scandinavian: { roughness: 0.50, metalness: 0.00 },
  Traditional:  { roughness: 0.65, metalness: 0.00 },
  Shaker:       { roughness: 0.55, metalness: 0.00 },
}

const COUNTERTOP_PRICES: Record<string, number> = { Quartz: 85, Granite: 75, Marble: 120, Wood: 65, Concrete: 55 }
const DOOR_STYLE_PRICES: Record<string, number> = { flat: 0, shaker: 150, glass: 200 }
const WIDTH_OPTIONS = [24, 30, 36, 42, 48, 60, 72, 84, 96]

// ── Scene-level furniture toggle state ────────────────────────────────────────

export interface SceneFurniture {
  tableId?:  string   // undefined = not placed
  chairId?:  string
  chairCount: number
  cabinetId?: string
}

const DEFAULT_SCENE_FURNITURE: SceneFurniture = {
  tableId: undefined,
  chairId: undefined,
  chairCount: 4,
  cabinetId: undefined,
}

// ── Door / handle meshes (unchanged) ──────────────────────────────────────────

function FlatDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: any }) {
  return <mesh castShadow><boxGeometry args={[w, h, 0.025]} /><meshStandardMaterial color={color} {...finish} /></mesh>
}
function ShakerDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: any }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[w, h, 0.025]} /><meshStandardMaterial color={color} {...finish} /></mesh>
      <mesh position={[0, 0, 0.012]}><boxGeometry args={[w - 0.1, h - 0.1, 0.012]} /><meshStandardMaterial color={color} roughness={(finish.roughness || 0.5) + 0.12} metalness={0} /></mesh>
    </group>
  )
}
function GlassDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: any }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[w, h, 0.025]} /><meshStandardMaterial color={color} {...finish} /></mesh>
      <mesh position={[0, 0, 0.016]}><boxGeometry args={[w - 0.1, h - 0.1, 0.008]} /><meshStandardMaterial color="#90CAF9" transparent opacity={0.35} roughness={0.05} metalness={0.1} /></mesh>
    </group>
  )
}

const handleMat = new THREE.MeshStandardMaterial({ color: '#C0C0C0', roughness: 0.15, metalness: 0.9 })
function BarHandle({ z }: { z: number }) { return <mesh position={[0, -0.16, z]} castShadow material={handleMat}><boxGeometry args={[0.025, 0.18, 0.02]} /></mesh> }
function KnobHandle({ z }: { z: number }) { return <mesh position={[0, 0, z]} castShadow material={handleMat} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.03, 12]} /></mesh> }
function IntegratedHandle({ w, z }: { w: number; z: number }) { return <mesh position={[0, 0.33, z]}><boxGeometry args={[w * 0.55, 0.022, 0.018]} /><meshStandardMaterial color="#888" roughness={0.8} /></mesh> }

// ── Base kitchen cabinet run (unchanged from before) ──────────────────────────

function DynamicCabinet({ config }: { config: CabinetConfig }) {
  const W = config.widthInches / 12
  const baseH = 0.9, ctH = 0.055, upperH = 0.75, upperW = W * 0.85, upperDepth = 0.34

  const cabColor = useMemo(() => new THREE.Color(CABINET_COLORS[config.cabinetColor] ?? CABINET_COLORS.White), [config.cabinetColor])
  const ctColor  = useMemo(() => new THREE.Color(COUNTERTOP_COLORS[config.countertop] ?? COUNTERTOP_COLORS.Quartz), [config.countertop])
  const finish = STYLE_FINISH[config.style] ?? STYLE_FINISH.Modern
  const doorFinish = { roughness: finish.roughness * 0.8, metalness: finish.metalness }
  const toekickMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 }), [])

  const DoorComp = config.doorStyle === 'shaker' ? ShakerDoor : config.doorStyle === 'glass' ? GlassDoor : FlatDoor

  const baseDoorW = (W - 0.04) / config.doorCount
  const baseDoors = Array.from({ length: config.doorCount }, (_, i) => -W / 2 + 0.02 + baseDoorW * i + baseDoorW / 2)
  const upperCount = Math.max(1, config.doorCount)
  const upperDoorW = (upperW - 0.04) / upperCount
  const upperOffX = W * 0.08
  const upperDoors = Array.from({ length: upperCount }, (_, i) => upperOffX - upperW / 2 + 0.02 + upperDoorW * i + upperDoorW / 2)
  const upperCenterY = baseH + ctH + 0.45 + upperH / 2

  return (
    <group>
      <mesh position={[0, baseH / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, baseH, 0.6]} /><meshStandardMaterial color={cabColor} {...finish} /></mesh>
      {baseDoors.map((x, i) => (
        <group key={i} position={[x, 0.46, 0.313]}>
          <DoorComp w={baseDoorW - 0.02} h={0.72} color={cabColor} finish={doorFinish} />
          {config.handleStyle === 'bar' && <BarHandle z={0.026} />}
          {config.handleStyle === 'knob' && <KnobHandle z={0.04} />}
          {config.handleStyle === 'integrated' && <IntegratedHandle w={baseDoorW - 0.02} z={0.018} />}
        </group>
      ))}
      <mesh position={[0, 0.05, 0.29]} castShadow material={toekickMat}><boxGeometry args={[W - 0.02, 0.09, 0.04]} /></mesh>
      <mesh position={[0, baseH + ctH / 2, 0.02]} castShadow receiveShadow><boxGeometry args={[W + 0.12, ctH, 0.66]} /><meshStandardMaterial color={ctColor} roughness={0.25} metalness={0.08} /></mesh>
      <mesh position={[upperOffX, upperCenterY, -0.125]} castShadow receiveShadow><boxGeometry args={[upperW, upperH, upperDepth]} /><meshStandardMaterial color={cabColor} {...finish} /></mesh>
      {upperDoors.map((x, i) => (
        <group key={i} position={[x, upperCenterY, -0.125 + upperDepth / 2 + 0.012]}>
          <DoorComp w={upperDoorW - 0.02} h={upperH - 0.05} color={cabColor} finish={doorFinish} />
          {config.handleStyle === 'bar' && <BarHandle z={0.022} />}
          {config.handleStyle === 'knob' && <KnobHandle z={0.035} />}
          {config.handleStyle === 'integrated' && <IntegratedHandle w={upperDoorW - 0.02} z={0.018} />}
        </group>
      ))}
    </group>
  )
}

// ── NEW: Dining table (procedural, colored from real catalog pick) ───────────

function DiningTable({ item, position }: { item: CatalogItem; position: [number, number, number] }) {
  const color = useMemo(() => new THREE.Color(item.color), [item.color])
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {[[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ── NEW: Dining chair (procedural, colored from real catalog pick) ───────────

function DiningChair({ item, position, rotationY = 0 }: { item: CatalogItem; position: [number, number, number]; rotationY?: number }) {
  const color = useMemo(() => new THREE.Color(item.color), [item.color])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.42, 0.05, 0.42]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
      <mesh position={[0, 0.75, -0.19]} castShadow><boxGeometry args={[0.42, 0.55, 0.05]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow><boxGeometry args={[0.035, 0.44, 0.035]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
      ))}
    </group>
  )
}

// ── NEW: Tall cabinet / hutch (procedural, colored from real catalog pick) ───

function TallCabinet({ item, position }: { item: CatalogItem; position: [number, number, number] }) {
  const color = useMemo(() => new THREE.Color(item.color), [item.color])
  return (
    <group position={position}>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow><boxGeometry args={[0.8, 2.0, 0.45]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
      <mesh position={[-0.195, 1.0, 0.226]} castShadow><boxGeometry args={[0.38, 1.9, 0.02]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
      <mesh position={[0.195, 1.0, 0.226]} castShadow><boxGeometry args={[0.38, 1.9, 0.02]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
      <mesh position={[0, 1.0, 0.24]} castShadow material={handleMat}><boxGeometry args={[0.02, 0.2, 0.02]} /></mesh>
    </group>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({ config, furniture }: { config: CabinetConfig; furniture: SceneFurniture }) {
  const table  = TABLE_OPTIONS.find((t) => t.id === furniture.tableId)
  const chair  = CHAIR_OPTIONS.find((c) => c.id === furniture.chairId)
  const cabinet = TALL_CABINET_OPTIONS.find((c) => c.id === furniture.cabinetId)

  const chairPositions: [number, number, number][] = []
  if (chair) {
    const n = furniture.chairCount
    const slots: [number, number, number, number][] = [
      [-0.75, 0, 1.55, Math.PI],
      [0.75, 0, 1.55, Math.PI],
      [-0.75, 0, 2.6, 0],
      [0.75, 0, 2.6, 0],
    ]
    for (let i = 0; i < Math.min(n, 4); i++) chairPositions.push([slots[i][0], slots[i][1], slots[i][2]])
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
      <directionalLight position={[-4, 4, -2]} intensity={0.3} />
      <pointLight position={[0, 4, 3]} intensity={0.3} color="#fff5e0" />

      <group position={[0, -1, 0]}>
        <DynamicCabinet config={config} />
        {table && <DiningTable item={table} position={[0, 0, 2.1]} />}
        {chair && chairPositions.map((pos, i) => {
          const rot = pos[2] < 2 ? Math.PI : 0
          return <DiningChair key={i} item={chair} position={pos} rotationY={rot} />
        })}
        {cabinet && <TallCabinet item={cabinet} position={[-2.2, 0, -0.3]} />}
      </group>

      <ContactShadows position={[0, -1.005, 0]} opacity={0.45} scale={12} blur={2.5} far={5} />
      <Environment preset="apartment" />
      <OrbitControls
        enableZoom enablePan
        minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.1}
        minDistance={2.5} maxDistance={14}
        target={[0, 0.3, 1]}
        autoRotate autoRotateSpeed={0.3}
      />
    </>
  )
}

// ── Price ─────────────────────────────────────────────────────────────────────

function calcPrice(config: CabinetConfig, roomData?: RoomData): number {
  const ft = config.widthInches / 12
  const base = ft * 200
  const ct = ft * (COUNTERTOP_PRICES[config.countertop] ?? 85)
  const door = DOOR_STYLE_PRICES[config.doorStyle] ?? 0
  const openings = (roomData?.windows ?? 0) + (roomData?.doors ?? 0)
  const installComplexity = openings * 120
  const heightPremium = (roomData?.estHeight ?? 9) > 9 ? ft * 45 : 0
  return Math.round(base + ct + door + 500 + installComplexity + heightPremium + 350)
}

// ── Catalog picker row (shared UI for table/chair/cabinet slots) ─────────────

function CatalogPicker({
  label, options, selectedId, onSelect, extra,
}: {
  label: string
  options: CatalogItem[]
  selectedId?: string
  onSelect: (id: string | undefined) => void
  extra?: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        {selectedId && (
          <button onClick={() => onSelect(undefined)} className="text-[10px] font-bold text-gray-400 hover:text-red-500">
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-1">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`overflow-hidden rounded-lg border-2 transition-all ${selectedId === opt.id ? 'border-purple-600' : 'border-transparent hover:border-purple-200'}`}
          >
            <div className="aspect-[4/3] bg-gray-50">
              <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
            </div>
            <p className={`text-[9px] font-bold py-1 text-center truncate px-1 ${selectedId === opt.id ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
              {opt.name}
            </p>
          </button>
        ))}
      </div>
      {extra}
    </div>
  )
}

// ── Control panel ─────────────────────────────────────────────────────────────

function ControlPanel({
  config, onChange, furniture, onFurnitureChange, onAddToCart, onRequestQuote, wallWidthInches, roomData,
}: {
  config: CabinetConfig
  onChange: (c: Partial<CabinetConfig>) => void
  furniture: SceneFurniture
  onFurnitureChange: (f: Partial<SceneFurniture>) => void
  onAddToCart: () => void
  onRequestQuote: () => void
  wallWidthInches?: number
  roomData?: RoomData
}) {
  const price = calcPrice(config, roomData)
  const maxAvailable = wallWidthInches ?? null
  const fits = !maxAvailable || config.widthInches <= maxAvailable
  const spaceLeft = maxAvailable ? maxAvailable - config.widthInches : null
  const tightFit = spaceLeft !== null && spaceLeft >= 0 && spaceLeft < 12

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white border-l border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configure</p>
        <p className="text-sm font-semibold text-gray-700 mt-0.5">Build out the whole room</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {maxAvailable && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${!fits ? 'bg-red-50 border-red-200 text-red-700' : tightFit ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            <span className="text-base">{!fits ? '⚠' : tightFit ? '⚡' : '✓'}</span>
            <div>{!fits ? `Too wide — ${maxAvailable}" available` : tightFit ? `Tight fit — ${spaceLeft}" to spare` : `Fits your wall — ${spaceLeft}" to spare`}</div>
          </div>
        )}

        {/* Base cabinet controls */}
        <div>
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-2 border-b border-purple-100 pb-1">Kitchen Cabinet</p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Width</p>
              <div className="flex flex-wrap gap-1.5">
                {WIDTH_OPTIONS.map((w) => {
                  const tooWide = maxAvailable ? w > maxAvailable : false
                  return (
                    <button key={w} onClick={() => !tooWide && onChange({ widthInches: w })} disabled={tooWide}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${config.widthInches === w ? 'bg-purple-700 text-white border-purple-700' : tooWide ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                      {w}"
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Doors</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => onChange({ doorCount: n })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${config.doorCount === n ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real catalog furniture slots */}
        <div>
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-3 border-b border-purple-100 pb-1">Add Real Furniture</p>
          <div className="space-y-5">
            <CatalogPicker label="Dining Table" options={TABLE_OPTIONS} selectedId={furniture.tableId} onSelect={(id) => onFurnitureChange({ tableId: id })} />
            <CatalogPicker
              label="Dining Chairs"
              options={CHAIR_OPTIONS}
              selectedId={furniture.chairId}
              onSelect={(id) => onFurnitureChange({ chairId: id })}
              extra={furniture.chairId && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-400 font-bold">Qty:</span>
                  {[2, 4].map((n) => (
                    <button key={n} onClick={() => onFurnitureChange({ chairCount: n })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${furniture.chairCount === n ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            />
            <CatalogPicker label="Tall Cabinet" options={TALL_CABINET_OPTIONS} selectedId={furniture.cabinetId} onSelect={(id) => onFurnitureChange({ cabinetId: id })} />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white space-y-2.5 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Cabinet Est.</p>
            <p className="text-2xl font-black text-gray-900">${price.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-gray-400 text-right">Furniture priced<br />separately</p>
        </div>
        <button onClick={onAddToCart} disabled={!fits} className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-colors shadow-md text-sm">
          Add to Cart
        </button>
        <button onClick={onRequestQuote} className="w-full py-2.5 bg-white border border-gray-200 hover:border-purple-300 text-gray-700 font-bold rounded-xl transition-colors text-sm">
          Request Factory Quote
        </button>
      </div>
    </div>
  )
}

// ── Public export ─────────────────────────────────────────────────────────────

export interface CabinetConfiguratorProps {
  cabinetColor?:    string
  countertop?:      string
  style?:           string
  configOverride?:  Partial<CabinetConfig>
  wallWidthInches?: number
  roomData?:        RoomData
  onAddToCart?:     (config: CabinetConfig, price: number) => void
  onRequestQuote?:  (config: CabinetConfig, price: number) => void
}

export function CabinetConfigurator({
  cabinetColor = 'White', countertop = 'Quartz', style = 'Modern',
  configOverride, wallWidthInches, roomData, onAddToCart, onRequestQuote,
}: CabinetConfiguratorProps) {
  const [config, setConfig] = useState<CabinetConfig>({
    cabinetColor, countertop, style, widthInches: 36, doorCount: 2, doorStyle: 'flat', handleStyle: 'bar',
  })
  const [furniture, setFurniture] = useState<SceneFurniture>(DEFAULT_SCENE_FURNITURE)

  useEffect(() => {
    setConfig((prev) => ({ ...prev, cabinetColor: cabinetColor || prev.cabinetColor, countertop: countertop || prev.countertop, style: style || prev.style }))
  }, [cabinetColor, countertop, style])

  useEffect(() => {
    if (configOverride && Object.keys(configOverride).length > 0) setConfig((prev) => ({ ...prev, ...configOverride }))
  }, [configOverride])

  const handleChange = useCallback((partial: Partial<CabinetConfig>) => setConfig((prev) => ({ ...prev, ...partial })), [])
  const handleFurnitureChange = useCallback((partial: Partial<SceneFurniture>) => setFurniture((prev) => ({ ...prev, ...partial })), [])

  const price = calcPrice(config, roomData)
  const handleAddToCart = () => onAddToCart ? onAddToCart(config, price) : alert(`Added to cart: ${config.widthInches}" ${config.cabinetColor} cabinet — Est. $${price.toLocaleString()}`)
  const handleRequestQuote = () => onRequestQuote ? onRequestQuote(config, price) : alert(`Quote requested — Est. $${price.toLocaleString()}`)

  return (
    <div className="w-full h-full flex">
      <div className="flex-1 min-h-[400px] bg-gray-100">
        <Canvas camera={{ position: [5, 2, 6], fov: 42 }} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
          <Suspense fallback={null}>
            <Scene config={config} furniture={furniture} />
          </Suspense>
        </Canvas>
      </div>
      <div className="w-64 shrink-0 flex flex-col">
        <ControlPanel
          config={config} onChange={handleChange}
          furniture={furniture} onFurnitureChange={handleFurnitureChange}
          onAddToCart={handleAddToCart} onRequestQuote={handleRequestQuote}
          wallWidthInches={wallWidthInches} roomData={roomData}
        />
      </div>
    </div>
  )
}
