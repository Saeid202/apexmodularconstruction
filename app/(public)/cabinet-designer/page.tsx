'use client'

import { useMemo, useRef, useState } from 'react'
import { Box, Calculator, Check, Layers, Loader2, Maximize2, Minimize2, Plus, RotateCcw, Square, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { CabinetScene, type CabinetSceneHandle } from '@/components/cabinet-designer/CabinetScene'
import { requestCabinetQuote } from '@/app/actions/cabinet-designs'
import { CABINET_MATERIALS, COUNTERTOP_MATERIALS, getMaterial } from '@/lib/cabinet-designer/materials'
import { calculateCabinetDesignPrice } from '@/lib/cabinet-designer/priceCalculator'
import { CABINET_TYPE_DEFAULTS, CABINET_TYPE_LABELS, type CabinetType, type CabinetUnit, type DoorStyle, type HandleStyle } from '@/lib/cabinet-designer/types'

let unitIdCounter = 0
function createUnitId() {
  unitIdCounter += 1
  return `unit-${unitIdCounter}-${Date.now()}`
}

function createUnit(type: CabinetType, materialId: string): CabinetUnit {
  const defaults = CABINET_TYPE_DEFAULTS[type]
  return {
    id: createUnitId(),
    type,
    ...defaults,
    doorStyle: 'flat',
    handleStyle: 'bar',
    materialId,
  }
}

const doorStyleOptions: Array<{ value: DoorStyle; label: string; desc: string }> = [
  { value: 'flat', label: 'Flat Slab', desc: 'Clean, modern' },
  { value: 'shaker', label: 'Shaker Panel', desc: 'Classic frame' },
  { value: 'glass', label: 'Glass Insert', desc: 'Open, airy' },
]

const handleStyleOptions: Array<{ value: HandleStyle; label: string }> = [
  { value: 'bar', label: 'Bar Pull' },
  { value: 'knob', label: 'Knob' },
  { value: 'integrated', label: 'Integrated' },
  { value: 'none', label: 'None' },
]

function QuoteRequestModal({
  units,
  countertopId,
  totalPrice,
  onClose,
}: {
  units: CabinetUnit[]
  countertopId: string
  totalPrice: number
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    const result = await requestCabinetQuote({ units, countertopId, totalPrice, name, email, phone, message })

    setSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    setSuccess(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Cabinet Designer</p>
            <h2 className="mt-1 text-xl font-bold text-[#1B272B]">Request a quote</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#71847E] hover:bg-[#F5F7F6]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="mt-5 rounded-xl bg-[#EEF7F2] p-4 text-sm text-[#23634F]">
            <p className="font-bold">Quote request sent</p>
            <p className="mt-1">We saved your {units.length} cabinet design (est. ${totalPrice.toLocaleString('en-CA')}) and a specialist will follow up by email shortly.</p>
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-lg bg-[#2C8065] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#23634F]">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold text-[#55716A]">Name
              <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-3 py-2 text-sm font-medium outline-none focus:border-[#2C8065]" />
            </label>
            <label className="block text-xs font-semibold text-[#55716A]">Email
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-3 py-2 text-sm font-medium outline-none focus:border-[#2C8065]" />
            </label>
            <label className="block text-xs font-semibold text-[#55716A]">Phone (optional)
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-3 py-2 text-sm font-medium outline-none focus:border-[#2C8065]" />
            </label>
            <label className="block text-xs font-semibold text-[#55716A]">Notes (optional)
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-3 py-2 text-sm font-medium outline-none focus:border-[#2C8065]" />
            </label>
            <p className="text-xs text-[#71847E]">{units.length} cabinet(s) · est. ${totalPrice.toLocaleString('en-CA')}</p>
            {error && <p className="rounded-lg bg-[#FFF6EE] px-3 py-2 text-xs font-semibold text-[#A7654B]">{error}</p>}
            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#203238] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2C8065] disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Sending…' : 'Send quote request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const cabinetTypeOptions: CabinetType[] = ['base', 'wall', 'tall', 'corner']

export default function CabinetDesignerPage() {
  const [units, setUnits] = useState<CabinetUnit[]>(() => [createUnit('base', 'white')])
  const [countertopId, setCountertopId] = useState('quartz')
  const [activeUnitId, setActiveUnitId] = useState<string>(() => units[0].id)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const sceneRef = useRef<CabinetSceneHandle>(null)

  const activeUnit = units.find((unit) => unit.id === activeUnitId) ?? units[0]
  const price = useMemo(() => calculateCabinetDesignPrice({ units, countertopId }), [units, countertopId])
  const activeUnitPrice = price.units.find((unit) => unit.unitId === activeUnit?.id)

  function updateActiveUnit(patch: Partial<CabinetUnit>) {
    if (!activeUnit) return
    setUnits((current) => current.map((unit) => (unit.id === activeUnit.id ? { ...unit, ...patch } : unit)))
  }

  function setActiveUnitType(type: CabinetType) {
    if (!activeUnit) return
    const defaults = CABINET_TYPE_DEFAULTS[type]
    updateActiveUnit({ type, ...defaults })
  }

  function addUnit(type: CabinetType) {
    const materialId = activeUnit?.materialId ?? 'white'
    const unit = createUnit(type, materialId)
    setUnits((current) => [...current, unit])
    setActiveUnitId(unit.id)
  }

  function removeUnit(id: string) {
    setUnits((current) => {
      const next = current.filter((unit) => unit.id !== id)
      if (next.length === 0) return current // keep at least one unit
      if (activeUnitId === id) setActiveUnitId(next[0].id)
      return next
    })
  }

  const totalWidthInches = units.reduce((sum, unit) => sum + unit.widthInches, 0)

  const sidebar = (
    <>
      {/* Step 1: run layout */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">1. Cabinet run</p>
        <div className="mt-3 space-y-2">
          {units.map((unit, index) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => setActiveUnitId(unit.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${unit.id === activeUnitId ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${unit.id === activeUnitId ? 'bg-[#2C8065] text-white' : 'bg-[#EAF0ED] text-[#55716A]'}`}>
                <Box className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold">{index + 1}. {CABINET_TYPE_LABELS[unit.type]}</span>
                <span className="block text-xs text-[#71847E]">{unit.widthInches}&quot; wide · {getMaterial(unit.materialId).name}</span>
              </span>
              {units.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => { event.stopPropagation(); removeUnit(unit.id) }}
                  className="rounded-lg p-1.5 text-[#A7654B] hover:bg-[#F7E9E4]"
                  aria-label="Remove cabinet"
                >
                  <Trash2 className="h-4 w-4" />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {cabinetTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addUnit(type)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#2C8065] px-2 py-2 text-xs font-bold text-[#23634F] transition-colors hover:bg-[#EEF7F2]"
            >
              <Plus className="h-3.5 w-3.5" /> {CABINET_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#71847E]">Run length: {(totalWidthInches / 12).toFixed(1)} ft ({totalWidthInches}&quot;)</p>
      </div>

      {activeUnit && (
        <>
          {/* Step 2: dimensions & type */}
          <div className="border-t border-[#E3EBE8] pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">2. Size &amp; type</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {cabinetTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveUnitType(type)}
                  className={`rounded-lg border px-1 py-2 text-[11px] font-bold capitalize transition-colors ${activeUnit.type === type ? 'border-[#2C8065] bg-[#2C8065] text-white' : 'border-[#D6DFDC] text-[#55716A] hover:bg-[#EEF7F2]'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(['widthInches', 'heightInches', 'depthInches'] as const).map((field) => (
                <label key={field} className="text-xs font-semibold text-[#55716A]">
                  {field === 'widthInches' ? 'Width' : field === 'heightInches' ? 'Height' : 'Depth'} (in)
                  <input
                    type="number"
                    min={6}
                    value={activeUnit[field]}
                    onChange={(event) => updateActiveUnit({ [field]: Number(event.target.value) || 0 } as Partial<CabinetUnit>)}
                    className="mt-1 w-full rounded-lg border border-[#C9D7D2] px-2 py-2 text-sm font-bold outline-none focus:border-[#2C8065]"
                  />
                </label>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#55716A]">
              <input
                type="checkbox"
                checked={activeUnit.hasCountertop}
                onChange={(event) => updateActiveUnit({ hasCountertop: event.target.checked })}
                className="h-4 w-4 accent-[#2C8065]"
              />
              Include countertop over this unit
            </label>
          </div>

          {/* Step 3: material / pattern */}
          <div className="border-t border-[#E3EBE8] pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">3. Cabinet material</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CABINET_MATERIALS.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => updateActiveUnit({ materialId: material.id })}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${activeUnit.materialId === material.id ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}
                  title={material.name}
                >
                  <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: material.color }} />
                  <span className="text-[10px] font-semibold text-[#55716A]">{material.name}</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Door style</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {doorStyleOptions.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateActiveUnit({ doorStyle: value })}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${activeUnit.doorStyle === value ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}
                >
                  <span>
                    <span className="block text-xs font-bold">{label}</span>
                    <span className="block text-[10px] text-[#71847E]">{desc}</span>
                  </span>
                  {activeUnit.doorStyle === value && <Check className="h-4 w-4 text-[#2C8065]" />}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Doors</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateActiveUnit({ doorCount: count })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-colors ${activeUnit.doorCount === count ? 'border-[#2C8065] bg-[#2C8065] text-white' : 'border-[#D6DFDC] text-[#55716A] hover:bg-[#EEF7F2]'}`}
                >
                  {count}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Handle style</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {handleStyleOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateActiveUnit({ handleStyle: value })}
                  className={`rounded-lg border py-2 text-xs font-bold transition-colors ${activeUnit.handleStyle === value ? 'border-[#2C8065] bg-[#2C8065] text-white' : 'border-[#D6DFDC] text-[#55716A] hover:bg-[#EEF7F2]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Step 4: countertop */}
      <div className="border-t border-[#E3EBE8] pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">4. Countertop material</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COUNTERTOP_MATERIALS.map((countertop) => (
            <button
              key={countertop.id}
              type="button"
              onClick={() => setCountertopId(countertop.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${countertopId === countertop.id ? 'border-[#2C8065] bg-[#EEF7F2]' : 'border-[#D6DFDC] hover:bg-[#F5F7F6]'}`}
              title={countertop.name}
            >
              <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: countertop.color }} />
              <span className="text-[10px] font-semibold text-[#55716A]">{countertop.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )

  const previewControls = (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => sceneRef.current?.zoomIn()} className="rounded-lg border border-[#D6DFDC] p-2 text-[#2C8065] transition-colors hover:bg-[#EEF7F2]" aria-label="Zoom in" title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => sceneRef.current?.zoomOut()} className="rounded-lg border border-[#D6DFDC] p-2 text-[#2C8065] transition-colors hover:bg-[#EEF7F2]" aria-label="Zoom out" title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => sceneRef.current?.resetView()} className="rounded-lg border border-[#D6DFDC] p-2 text-[#2C8065] transition-colors hover:bg-[#EEF7F2]" aria-label="Reset view" title="Reset view">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => setPreviewExpanded((current) => !current)} className="rounded-lg border border-[#D6DFDC] p-2 text-[#2C8065] transition-colors hover:bg-[#EEF7F2]" aria-label={previewExpanded ? 'Exit fullscreen' : 'Expand preview'} title={previewExpanded ? 'Exit fullscreen' : 'Expand preview'}>
        {previewExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  )

  const priceSummary = (
    <section className="rounded-2xl border border-[#B7D7C8] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55716A]">Cost estimate</p>
          <h2 className="mt-1 text-xl font-bold">Price breakdown</h2>
        </div>
        <Calculator className="h-5 w-5 text-[#2C8065]" />
      </div>

      <div className="mt-4 space-y-2">
        {price.units.map((unitPrice, index) => (
          <div key={unitPrice.unitId} className="flex items-center justify-between rounded-lg bg-[#F5F7F6] px-3 py-2 text-xs">
            <span className="font-semibold text-[#55716A]">{index + 1}. {CABINET_TYPE_LABELS[units[index].type]} ({units[index].widthInches}&quot;)</span>
            <span className="font-bold text-[#1B272B]">${unitPrice.total.toLocaleString('en-CA', { maximumFractionDigits: 0 })}</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-[#F5F7F6] px-3 py-2 text-xs">
          <span className="font-semibold text-[#55716A]">Installation</span>
          <span className="font-bold text-[#1B272B]">${price.installFee.toLocaleString('en-CA')}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#E3EBE8] pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#71847E]">Estimated total</p>
          <p className="text-2xl font-black text-[#1B272B]">${price.total.toLocaleString('en-CA')}</p>
        </div>
        <p className="text-[10px] text-[#71847E] text-right">Incl. install<br />excl. tax</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => window.alert(`Added ${units.length} cabinet(s) to cart — Est. $${price.total.toLocaleString('en-CA')}`)}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#2C8065] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#23634F]"
        >
          <Layers className="h-4 w-4" /> Add to Cart
        </button>
        <button
          type="button"
          onClick={() => setQuoteModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#203238] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2C8065]"
        >
          <Square className="h-4 w-4" /> Request a quote
        </button>
      </div>
    </section>
  )

  if (previewExpanded) {
    return (
      <main className="fixed inset-0 z-50 flex flex-col bg-[#F5F7F6] text-[#1B272B]">
        <div className="flex items-center justify-between border-b border-[#D6DFDC] bg-white px-5 py-3 shrink-0">
          <div>
            <p className="text-sm font-bold">Live 3D preview</p>
            <p className="text-xs text-[#71847E]">Drag to orbit, scroll to zoom</p>
          </div>
          <div className="flex items-center gap-2">
            {previewControls}
            <button
              type="button"
              onClick={() => setPreviewExpanded(false)}
              className="flex items-center gap-1.5 rounded-lg bg-[#203238] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#2C8065]"
            >
              <X className="h-4 w-4" /> Close
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[minmax(300px,360px)_1fr]">
          <aside className="space-y-5 overflow-y-auto rounded-2xl border border-[#D6DFDC] bg-white p-5 shadow-sm">
            {sidebar}
          </aside>

          <div className="grid min-h-0 grid-rows-[1fr_auto] gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-[#D6DFDC] bg-[#DDE9E5]">
              <CabinetScene ref={sceneRef} units={units} countertopId={countertopId} />
            </div>
            <div className="max-h-[40vh] overflow-y-auto">{priceSummary}</div>
          </div>
        </div>

        {quoteModalOpen && (
          <QuoteRequestModal
            units={units}
            countertopId={countertopId}
            totalPrice={price.total}
            onClose={() => setQuoteModalOpen(false)}
          />
        )}
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F7F6] text-[#1B272B]">
      <section className="border-b border-[#D6DFDC] bg-[#203238] px-5 pb-10 pt-28 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#B7D7C8]">Cargoplus Design Studio</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">Design your cabinet</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#D8E4E0] sm:text-base">Build a run of cabinets, adjust each unit&apos;s size, and pick materials and hardware before requesting a quote.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(300px,360px)_1fr]">
        <aside className="space-y-5 rounded-2xl border border-[#D6DFDC] bg-white p-5 shadow-sm">
          {sidebar}
        </aside>

        <div className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[#D6DFDC] bg-[#DDE9E5] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C8D8D2] bg-white px-5 py-4">
              <div>
                <p className="text-sm font-bold">Live 3D preview</p>
                <p className="text-xs text-[#71847E]">Drag to orbit, scroll to zoom</p>
              </div>
              {previewControls}
            </div>
            <div className="relative h-[420px] sm:h-[560px]">
              <CabinetScene ref={sceneRef} units={units} countertopId={countertopId} />
            </div>
          </div>

          {priceSummary}
        </div>
      </section>

      {quoteModalOpen && (
        <QuoteRequestModal
          units={units}
          countertopId={countertopId}
          totalPrice={price.total}
          onClose={() => setQuoteModalOpen(false)}
        />
      )}
    </main>
  )
}
