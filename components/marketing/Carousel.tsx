'use client'

/**
 * Carousel primitive shared by the hero, model and spotlight sections.
 *
 * The reference site drives almost its entire homepage with this one pattern:
 * circular arrow buttons pinned to the sides, small dot indicators, and — for the
 * model row — the next slide peeking in from the right.
 *
 * ## Why this is built around "pages" rather than slides
 *
 * Naively rendering one dot per slide is wrong for any carousel that shows more
 * than one slide at a time. Near the right-hand end the browser clamps
 * `scrollLeft` to `scrollWidth - clientWidth`, so the last few slides can never
 * reach the left edge. With six cards at ~2.1 per view that made dot 5
 * unreachable: clicking it scrolled to the clamped maximum, which reported slide
 * 6, so the dot could never become active.
 *
 * So we compute the set of *distinct reachable scroll offsets* and render one dot
 * per offset. Every dot is then guaranteed to be selectable, at any slide width
 * and any viewport, with no hardcoded assumptions about how many fit on screen.
 *
 * Scroll position remains the single source of truth for what is active —
 * navigation only scrolls, and an observer reads the result back.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Scroll offset that brings a slide to the start of the track, clamped to the
 *  furthest the track can actually scroll. */
function offsetFor(track: HTMLElement, slide: HTMLElement) {
  const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth)
  return Math.min(Math.round(slide.offsetLeft - track.offsetLeft), maxScroll)
}

/** Distinct reachable scroll offsets, each paired with the slide it reveals. */
function measurePages(track: HTMLElement) {
  const slides = [...track.children] as HTMLElement[]
  const seen = new Set<number>()
  const pages: { offset: number; slide: number }[] = []

  slides.forEach((slide, index) => {
    const offset = offsetFor(track, slide)
    if (seen.has(offset)) return
    seen.add(offset)
    pages.push({ offset, slide: index })
  })

  return pages
}

const samePages = (a: { offset: number }[], b: { offset: number }[]) =>
  a.length === b.length && a.every((page, i) => page.offset === b[i].offset)

const sameSet = (a: Set<number>, b: Set<number>) =>
  a.size === b.size && [...a].every((value) => b.has(value))

interface CarouselProps {
  /** Accessible name for the carousel region. */
  label: string
  /** One entry per slide. */
  children: React.ReactNode[]
  /** Show the next slide partially, as the reference's model row does. */
  peek?: boolean
  /** Where the dot indicators sit. `overlay` places them on the media. */
  dots?: 'below' | 'overlay' | 'none'
  arrows?: 'inside' | 'none'
  autoplay?: boolean
  /** Seconds between advances when autoplay is on. */
  interval?: number
  className?: string
  trackClassName?: string
}

export function Carousel({
  label,
  children,
  peek = false,
  dots = 'below',
  arrows = 'inside',
  autoplay = false,
  interval = 6,
  className,
  trackClassName,
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const count = children.length
  const slideKeys = useMemo(() => children.map((_, i) => `slide-${i}`), [children])

  const [pages, setPages] = useState<{ offset: number; slide: number }[]>([])
  const [activePage, setActivePage] = useState(0)
  const [paused, setPaused] = useState(false)

  // Bumped by any user navigation so the autoplay interval restarts instead of
  // firing immediately after someone has just chosen a slide themselves.
  const [interactionCount, setInteractionCount] = useState(0)

  // Slides scrolled out of the track are made `inert`, otherwise tabbing walks
  // into CTAs nobody can see and yanks the track sideways. Starts as "everything
  // visible" so the markup is fully interactive before hydration.
  const [visible, setVisible] = useState<Set<number>>(
    () => new Set(children.map((_, i) => i))
  )

  const scrollToOffset = useCallback((offset: number) => {
    trackRef.current?.scrollTo({ left: offset, behavior: 'smooth' })
  }, [])

  const goToPage = useCallback(
    (pageIndex: number, fromUser: boolean) => {
      const track = trackRef.current
      if (!track) return
      const list = measurePages(track)
      if (list.length === 0) return
      const wrapped = ((pageIndex % list.length) + list.length) % list.length
      if (fromUser) setInteractionCount((n) => n + 1)
      scrollToOffset(list[wrapped].offset)
    },
    [scrollToOffset]
  )

  /** Step relative to whatever is actually on screen right now. */
  const step = useCallback(
    (delta: number, fromUser: boolean) => {
      const track = trackRef.current
      if (!track) return
      const list = measurePages(track)
      if (list.length === 0) return
      let current = 0
      let best = Infinity
      list.forEach((page, i) => {
        const distance = Math.abs(page.offset - track.scrollLeft)
        if (distance < best) {
          best = distance
          current = i
        }
      })
      goToPage(current + delta, fromUser)
    },
    [goToPage]
  )

  // Single writer of page geometry and active state, so the dots can never
  // disagree with the view. An IntersectionObserver rather than only a scroll
  // listener: when images finish loading the track re-lays-out and the browser
  // re-snaps it, and that correction does not reliably emit a scroll event.
  useEffect(() => {
    const track = trackRef.current
    if (!track || count === 0) return

    const sync = () => {
      const list = measurePages(track)
      setPages((prev) => (samePages(prev, list) ? prev : list))

      let current = 0
      let best = Infinity
      list.forEach((page, i) => {
        const distance = Math.abs(page.offset - track.scrollLeft)
        if (distance < best) {
          best = distance
          current = i
        }
      })
      setActivePage(current)

      // A slide counts as interactive once most of it is inside the track, so the
      // fully-shown cards qualify but the sliver of the next one does not.
      const trackRect = track.getBoundingClientRect()
      const next = new Set<number>()
      ;[...track.children].forEach((slide, i) => {
        const r = slide.getBoundingClientRect()
        const shown = Math.min(r.right, trackRect.right) - Math.max(r.left, trackRect.left)
        if (r.width > 0 && shown / r.width >= 0.6) next.add(i)
      })
      if (next.size === 0 && list[current]) next.add(list[current].slide)
      setVisible((prev) => (sameSet(prev, next) ? prev : next))
    }

    const observer = new IntersectionObserver(sync, { root: track, threshold: [0, 0.5, 0.9] })
    for (const slide of track.children) observer.observe(slide)

    const resizeObserver = new ResizeObserver(sync)
    resizeObserver.observe(track)

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }

    sync()
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [count])

  const pageCount = pages.length

  useEffect(() => {
    if (!autoplay || pageCount <= 1 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = setInterval(() => {
      if (document.hidden) return
      step(1, false)
    }, interval * 1000)

    return () => clearInterval(timer)
  }, [autoplay, pageCount, interval, paused, step, interactionCount])

  const showArrows = arrows === 'inside' && pageCount > 1
  const showDots = dots !== 'none' && pageCount > 1

  return (
    <div
      className={cn('relative', className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <ul
        ref={trackRef}
        className={cn(
          'scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
          peek ? 'gap-3 sm:gap-4' : 'gap-0',
          trackClassName
        )}
      >
        {children.map((slide, i) => (
          <li
            key={slideKeys[i]}
            className={cn(
              'shrink-0 snap-start',
              peek ? 'w-[86%] sm:w-[62%] lg:w-[47.5%]' : 'w-full'
            )}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            inert={!visible.has(i)}
          >
            {slide}
          </li>
        ))}
      </ul>

      {showArrows && (
        <>
          <ArrowButton direction="previous" onClick={() => step(-1, true)} />
          <ArrowButton direction="next" onClick={() => step(1, true)} />
        </>
      )}

      {showDots && (
        <div
          className={cn(
            'flex items-center justify-center',
            dots === 'overlay' ? 'absolute inset-x-0 bottom-3 z-20' : 'mt-3'
          )}
        >
          {pages.map((page, i) => (
            <button
              key={page.offset}
              type="button"
              onClick={() => goToPage(i, true)}
              aria-label={`Go to slide ${page.slide + 1} of ${count}`}
              aria-current={i === activePage}
              // The visual dot stays 8px, but the button is padded to a 24px
              // target so it satisfies WCAG 2.5.8 on touch.
              className="group/dot flex h-6 w-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span
                className={cn(
                  'block h-2 w-2 rounded-full transition-colors duration-300',
                  i === activePage
                    ? dots === 'overlay'
                      ? 'bg-white'
                      : 'bg-[#4B1D8F]'
                    : dots === 'overlay'
                      ? 'bg-white/45 group-hover/dot:bg-white/70'
                      : 'bg-neutral-300 group-hover/dot:bg-neutral-400'
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction === 'previous' ? 'Previous' : 'Next'} slide`}
      className={cn(
        'absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none sm:flex',
        direction === 'previous' ? 'left-4' : 'right-4'
      )}
    >
      <Icon aria-hidden className="h-5 w-5" />
    </button>
  )
}
