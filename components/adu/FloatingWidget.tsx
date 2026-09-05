"use client";

/**
 * Floating support launcher and its panel.
 *
 * Restyled to sit inside the same design language as the rest of the site: white
 * surfaces, hairline neutral borders, brand purple reserved for glyphs and small
 * accents, and elevation rather than colour mass to signal "this floats".
 *
 * Previously the launcher was an 80px block of solid #4B1D8F and the panel header
 * was a full-width solid purple band, which read as far heavier than anything
 * else on the page. Purple is still present — it is just carrying the icon and
 * the focus ring instead of a large fill.
 */

import React, { useState } from 'react';
import { X, Bot, Maximize2, Minimize2 } from 'lucide-react';
import { ApexAIAssistant } from '@/components/ai-assistant/ApexAIAssistant';
import { cn } from '@/lib/utils';

export function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMaximized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div
          className={cn(
            'shadow-panel mb-4 flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-500 ease-in-out animate-in fade-in zoom-in slide-in-from-bottom-10',
            isMaximized
              ? 'h-[92vh] w-[96vw] sm:h-[90vh]'
              : 'h-[750px] max-h-[85vh] w-[90vw] sm:w-[650px]'
          )}
        >
          {/* Header — white with a hairline rule, matching the site header and the
              card language, rather than a solid purple band. */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-tint)] text-[#4B1D8F]"
              >
                <Bot className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-neutral-900">
                  Apex AI Assistant
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="hidden rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:outline-none sm:block"
                aria-label={isMaximized ? 'Restore assistant size' : 'Maximize assistant'}
                title={isMaximized ? 'Minimize' : 'Maximize'}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleOpen}
                aria-label="Close AI assistant"
                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Area. The panel supplies its own header above, so the
              assistant's internal one is suppressed to avoid showing the same
              title twice. */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ApexAIAssistant showHeader={false} />
          </div>
        </div>
      )}

      {/* Launcher — elevation and a purple glyph do the work that a large solid
          purple fill used to. 56px instead of 80px so it stops dominating the
          bottom-right corner. */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Open Apex AI assistant"
          className="shadow-panel group flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#4B1D8F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--surface-subtle)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Bot className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
        </button>
      )}
    </div>
  );
}
