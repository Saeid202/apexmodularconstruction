'use client'

import { forwardRef, Suspense, useImperativeHandle, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { getCountertop, getMaterial } from '@/lib/cabinet-designer/materials'
import type { CabinetUnit } from '@/lib/cabinet-designer/types'

const IN = 1 / 12 // inches -> feet (the scene's unit)

const handleMat = new THREE.MeshStandardMaterial({ color: '#C0C0C0', roughness: 0.15, metalness: 0.9 })

function FlatDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: { roughness: number; metalness: number } }) {
  return (
    <mesh castShadow>
      <boxGeometry args={[w, h, 0.025]} />
      <meshStandardMaterial color={color} {...finish} />
    </mesh>
  )
}

function ShakerDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: { roughness: number; metalness: number } }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.025]} />
        <meshStandardMaterial color={color} {...finish} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[w - 0.1, h - 0.1, 0.012]} />
        <meshStandardMaterial color={color} roughness={finish.roughness + 0.12} metalness={0} />
      </mesh>
    </group>
  )
}

function GlassDoor({ w, h, color, finish }: { w: number; h: number; color: THREE.Color; finish: { roughness: number; metalness: number } }) {
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

function DoorHandle({ style, w, z }: { style: CabinetUnit['handleStyle']; w: number; z: number }) {
  if (style === 'bar') {
    return (
      <mesh position={[0, -0.16, z]} castShadow material={handleMat}>
        <boxGeometry args={[0.025, 0.18, 0.02]} />
      </mesh>
    )
  }
  if (style === 'knob') {
    return (
      <mesh position={[0, 0, z]} castShadow material={handleMat} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.03, 12]} />
      </mesh>
    )
  }
  if (style === 'integrated') {
    return (
      <mesh position={[0, 0.33, z]}>
        <boxGeometry args={[w * 0.55, 0.022, 0.018]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
    )
  }
  return null
}

const toekickMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 })

/** Renders one cabinet unit (base/wall/tall/corner) at the given X offset (feet). */
function CabinetUnitMesh({ unit, offsetX }: { unit: CabinetUnit; offsetX: number }) {
  const W = unit.widthInches * IN
  const H = unit.heightInches * IN
  const D = unit.depthInches * IN

  const material = getMaterial(unit.materialId)
  const color = useMemo(() => new THREE.Color(material.color), [material.color])
  const finish = { roughness: material.roughness, metalness: material.metalness }
  const doorFinish = { roughness: finish.roughness * 0.8, metalness: finish.metalness }

  const DoorComp = unit.doorStyle === 'shaker' ? ShakerDoor : unit.doorStyle === 'glass' ? GlassDoor : FlatDoor

  const doorW = (W - 0.04) / unit.doorCount
  const doorH = H - 0.18
  const doorXs = Array.from({ length: unit.doorCount }, (_, i) => -W / 2 + 0.02 + doorW * i + doorW / 2)

  // Wall cabinets are mounted with their bottom 54in above the floor (standard kitchen clearance).
  const bottomY = unit.type === 'wall' ? 54 * IN : 0
  const centerY = bottomY + H / 2
  const frontZ = D / 2 + 0.013

  if (unit.type === 'corner') {
    const returnDepth = D * 0.62
    return (
      <group position={[offsetX, 0, 0]}>
        <mesh position={[0, centerY, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, H, D]} />
          <meshStandardMaterial color={color} {...finish} />
        </mesh>
        <mesh position={[W / 2 + returnDepth / 2 - 0.01, centerY, -D / 2 + returnDepth / 2]} castShadow receiveShadow>
          <boxGeometry args={[returnDepth, H, returnDepth]} />
          <meshStandardMaterial color={color} {...finish} />
        </mesh>
        <group position={[0, centerY, frontZ]}>
          <DoorComp w={W - 0.1} h={doorH} color={color} finish={doorFinish} />
          <DoorHandle style={unit.handleStyle} w={W} z={0.03} />
        </group>
      </group>
    )
  }

  return (
    <group position={[offsetX, 0, 0]}>
      <mesh position={[0, centerY, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={color} {...finish} />
      </mesh>

      {doorXs.map((x, i) => (
        <group key={i} position={[x, centerY, frontZ]}>
          <DoorComp w={doorW - 0.02} h={doorH} color={color} finish={doorFinish} />
          <DoorHandle style={unit.handleStyle} w={doorW} z={0.03} />
        </group>
      ))}

      {unit.type !== 'wall' && (
        <mesh position={[0, 0.05, D / 2 - 0.03]} castShadow material={toekickMat}>
          <boxGeometry args={[W - 0.02, 0.09, 0.04]} />
        </mesh>
      )}
    </group>
  )
}

/** Sum of each unit's width in feet, used to lay units side-by-side and center the run. */
export function getRunWidthFeet(units: CabinetUnit[]) {
  return units.reduce((sum, unit) => sum + unit.widthInches * IN, 0)
}

function CabinetRun({ units, countertopId }: { units: CabinetUnit[]; countertopId: string }) {
  const runWidth = getRunWidthFeet(units)
  let cursor = -runWidth / 2

  const positioned = units.map((unit) => {
    const w = unit.widthInches * IN
    const offsetX = cursor + w / 2
    cursor += w
    return { unit, offsetX }
  })

  const hasCountertopRun = units.some((unit) => unit.hasCountertop)
  const countertop = getCountertop(countertopId)
  const countertopHeight = units.find((unit) => unit.hasCountertop)?.heightInches ?? 34.5
  const countertopDepth = units.find((unit) => unit.hasCountertop)?.depthInches ?? 24

  return (
    <group>
      {positioned.map(({ unit, offsetX }) => (
        <CabinetUnitMesh key={unit.id} unit={unit} offsetX={offsetX} />
      ))}
      {hasCountertopRun && (
        <mesh position={[0, countertopHeight * IN + 0.028, 0]} castShadow receiveShadow>
          <boxGeometry args={[runWidth + 0.12, 0.055, countertopDepth * IN + 0.06]} />
          <meshStandardMaterial color={countertop.color} roughness={0.25} metalness={0.08} />
        </mesh>
      )}
    </group>
  )
}

export interface CabinetSceneHandle {
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
}

export const CabinetScene = forwardRef<CabinetSceneHandle, { units: CabinetUnit[]; countertopId: string }>(
  function CabinetScene({ units, countertopId }, ref) {
    const runWidth = Math.max(getRunWidthFeet(units), 2)
    const cameraDistance = Math.min(Math.max(runWidth * 1.4, 3), 14)
    const controlsRef = useRef<OrbitControlsImpl | null>(null)

    useImperativeHandle(ref, () => ({
      zoomIn: () => zoomBy(0.8),
      zoomOut: () => zoomBy(1.25),
      resetView: () => resetCamera(),
    }))

    function zoomBy(factor: number) {
      const controls = controlsRef.current
      if (!controls) return
      const camera = controls.object as THREE.PerspectiveCamera
      camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target)
      controls.update()
    }

    function resetCamera() {
      const controls = controlsRef.current
      if (!controls) return
      const camera = controls.object as THREE.PerspectiveCamera
      camera.position.set(cameraDistance, 1.6, cameraDistance)
      controls.target.set(0, 0.3, 0)
      controls.update()
    }

    return (
      <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{ position: [cameraDistance, 1.6, cameraDistance], fov: 40 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
          <directionalLight position={[-4, 4, -2]} intensity={0.3} />
          <pointLight position={[0, 4, 3]} intensity={0.3} color="#fff5e0" />
          <group position={[0, -1, 0]}>
            <CabinetRun units={units} countertopId={countertopId} />
          </group>
          <ContactShadows position={[0, -1.005, 0]} opacity={0.45} scale={Math.max(runWidth * 2, 10)} blur={2.5} far={5} />
          <Environment preset="apartment" />
          <OrbitControls
            ref={controlsRef}
            enableZoom
            enablePan={false}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2.5}
            maxDistance={20}
            target={[0, 0.3, 0]}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Suspense>
      </Canvas>
    )
  }
)
