'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  DoorOpen,
  MousePointer2,
  PaintBucket,
  Save,
  Wind,
} from 'lucide-react'
import { saveCalibration } from '@/app/actions/calibration'
import { saveCustomizationGroupAnchorLinks } from '@/app/actions/seller-configurator'
import type { HouseAnchor, AnchorType } from '@/types/configurator'
import type { CustomizationGroupWithRelations } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PURPLE = '#4B1D8F'

type VisualType = 'door' | 'window' | 'wall-color' | 'generic'

type LinkableGroup = Pick<
  CustomizationGroupWithRelations,
  'id' | 'name' | 'target_anchor_id' | 'visual_type' | 'options'
>

interface Props {
  product: { id: string; name: string; slug: string }
  initialSettings: { id?: string; base_image_url: string; anchors: HouseAnchor[] } | null
  mainImage: string
  groups: LinkableGroup[]
}

const TOOL_OPTIONS: Array<{ value: AnchorType; label: string }> = [
  { value: 'door', label: 'Door' },
  { value: 'window', label: 'Window' },
  { value: 'wall-mask', label: 'Wall' },
]

const VISUAL_TYPE_OPTIONS: Array<{ value: VisualType; label: string }> = [
  { value: 'generic', label: 'Generic' },
  { value: 'door', label: 'Door' },
  { value: 'window', label: 'Window' },
  { value: 'wall-color', label: 'Wall Color' },
]

const anchorTypeToLabel = (anchorType: AnchorType) => {
  switch (anchorType) {
    case 'door':
      return 'Door'
    case 'window':
      return 'Window'
    case 'wall-mask':
      return 'Wall'
  }
}

const visualTypeToAnchorType = (visualType: VisualType): AnchorType | null => {
  switch (visualType) {
    case 'door':
      return 'door'
    case 'window':
      return 'window'
    case 'wall-color':
      return 'wall-mask'
    default:
      return null
  }
}

const getAnchorAccent = (anchorType: AnchorType) => {
  switch (anchorType) {
    case 'door':
      return 'border-blue-500 bg-blue-500/10'
    case 'window':
      return 'border-cyan-500 bg-cyan-500/10'
    case 'wall-mask':
      return 'border-orange-500 bg-orange-500/10'
  }
}

const getAnchorIcon = (anchorType: AnchorType) => {
  switch (anchorType) {
    case 'door':
      return DoorOpen
    case 'window':
      return Wind
    case 'wall-mask':
      return PaintBucket
  }
}

export default function VisualConfiguratorBuilder({
  product,
  initialSettings,
  mainImage,
  groups,
}: Props) {
  const [anchors, setAnchors] = useState<HouseAnchor[]>(initialSettings?.anchors ?? [])
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSettings?.anchors?.[0]?.id ?? null
  )
  const [activeTool, setActiveTool] = useState<AnchorType>('door')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [groupMappings, setGroupMappings] = useState(
    groups.map((group) => ({
      id: group.id,
      name: group.name,
      target_anchor_id: group.target_anchor_id,
      visual_type: (group.visual_type ?? 'generic') as VisualType,
      optionCount: group.options.length,
    }))
  )

  const containerRef = useRef<HTMLDivElement>(null)

  const selectedAnchor = useMemo(
    () => anchors.find((anchor) => anchor.id === selectedId) ?? null,
    [anchors, selectedId]
  )

  const anchorMap = useMemo(() => new Map(anchors.map((anchor) => [anchor.id, anchor])), [anchors])

  const validation = useMemo(() => {
    const linkedGroups = groupMappings.filter((group) => Boolean(group.target_anchor_id))
    const missingMappings = groupMappings.filter(
      (group) => group.visual_type !== 'generic' && !group.target_anchor_id
    )
    const invalidTypeLinks = groupMappings.filter((group) => {
      if (!group.target_anchor_id) return false
      const anchor = anchorMap.get(group.target_anchor_id)
      if (!anchor) return true
      const expectedAnchorType = visualTypeToAnchorType(group.visual_type)
      return expectedAnchorType ? anchor.anchor_type !== expectedAnchorType : false
    })
    const missingWallMasks = groupMappings.filter((group) => {
      if (group.visual_type !== 'wall-color' || !group.target_anchor_id) return false
      const anchor = anchorMap.get(group.target_anchor_id)
      return !anchor || !anchor.mask_url
    })
    const emptyGroups = groupMappings.filter((group) => group.optionCount === 0)

    return {
      hasBaseImage: Boolean(mainImage),
      anchorCount: anchors.length,
      linkedGroupCount: linkedGroups.length,
      missingMappings,
      invalidTypeLinks,
      missingWallMasks,
      emptyGroups,
      isReady:
        Boolean(mainImage) &&
        anchors.length > 0 &&
        missingMappings.length === 0 &&
        invalidTypeLinks.length === 0 &&
        missingWallMasks.length === 0,
    }
  }, [anchorMap, anchors.length, groupMappings, mainImage])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    if ((e.target as HTMLElement).closest('.anchor-box')) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setIsDrawing(true)
    setStartPos({ x, y })
    setCurrentPos({ x, y })
    setSaveMessage(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setCurrentPos({ x, y })
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const x = Math.min(startPos.x, currentPos.x)
    const y = Math.min(startPos.y, currentPos.y)
    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    if (width > 1 && height > 1) {
      const newAnchor: HouseAnchor = {
        id: crypto.randomUUID(),
        house_id: initialSettings?.id || '',
        anchor_type: activeTool,
        label: `${anchorTypeToLabel(activeTool)} ${anchors.filter((a) => a.anchor_type === activeTool).length + 1}`,
        x_pos: x,
        y_pos: y,
        width,
        height,
        z_index: 10,
      }

      setAnchors((current) => [...current, newAnchor])
      setSelectedId(newAnchor.id ?? null)
    }
  }

  const updateAnchor = (anchorId: string, updates: Partial<HouseAnchor>) => {
    setAnchors((current) =>
      current.map((anchor) => (anchor.id === anchorId ? { ...anchor, ...updates } : anchor))
    )
  }

  const deleteAnchor = (anchorId: string) => {
    setAnchors((current) => current.filter((anchor) => anchor.id !== anchorId))
    setGroupMappings((current) =>
      current.map((group) =>
        group.target_anchor_id === anchorId ? { ...group, target_anchor_id: null } : group
      )
    )
    setSelectedId((current) => (current === anchorId ? null : current))
  }

  const updateGroupMapping = (
    groupId: string,
    field: 'target_anchor_id' | 'visual_type',
    value: string | null
  ) => {
    setGroupMappings((current) =>
      current.map((group) => (group.id === groupId ? { ...group, [field]: value } : group))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    const calibrationResult = await saveCalibration({
      productId: product.id,
      mainImage,
      existingSettingsId: initialSettings?.id,
      anchors,
    })

    if (calibrationResult.error) {
      setIsSaving(false)
      setSaveMessage(calibrationResult.error)
      return
    }

    if (calibrationResult.anchors) {
      setAnchors(calibrationResult.anchors)
      if (selectedId && !calibrationResult.anchors.some((anchor) => anchor.id === selectedId)) {
        setSelectedId(calibrationResult.anchors[0]?.id ?? null)
      }
    }

    const linkResult = await saveCustomizationGroupAnchorLinks({
      productId: product.id,
      groups: groupMappings.map((group) => ({
        id: group.id,
        target_anchor_id: group.target_anchor_id,
        visual_type: group.visual_type,
      })),
    })

    setIsSaving(false)
    setSaveMessage(linkResult.error ?? 'Visual configurator saved successfully.')
  }

  return (
    <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
      <div
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: `${PURPLE}22` }}
      >
        <div className="mb-5 flex items-center gap-3">
          <Link
            href={`/seller/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: PURPLE }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Product
          </Link>
        </div>

        <div className="mb-4 rounded-2xl p-4" style={{ backgroundColor: '#F5F4F7' }}>
          <h1 className="text-lg font-black text-gray-900">Visual Configurator</h1>
          <p className="mt-1 text-sm text-gray-600">
            Define where each seller customization affects the base image for {product.name}.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Add Visual Part
            </Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TOOL_OPTIONS.map((tool) => {
                const Icon = getAnchorIcon(tool.value)
                const isActive = activeTool === tool.value
                return (
                  <button
                    key={tool.value}
                    type="button"
                    onClick={() => setActiveTool(tool.value)}
                    className="flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-all"
                    style={{
                      borderColor: isActive ? PURPLE : `${PURPLE}22`,
                      backgroundColor: isActive ? '#EDE9F6' : 'white',
                      color: isActive ? PURPLE : '#475569',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {tool.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Defined Anchors
            </Label>
            <div className="mt-2 space-y-2">
              {anchors.map((anchor) => {
                const Icon = getAnchorIcon(anchor.anchor_type)
                const isSelected = selectedId === anchor.id
                return (
                  <button
                    key={anchor.id}
                    type="button"
                    onClick={() => setSelectedId(anchor.id ?? null)}
                    className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all"
                    style={{
                      borderColor: isSelected ? PURPLE : `${PURPLE}22`,
                      backgroundColor: isSelected ? '#F5F0FF' : 'white',
                    }}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm font-semibold text-gray-800">
                        {anchor.label}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold uppercase text-gray-500">
                      {anchorTypeToLabel(anchor.anchor_type)}
                    </span>
                  </button>
                )
              })}
              {anchors.length === 0 && (
                <div className="rounded-xl border-2 border-dashed p-4 text-center text-sm text-gray-500">
                  <MousePointer2 className="mx-auto mb-2 h-5 w-5 opacity-60" />
                  Click and drag on the image to create a new anchor.
                </div>
              )}
            </div>
          </div>

          {selectedAnchor && selectedAnchor.id && (
            <div className="rounded-2xl border p-4" style={{ borderColor: `${PURPLE}22` }}>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Selected Anchor
                </Label>
                <button
                  type="button"
                  onClick={() => deleteAnchor(selectedAnchor.id!)}
                  className="text-xs font-bold text-red-500"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="anchor-label">Label</Label>
                  <Input
                    id="anchor-label"
                    value={selectedAnchor.label}
                    onChange={(e) => updateAnchor(selectedAnchor.id!, { label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="anchor-type">Type</Label>
                  <Select
                    value={selectedAnchor.anchor_type}
                    onValueChange={(value: AnchorType) =>
                      updateAnchor(selectedAnchor.id!, { anchor_type: value })
                    }
                  >
                    <SelectTrigger id="anchor-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOOL_OPTIONS.map((tool) => (
                        <SelectItem key={tool.value} value={tool.value}>
                          {tool.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="anchor-x">X %</Label>
                    <Input
                      id="anchor-x"
                      type="number"
                      value={selectedAnchor.x_pos}
                      onChange={(e) =>
                        updateAnchor(selectedAnchor.id!, { x_pos: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="anchor-y">Y %</Label>
                    <Input
                      id="anchor-y"
                      type="number"
                      value={selectedAnchor.y_pos}
                      onChange={(e) =>
                        updateAnchor(selectedAnchor.id!, { y_pos: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="anchor-width">Width %</Label>
                    <Input
                      id="anchor-width"
                      type="number"
                      value={selectedAnchor.width}
                      onChange={(e) =>
                        updateAnchor(selectedAnchor.id!, { width: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="anchor-height">Height %</Label>
                    <Input
                      id="anchor-height"
                      type="number"
                      value={selectedAnchor.height}
                      onChange={(e) =>
                        updateAnchor(selectedAnchor.id!, { height: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="anchor-z">Z-Index</Label>
                  <Input
                    id="anchor-z"
                    type="number"
                    value={selectedAnchor.z_index}
                    onChange={(e) =>
                      updateAnchor(selectedAnchor.id!, { z_index: Number(e.target.value) })
                    }
                  />
                </div>
                {selectedAnchor.anchor_type === 'wall-mask' && (
                  <div>
                    <Label htmlFor="mask-url">Wall Mask URL</Label>
                    <Input
                      id="mask-url"
                      value={selectedAnchor.mask_url ?? ''}
                      placeholder="https://.../wall-mask.png"
                      onChange={(e) =>
                        updateAnchor(selectedAnchor.id!, { mask_url: e.target.value })
                      }
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use a mask PNG so only the wall shape recolors, not the entire rectangle.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: `${PURPLE}22` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Base Image Calibration</h2>
            <p className="text-sm text-gray-600">
              Draw anchors directly on the seller-selected base image.
            </p>
          </div>
          <div
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: '#EDE9F6', color: PURPLE }}
          >
            Active Tool: {anchorTypeToLabel(activeTool)}
          </div>
        </div>

        <div className="relative flex h-full min-h-[620px] items-center justify-center rounded-2xl bg-slate-50 p-6">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative w-full max-w-[1100px] overflow-hidden rounded-2xl bg-white shadow-xl select-none"
            style={{ aspectRatio: '16 / 9', cursor: 'crosshair' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-contain pointer-events-none"
            />

            {anchors.map((anchor) => {
              const Icon = getAnchorIcon(anchor.anchor_type)
              const isSelected = selectedId === anchor.id
              return (
                <div
                  key={anchor.id}
                  className={`anchor-box absolute border-2 transition-all ${getAnchorAccent(anchor.anchor_type)} ${isSelected ? 'ring-2 ring-offset-1 ring-purple-400' : ''}`}
                  style={{
                    left: `${anchor.x_pos}%`,
                    top: `${anchor.y_pos}%`,
                    width: `${anchor.width}%`,
                    height: `${anchor.height}%`,
                    zIndex: anchor.z_index,
                  }}
                  onClick={() => setSelectedId(anchor.id ?? null)}
                >
                  <div
                    className="absolute left-0 top-0 flex -translate-y-full items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: PURPLE }}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{anchor.label}</span>
                  </div>
                </div>
              )
            })}

            {isDrawing && (
              <div
                className="absolute z-[100] border-2 border-dashed border-purple-500 bg-purple-500/10"
                style={{
                  left: `${Math.min(startPos.x, currentPos.x)}%`,
                  top: `${Math.min(startPos.y, currentPos.y)}%`,
                  width: `${Math.abs(currentPos.x - startPos.x)}%`,
                  height: `${Math.abs(currentPos.y - startPos.y)}%`,
                }}
              />
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border bg-white/95 px-4 py-2 text-xs shadow-sm">
            <span className="font-semibold text-gray-700">Tip:</span> Click + drag to place a{' '}
            {anchorTypeToLabel(activeTool).toLowerCase()} anchor.
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: `${PURPLE}22` }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-black text-gray-900">Customization Mapping</h2>
          <p className="text-sm text-gray-600">
            Link each seller customization group to the exact visual anchor it controls.
          </p>
        </div>

        <div className="space-y-3">
          {groupMappings.map((group) => {
            const compatibleAnchorType = visualTypeToAnchorType(group.visual_type)
            const compatibleAnchors = compatibleAnchorType
              ? anchors.filter((anchor) => anchor.anchor_type === compatibleAnchorType)
              : anchors

            return (
              <div
                key={group.id}
                className="rounded-2xl border p-4"
                style={{ borderColor: `${PURPLE}22` }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-500">
                      {group.optionCount} option{group.optionCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                    {group.visual_type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Visual Type</Label>
                    <Select
                      value={group.visual_type}
                      onValueChange={(value: VisualType) =>
                        updateGroupMapping(group.id, 'visual_type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISUAL_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Anchor</Label>
                    <Select
                      value={group.target_anchor_id ?? '__none__'}
                      onValueChange={(value) =>
                        updateGroupMapping(
                          group.id,
                          'target_anchor_id',
                          value === '__none__' ? null : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select anchor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {compatibleAnchors.map((anchor) => (
                          <SelectItem key={anchor.id} value={anchor.id!}>
                            {anchor.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="mt-6 rounded-2xl border p-4"
          style={{
            borderColor: validation.isReady ? '#BBF7D0' : '#FDE68A',
            backgroundColor: validation.isReady ? '#F0FDF4' : '#FFFBEB',
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            {validation.isReady ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <CircleAlert className="h-5 w-5 text-amber-600" />
            )}
            <h3 className="text-sm font-black text-gray-900">Validation Summary</h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-700">
            <li>Base image selected: {validation.hasBaseImage ? 'Yes' : 'No'}</li>
            <li>Anchors defined: {validation.anchorCount}</li>
            <li>Groups linked: {validation.linkedGroupCount}</li>
            <li>Groups missing mapping: {validation.missingMappings.length}</li>
            <li>Invalid type links: {validation.invalidTypeLinks.length}</li>
            <li>Wall mappings missing mask: {validation.missingWallMasks.length}</li>
          </ul>
        </div>

        <div className="mt-6 space-y-3">
          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              'Saving…'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Visual Configurator
              </>
            )}
          </Button>
          {saveMessage && (
            <p
              className={`text-sm ${saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}
            >
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
