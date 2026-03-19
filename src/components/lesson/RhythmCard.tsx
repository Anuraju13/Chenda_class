/*
  RhythmCard — Beat-by-beat visual breakdown of a rhythm pattern.

  FONT DECISION — why font-malayalam matters here:
  ─────────────────────────────────────────────────
  The individual syllables (ത, കി, ട്ട, ധിം) are single characters or short clusters.
  Without Manjari/Gayathri, browsers fall back to system fonts which:
  - May render Malayalam incorrectly (wrong conjuncts)
  - Have inconsistent glyph widths, causing beat cards to be different widths
  - Look pixelated at large sizes on Windows

  Manjari (our primary) was specifically designed for large-display use —
  it has uniform stroke widths and clear conjunct ligatures (ട്ട is one combined glyph).

  WHY DATA-DRIVEN (props) INSTEAD OF HARDCODED:
  ───────────────────────────────────────────────
  The original component had the beat array inside the component file.
  We moved it to curriculum.json so:
  - You can add rhythm patterns to any lesson without writing React code
  - Future you can update patterns just by editing JSON
  - Each pattern can have its own title, beats, and tip cards

  STRIKE TYPE COLORS:
  ────────────────────
  Beat cards are colored by their strike type, giving a visual rhythm map:
  - Stick       → neutral slate
  - Hand/Tap    → blue (softer sound)
  - Power Strike → amber (dominant, loudest)
  - Filler      → zinc (lighter, connecting strokes)
*/

import { Music } from 'lucide-react';
import type { RhythmPattern } from '@/types/curriculum';

interface RhythmCardProps {
  patterns: RhythmPattern[];
}

// Color scheme per beat type — applied to the card border and transliteration text
const BEAT_TYPE_STYLES: Record<string, { border: string; label: string }> = {
  Stick: {
    border: 'border-slate-600',
    label: 'text-slate-400',
  },
  'Hand/Tap': {
    border: 'border-blue-700/60',
    label: 'text-blue-400',
  },
  'Power Strike': {
    border: 'border-amber-500/70',
    label: 'text-amber-400',
  },
  Filler: {
    border: 'border-zinc-700',
    label: 'text-zinc-500',
  },
};

// Fallback for unrecognized beat types
const DEFAULT_BEAT_STYLE = { border: 'border-slate-700', label: 'text-slate-500' };

export function RhythmCard({ patterns }: RhythmCardProps) {
  return (
    <div className="space-y-6">
      {patterns.map((pattern, pIdx) => (
        <div
          key={pIdx}
          className="rounded-2xl border border-amber-900/50 bg-zinc-900 p-6 shadow-2xl"
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold uppercase tracking-wider text-amber-500">
                <Music className="h-5 w-5" />
                {pattern.title}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-400">{pattern.subtitle}</p>
            </div>
            <span className="rounded-full border border-amber-900/50 bg-amber-900/30 px-3 py-1 font-mono text-xs text-amber-500">
              {pattern.cycleName}
            </span>
          </div>

          {/* ── Beat Grid ───────────────────────────────────────────────────── */}
          {/*
            flex-wrap → beats wrap to next line on narrow screens
            justify-center → centered on all screen widths
            gap-3 → consistent spacing between beat cards
          */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {pattern.beats.map((beat, bIdx) => {
              const styles = BEAT_TYPE_STYLES[beat.type] ?? DEFAULT_BEAT_STYLE;
              const isPowerStrike = beat.type === 'Power Strike';

              return (
                <div
                  key={bIdx}
                  className={`group flex flex-col items-center rounded-xl border bg-zinc-800/50 px-3 py-3 transition-colors hover:bg-zinc-800 ${styles.border}`}
                >
                  {/*
                    Malayalam SYLLABLE — the visually dominant element of each beat card.

                    font-malayalam → applies Manjari font (from tailwind.config.ts fontFamily.malayalam)
                                     Falls back to Gayathri, then serif.
                    text-4xl md:text-5xl → 36px mobile, 48px desktop — large enough to read clearly
                    font-bold → Manjari weight 700, renders crisp conjuncts (ட்ட as one glyph)
                    group-hover:text-amber-400 → subtle highlight on hover to indicate interactivity
                  */}
                  <span
                    className={`font-malayalam text-4xl font-bold transition-colors group-hover:text-amber-400 md:text-5xl ${
                      isPowerStrike ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {beat.ml}
                  </span>

                  {/* Latin transliteration */}
                  <span
                    className={`mt-1.5 font-mono text-[10px] uppercase tracking-tighter ${styles.label} ${
                      isPowerStrike ? 'font-black' : ''
                    }`}
                  >
                    {beat.en}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Practice Tip Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase text-zinc-500">Emphasis</p>
              {/*
                The emphasis text contains the word "DHIM" in all caps.
                We parse it so DHIM gets highlighted in amber — visual link to the beat card.
              */}
              <p className="text-sm text-zinc-300">
                {pattern.emphasis.split('DHIM').map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="font-bold text-amber-500 underline">DHIM</span>
                    </span>
                  ) : (
                    part
                  )
                )}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase text-zinc-500">Target Speed</p>
              {/*
                Highlight numbers like "80 BPM" and "120" in white bold.
              */}
              <p className="text-sm text-zinc-300">
                {pattern.targetSpeed
                  .split(/(\d+ BPM|\d+)/)
                  .map((part, i) =>
                    /^\d+/.test(part) ? (
                      <span key={i} className="font-bold text-white">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
