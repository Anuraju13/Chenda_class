/*
  VaythariCard — Displays the rhythmic chant (vaythari) patterns for a lesson.

  This is a SERVER COMPONENT (no 'use client') because it only displays data.
  Server components:
  - Render on the server into HTML
  - No JavaScript sent to the browser for this component
  - Faster page loads, better for SEO

  The key CSS classes for Malayalam rendering:
  - font-malayalam  → applies Manjari/Gayathri via the CSS variable
  - text-5xl        → 48px — large enough to read during practice
  - font-bold       → weight 700 for strong visual presence
  - leading-loose   → 2.0 line height — CRITICAL for Malayalam. The script has tall
                      ascenders (like in ക്കി) that clip at normal line heights.
  - tracking-wide   → slightly wider letter spacing improves readability
*/

import type { VaythariItem } from '@/types/curriculum';

interface VaythariCardProps {
  items: VaythariItem[];
}

// Map tempo to a human-readable badge color
const TEMPO_STYLES: Record<VaythariItem['tempo'], string> = {
  slow: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  fast: 'bg-red-500/20 text-red-400',
};

export function VaythariCard({ items }: VaythariCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-slate-900">

      {/* Header bar with amber top accent */}
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          വായ്ത്താരി — Vaythari
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          The rhythmic syllables — read aloud while you practice
        </p>
      </div>

      {/* List of vaythari patterns */}
      <div className="divide-y divide-slate-800">
        {items.map((item, idx) => (
          <div key={idx} className="px-5 py-6">

            {/* Pattern label + tempo badge */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-semibold text-slate-300">
                {item.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TEMPO_STYLES[item.tempo]}`}>
                {item.tempo}
              </span>
            </div>

            {/*
              THE MALAYALAM TEXT — the most important element on the page.

              font-malayalam → Manjari font (declared in tailwind.config.ts)
              text-4xl lg:text-5xl → 36px on mobile, 48px on desktop
              font-bold → Manjari 700 weight
              leading-loose → 2.0 line height (prevents character clipping)
              tracking-wide → +0.025em letter spacing
              text-amber-100 → warm white, not harsh pure white — easy on eyes in dark mode
              [word-spacing:0.2em] → adds space between words for readability
            */}
            <p className="font-malayalam text-4xl font-bold leading-loose tracking-wide text-amber-100 [word-spacing:0.2em] lg:text-5xl">
              {item.text}
            </p>

            {/* Transliteration — phonetic guide in Latin script */}
            <p className="mt-3 font-mono text-sm tracking-widest text-slate-500">
              {item.transliteration}
            </p>

          </div>
        ))}
      </div>

    </div>
  );
}
