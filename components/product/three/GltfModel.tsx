'use client'

/**
 * Loads a product's GLB and drives it from the same scene directives the
 * procedural fallback uses. Node names in the asset are matched loosely, so a
 * mesh called `Roof_Panel_01` is picked up by a "Roof Colour" customization
 * group without any per-product wiring.
 */

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, type Material, type Object3D } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import {
  getFinish,
  resolveNodeAppearance,
  type SceneDirectives,
  type StudioConfig,
} from '@/lib/product/model3d'

interface Props {
  url: string
  directives: SceneDirectives
  studio: StudioConfig
  onPartsDiscovered?: (nodeNames: string[]) => void
}

function isStandardMaterial(material: Material): material is MeshStandardMaterial {
  return (material as MeshStandardMaterial).isMeshStandardMaterial === true
}

function materialsOf(mesh: Mesh): Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material]
}

export function GltfModel({ url, directives, studio, onPartsDiscovered }: Props) {
  const { scene } = useGLTF(url)

  /**
   * drei caches one scene instance per URL and hands the same object to every
   * consumer, so it must be deep-cloned before we touch it. Materials are
   * shared even after a clone, hence the second pass — without it, recolouring
   * here would bleed into every other mount of the same model.
   */
  const model = useMemo(() => {
    const root = SkeletonUtils.clone(scene)
    root.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      child.material = Array.isArray(child.material)
        ? child.material.map((m) => m.clone())
        : child.material.clone()
    })
    return root
  }, [scene])

  /** Base colour of each cloned material, so an unset override can restore it. */
  const baseColors = useRef(new WeakMap<Material, number>())

  useLayoutEffect(() => {
    const store = baseColors.current
    model.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) return
      for (const material of materialsOf(child)) {
        if (isStandardMaterial(material) && !store.has(material)) {
          store.set(material, material.color.getHex())
        }
      }
    })
  }, [model])

  // Free the cloned materials when the model is swapped out or unmounted.
  useEffect(() => {
    return () => {
      model.traverse((child: Object3D) => {
        if (!(child instanceof Mesh)) return
        for (const material of materialsOf(child)) material.dispose()
      })
    }
  }, [model])

  useEffect(() => {
    if (!onPartsDiscovered) return
    const names: string[] = []
    model.traverse((child: Object3D) => {
      if (child.name) names.push(child.name)
    })
    onPartsDiscovered(names)
  }, [model, onPartsDiscovered])

  // Re-apply visibility and materials whenever the buyer changes anything.
  useLayoutEffect(() => {
    const finish = getFinish(studio.finish)
    const store = baseColors.current

    model.traverse((child: Object3D) => {
      // Visibility is resolved for every node, not just meshes: assets
      // routinely wrap a removable feature in a named empty/group, and hiding
      // the parent takes the whole subtree with it.
      const appearance = resolveNodeAppearance(child.name, directives, studio)
      child.visible = appearance.visible

      if (!(child instanceof Mesh)) return

      for (const material of materialsOf(child)) {
        if (!isStandardMaterial(material)) continue

        material.wireframe = studio.wireframe
        material.roughness = finish.roughness
        material.metalness = finish.metalness
        material.envMapIntensity = finish.envIntensity

        if (appearance.color) {
          material.color.set(appearance.color)
        } else {
          const base = store.get(material)
          if (base !== undefined) material.color.setHex(base)
        }

        material.needsUpdate = true
      }
    })
  }, [model, directives, studio])

  return <primitive object={model} />
}
