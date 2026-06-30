'use client'

import { useState, useEffect, useRef } from 'react'
import { Settings, ToggleLeft, ToggleRight, Plus, X, Upload, Package } from 'lucide-react'
import {
  createCustomizationOption,
  updateCustomizationOption,
  deleteCustomizationOption,
} from '@/app/actions/customization'
import { uploadProductImage } from '@/lib/uploadProductImage'

interface CustomizationSuiteSimpleProps {
  productId: string
  userId: string
  initialEnabled?: boolean
  customGroups?: any[]
  onCustomGroupsChange?: (groups: any[]) => void
}

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface OptionRow {
  id: string | 'new'
  category: string
  name: string
  code: string
  price: string
  images: string[]
  isNew?: boolean
  uploading: boolean
  doorType?: 'interior' | 'exterior'
  saveStatus?: 'idle' | 'saving' | 'success' | 'error'
  description?: string | null
  colorHex?: string
  selectedColorHexes?: string[]
  relatedOptionIds?: string[]
  groupId?: string
}

const DEFAULT_CATEGORIES = [
  'Doors',
  'Windows',
  'Flooring',
  'Interior Walls',
  'Exterior Walls',
  'Colors',
]

const DEFAULT_COLOR_PALETTE = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00A3FF',
  '#00C853',
  '#FFD600',
  '#FF6D00',
  '#8E24AA',
  '#00ACC1',
  '#4CAF50',
]

export function CustomizationSuiteSimple({
  productId,
  userId,
  initialEnabled = false,
  customGroups,
  onCustomGroupsChange,
}: CustomizationSuiteSimpleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [options, setOptions] = useState<OptionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [debugPayload, setDebugPayload] = useState<string>('')
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  async function loadExistingOptions() {
    setLoading(true)
    try {
      const { getCustomizationGroups } = await import('@/app/actions/customization')
      const result = await getCustomizationGroups(productId)

      if (result.data && result.data.length > 0) {
        // Transform database data to OptionRow format
        const transformedOptions: OptionRow[] = []

        result.data.forEach((group) => {
          // For color groups, we need to group related color options together
          const isColorGroup = group.name.toLowerCase().includes('color')

          if (isColorGroup) {
            // Group color options by their base name (everything before the color hex in parentheses)
            const colorGroupsByBaseName: Record<string, any[]> = {}

            group.options.forEach((option) => {
              // Extract base name and color from option name
              // Expected format: "ColorName (#RRGGBB)" or "Color (#RRGGBB)"
              const baseNameMatch = option.name.match(/^(.+?)\s*\(#[0-9A-Fa-f]{6}\)$/)
              const baseName = baseNameMatch ? baseNameMatch[1].trim() : option.name

              console.log(
                `[COLOR DEBUG] Loading option: "${option.name}" -> baseName: "${baseName}", description: "${option.description}"`
              )

              if (!colorGroupsByBaseName[baseName]) {
                colorGroupsByBaseName[baseName] = []
              }
              colorGroupsByBaseName[baseName].push(option)
            })

            console.log('[COLOR DEBUG] Color groups by base name:', colorGroupsByBaseName)

            // Convert grouped options back to single rows with multiple selected colors
            Object.entries(colorGroupsByBaseName).forEach(([baseName, options]) => {
              const selectedColors: string[] = []
              const relatedIds: string[] = []
              const firstOption = options[0]

              options.forEach((opt) => {
                const colorHex =
                  opt.color_hex ?? (opt.description?.startsWith('#') ? opt.description : undefined)
                if (colorHex) {
                  selectedColors.push(colorHex)
                }
                relatedIds.push(opt.id)
              })

              console.log(
                `[COLOR DEBUG] Grouped color "${baseName}" with ${selectedColors.length} colors:`,
                selectedColors
              )

              transformedOptions.push({
                id: firstOption.id, // Use first option's ID as the row ID
                category: group.name,
                name: baseName,
                code: '',
                price: firstOption.price_modifier.toString(),
                images: [firstOption.image_url, ...(firstOption.additional_images || [])].filter(
                  (img): img is string => img !== null
                ),
                isNew: false,
                uploading: false,
                doorType: undefined,
                saveStatus: 'idle',
                description: null,
                colorHex: selectedColors[0],
                selectedColorHexes: selectedColors.length > 0 ? selectedColors : undefined,
                relatedOptionIds: relatedIds,
                groupId: group.id,
              })
            })
          } else {
            // Non-color groups: process normally
            group.options.forEach((option) => {
              // Extract door type from group name if it exists
              const doorTypeMatch = group.name.match(/\((interior|exterior)\)$/)
              const doorType = doorTypeMatch
                ? (doorTypeMatch[1] as 'interior' | 'exterior')
                : undefined

              transformedOptions.push({
                id: option.id,
                category: group.name.replace(/\s*\((interior|exterior)\)$/, ''),
                name: option.name,
                code: '',
                price: option.price_modifier.toString(),
                images: [option.image_url, ...(option.additional_images || [])].filter(
                  (img): img is string => img !== null
                ),
                isNew: false,
                uploading: false,
                doorType,
                saveStatus: 'idle',
                description: option.description ?? null,
                colorHex: undefined,
                selectedColorHexes: undefined,
              })
            })
          }
        })

        setOptions(transformedOptions)
      } else {
        setOptions([])
      }
    } catch (error) {
      console.error('Error loading options:', error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEnabled) {
      loadExistingOptions()
    } else {
      setOptions([])
    }
  }, [isEnabled, productId])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('debug_customGroups_payload')
        if (saved) setDebugPayload(saved)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const addNewRow = () => {
    const newRow: OptionRow = {
      id: 'new',
      category: DEFAULT_CATEGORIES[0],
      name: '',
      code: '',
      price: '0',
      images: [],
      isNew: true,
      uploading: false,
      doorType: 'interior',
      saveStatus: 'idle',
      description: null,
      colorHex: undefined,
    }
    setOptions((prev) => [...prev, newRow])
  }

  const handleImageUpload = async (files: FileList, rowIndex: number) => {
    if (!files || files.length === 0) {
      console.log('No files selected')
      return
    }

    console.log('Starting image upload for:', rowIndex, files)
    console.log('User ID:', userId)
    const imageUrls: string[] = []

    try {
      // Update uploading state
      setOptions((prev) =>
        prev.map((opt, idx) => (idx === rowIndex ? { ...opt, uploading: true } : opt))
      )

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)

        try {
          const url = await uploadProductImage(file, userId, Date.now())
          console.log('Upload successful for:', file.name, 'URL:', url)
          imageUrls.push(url)
        } catch (fileError) {
          console.error('Failed to upload file:', file.name, fileError)
        }
      }

      console.log('All files processed. URLs:', imageUrls)
    } catch (error) {
      console.error('Error in upload process:', error)
    } finally {
      // Update images
      setOptions((prev) =>
        prev.map((opt, idx) =>
          idx === rowIndex
            ? { ...opt, images: [...opt.images, ...imageUrls], uploading: false }
            : opt
        )
      )
      console.log('Upload process completed. Final image count:', imageUrls.length)
    }
  }

  const handleRemoveImage = (rowIndex: number, imageIndex: number) => {
    setOptions((prev) =>
      prev.map((opt, idx) => {
        if (idx === rowIndex) {
          return {
            ...opt,
            images: opt.images.filter((_, imgIdx) => imgIdx !== imageIndex),
          }
        }
        return opt
      })
    )
  }

  const handleFieldChange = (rowIndex: number, field: keyof OptionRow, value: any) => {
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === rowIndex ? { ...opt, [field]: value } : opt))
    )
  }

  const handleCategoryChange = (rowIndex: number, value: string) => {
    setOptions((prev) =>
      prev.map((opt, idx) =>
        idx === rowIndex
          ? {
              ...opt,
              category: value,
              colorHex: value === 'Colors' ? opt.colorHex || DEFAULT_COLOR_PALETTE[0] : undefined,
              selectedColorHexes:
                value === 'Colors'
                  ? opt.selectedColorHexes || [opt.colorHex || DEFAULT_COLOR_PALETTE[0]]
                  : undefined,
            }
          : opt
      )
    )
  }

  const toggleSelectedColor = (rowIndex: number, color: string) => {
    setOptions((prev) =>
      prev.map((opt, idx) => {
        if (idx !== rowIndex) return opt
        const selected = opt.selectedColorHexes ?? (opt.colorHex ? [opt.colorHex] : [])
        const alreadySelected = selected.includes(color)
        const nextSelected = alreadySelected
          ? selected.filter((c) => c !== color)
          : [...selected, color]
        return {
          ...opt,
          selectedColorHexes: nextSelected,
          colorHex: nextSelected[0] || opt.colorHex,
        }
      })
    )
  }

  const handleSave = async (rowIndex: number) => {
    const option = options[rowIndex]
    console.log('Saving option at row:', rowIndex, option)

    if (!option.name.trim()) {
      setOptions((prev) =>
        prev.map((opt, idx) => (idx === rowIndex ? { ...opt, saveStatus: 'error' } : opt))
      )
      return
    }

    // Set saving status
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === rowIndex ? { ...opt, saveStatus: 'saving' } : opt))
    )

    try {
      if (option.id === 'new') {
        console.log('Creating new option with data:', {
          name: option.name.trim(),
          price: option.price,
          images: option.images,
          category: option.category,
          doorType: option.doorType,
        })

        // First create a group for this option
        const groupName =
          option.category === 'Doors' && option.doorType
            ? `${option.category} (${option.doorType})`
            : option.category

        console.log('Creating group with name:', groupName)

        const { createCustomizationGroup } = await import('@/app/actions/customization')
        const groupResult = await createCustomizationGroup({
          product_id: productId,
          name: groupName,
          description: null,
          is_required: false,
        })

        console.log('Group creation result:', groupResult)

        if (groupResult.error) {
          console.error('Failed to create group:', groupResult.error)
          setOptions((prev) =>
            prev.map((opt, idx) => (idx === rowIndex ? { ...opt, saveStatus: 'error' } : opt))
          )
          return
        }

        // Create one or more color options for this new group.
        const colorsToCreate =
          option.category === 'Colors'
            ? option.selectedColorHexes && option.selectedColorHexes.length > 0
              ? option.selectedColorHexes
              : [option.colorHex || DEFAULT_COLOR_PALETTE[0]]
            : [option.colorHex || option.description || DEFAULT_COLOR_PALETTE[0]]

        console.log(
          `[COLOR DEBUG] Creating ${colorsToCreate.length} color options for "${option.name}":`,
          colorsToCreate
        )

        const createdResults = await Promise.all(
          colorsToCreate.map((color) => {
            const optionName =
              option.category === 'Colors'
                ? `${option.name.trim() || 'Color'} (${color})`
                : option.name.trim()
            console.log(
              `[COLOR DEBUG] Creating option with name: "${optionName}", description: "${color}"`
            )
            return createCustomizationOption({
              group_id: groupResult.data!.id,
              name: optionName,
              description: option.category === 'Colors' ? color : option.description || null,
              price_modifier: parseFloat(option.price) || 0,
              image_url: option.images[0] || null,
              color_hex: option.category === 'Colors' ? color : option.colorHex || null,
              additional_images: option.images.length > 1 ? option.images.slice(1) : null,
              stock_quantity: null,
              track_inventory: false,
            })
          })
        )

        const failedResult = createdResults.find((result) => result.error)
        if (failedResult) {
          console.error('Failed to save one or more color options:', failedResult.error)
          setOptions((prev) =>
            prev.map((opt, idx) =>
              idx === rowIndex ? { ...opt, saveStatus: 'error' as const } : opt
            )
          )
          return
        }

        const createdOptions = createdResults.map((result) => result.data!)
        // Create a single grouped row representing all created color options
        const groupedRow = {
          id: createdOptions[0].id,
          category: option.category,
          name: option.name,
          code: option.code,
          price: option.price,
          images: [
            createdOptions[0].image_url,
            ...(createdOptions[0].additional_images || []),
          ].filter((img): img is string => img !== null),
          isNew: false,
          uploading: false,
          doorType: option.doorType,
          saveStatus: 'success' as const,
          description: createdOptions[0].description ?? null,
          colorHex: createdOptions[0].color_hex ?? createdOptions[0].description ?? undefined,
          selectedColorHexes: createdOptions.map((c) => c.description).filter(Boolean) as string[],
          relatedOptionIds: createdOptions.map((c) => c.id),
          groupId: groupResult.data!.id,
        } as OptionRow

        setOptions((prev) => {
          const before = prev.slice(0, rowIndex)
          const after = prev.slice(rowIndex + 1)
          const updated = [...before, groupedRow, ...after]
          console.log('Updated options:', updated)
          return updated
        })

        // Sync to parent after successful save
        syncCustomGroups()

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setOptions((prev) =>
            prev.map((opt, idx) =>
              idx >= rowIndex && idx < rowIndex + createdOptions.length
                ? { ...opt, saveStatus: 'idle' as const }
                : opt
            )
          )
        }, 3000)
      } else {
        // Updating existing option(s)
        console.log('Updating existing option:', option.id)

        // For color options with multiple selected colors, handle deletion and recreation
        if (
          option.category === 'Colors' &&
          option.relatedOptionIds &&
          option.relatedOptionIds.length > 0
        ) {
          const { deleteCustomizationOption } = await import('@/app/actions/customization')

          // Delete all related old color options
          await Promise.all(option.relatedOptionIds.map((id) => deleteCustomizationOption(id)))

          // Create new options for each selected color
          const colorsToCreate =
            option.selectedColorHexes && option.selectedColorHexes.length > 0
              ? option.selectedColorHexes
              : [option.colorHex || DEFAULT_COLOR_PALETTE[0]]

          // Use the groupId stored in the option row
          const groupId = option.groupId

          if (!groupId) {
            console.error(
              '[COLOR DEBUG] Could not find group ID for color options. Option:',
              option
            )
            setOptions((prev) =>
              prev.map((opt, idx) =>
                idx === rowIndex ? { ...opt, saveStatus: 'error' as const } : opt
              )
            )
            return
          }

          console.log(
            '[COLOR DEBUG] Updating colors with groupId:',
            groupId,
            'Colors:',
            colorsToCreate
          )

          const createdResults = await Promise.all(
            colorsToCreate.map((color) =>
              createCustomizationOption({
                group_id: groupId,
                name: `${option.name.trim() || 'Color'} (${color})`,
                description: color,
                price_modifier: parseFloat(option.price) || 0,
                image_url: option.images[0] || null,
                color_hex: color,
                additional_images: option.images.length > 1 ? option.images.slice(1) : null,
                stock_quantity: null,
                track_inventory: false,
              })
            )
          )

          const failedResult = createdResults.find((result) => result.error)
          if (failedResult) {
            console.error('Failed to save updated color options:', failedResult.error)
            setOptions((prev) =>
              prev.map((opt, idx) =>
                idx === rowIndex ? { ...opt, saveStatus: 'error' as const } : opt
              )
            )
            return
          }

          // Update the row with new IDs
          const createdOptions = createdResults.map((r) => r.data!)
          setOptions((prev) =>
            prev.map((opt, idx) => {
              if (idx === rowIndex) {
                return {
                  ...opt,
                  id: createdOptions[0].id,
                  relatedOptionIds: createdOptions.map((c) => c.id),
                  saveStatus: 'success' as const,
                }
              }
              return opt
            })
          )
        } else {
          // Non-color option or single-color option: normal update
          await updateCustomizationOption(option.id as string, {
            name: option.name.trim(),
            description:
              option.category === 'Colors' ? option.colorHex || null : option.description || null,
            price_modifier: parseFloat(option.price) || 0,
            image_url: option.images[0] || null,
            color_hex:
              option.category === 'Colors' ? option.colorHex || null : option.colorHex || null,
            additional_images: option.images.length > 1 ? option.images.slice(1) : null,
          })

          setOptions((prev) =>
            prev.map((opt, idx) =>
              idx === rowIndex ? { ...opt, saveStatus: 'success' as const } : opt
            )
          )
        }

        // Sync to parent after successful update
        syncCustomGroups()

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setOptions((prev) =>
            prev.map((opt, idx) =>
              idx === rowIndex ? { ...opt, saveStatus: 'idle' as const } : opt
            )
          )
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving option:', error)
      setOptions((prev) =>
        prev.map((opt, idx) => (idx === rowIndex ? { ...opt, saveStatus: 'error' as const } : opt))
      )
    }
  }

  const handleDelete = async (rowIndex: number) => {
    const option = options[rowIndex]

    if (!confirm('Are you sure you want to delete this option?')) return

    try {
      if (option.id !== 'new') {
        await deleteCustomizationOption(option.id)
      }

      const updatedOptions = options.filter((_, idx) => idx !== rowIndex)
      setOptions(updatedOptions)
      syncCustomGroups(updatedOptions)
    } catch (error) {
      console.error('Error deleting option:', error)
      alert('Error deleting option. Please try again.')
    }
  }

  // Transform internal options to customGroups format for parent
  const syncCustomGroups = (optionsToSync?: OptionRow[]) => {
    if (!onCustomGroupsChange) return

    const optsToProcess = optionsToSync || options

    // Group options by category
    const grouped: Record<string, OptionRow[]> = {}
    optsToProcess.forEach((opt) => {
      if (!grouped[opt.category]) {
        grouped[opt.category] = []
      }
      grouped[opt.category].push(opt)
    })

    // Transform to customGroups format
    const transformedGroups = Object.entries(grouped)
      .filter(([_, opts]) => opts.length > 0) // Filter out empty categories
      .map(([category, opts]) => {
        const existingGroup = customGroups?.find((group) => group.name === category)
        // For color categories, expand grouped rows into individual color option entries
        if (category.toLowerCase().includes('color')) {
          const expandedOptions = opts.flatMap((opt) => {
            const colors =
              opt.selectedColorHexes && opt.selectedColorHexes.length > 0
                ? opt.selectedColorHexes
                : opt.colorHex
                  ? [opt.colorHex]
                  : []

            if (colors.length === 0) {
              // Fallback to single entry using the base name
              return [
                {
                  id: opt.id === 'new' ? `new-${opt.name}` : opt.id,
                  name: opt.name,
                  priceModifier: parseFloat(opt.price) || 0,
                  imageUrl: opt.images[0] || '',
                  description: null as string | null,
                  colorHex: opt.colorHex ?? null,
                },
              ]
            }

            return colors.map((color, idx) => ({
              id:
                opt.relatedOptionIds && opt.relatedOptionIds[idx]
                  ? opt.relatedOptionIds[idx]
                  : opt.id === 'new'
                    ? `new-${opt.name}-${idx}`
                    : opt.id,
              name: `${opt.name} (${color})`,
              priceModifier: parseFloat(opt.price) || 0,
              imageUrl: opt.images[0] || '',
              description: color as string | null,
              colorHex: color,
            }))
          })

          return {
            id: existingGroup?.id ?? (opts[0].id === 'new' ? `new-${category}` : opts[0].id),
            name: category,
            visualType: existingGroup?.visualType ?? 'generic',
            targetAnchorId: existingGroup?.targetAnchorId ?? null,
            options: expandedOptions,
          }
        }

        return {
          id: existingGroup?.id ?? (opts[0].id === 'new' ? `new-${category}` : opts[0].id),
          name: category,
          visualType: existingGroup?.visualType ?? 'generic',
          targetAnchorId: existingGroup?.targetAnchorId ?? null,
          options: opts.map((opt) => ({
            id: opt.id === 'new' ? `new-${opt.name}` : opt.id,
            name: opt.name,
            priceModifier: parseFloat(opt.price) || 0,
            imageUrl: opt.images[0] || '',
            description: opt.description ?? null,
            colorHex: opt.colorHex ?? null,
          })),
        }
      })

    try {
      const payload = JSON.stringify(transformedGroups, null, 2)
      setDebugPayload(payload)
      if (typeof window !== 'undefined') localStorage.setItem('debug_customGroups_payload', payload)
    } catch (e) {
      console.error('Failed to persist debug payload', e)
    }

    onCustomGroupsChange(transformedGroups)
  }

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for each row */}
      {options.map((option, index) => (
        <input
          key={`file-input-${index}`}
          ref={(el) => {
            fileInputRefs.current[`${index}-main`] = el
          }}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files, index)}
        />
      ))}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#EDE9F6' }}
          >
            <Settings className="h-4 w-4" style={{ color: PURPLE }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Product Customization</h3>
            <p className="text-sm text-gray-600">
              Allow buyers to select custom doors, windows, flooring, colors, and other finish
              options.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: isEnabled ? `${PURPLE}15` : '#F3F4F6',
            color: isEnabled ? PURPLE : '#6B7280',
            border: `2px solid ${isEnabled ? PURPLE : '#E5E7EB'}`,
          }}
        >
          {isEnabled ? (
            <>
              <ToggleRight className="h-4 w-4" />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
              <span>Disabled</span>
            </>
          )}
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={addNewRow}
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: PURPLE }}
          >
            <Plus className="h-4 w-4" />
            Add New Customization Option
          </button>

          {options.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed p-8 text-center"
              style={{ borderColor: `${PURPLE}22` }}
            >
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customization Options</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click "Add New Customization Option" to get started.
              </p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <div
                className="grid grid-cols-8 gap-2 p-3 bg-gray-50 border-b font-medium text-xs text-gray-700"
                style={{ backgroundColor: `${PURPLE}05` }}
              >
                <div>Category</div>
                <div>Door Type</div>
                <div>Images</div>
                <div>Name</div>
                <div>Code</div>
                <div>Color</div>
                <div>Price Modifier</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-gray-200">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-8 gap-2 p-3 items-center hover:bg-gray-50"
                    style={{
                      backgroundColor: option.isNew ? `${GOLD}10` : 'transparent',
                    }}
                  >
                    {/* Row content (category, door type, images, name, code, color, price, actions) */}
                    <div className="text-sm">
                      <select
                        value={option.category}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${PURPLE}44` }}
                      >
                        {DEFAULT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-sm">
                      {option.category === 'Doors' ? (
                        <select
                          value={option.doorType || 'interior'}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              'doorType',
                              e.target.value as 'interior' | 'exterior'
                            )
                          }
                          className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: `${PURPLE}44` }}
                        >
                          <option value="interior">Interior</option>
                          <option value="exterior">Exterior</option>
                        </select>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </div>

                    <div className="text-sm">
                      {/* Images + upload button */}
                      {option.images.length > 0 ? (
                        <div className="flex gap-1">
                          {option.images.slice(0, 6).map((image, imgIndex) =>
                            image ? (
                              <div key={imgIndex} className="relative group">
                                <div
                                  className="w-12 h-12 rounded border overflow-hidden"
                                  style={{ borderColor: `${PURPLE}22` }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={image}
                                    alt={`Option ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  onClick={() => handleRemoveImage(index, imgIndex)}
                                  className="absolute -top-0.5 -right-0.5 rounded-full bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : null
                          )}
                          {option.images.length > 6 && (
                            <div
                              className="w-12 h-12 rounded border flex items-center justify-center text-xs text-gray-500"
                              style={{ borderColor: `${PURPLE}22` }}
                            >
                              +{option.images.length - 6}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[`${index}-main`]?.click()}
                            disabled={option.uploading}
                            className="w-12 h-12 rounded border flex items-center justify-center text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            style={{ borderColor: `${PURPLE}44` }}
                          >
                            <Upload className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[`${index}-main`]?.click()}
                          disabled={option.uploading}
                          className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          style={{ borderColor: `${PURPLE}44` }}
                        >
                          {option.uploading ? (
                            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-purple-600 rounded-full"></div>
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          <span>{option.uploading ? 'Uploading...' : 'Upload'}</span>
                        </button>
                      )}

                      {option.category === 'Colors' && (
                        <div
                          className="mt-3 p-3 rounded-lg border border-purple-200"
                          style={{ backgroundColor: `${PURPLE}05` }}
                        >
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Palette - {option.selectedColorHexes?.length ?? 0} Selected
                          </div>
                          <div className="grid grid-cols-5 gap-2 mb-3">
                            {DEFAULT_COLOR_PALETTE.map((color) => {
                              const selected =
                                option.selectedColorHexes?.includes(color) ??
                                option.colorHex === color
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => toggleSelectedColor(index, color)}
                                  className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${selected ? 'border-black ring-2 ring-offset-1 ring-black/20' : 'border-gray-200 hover:border-gray-400'}`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              )
                            })}
                          </div>
                          <label
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                            style={{ borderColor: `${PURPLE}44` }}
                          >
                            <span>Custom</span>
                            <input
                              type="color"
                              value={option.colorHex || DEFAULT_COLOR_PALETTE[0]}
                              onChange={(e) => {
                                handleFieldChange(index, 'colorHex', e.target.value)
                                setOptions((prev) =>
                                  prev.map((opt, idx) =>
                                    idx === index
                                      ? { ...opt, selectedColorHexes: [e.target.value] }
                                      : opt
                                  )
                                )
                              }}
                              className="h-8 w-10 rounded-full border-0 p-0 cursor-pointer"
                            />
                          </label>
                          {(option.selectedColorHexes?.length ?? 0) > 0 && (
                            <div className="mt-3 pt-3 border-t border-purple-100">
                              <div className="text-xs font-semibold text-gray-600 mb-2">
                                Selected Colors:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {option.selectedColorHexes?.map((hex) => (
                                  <div
                                    key={hex}
                                    className="flex items-center gap-1 rounded-full bg-white border px-2 py-1 text-xs"
                                  >
                                    <div
                                      className="h-4 w-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: hex }}
                                    />
                                    <span className="font-mono text-gray-600">{hex}</span>
                                    <button
                                      type="button"
                                      onClick={() => toggleSelectedColor(index, hex)}
                                      className="ml-1 text-red-500 hover:text-red-700 font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        placeholder="Option name"
                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${PURPLE}44` }}
                      />
                    </div>

                    <div className="text-sm">
                      <input
                        type="text"
                        value={option.code}
                        onChange={(e) => handleFieldChange(index, 'code', e.target.value)}
                        placeholder="Product code"
                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${PURPLE}44` }}
                      />
                    </div>

                    <div className="text-sm">
                      {option.category === 'Colors' ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded border"
                            style={{
                              backgroundColor: option.colorHex || '#000000',
                              borderColor: `${PURPLE}44`,
                            }}
                          />
                          <input
                            type="color"
                            value={option.colorHex || '#000000'}
                            onChange={(e) => handleFieldChange(index, 'colorHex', e.target.value)}
                            className="h-8 w-12 rounded border p-0"
                            style={{ borderColor: `${PURPLE}44` }}
                          />
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </div>

                    <div className="text-sm">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full rounded border pl-5 pr-2 py-1 text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: `${PURPLE}44` }}
                        />
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleSave(index)}
                            disabled={!option.name.trim() || option.saveStatus === 'saving'}
                            className="rounded px-2 py-1 text-xs font-medium text-white disabled:opacity-50 transition-colors"
                            style={{
                              backgroundColor:
                                option.saveStatus === 'success'
                                  ? '#10b981'
                                  : option.saveStatus === 'error'
                                    ? '#ef4444'
                                    : option.saveStatus === 'saving'
                                      ? '#6b7280'
                                      : PURPLE,
                            }}
                          >
                            {option.saveStatus === 'saving' ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Status Message */}
                        {option.saveStatus && option.saveStatus !== 'idle' && (
                          <div
                            className={`text-xs ${option.saveStatus === 'success' ? 'text-green-600' : option.saveStatus === 'error' ? 'text-red-600' : 'text-gray-600'}`}
                          >
                            {option.saveStatus === 'success' && '✓ Saved successfully'}
                            {option.saveStatus === 'error' && '✗ Failed to save'}
                            {option.saveStatus === 'saving' && 'Saving...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isEnabled && (
        <div
          className="rounded-xl border-2 border-dashed p-8 text-center"
          style={{ borderColor: `${PURPLE}22` }}
        >
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customization Disabled</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable customization to allow buyers to select custom doors, windows, flooring, etc.
          </p>
        </div>
      )}
    </div>
  )
}
