'use client'

/**
 * The react-three-fiber canvas. Loaded only on the client, via the
 * `next/dynamic` call in Build3DPreview — nothing here may be imported from a
 * server component.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Grid, Html, Lightformer, OrbitControls } from '@react-three/drei'
import {
  Box3,
  Vector3,
  type Group,
  type PerspectiveCamera,
  type WebGLRenderer,
  PCFShadowMap,
  PCFSoftShadowMap,
} from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  CAMERA_VIEWS,
  getEnvironment,
  type SceneDirectives,
  type StudioConfig,
} from '@/lib/product/model3d'
import { GltfModel } from './GltfModel'
import { ProceduralHome } from './ProceduralHome'
import { ViewerErrorBoundary } from './ViewerErrorBoundary'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface Props {
  modelUrl: string | null
  directives: SceneDirectives
  studio: StudioConfig
  /** Bumped by the shell's Reset button to re-frame the model. */
  resetKey: number
  onPartsDiscovered?: (nodeNames: string[]) => void
  onCanvasReady?: (renderer: WebGLRenderer) => void
  onModelError?: (message: string) => void
}

/* ------------------------------------------------------------------ *
 * Camera framing
 * ------------------------------------------------------------------ */

const FALLBACK_CENTER = new Vector3(0, 1.6, 0)
const FALLBACK_RADIUS = 8
const WORLD_UP = new Vector3(0, 1, 0)
/** Breathing room around the fitted model. */
const FIT_MARGIN = 1.22

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Frames whatever model is loaded and animates between the named view presets.
 *
 * Only drives the camera while a transition is in flight, so it never fights
 * the buyer mid-orbit.
 */
function CameraRig({
  modelRef,
  view,
  resetKey,
  fitKey,
}: {
  modelRef: React.RefObject<Group | null>
  view: string
  resetKey: number
  fitKey: number
}) {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null

  const desiredPosition = useRef(new Vector3())
  const desiredTarget = useRef(new Vector3())
  const animating = useRef(false)

  useEffect(() => {
    const preset = CAMERA_VIEWS.find((v) => v.id === view) ?? CAMERA_VIEWS[0]
    const direction = new Vector3(...preset.direction).normalize()

    const center = FALLBACK_CENTER.clone()
    const size = new Vector3(FALLBACK_RADIUS, FALLBACK_RADIUS, FALLBACK_RADIUS)

    const group = modelRef.current
    if (group) {
      const box = new Box3().setFromObject(group)
      if (!box.isEmpty()) {
        box.getCenter(center)
        box.getSize(size)
      }
    }

    /*
     * Fit the box against the frustum rather than its bounding sphere: a home
     * is wide and shallow, so sphere-fitting would push the camera far enough
     * back to leave most of a 16:10 viewport empty.
     */
    const right = new Vector3().crossVectors(WORLD_UP, direction)
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0) // straight-down aerial view
    right.normalize()
    const up = new Vector3().crossVectors(direction, right).normalize()

    const extentAlong = (axis: Vector3) =>
      0.5 *
      (Math.abs(axis.x) * size.x + Math.abs(axis.y) * size.y + Math.abs(axis.z) * size.z)

    const perspective = camera as PerspectiveCamera
    const tanHalfFov = Math.tan(((perspective.fov ?? 36) * Math.PI) / 360)
    const aspect = perspective.aspect || 1

    const distanceForHeight = extentAlong(up) / tanHalfFov
    const distanceForWidth = extentAlong(right) / (tanHalfFov * aspect)
    const distance = clamp(FIT_MARGIN * Math.max(distanceForHeight, distanceForWidth), 4, 60)

    desiredTarget.current.copy(center)
    desiredPosition.current.copy(center).addScaledVector(direction, distance)
    animating.current = true
  }, [modelRef, camera, view, resetKey, fitKey])

  useFrame((_, delta) => {
    if (!animating.current) return

    // Frame-rate independent easing.
    const alpha = 1 - Math.pow(0.0015, delta)
    camera.position.lerp(desiredPosition.current, alpha)

    if (controls) {
      controls.target.lerp(desiredTarget.current, alpha)
      controls.update()
    } else {
      camera.lookAt(desiredTarget.current)
    }

    if (camera.position.distanceTo(desiredPosition.current) < 0.03) {
      camera.position.copy(desiredPosition.current)
      animating.current = false
    }
  })

  return null
}

/* ------------------------------------------------------------------ *
 * Loading indicator (inside the canvas so drei stays in this chunk)
 * ------------------------------------------------------------------ */

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent"
          style={{ borderColor: `${GOLD} transparent ${PURPLE} ${PURPLE}` }}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Loading model
        </span>
      </div>
    </Html>
  )
}

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

function Scene({
  modelUrl,
  directives,
  studio,
  resetKey,
  onPartsDiscovered,
  onModelError,
}: Omit<Props, 'onCanvasReady'>) {
  const env = getEnvironment(studio.environment)
  const modelRef = useRef<Group | null>(null)
  const [fitKey, setFitKey] = useState(0)

  // Discovering parts also tells us the model finished loading, which is the
  // right moment to re-frame the camera around its real bounds.
  const handleParts = useCallback(
    (names: string[]) => {
      setFitKey((k) => k + 1)
      onPartsDiscovered?.(names)
    },
    [onPartsDiscovered]
  )

  const fallbackHome = (
    <ProceduralHome directives={directives} studio={studio} onPartsDiscovered={handleParts} />
  )

  return (
    <>
      <hemisphereLight args={[env.skyColor, env.groundColor]} intensity={env.ambientIntensity} />
      <ambientLight intensity={env.ambientIntensity * 0.5} color={env.skyColor} />
      <directionalLight
        castShadow
        position={env.keyPosition}
        intensity={env.keyIntensity}
        color={env.keyColor}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-far={48}
      />
      <directionalLight
        position={[-env.keyPosition[0], env.keyPosition[1] * 0.6, -env.keyPosition[2]]}
        intensity={env.fillIntensity}
        color={env.fillColor}
      />

      {/*
        Portal-mode Environment: the reflection map is rendered from these
        Lightformers rather than fetched from drei's HDRI CDN, so the viewer
        works offline and under a strict CSP. Keyed so a preset change
        re-renders the cube map.
      */}
      <Environment key={env.id} resolution={256} frames={1}>
        <Lightformer
          intensity={env.lightformerIntensity}
          color={env.lightformerColor}
          position={[0, 6, -9]}
          scale={[12, 8, 1]}
        />
        <Lightformer
          intensity={env.lightformerIntensity * 0.55}
          color={env.skyColor}
          position={[-9, 4, 4]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[9, 7, 1]}
        />
        <Lightformer
          intensity={env.lightformerIntensity * 0.35}
          color={env.groundColor}
          position={[0, -5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[16, 16, 1]}
        />
      </Environment>

      <group ref={modelRef}>
        <Suspense fallback={<CanvasLoader />}>
          {modelUrl ? (
            <ViewerErrorBoundary fallback={fallbackHome} onError={onModelError}>
              <GltfModel
                url={modelUrl}
                directives={directives}
                studio={studio}
                onPartsDiscovered={handleParts}
              />
            </ViewerErrorBoundary>
          ) : (
            fallbackHome
          )}
        </Suspense>
      </group>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={env.shadowOpacity}
        scale={38}
        blur={2.4}
        far={12}
        resolution={1024}
        color="#1a1a2e"
      />

      {studio.showGround && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <circleGeometry args={[26, 64]} />
            <meshStandardMaterial color={env.groundColor} roughness={1} metalness={0} />
          </mesh>
          <Grid
            position={[0, 0.02, 0]}
            args={[60, 60]}
            cellSize={1}
            cellThickness={0.6}
            cellColor="#9aa0a6"
            sectionSize={5}
            sectionThickness={1.1}
            sectionColor={PURPLE}
            fadeDistance={46}
            fadeStrength={1.4}
            infiniteGrid
            followCamera={false}
          />
        </>
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        autoRotate={studio.autoRotate}
        autoRotateSpeed={0.9}
        minDistance={3}
        maxDistance={70}
        // Stop just short of the horizon so the buyer can't orbit underground.
        maxPolarAngle={Math.PI / 2 - 0.04}
        target={[0, 1.4, 0]}
      />

      <CameraRig modelRef={modelRef} view={studio.view} resetKey={resetKey} fitKey={fitKey} />
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Canvas
 * ------------------------------------------------------------------ */

export default function ModelViewer3D({ onCanvasReady, ...sceneProps }: Props) {
  const env = getEnvironment(sceneProps.studio.environment)

  const handleCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      onCanvasReady?.(gl)
      console.log('shadow type:', gl.shadowMap.type)
      console.log('PCFShadowMap:', PCFShadowMap)
      console.log('PCFSoftShadowMap:', PCFSoftShadowMap)
    },
    [onCanvasReady]
  )

  const cameraConfig = useMemo(() => ({ position: [12, 7, 14] as [number, number, number], fov: 36 }), [])

  return (
    <Canvas
      shadows={'percentage'}
      dpr={[1, 2]}
      camera={cameraConfig}
      // Required for the snapshot button — without it the drawing buffer is
      // cleared before toDataURL can read it.
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={handleCreated}
      style={{ background: env.background }}
    >
      <Scene {...sceneProps} />
    </Canvas>
  )
}
