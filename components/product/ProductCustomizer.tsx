'use client'

/**
 * Seller-defined option groups, rendered for the configurator's option rail.
 *
 * Two presentations, chosen by the group's nature:
 *   - colour / finish groups  → a swatch grid (multi-select)
 *   - everything else         → compact single-select rows
 *
 * Selection semantics are unchanged from the original list view: multi-select
 * toggles options in and out, single-select replaces, and clicking the current
 * pick of a single-select group clears it.
 */

import { Check, Info } from 'lucide-react'
import type { CustomizationGroupWithRelations, CustomizationOption } from '@/types'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

interface Props {
  groups: CustomizationGroupWithRelations[]
  selections: Record<string, CustomizationOption[]>
  onSelectionChange: (selections: Record<string, CustomizationOption[]>) => void
}

/** A group is treated as a multi-select colour group by name or visual type. */
function isColourGroup(group: CustomizationGroupWithRelations): boolean {
  return group.visual_type === 'wall-color' || group.name.toLowerCase().includes('color')
}

/** `#RRGGBB` may live on color_hex or, historically, in the description. */
function colourOf(option: CustomizationOption): string | null {
  if (option.color_hex) return option.color_hex
  if (option.description && /^#([0-9A-F]{6}|[0-9A-F]{3})$/i.test(option.description)) {
    return option.description
  }
  return null
}

/** Strips the trailing hex from names like "Slate Grey (#4A4A4A)". */
function displayNameOf(option: CustomizationOption): string {
  const match = option.name.match(/^(.+?)\s*\(#[0-9A-Fa-f]{6}\)$/)
  return match ? match[1] : option.name
}

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function ProductCustomizer({ groups, selections, onSelectionChange }: Props) {
  const handleSelect = (groupId: string, option: CustomizationOption, isMulti: boolean) => {
    const current = selections[groupId] ?? []
    const alreadySelected = current.some((existing) => existing.id === option.id)
    const newSelections = { ...selections }

    if (isMulti) {
      const updated = alreadySelected
        ? current.filter((existing) => existing.id !== option.id)
        : [...current, option]

      if (updated.length > 0) {
        newSelections[groupId] = updated
      } else {
        delete newSelections[groupId]
      }
    } else {
      if (alreadySelected) {
        delete newSelections[groupId]
      } else {
        newSelections[groupId] = [option]
      }
    }

    onSelectionChange(newSelections)
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-12 text-center">
        <div className="mb-3 rounded-full bg-gray-50 p-4">
          <Info className="h-7 w-7 text-gray-300" />
        </div>
        <h3 className="text-sm font-black tracking-tight text-gray-900">
          No options for this build
        </h3>
        <p className="mx-auto mt-1 max-w-[240px] text-xs font-medium text-gray-500">
          The seller has not published any configurable options yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7 animate-in fade-in duration-300">
      {groups.map((group, idx) => {
        const isMulti = isColourGroup(group)
        const selected = selections[group.id] ?? []
        const selectedTotal = selected.reduce((sum, opt) => sum + opt.price_modifier, 0)

        return (
          <section key={group.id}>
            {/* Group header */}
            <div className="mb-3 flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                style={{ backgroundColor: PURPLE }}
              >
                {(group.display_order ?? idx) + 1}
              </span>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black uppercase tracking-[0.1em] text-gray-900">
                    {group.name}
                  </h3>
                  {group.description && (
                    <span className="group/info relative flex items-center">
                      <Info className="h-3.5 w-3.5 cursor-help text-gray-400" />
                      <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-52 rounded-lg bg-gray-900 p-2 text-[10px] leading-relaxed text-white opacity-0 transition-opacity group-hover/info:opacity-100">
                        {group.description}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isMulti ? 'Choose any' : 'Choose one'}
                  {group.is_required && ' · Required'}
                </span>
              </div>

              {selected.length > 0 && (
                <span
                  className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ backgroundColor: `${PURPLE}12`, color: PURPLE }}
                >
                  {selectedTotal > 0 ? `+$${formatMoney(selectedTotal)}` : 'Included'}
                </span>
              )}
            </div>

            {isMulti ? (
              /* ── Swatch grid ─────────────────────────────────────────── */
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2.5">
                  {group.options.map((option) => {
                    const isSelected = selected.some((s) => s.id === option.id)
                    const colour = colourOf(option)
                    const name = displayNameOf(option)

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(group.id, option, true)}
                        title={
                          option.price_modifier > 0
                            ? `${name} · +$${formatMoney(option.price_modifier)}`
                            : name
                        }
                        aria-pressed={isSelected}
                        className="group/sw relative aspect-square overflow-hidden rounded-xl transition-all hover:scale-[1.04] active:scale-95"
                        style={{
                          border: isSelected ? `2px solid ${GOLD}` : '2px solid #E5E7EB',
                          boxShadow: isSelected ? `0 0 0 2px ${PURPLE}` : 'none',
                        }}
                      >
                        {option.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={option.image_url}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : colour ? (
                          <span
                            className="block h-full w-full"
                            style={{ backgroundColor: colour }}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-gray-50 text-[9px] font-bold text-gray-300">
                            N/A
                          </span>
                        )}

                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                            <span
                              className="rounded-full p-1 shadow-lg"
                              style={{ backgroundColor: PURPLE }}
                            >
                              <Check className="h-3 w-3 text-white" />
                            </span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <p className="mt-2.5 text-xs font-semibold text-gray-500">
                  {selected.length > 0 ? (
                    <>
                      <span className="text-gray-400">Selected: </span>
                      <span style={{ color: PURPLE }}>
                        {selected.map(displayNameOf).join(', ')}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">Nothing selected yet</span>
                  )}
                </p>
              </>
            ) : (
              /* ── Option rows ─────────────────────────────────────────── */
              <div className="flex flex-col gap-2">
                {group.options.map((option) => {
                  const isSelected = selected.some((s) => s.id === option.id)
                  const colour = colourOf(option)
                  const name = displayNameOf(option)
                  const hasSwatch = Boolean(option.image_url || colour)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(group.id, option, false)}
                      aria-pressed={isSelected}
                      className="flex items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-all active:scale-[0.99]"
                      style={{
                        borderColor: isSelected ? GOLD : '#E5E7EB',
                        backgroundColor: isSelected ? `${PURPLE}08` : 'white',
                        boxShadow: isSelected ? `0 4px 16px ${PURPLE}14` : 'none',
                      }}
                    >
                      {hasSwatch && (
                        <span
                          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border"
                          style={{ borderColor: isSelected ? GOLD : '#F3F4F6' }}
                        >
                          {option.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={option.image_url}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              className="block h-full w-full"
                              style={{ backgroundColor: colour ?? undefined }}
                            />
                          )}
                        </span>
                      )}

                      <span className="flex min-w-0 flex-1 flex-col">
                        <span
                          className="truncate text-sm font-black tracking-tight"
                          style={{ color: isSelected ? PURPLE : '#111827' }}
                        >
                          {name}
                        </span>
                        {option.description && !colour && (
                          <span className="line-clamp-2 text-[11px] font-medium leading-snug text-gray-500">
                            {option.description}
                          </span>
                        )}
                        <span className="text-xs font-bold" style={{ color: PURPLE }}>
                          {option.price_modifier > 0
                            ? `+$${formatMoney(option.price_modifier)}`
                            : 'Included'}
                        </span>
                      </span>

                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: isSelected ? PURPLE : 'transparent',
                          borderColor: isSelected ? PURPLE : '#E5E7EB',
                        }}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
