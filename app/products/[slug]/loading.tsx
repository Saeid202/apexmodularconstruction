const GOLD = '#D4AF37'

/**
 * Mirrors the configurator's full-viewport, two-column shape so the transition
 * into the loaded page doesn't shift anything around.
 */
export default function ProductDetailLoading() {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <div
        className="flex h-14 shrink-0 items-center gap-4 px-5"
        style={{
          background:
            'linear-gradient(135deg, var(--brand-chrome-from) 0%, var(--brand-chrome-to) 100%)',
          borderBottom: `1px solid ${GOLD}55`,
        }}
      >
        <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-white/20" />
        <div className="flex-1">
          <div className="h-4 w-48 max-w-full animate-pulse rounded bg-white/20" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-xl bg-white/20" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Stage */}
        <div
          className="h-[38vh] min-h-[220px] shrink-0 animate-pulse lg:h-full lg:min-h-0 lg:flex-1"
          style={{
            background:
              'radial-gradient(ellipse at 50% -10%, #FFFFFF 0%, #F5F2FB 45%, #E7E0F4 100%)',
          }}
        />

        {/* Rail */}
        <aside className="flex min-h-0 flex-1 flex-col border-t border-gray-200 lg:h-full lg:w-[456px] lg:flex-none lg:border-t-0 lg:border-l xl:w-[520px]">
          <div className="flex-1 animate-pulse space-y-4 px-6 py-5">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-7 w-3/4 rounded bg-muted" />
            <div className="h-9 w-40 rounded bg-muted" />
            <div className="h-11 w-full rounded-xl bg-muted" />
            <div className="space-y-2 pt-2">
              <div className="h-14 w-full rounded-2xl bg-muted" />
              <div className="h-14 w-full rounded-2xl bg-muted" />
              <div className="h-14 w-full rounded-2xl bg-muted" />
            </div>
          </div>
          <div className="shrink-0 border-t border-gray-200 px-6 py-4">
            <div className="mb-3 h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 animate-pulse rounded-xl bg-muted" />
              <div className="h-12 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
