/*
  PlaybackController — Speed control buttons for the YouTube player.

  'use client' is needed because this component uses onClick handlers.
  onClick is a browser event — not available on the server.

  HOW THE SPEED CONTROL WORKS:
  ──────────────────────────────
  This component receives two props:
  1. currentRate — the currently selected speed (1, 0.75, or 0.5)
  2. onRateChange — a function to call when the user clicks a speed button

  The actual YouTube API call (player.setPlaybackRate) happens in LessonView,
  which owns the useYouTubePlayer hook. This component is purely the UI layer.

  This separation (UI component ↔ business logic hook) is called "lifting state up".
  PlaybackController doesn't need to know HOW the speed changes — just that it does.

  TOUCH-FRIENDLY DESIGN:
  ───────────────────────
  min-h-[52px] ensures buttons are at least 52px tall.
  WCAG (web accessibility guidelines) recommend 44px minimum for touch targets.
  For our users (30+ age group), we go slightly bigger.
*/

'use client';

interface PlaybackControllerProps {
  onRateChange: (rate: number) => void;
  currentRate: number;
}

const RATES = [
  { label: '0.5×', value: 0.5, hint: 'Half speed — best for studying wrist movement' },
  { label: '0.75×', value: 0.75, hint: 'Three-quarter speed' },
  { label: '1×', value: 1.0, hint: 'Normal speed' },
];

export function PlaybackController({ onRateChange, currentRate }: PlaybackControllerProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Playback Speed
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Use 0.5× slow-motion to study wrist and finger technique
        </p>
      </div>

      <div className="flex gap-3">
        {RATES.map((rate) => {
          const isActive = currentRate === rate.value;
          return (
            <button
              key={rate.value}
              onClick={() => onRateChange(rate.value)}
              title={rate.hint}
              className={`
                flex min-h-[52px] flex-1 items-center justify-center rounded-lg
                text-lg font-bold transition-all duration-150 active:scale-95
                ${isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }
              `}
            >
              {rate.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
