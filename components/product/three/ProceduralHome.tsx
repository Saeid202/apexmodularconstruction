'use client'

/**
 * Parametric modular home used whenever a product has no GLB attached (or its
 * GLB fails to load). Every mesh is named with the same convention a real
 * model is expected to follow, so it exercises the exact binding path in
 * `lib/product/model3d.ts` that a production asset will.
 */

import { useEffect, useMemo, type ReactNode } from 'react'
import { DoubleSide } from 'three'
import {
  getFinish,
  resolveNodeAppearance,
  type SceneDirectives,
  type StudioConfig,
  type SurfaceKey,
} from '@/lib/product/model3d'

interface SceneProps {
  directives: SceneDirectives
  studio: StudioConfig
}

interface PartProps extends SceneProps {
  name: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  /** Colour used when neither a seller selection nor a surface applies. */
  baseColor?: string
  /** Surface whose studio colour to inherit when the node name maps to none. */
  surfaceHint?: SurfaceKey
  children: ReactNode
}

/**
 * One named element of the home. Resolves its own visibility and colour from
 * the shared directives so adding a part to the scene needs no wiring.
 */
function Part({
  name,
  directives,
  studio,
  position,
  rotation,
  baseColor,
  surfaceHint,
  children,
}: PartProps) {
  const appearance = resolveNodeAppearance(name, directives, studio)
  const finish = getFinish(studio.finish)

  if (!appearance.visible) return null

  const color =
    appearance.color ?? (surfaceHint ? studio.colors[surfaceHint] : undefined) ?? baseColor ?? '#CCCCCC'

  return (
    <mesh name={name} position={position} rotation={rotation} castShadow receiveShadow>
      {children}
      <meshStandardMaterial
        color={color}
        roughness={finish.roughness}
        metalness={finish.metalness}
        envMapIntensity={finish.envIntensity}
        wireframe={studio.wireframe}
      />
    </mesh>
  )
}

/** Windows get their own glazing material rather than a painted surface. */
function Glass({
  name,
  position,
  rotation,
  args,
  studio,
  directives,
}: {
  name: string
  position: [number, number, number]
  rotation?: [number, number, number]
  args: [number, number, number]
} & SceneProps) {
  const appearance = resolveNodeAppearance(name, directives, studio)
  if (!appearance.visible) return null

  return (
    <mesh name={name} position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial
        color="#9FB8CC"
        roughness={0.08}
        metalness={0.1}
        transmission={0.6}
        thickness={0.4}
        transparent
        opacity={0.72}
        side={DoubleSide}
        wireframe={studio.wireframe}
      />
    </mesh>
  )
}

/* Body A — the main module. Foundation top sits at y = 0.4. */
const A = { w: 6.4, h: 3.0, d: 5.6, x: -1.7, z: 0 }
/* Body B — the smaller wing. */
const B = { w: 4.0, h: 2.6, d: 4.4, x: 3.3, z: -0.4 }
const FLOOR = 0.4

const A_TOP = FLOOR + A.h
const B_TOP = FLOOR + B.h
const A_FRONT = A.z + A.d / 2
const B_FRONT = B.z + B.d / 2

/**
 * Node names this model contains. Reported upward so the studio panel can hide
 * controls for parts that aren't present.
 */
const NODE_NAMES = [
  'foundation_slab',
  'foundation_skirt',
  'siding_module_a',
  'siding_module_b',
  'roof_module_a',
  'roof_module_b',
  'trim_fascia_a',
  'trim_fascia_b',
  'trim_corner_1',
  'trim_corner_2',
  'trim_corner_3',
  'trim_corner_4',
  'door_entry',
  'hardware_handle',
  'window_front_1',
  'window_front_2',
  'window_side_1',
  'window_wing_1',
  'glass_front_1',
  'glass_front_2',
  'glass_side_1',
  'glass_wing_1',
  'deck_platform',
  'stair_tread_1',
  'stair_tread_2',
  'stair_tread_3',
  'railing_rail_top',
  'railing_post_1',
  'railing_post_2',
  'railing_post_3',
  'pergola_post_1',
  'pergola_post_2',
  'pergola_beam',
  'pergola_slat_1',
  'solar_array_1',
  'solar_array_2',
  'solar_array_3',
  'skylight_1',
  'skylight_2',
  'chimney_stack',
  'carport_roof',
  'carport_post_1',
  'carport_post_2',
  'planter_box_1',
  'planter_box_2',
]

interface Props extends SceneProps {
  onPartsDiscovered?: (nodeNames: string[]) => void
}

export function ProceduralHome({ directives, studio, onPartsDiscovered }: Props) {
  useEffect(() => {
    onPartsDiscovered?.(NODE_NAMES)
  }, [onPartsDiscovered])

  const shared = useMemo(() => ({ directives, studio }), [directives, studio])

  const railingPosts = [-2.1, 0, 2.1]
  const pergolaSlats = Array.from({ length: 7 }, (_, i) => -1.8 + i * 0.6)

  return (
    <group name="modular_home">
      {/* ── Foundation ─────────────────────────────────────────────── */}
      <Part name="foundation_slab" position={[0, FLOOR / 2, 0]} baseColor="#6B7280" {...shared}>
        <boxGeometry args={[11.6, FLOOR, 6.4]} />
      </Part>
      <Part name="foundation_skirt" position={[0, 0.06, 0]} baseColor="#4A5057" {...shared}>
        <boxGeometry args={[12.0, 0.12, 6.8]} />
      </Part>

      {/* ── Module bodies ──────────────────────────────────────────── */}
      <Part
        name="siding_module_a"
        position={[A.x, FLOOR + A.h / 2, A.z]}
        baseColor="#EDE9E3"
        {...shared}
      >
        <boxGeometry args={[A.w, A.h, A.d]} />
      </Part>
      <Part
        name="siding_module_b"
        position={[B.x, FLOOR + B.h / 2, B.z]}
        baseColor="#D8D2C7"
        {...shared}
      >
        <boxGeometry args={[B.w, B.h, B.d]} />
      </Part>

      {/* ── Roofs (low-slope slabs with overhang) ──────────────────── */}
      <Part name="roof_module_a" position={[A.x, A_TOP + 0.14, A.z]} baseColor="#3A3F44" {...shared}>
        <boxGeometry args={[A.w + 0.7, 0.28, A.d + 0.7]} />
      </Part>
      <Part name="roof_module_b" position={[B.x, B_TOP + 0.14, B.z]} baseColor="#3A3F44" {...shared}>
        <boxGeometry args={[B.w + 0.6, 0.28, B.d + 0.6]} />
      </Part>

      {/* ── Trim ───────────────────────────────────────────────────── */}
      <Part name="trim_fascia_a" position={[A.x, A_TOP - 0.06, A.z]} baseColor="#FFFFFF" {...shared}>
        <boxGeometry args={[A.w + 0.76, 0.14, A.d + 0.76]} />
      </Part>
      <Part name="trim_fascia_b" position={[B.x, B_TOP - 0.06, B.z]} baseColor="#FFFFFF" {...shared}>
        <boxGeometry args={[B.w + 0.66, 0.14, B.d + 0.66]} />
      </Part>
      {[
        [A.x - A.w / 2, A.z - A.d / 2],
        [A.x - A.w / 2, A.z + A.d / 2],
        [A.x + A.w / 2, A.z - A.d / 2],
        [A.x + A.w / 2, A.z + A.d / 2],
      ].map(([x, z], i) => (
        <Part
          key={i}
          name={`trim_corner_${i + 1}`}
          position={[x, FLOOR + A.h / 2, z]}
          baseColor="#FFFFFF"
          {...shared}
        >
          <boxGeometry args={[0.18, A.h, 0.18]} />
        </Part>
      ))}

      {/* ── Entry door ─────────────────────────────────────────────── */}
      <Part
        name="door_entry"
        position={[A.x + 1.9, FLOOR + 1.1, A_FRONT + 0.06]}
        baseColor="#4B1D8F"
        {...shared}
      >
        <boxGeometry args={[1.15, 2.2, 0.12]} />
      </Part>
      <Part
        name="hardware_handle"
        position={[A.x + 2.35, FLOOR + 1.1, A_FRONT + 0.16]}
        baseColor="#D4AF37"
        {...shared}
      >
        <boxGeometry args={[0.08, 0.3, 0.08]} />
      </Part>

      {/* ── Windows: painted frame + separate glazing ──────────────── */}
      <Part
        name="window_front_1"
        position={[A.x - 1.5, FLOOR + 1.7, A_FRONT + 0.05]}
        baseColor="#2E3338"
        {...shared}
      >
        <boxGeometry args={[2.6, 1.5, 0.12]} />
      </Part>
      <Glass
        name="glass_front_1"
        position={[A.x - 1.5, FLOOR + 1.7, A_FRONT + 0.13]}
        args={[2.36, 1.26, 0.05]}
        {...shared}
      />

      <Part
        name="window_front_2"
        position={[A.x + 0.55, FLOOR + 1.9, A_FRONT + 0.05]}
        baseColor="#2E3338"
        {...shared}
      >
        <boxGeometry args={[0.85, 1.1, 0.12]} />
      </Part>
      <Glass
        name="glass_front_2"
        position={[A.x + 0.55, FLOOR + 1.9, A_FRONT + 0.13]}
        args={[0.66, 0.9, 0.05]}
        {...shared}
      />

      <Part
        name="window_side_1"
        position={[A.x - A.w / 2 - 0.05, FLOOR + 1.75, A.z - 0.6]}
        rotation={[0, Math.PI / 2, 0]}
        baseColor="#2E3338"
        {...shared}
      >
        <boxGeometry args={[2.2, 1.4, 0.12]} />
      </Part>
      <Glass
        name="glass_side_1"
        position={[A.x - A.w / 2 - 0.13, FLOOR + 1.75, A.z - 0.6]}
        rotation={[0, Math.PI / 2, 0]}
        args={[1.98, 1.18, 0.05]}
        {...shared}
      />

      <Part
        name="window_wing_1"
        position={[B.x, FLOOR + 1.5, B_FRONT + 0.05]}
        baseColor="#2E3338"
        {...shared}
      >
        <boxGeometry args={[2.2, 1.3, 0.12]} />
      </Part>
      <Glass
        name="glass_wing_1"
        position={[B.x, FLOOR + 1.5, B_FRONT + 0.13]}
        args={[1.98, 1.08, 0.05]}
        {...shared}
      />

      {/* ── Deck, stairs, railing ──────────────────────────────────── */}
      <Part
        name="deck_platform"
        position={[A.x, FLOOR - 0.09, A_FRONT + 1.4]}
        baseColor="#9A7B4F"
        {...shared}
      >
        <boxGeometry args={[A.w + 0.4, 0.18, 2.8]} />
      </Part>
      {[0, 1, 2].map((i) => (
        <Part
          key={i}
          name={`stair_tread_${i + 1}`}
          position={[A.x, FLOOR - 0.22 - i * 0.13, A_FRONT + 2.9 + i * 0.34]}
          baseColor="#8C6E45"
          surfaceHint="deck"
          {...shared}
        >
          <boxGeometry args={[2.4, 0.13, 0.34]} />
        </Part>
      ))}
      <Part
        name="railing_rail_top"
        position={[A.x, FLOOR + 0.9, A_FRONT + 2.75]}
        baseColor="#7C6A55"
        surfaceHint="deck"
        {...shared}
      >
        <boxGeometry args={[A.w + 0.4, 0.1, 0.1]} />
      </Part>
      {railingPosts.map((x, i) => (
        <Part
          key={i}
          name={`railing_post_${i + 1}`}
          position={[A.x + x, FLOOR + 0.45, A_FRONT + 2.75]}
          baseColor="#7C6A55"
          surfaceHint="deck"
          {...shared}
        >
          <boxGeometry args={[0.1, 1.0, 0.1]} />
        </Part>
      ))}

      {/* ── Pergola (optional) ─────────────────────────────────────── */}
      {[-2.4, 2.4].map((x, i) => (
        <Part
          key={i}
          name={`pergola_post_${i + 1}`}
          position={[A.x + x, FLOOR + 1.35, A_FRONT + 2.5]}
          baseColor="#7C6A55"
          surfaceHint="trim"
          {...shared}
        >
          <boxGeometry args={[0.16, 2.7, 0.16]} />
        </Part>
      ))}
      <Part
        name="pergola_beam"
        position={[A.x, FLOOR + 2.65, A_FRONT + 2.5]}
        baseColor="#7C6A55"
        surfaceHint="trim"
        {...shared}
      >
        <boxGeometry args={[5.4, 0.16, 0.16]} />
      </Part>
      {pergolaSlats.map((z, i) => (
        <Part
          key={i}
          name={`pergola_slat_${i + 1}`}
          position={[A.x, FLOOR + 2.72, A_FRONT + 1.3 + i * 0.4]}
          baseColor="#7C6A55"
          surfaceHint="trim"
          {...shared}
        >
          <boxGeometry args={[5.4, 0.08, 0.12]} />
        </Part>
      ))}

      {/* ── Roof-mounted extras (optional) ─────────────────────────── */}
      {[-1.7, 0, 1.7].map((x, i) => (
        <Part
          key={i}
          name={`solar_array_${i + 1}`}
          position={[A.x + x, A_TOP + 0.42, A.z - 1.2]}
          rotation={[-0.28, 0, 0]}
          baseColor="#1B2A3A"
          {...shared}
        >
          <boxGeometry args={[1.5, 0.06, 2.0]} />
        </Part>
      ))}
      {[-1.2, 1.2].map((x, i) => (
        <Part
          key={i}
          name={`skylight_${i + 1}`}
          position={[A.x + x, A_TOP + 0.3, A.z + 1.4]}
          baseColor="#9FB8CC"
          {...shared}
        >
          <boxGeometry args={[1.1, 0.1, 1.1]} />
        </Part>
      ))}
      <Part
        name="chimney_stack"
        position={[A.x - 2.2, A_TOP + 0.9, A.z - 1.9]}
        baseColor="#6B7280"
        {...shared}
      >
        <boxGeometry args={[0.6, 1.6, 0.6]} />
      </Part>

      {/* ── Carport (optional) ─────────────────────────────────────── */}
      <Part
        name="carport_roof"
        position={[B.x + 3.6, FLOOR + 2.5, B.z]}
        baseColor="#8A8F94"
        surfaceHint="roof"
        {...shared}
      >
        <boxGeometry args={[4.4, 0.18, 4.6]} />
      </Part>
      {[
        [B.x + 1.6, B.z - 2.0],
        [B.x + 5.5, B.z + 2.0],
      ].map(([x, z], i) => (
        <Part
          key={i}
          name={`carport_post_${i + 1}`}
          position={[x, FLOOR + 1.25, z]}
          baseColor="#8A8F94"
          surfaceHint="trim"
          {...shared}
        >
          <boxGeometry args={[0.16, 2.5, 0.16]} />
        </Part>
      ))}

      {/* ── Planters (optional) ────────────────────────────────────── */}
      {[-3.4, 3.4].map((x, i) => (
        <Part
          key={i}
          name={`planter_box_${i + 1}`}
          position={[A.x + x, FLOOR + 0.2, A_FRONT + 1.6]}
          baseColor="#5C4634"
          surfaceHint="deck"
          {...shared}
        >
          <boxGeometry args={[0.8, 0.6, 0.8]} />
        </Part>
      ))}
    </group>
  )
}
