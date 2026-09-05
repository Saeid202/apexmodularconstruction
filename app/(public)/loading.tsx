/**
 * Homepage loading skeleton.
 *
 * Mirrors the real first screenful — a full-bleed hero block, the credential
 * strip, then the peeking model carousel — so the page does not visibly re-flow
 * when the real content arrives.
 */

function Bar({ className }: { className: string }) {
  return <div className={`rounded bg-neutral-200 ${className}`} />
}

export default function HomeLoading() {
  return (
    <div aria-hidden className="animate-pulse bg-white">
      {/* Hero */}
      <div className="flex h-[520px] items-center justify-center bg-neutral-200 sm:h-[600px] lg:h-[660px]">
        <div className="flex w-full max-w-2xl flex-col items-center gap-5 px-6">
          <Bar className="h-9 w-full max-w-xl bg-neutral-300 md:h-12" />
          <Bar className="h-9 w-2/3 bg-neutral-300 md:h-12" />
          <Bar className="mt-2 h-4 w-1/2 bg-neutral-300" />
          <div className="mt-4 flex gap-3">
            <Bar className="h-10 w-32 rounded-full bg-neutral-300" />
            <Bar className="h-10 w-32 rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>

      {/* Credential strip */}
      <div className="border-b border-neutral-100 py-7">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-center gap-x-12 gap-y-3 px-5 sm:px-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bar key={i} className="h-3 w-28" />
          ))}
        </div>
      </div>

      {/* Model carousel */}
      <div className="py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-10">
          <Bar className="h-8 w-56" />
          <Bar className="mt-4 h-4 w-full max-w-md" />
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-[1360px] gap-4 overflow-hidden pl-5 sm:pl-8 lg:pl-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[380px] w-[86%] shrink-0 rounded-2xl bg-neutral-200 sm:h-[440px] sm:w-[62%] lg:h-[470px] lg:w-[47.5%]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
