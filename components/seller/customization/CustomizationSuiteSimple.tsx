'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Sparkles, RefreshCcw, Save, Trash2, Eye, Upload } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { scanProductImageAction } from '@/app/actions/customization-scanner'
import { uploadProductImage } from '@/lib/uploadProductImage'

interface VariantSlot {
  file: File | null
  existingUrl?: string | null
  code: string
  price: string
  isMaster: boolean
}

function getSafeMaskUrl(url: string | null | undefined): string {
  if (!url) return 'none'
  if (url.startsWith('data:image/svg+xml;utf8,')) {
    const rawSvg = url.substring('data:image/svg+xml;utf8,'.length)
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`
  }
  return url
}

interface CustomizationSuiteSimpleProps {
  productId: string
  userId: string
  initialEnabled?: boolean
  customGroups?: any[]
  onCustomGroupsChange?: (groups: any[]) => void
  variants: VariantSlot[]
}

interface OptionItem {
  id: string
  name: string
  priceModifier: number
  colorHex: string | null
  imageUrl: string | null
  description?: string | null
}

interface ZoneGroup {
  id: string // zone_id or temporary group id
  name: string // e.g., "Seat Cushions"
  targetZoneId: string | null
  maskUrl: string | null
  options: OptionItem[]
}

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

const PRESET_COLORS = [
  '#4B1D8F', // Brand Purple
  '#D4AF37', // Brand Gold
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#6B7280', // Gray
  '#FFFFFF', // White
  '#000000', // Black
]

export function CustomizationSuiteSimple({
  productId,
  userId,
  initialEnabled = false,
  customGroups = [],
  onCustomGroupsChange,
  variants,
}: CustomizationSuiteSimpleProps) {
  const [zones, setZones] = useState<ZoneGroup[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)
  const [scanningError, setScanningError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  // Find the master image from the variants array
  const masterVariant = variants.find((v) => v.isMaster) || variants[0]
  const masterImageUrl = masterVariant
    ? masterVariant.file
      ? URL.createObjectURL(masterVariant.file)
      : masterVariant.existingUrl
    : null

  // Load initial data (if product is existing)
  useEffect(() => {
    async function loadData() {
      if (productId === 'new' || !productId.match(/^[0-9a-fA-F-]{36}$/)) {
        // For new products, transform initial groups state if available
        if (customGroups && customGroups.length > 0) {
          const transformed = customGroups.map((g: any) => ({
            id: g.id || `group-${Math.random().toString(36).substr(2, 9)}`,
            name: g.name,
            targetZoneId: g.targetZoneId || null,
            maskUrl: g.maskUrl || null,
            options: (g.options || []).map((o: any) => ({
              id: o.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
              name: o.name,
              priceModifier: o.priceModifier || 0,
              colorHex: o.colorHex || null,
              imageUrl: o.imageUrl || null,
              description: o.description || null,
            })),
          }))
          setZones(transformed)
        }
        return
      }

      // Fetch existing customization zones and groups for this product
      try {
        const { data: zonesData } = await supabase
          .from('product_customization_zones')
          .select('*')
          .eq('product_id', productId)

        const { data: groupsData } = await supabase
          .from('product_customization_groups')
          .select('*, options:product_customization_options(*)')
          .eq('product_id', productId)

        if (zonesData && zonesData.length > 0) {
          const mapped: ZoneGroup[] = zonesData.map((z: any) => {
            const relatedGroup = groupsData?.find((g: any) => g.target_zone_id === z.id)
            return {
              id: z.id,
              name: z.name,
              targetZoneId: z.id,
              maskUrl: z.mask_url,
              options: relatedGroup
                ? relatedGroup.options.map((o: any) => ({
                    id: o.id,
                    name: o.name,
                    priceModifier: Number(o.price_modifier),
                    colorHex: o.color_hex,
                    imageUrl: o.image_url,
                    description: o.description,
                  }))
                : [],
            }
          })
          setZones(mapped)
        }
      } catch (err) {
        console.error('Error fetching customization zones:', err)
      }
    }
    loadData()
  }, [productId, customGroups.length === 0])

  // Trigger scanning of the master image
  const handleScanImage = async () => {
    if (!masterImageUrl) {
      setScanningError('Please upload a master image first.')
      return
    }

    setIsScanning(true)
    setScanningError(null)

    try {
      let scanUrl = masterImageUrl

      // If master image is a local File, upload it to temporary storage first to get a URL
      if (masterVariant.file) {
        const url = await uploadProductImage(masterVariant.file, userId, 0)
        scanUrl = url
      }

      if (!scanUrl) {
        throw new Error('Could not resolve master image URL.')
      }

      const result = await scanProductImageAction(productId, scanUrl)
      if (result.success && result.zones) {
        const newZones: ZoneGroup[] = result.zones.map((z: any) => ({
          id: z.id || `zone-${Math.random().toString(36).substr(2, 9)}`,
          name: z.name,
          targetZoneId: z.id || null,
          maskUrl: z.mask_url,
          options: [],
        }))

        setZones(newZones)
        syncToParent(newZones)
      } else {
        throw new Error(result.error || 'Failed to scan image')
      }
    } catch (err: any) {
      console.error(err)
      setScanningError(err.message || 'Scan failed.')
    } finally {
      setIsScanning(false)
    }
  }

  // Sync state back to parent form
  const syncToParent = (updatedZones: ZoneGroup[]) => {
    if (!onCustomGroupsChange) return
    const parentGroups = updatedZones.map((z) => ({
      id: z.id,
      name: z.name,
      targetZoneId: z.targetZoneId,
      maskUrl: z.maskUrl,
      options: z.options.map((o) => ({
        id: o.id,
        name: o.name,
        priceModifier: o.priceModifier,
        colorHex: o.colorHex,
        imageUrl: o.imageUrl,
        description: o.description,
      })),
    }))
    onCustomGroupsChange(parentGroups)
  }

  // Update a zone's name
  const handleRenameZone = (zoneId: string, newName: string) => {
    const updated = zones.map((z) => (z.id === zoneId ? { ...z, name: newName } : z))
    setZones(updated)
    syncToParent(updated)
  }

  // Update a zone's mask URL
  const handleUpdateZoneMask = (zoneId: string, maskUrl: string) => {
    const updated = zones.map((z) => (z.id === zoneId ? { ...z, maskUrl } : z))
    setZones(updated)
    syncToParent(updated)
  }

  const handleMaskUpload = (zoneId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (!text.includes('<svg')) {
        alert('Please upload a valid SVG file.')
        return
      }
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(text)}`
      handleUpdateZoneMask(zoneId, dataUri)
    }
    reader.readAsText(file)
  }

  // Delete a zone
  const handleDeleteZone = (zoneId: string) => {
    if (!confirm('Are you sure you want to remove this zone?')) return
    const updated = zones.filter((z) => z.id !== zoneId)
    setZones(updated)
    syncToParent(updated)
  }

  // Add a new empty zone manually (Fallback Path)
  const handleAddZoneManually = () => {
    const newZone: ZoneGroup = {
      id: `zone-${Math.random().toString(36).substr(2, 9)}`,
      name: `Custom Zone ${zones.length + 1}`,
      targetZoneId: null,
      maskUrl: null,
      options: [],
    }
    const updated = [...zones, newZone]
    setZones(updated)
    syncToParent(updated)
  }

  // Add an option to a zone
  const handleAddOption = (zoneId: string) => {
    const updated = zones.map((z) => {
      if (z.id !== zoneId) return z
      const newOpt: OptionItem = {
        id: `opt-${Math.random().toString(36).substr(2, 9)}`,
        name: 'New Custom Choice',
        priceModifier: 0,
        colorHex: '#4B1D8F',
        imageUrl: null,
      }
      return {
        ...z,
        options: [...z.options, newOpt],
      }
    })
    setZones(updated)
    syncToParent(updated)
  }

  // Update option properties
  const handleUpdateOption = (zoneId: string, optionId: string, fields: Partial<OptionItem>) => {
    const updated = zones.map((z) => {
      if (z.id !== zoneId) return z
      return {
        ...z,
        options: z.options.map((o) => (o.id === optionId ? { ...o, ...fields } : o)),
      }
    })
    setZones(updated)
    syncToParent(updated)
  }

  // Remove option from zone
  const handleRemoveOption = (zoneId: string, optionId: string) => {
    const updated = zones.map((z) => {
      if (z.id !== zoneId) return z
      return {
        ...z,
        options: z.options.filter((o) => o.id !== optionId),
      }
    })
    setZones(updated)
    syncToParent(updated)
  }

  return (
    <div className="space-y-6">
      {/* AI Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-700 animate-pulse" />
            <h4 className="text-sm font-bold text-purple-900">AI Segmentation scan (SAM)</h4>
          </div>
          <p className="text-xs text-purple-700/80 leading-relaxed max-w-xl">
            Click scan to automatically analyze the image, find customization areas (cushions, frames, doors), and name them automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={handleScanImage}
          disabled={isScanning || !masterImageUrl}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group shrink-0"
          style={{ background: `linear-gradient(135deg, ${PURPLE}, #6B46C1)` }}
        >
          {isScanning ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          )}
          <span>{isScanning ? 'Scanning Image...' : 'Auto-Scan Image'}</span>
        </button>
      </div>

      {scanningError && (
        <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {scanningError}
        </div>
      )}

      {/* Editor Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Highlight Mask Overlay */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
            {masterImageUrl ? (
              <>
                <img
                  src={masterImageUrl}
                  alt="Product customization scan"
                  className="w-full h-full object-contain"
                />

                {/* SVG Mask Overlays */}
                {zones.map((zone) => {
                  if (!zone.maskUrl) return null
                  const isHovered = hoveredZoneId === zone.id
                  return (
                    <div
                      key={zone.id}
                      className="absolute inset-0 pointer-events-none transition-all duration-300"
                      style={{
                        maskImage: `url("${getSafeMaskUrl(zone.maskUrl)}")`,
                        WebkitMaskImage: `url("${getSafeMaskUrl(zone.maskUrl)}")`,
                        maskSize: '100% 100%',
                        WebkitMaskSize: '100% 100%',
                        backgroundColor: isHovered ? 'rgba(75, 29, 143, 0.65)' : 'rgba(212, 175, 55, 0.25)',
                      }}
                    />
                  )
                })}
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs text-gray-400 font-semibold">
                  Upload a master image to preview custom zones.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 bg-gray-50 p-2.5 rounded-xl border">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]/50" /> Proposed Zones
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#4B1D8F]/75" /> Active Hover
            </span>
          </div>
        </div>

        {/* Right Column: Zones Table & Options List */}
        <div className="lg:col-span-8 space-y-4">
          {zones.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <p className="text-xs text-gray-400 font-medium">
                No customization zones found. Click "Auto-Scan Image" above to generate zones.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onMouseEnter={() => setHoveredZoneId(zone.id)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    hoveredZoneId === zone.id
                      ? 'border-purple-300 bg-purple-50/10 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Zone Header */}
                  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold shrink-0">
                        Z
                      </span>
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => handleRenameZone(zone.id, e.target.value)}
                        placeholder="Zone name (e.g. Cushions)"
                        className="text-xs font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none py-0.5 px-1 w-full max-w-sm rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                        <Upload className="h-3 w-3" />
                        Upload Mask
                        <input
                          type="file"
                          accept=".svg"
                          className="hidden"
                          onChange={(e) => handleMaskUpload(zone.id, e)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Delete Zone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {zone.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        {/* Color Picker Swatch */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            value={opt.colorHex || '#4B1D8F'}
                            onChange={(e) =>
                              handleUpdateOption(zone.id, opt.id, { colorHex: e.target.value })
                            }
                            className="h-6 w-6 rounded-full border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                          />
                        </div>

                        {/* Name Input */}
                        <div className="flex-1 min-w-[120px]">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) =>
                              handleUpdateOption(zone.id, opt.id, { name: e.target.value })
                            }
                            placeholder="Option name (e.g. Forest Green)"
                            className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:border-purple-600 focus:outline-none"
                          />
                        </div>

                        {/* Price Modifier Input */}
                        <div className="w-[100px] flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">$</span>
                          <input
                            type="number"
                            value={opt.priceModifier}
                            onChange={(e) =>
                              handleUpdateOption(zone.id, opt.id, {
                                priceModifier: Number(e.target.value) || 0,
                              })
                            }
                            placeholder="Price"
                            className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:border-purple-600 focus:outline-none"
                          />
                        </div>

                        {/* Remove Option */}
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(zone.id, opt.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200/50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddOption(zone.id)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 bg-white hover:bg-gray-50 border border-dashed border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 transition-all active:scale-[0.99]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Custom Choice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Zone Manually Button */}
          <button
            type="button"
            onClick={handleAddZoneManually}
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl text-xs font-bold text-purple-700 hover:text-purple-900 transition-all bg-purple-50/20 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Add Custom Zone Manually
          </button>
        </div>
      </div>
    </div>
  )
}
