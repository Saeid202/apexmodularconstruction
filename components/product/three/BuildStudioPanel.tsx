'use client'

/**
 * Buyer-facing controls for the 3D studio: per-surface colour, material
 * finish, lighting, and add/remove toggles for optional parts.
 *
 * These are presentation-only — pricing stays driven entirely by the seller's
 * customization groups in ProductCustomizer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Check, ChevronDown, Layers, Palette, Sparkles, Sun } from 'lucide-react'
import {
  availableParts,
  availableSurfaces,
  ENVIRONMENT_PRESETS,
  FINISH_PRESETS,
  isPartEnabled,
  OPTIONAL_PARTS,
  type SceneDirectives,
  type StudioConfig,
  type SurfaceKey,
} from '@/lib/product/model3d'

const PURPLE = '#4B1D8F'
const GOLD = '#D4AF37'

const HEX_INPUT_RE = /^#[0-9a-f]{6}$/i

interface Props {
  studio: StudioConfig
  onChange: (next: StudioConfig) => void
  /** Node names reported by the loaded model; filters the controls shown. */
  discoveredNodes: string[]
  /** Seller-driven colours, used to show what a studio change would override. */
  directives: SceneDirectives
}

/* ------------------------------------------------------------------ *
 * Section shell
 * ------------------------------------------------------------------ */

function Section({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string
  subtitle?: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
          style={{ backgroundColor: PURPLE }}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black uppercase tracking-tight text-gray-900">
            {title}
          </span>
          {subtitle && (
            <span className="block truncate text-[11px] font-medium text-gray-500">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-gray-100 px-4 py-4">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Segmented control
 * ------------------------------------------------------------------ */

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
            style={{
              backgroundColor: active ? PURPLE : '#F3F4F6',
              color: active ? '#fff' : '#4B5563',
              border: `2px solid ${active ? GOLD : 'transparent'}`,
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Colour row
 * ------------------------------------------------------------------ */

function SurfaceRow({
  label,
  swatches,
  value,
  overriddenBySeller,
  onPick,
}: {
  label: string
  swatches: string[]
  value: string
  /** True when a seller colour option is currently driving this surface. */
  overriddenBySeller: boolean
  onPick: (hex: string) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // The hex field keeps its own draft so half-typed values aren't rejected.
  // Re-sync during render (not in an effect) when the colour changes elsewhere.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  useEffect(() => {
    if (!pickerOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [pickerOpen])

  const commit = (hex: string) => {
    setDraft(hex)
    if (HEX_INPUT_RE.test(hex)) onPick(hex)
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-gray-800">{label}</p>
        {overriddenBySeller && (
          <p className="text-[10px] font-medium text-gray-400">Set by your selection above</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {swatches.map((hex) => {
          const active = hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={hex}
              type="button"
              onClick={() => onPick(hex)}
              title={hex}
              aria-label={`${label}: ${hex}`}
              className="relative h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
              style={{
                backgroundColor: hex,
                borderColor: active ? PURPLE : '#E5E7EB',
                boxShadow: active ? `0 0 0 2px ${GOLD}` : 'none',
              }}
            >
              {active && (
                <Check
                  className="absolute inset-0 m-auto h-3 w-3"
                  style={{ color: isLight(hex) ? '#111827' : '#FFFFFF' }}
                />
              )}
            </button>
          )
        })}

        {/* Custom colour */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            title="Custom colour"
            aria-label={`${label}: custom colour`}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed transition-transform hover:scale-110 active:scale-95"
            style={{ borderColor: PURPLE, backgroundColor: value }}
          >
            <Palette className="h-3 w-3" style={{ color: isLight(value) ? PURPLE : '#fff' }} />
          </button>

          {pickerOpen && (
            <div className="absolute right-0 z-30 mt-2 w-[200px] rounded-2xl border-2 border-gray-100 bg-white p-3 shadow-2xl">
              <HexColorPicker color={value} onChange={commit} style={{ width: '100%' }} />
              <input
                value={draft}
                onChange={(e) => commit(e.target.value)}
                spellCheck={false}
                aria-label={`${label} hex value`}
                className="mt-2 w-full rounded-lg border-2 border-gray-100 px-2 py-1 text-center text-xs font-bold uppercase tracking-wider text-gray-700 focus:border-purple-300 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Rough perceived-luminance check, for picking a readable tick colour. */
function isLight(hex: string): boolean {
  const value = hex.replace('#', '')
  if (value.length !== 6) return true
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

/* ------------------------------------------------------------------ *
 * Panel
 * ------------------------------------------------------------------ */

export function BuildStudioPanel({ studio, onChange, discoveredNodes, directives }: Props) {
  const surfaces = useMemo(() => availableSurfaces(discoveredNodes), [discoveredNodes])
  const parts = useMemo(() => availableParts(discoveredNodes), [discoveredNodes])

  const patch = useCallback(
    (next: Partial<StudioConfig>) => onChange({ ...studio, ...next }),
    [studio, onChange]
  )

  const setSurfaceColor = useCallback(
    (key: SurfaceKey, hex: string) => {
      onChange({
        ...studio,
        colors: { ...studio.colors, [key]: hex },
        // Marking the surface touched is what lets a buyer's colour win over
        // the seller's configured option for that surface.
        touched: { ...studio.touched, [key]: true },
      })
    },
    [studio, onChange]
  )

  const togglePart = useCallback(
    (id: string) => {
      onChange({ ...studio, parts: { ...studio.parts, [id]: !studio.parts[id] } })
    },
    [studio, onChange]
  )

  const activeEnvironment = ENVIRONMENT_PRESETS.find((e) => e.id === studio.environment)
  const activeFinish = FINISH_PRESETS.find((f) => f.id === studio.finish)
  const addedCount = parts.filter((p) => isPartEnabled(p.id, studio)).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: GOLD }} />
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">3D Studio</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Visual preview · no cost
        </span>
      </div>

      <Section
        title="Colours & Materials"
        subtitle={`${surfaces.length} surfaces · ${activeFinish?.label ?? 'Satin'} finish`}
        icon={<Palette className="h-4 w-4" />}
      >
        <div className="divide-y divide-gray-50">
          {surfaces.map((surface) => (
            <SurfaceRow
              key={surface.key}
              label={surface.label}
              swatches={surface.swatches}
              value={studio.colors[surface.key]}
              overriddenBySeller={
                !studio.touched[surface.key] && Boolean(directives.colorBySurface[surface.key])
              }
              onPick={(hex) => setSurfaceColor(surface.key, hex)}
            />
          ))}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Surface finish
          </p>
          <Segmented
            options={FINISH_PRESETS.map((f) => ({ id: f.id, label: f.label }))}
            value={studio.finish}
            onChange={(id) => patch({ finish: id })}
          />
        </div>
      </Section>

      <Section
        title="Site & Lighting"
        subtitle={activeEnvironment?.label}
        icon={<Sun className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Segmented
          options={ENVIRONMENT_PRESETS.map((e) => ({ id: e.id, label: e.label }))}
          value={studio.environment}
          onChange={(id) => patch({ environment: id })}
        />

        <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
          <SwitchRow
            label="Show site & grid"
            checked={studio.showGround}
            onChange={(v) => patch({ showGround: v })}
          />
          <SwitchRow
            label="Turntable rotation"
            checked={studio.autoRotate}
            onChange={(v) => patch({ autoRotate: v })}
          />
          <SwitchRow
            label="Framing view (wireframe)"
            checked={studio.wireframe}
            onChange={(v) => patch({ wireframe: v })}
          />
        </div>
      </Section>

      {parts.length > 0 && (
        <Section
          title="Add-ons & Features"
          subtitle={`${addedCount} of ${parts.length} included`}
          icon={<Layers className="h-4 w-4" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 gap-2">
            {parts.map((part) => {
              const on = studio.parts[part.id] ?? part.defaultOn
              // A part mounted on something that's been removed can't appear,
              // so show it greyed out rather than ticked-but-invisible.
              const blocked = on && !isPartEnabled(part.id, studio)
              const parentLabel = blocked
                ? OPTIONAL_PARTS.find((p) => p.id === part.requires)?.label
                : null

              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => togglePart(part.id)}
                  aria-pressed={on}
                  title={parentLabel ? `Requires ${parentLabel}` : part.label}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                    blocked ? 'opacity-50' : ''
                  }`}
                  style={{
                    borderColor: on && !blocked ? GOLD : '#E5E7EB',
                    backgroundColor: on && !blocked ? `${PURPLE}08` : 'white',
                  }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
                    style={{
                      backgroundColor: on ? PURPLE : 'transparent',
                      borderColor: on ? PURPLE : '#D1D5DB',
                    }}
                  >
                    {on && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-xs font-bold ${
                        on && !blocked ? 'text-purple-900' : 'text-gray-600'
                      }`}
                    >
                      {part.label}
                    </span>
                    {parentLabel && (
                      <span className="block truncate text-[10px] font-medium text-gray-400">
                        Needs {parentLabel}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[10px] font-medium leading-relaxed text-gray-400">
            Add-ons shown here are for visualisation. Priced options appear in the configurator
            above and are the ones carried through to your quote.
          </p>
        </Section>
      )}
    </div>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer select-none items-center justify-between gap-3">
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{ backgroundColor: checked ? PURPLE : '#D1D5DB' }}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
