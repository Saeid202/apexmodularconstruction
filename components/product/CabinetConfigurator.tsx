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

// ── Maps ──────────────────────────────────────────────────────────────────────

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

const COUNTERTOP_PRICES: Record<string, number> = {
  Quartz: 85, Granite: 75, Marble: 120, Wood: 65, Concrete: 55,
}

const DOOR_STYLE_PRICES: Record<string, number> = {
  flat: 0, shaker: 150, glass: 200,
}

const WIDTH_OPTIONS = [24, 30, 36, 42, 48, 60, 72, 84, 96]

// ── Door meshes ───────────────────────────────────────────────────────────────

function FlatDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: any }) {
  return (
    <mesh castShadow>
      <boxGeometry args={[w, h, 0.025]} />
      <meshStandardMaterial color={color} {...finish} />
    </mesh>
  )
}

function ShakerDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: any }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.025]} />
        <meshStandardMaterial color={color} {...finish} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[w - 0.1, h - 0.1, 0.012]} />
        <meshStandardMaterial color={color} roughness={(finish.roughness || 0.5) + 0.12} metalness={0} />
      </mesh>
    </group>
  )
}

function GlassDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: any }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.025]} />
        <meshStandardMaterial color={color} {...finish} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <boxGeometry args={[w - 0.1, h - 0.1, 0.008]} />
        <meshStandardMaterial color="#90CAF9" transparent opacity={0.35} roughness={0.05} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ── Handle meshes ─────────────────────────────────────────────────────────────

const handleMat = new THREE.MeshStandardMaterial({ color: '#C0C0C0', roughness: 0.15, metalness: 0.9 })

function BarHandle({ z }: { z: number }) {
  return (
    <mesh position={[0, -0.16, z]} castShadow material={handleMat}>
      <boxGeometry args={[0.025, 0.18, 0.02]} />
    </mesh>
  )
}

function KnobHandle({ z }: { z: number }) {
  return (
    <mesh position={[0, 0, z]} castShadow material={handleMat} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.018, 0.018, 0.03, 12]} />
    </mesh>
  )
}

function IntegratedHandle({ w, z }: { w: number; z: number }) {
  return (
    <mesh position={[0, 0.33, z]}>
      <boxGeometry args={[w * 0.55, 0.022, 0.018]} />
      <meshStandardMaterial color="#888" roughness={0.8} />
    </mesh>
  )
}

// ── Dynamic cabinet geometry ──────────────────────────────────────────────────

function DynamicCabinet({ config }: { config: CabinetConfig }) {
  const W        = config.widthInches / 12
  const baseH    = 0.9
  const ctH      = 0.055
  const upperH   = 0.75
  const upperW   = W * 0.85
  const upperDepth = 0.34

  const cabColor = useMemo(
    () => new THREE.Color(CABINET_COLORS[config.cabinetColor] ?? CABINET_COLORS.White),
    [config.cabinetColor]
  )
  const ctColor = useMemo(
    () => new THREE.Color(COUNTERTOP_COLORS[config.countertop] ?? COUNTERTOP_COLORS.Quartz),
    [config.countertop]
  )
  const finish     = STYLE_FINISH[config.style] ?? STYLE_FINISH.Modern
  const doorFinish = { roughness: finish.roughness * 0.8, metalness: finish.metalness }

  const toekickMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 }),
    []
  )

  const DoorComp = config.doorStyle === 'shaker' ? ShakerDoor
    : config.doorStyle === 'glass'  ? GlassDoor
    : FlatDoor

  // Base door layout
  const baseDoorW  = (W - 0.04) / config.doorCount
  const baseDoors  = Array.from({ length: config.doorCount }, (_, i) =>
    -W / 2 + 0.02 + baseDoorW * i + baseDoorW / 2
  )

  // Upper door layout
  const upperCount = Math.max(1, config.doorCount)
  const upperDoorW = (upperW - 0.04) / upperCount
  const upperOffX  = W * 0.08
  const upperDoors = Array.from({ length: upperCount }, (_, i) =>
    upperOffX - upperW / 2 + 0.02 + upperDoorW * i + upperDoorW / 2
  )

  const upperCenterY = baseH + ctH + 0.45 + upperH / 2

  return (
    <group>
      {/* Base body */}
      <mesh position={[0, baseH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, baseH, 0.6]} />
        <meshStandardMaterial color={cabColor} {...finish} />
      </mesh>

      {/* Base doors + handles */}
      {baseDoors.map((x, i) => (
        <group key={i} position={[x, 0.46, 0.313]}>
          <DoorComp w={baseDoorW - 0.02} h={0.72} color={cabColor} finish={doorFinish} />
          {config.handleStyle === 'bar'        && <BarHandle z={0.026} />}
          {config.handleStyle === 'knob'       && <KnobHandle z={0.04} />}
          {config.handleStyle === 'integrated' && <IntegratedHandle w={baseDoorW - 0.02} z={0.018} />}
        </group>
      ))}

      {/* Toe kick */}
      <mesh position={[0, 0.05, 0.29]} castShadow material={toekickMat}>
        <boxGeometry args={[W - 0.02, 0.09, 0.04]} />
      </mesh>

      {/* Countertop */}
      <mesh position={[0, baseH + ctH / 2, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.12, ctH, 0.66]} />
        <meshStandardMaterial color={ctColor} roughness={0.25} metalness={0.08} />
      </mesh>

      {/* Upper body */}
      <mesh position={[upperOffX, upperCenterY, -0.125]} castShadow receiveShadow>
        <boxGeometry args={[upperW, upperH, upperDepth]} />
        <meshStandardMaterial color={cabColor} {...finish} />
      </mesh>

      {/* Upper doors + handles */}
      {upperDoors.map((x, i) => (
        <group key={i} position={[x, upperCenterY, -0.125 + upperDepth / 2 + 0.012]}>
          <DoorComp w={upperDoorW - 0.02} h={upperH - 0.05} color={cabColor} finish={doorFinish} />
          {config.handleStyle === 'bar'        && <BarHandle z={0.022} />}
          {config.handleStyle === 'knob'       && <KnobHandle z={0.035} />}
          {config.handleStyle === 'integrated' && <IntegratedHandle w={upperDoorW - 0.02} z={0.018} />}
        </group>
      ))}
    </group>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({ config }: { config: CabinetConfig }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
      <directionalLight position={[-4, 4, -2]} intensity={0.3} />
      <pointLight position={[0, 4, 3]} intensity={0.3} color="#fff5e0" />
      <group position={[0, -1, 0]}>
        <DynamicCabinet config={config} />
      </group>
      <ContactShadows position={[0, -1.005, 0]} opacity={0.45} scale={10} blur={2.5} far={5} />
      <Environment preset="apartment" />
      <OrbitControls
        enableZoom enablePan={false}
        minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.1}
        minDistance={2.5} maxDistance={12}
        target={[0, 0.3, 0]}
        autoRotate autoRotateSpeed={0.4}
      />
    </>
  )
}

// ── Price ─────────────────────────────────────────────────────────────────────

function calcPrice(config: CabinetConfig): number {
  const ft      = config.widthInches / 12
  const base    = ft * 200
  const ct      = ft * (COUNTERTOP_PRICES[config.countertop] ?? 85)
  const door    = DOOR_STYLE_PRICES[config.doorStyle] ?? 0
  const install = 500
  return Math.round(base + ct + door + install)
}

// ── Control panel ─────────────────────────────────────────────────────────────

function ControlPanel({
  config,
  onChange,
  onAddToCart,
  onRequestQuote,
}: {
  config: CabinetConfig
  onChange: (c: Partial<CabinetConfig>) => void
  onAddToCart: () => void
  onRequestQuote: () => void
}) {
  const price = calcPrice(config)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white border-l border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configure</p>
        <p className="text-sm font-semibold text-gray-700 mt-0.5">Adjust every detail</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Width */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Width</p>
          <div className="flex flex-wrap gap-1.5">
            {WIDTH_OPTIONS.map(w => (
              <button
                key={w}
                onClick={() => onChange({ widthInches: w })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  config.widthInches === w
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}
              >
                {w}"
              </button>
            ))}
          </div>
        </div>

        {/* Door count */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Doors</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => onChange({ doorCount: n })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                  config.doorCount === n
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Door style */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Door Style</p>
          <div className="flex flex-col gap-1.5">
            {([
              { val: 'flat',   label: 'Flat Slab',    desc: 'Clean, modern',   extra: '' },
              { val: 'shaker', label: 'Shaker Panel',  desc: 'Classic frame',   extra: '+$150' },
              { val: 'glass',  label: 'Glass Insert',  desc: 'Open, airy',      extra: '+$200' },
            ] as const).map(({ val, label, desc, extra }) => (
              <button
                key={val}
                onClick={() => onChange({ doorStyle: val })}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  config.doorStyle === val
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200 bg-white'
                }`}
              >
                <div>
                  <p className={`text-xs font-bold ${config.doorStyle === val ? 'text-purple-800' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
                {extra && <span className="text-[10px] font-bold text-purple-600 ml-2">{extra}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Handle style */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Handle Style</p>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { val: 'bar',        label: 'Bar Pull' },
              { val: 'knob',       label: 'Knob' },
              { val: 'integrated', label: 'Integrated' },
              { val: 'none',       label: 'None' },
            ] as const).map(({ val, label }) => (
              <button
                key={val}
                onClick={() => onChange({ handleStyle: val })}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  config.handleStyle === val
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1 border border-gray-100">
          <div className="flex justify-between"><span>Cabinet</span><span className="font-medium text-gray-700">{config.cabinetColor} {config.style}</span></div>
          <div className="flex justify-between"><span>Countertop</span><span className="font-medium text-gray-700">{config.countertop}</span></div>
          <div className="flex justify-between"><span>Size</span><span className="font-medium text-gray-700">{config.widthInches}" wide, {config.doorCount} doors</span></div>
          <div className="flex justify-between"><span>Door</span><span className="font-medium text-gray-700 capitalize">{config.doorStyle}</span></div>
          <div className="flex justify-between"><span>Handle</span><span className="font-medium text-gray-700 capitalize">{config.handleStyle}</span></div>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="p-4 border-t border-gray-100 bg-white space-y-2.5 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Est. Price</p>
            <p className="text-2xl font-black text-gray-900">${price.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-gray-400 text-right">Incl. install<br />excl. tax</p>
        </div>
        <button
          onClick={onAddToCart}
          className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
        >
          Add to Cart
        </button>
        <button
          onClick={onRequestQuote}
          className="w-full py-2.5 bg-white border border-gray-200 hover:border-purple-300 text-gray-700 font-bold rounded-xl transition-colors text-sm"
        >
          Request Factory Quote
        </button>
      </div>
    </div>
  )
}

// ── Public export ─────────────────────────────────────────────────────────────

export interface CabinetConfiguratorProps {
  cabinetColor?:   string
  countertop?:     string
  style?:          string
  onAddToCart?:    (config: CabinetConfig, price: number) => void
  onRequestQuote?: (config: CabinetConfig, price: number) => void
}

export function CabinetConfigurator({
  cabinetColor = 'White',
  countertop   = 'Quartz',
  style        = 'Modern',
  onAddToCart,
  onRequestQuote,
}: CabinetConfiguratorProps) {
  const [config, setConfig] = useState<CabinetConfig>({
    cabinetColor,
    countertop,
    style,
    widthInches:  36,
    doorCount:    2,
    doorStyle:    'flat',
    handleStyle:  'bar',
  })

  // Sync preference changes from the questions flow
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      cabinetColor: cabinetColor || prev.cabinetColor,
      countertop:   countertop   || prev.countertop,
      style:        style        || prev.style,
    }))
  }, [cabinetColor, countertop, style])

  const handleChange = useCallback((partial: Partial<CabinetConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }))
  }, [])

  const price = calcPrice(config)

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(config, price)
    } else {
      alert(`Added to cart:\n${config.widthInches}" ${config.cabinetColor} ${config.doorStyle} cabinet\nEst. $${price.toLocaleString()}`)
    }
  }

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote(config, price)
    } else {
      alert(`Quote requested!\n\n${config.widthInches}" ${config.cabinetColor} ${config.doorStyle} cabinet — ${config.doorCount} doors\nEst. $${price.toLocaleString()}\n\nSomeone will contact you shortly.`)
    }
  }

  return (
    <div className="w-full h-full flex">
      {/* 3D Canvas */}
      <div className="flex-1 min-h-[400px] bg-gray-100">
        <Canvas
          camera={{ position: [4.5, 1.5, 5], fov: 42 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <Suspense fallback={null}>
            <Scene config={config} />
          </Suspense>
        </Canvas>
      </div>

      {/* Control panel */}
      <div className="w-60 shrink-0 flex flex-col">
        <ControlPanel
          config={config}
          onChange={handleChange}
          onAddToCart={handleAddToCart}
          onRequestQuote={handleRequestQuote}
        />
      </div>
    </div>
  )
}
