/*
  Metronome — Interactive BPM controller using the useMetronome hook.

  'use client' is needed because:
  - onClick handlers (user interaction)
  - onChange on the slider
  - Renders dynamic state (isPlaying, bpm)
  - The hook internally uses browser AudioContext

  UI ELEMENTS:
  ─────────────
  1. BPM Display      — large number, tabular-nums for stable width
  2. Increment buttons — +5 / -5 for quick adjustment
  3. Range slider      — smooth drag between minBpm and maxBpm
  4. Preset buttons    — tap a common BPM (60, 80, 100, 120, 140)
  5. Start/Stop button — large, full-width, changes color when active

  DESIGN CHOICES:
  ────────────────
  - font-mono tabular-nums → numbers don't shift/jump as BPM changes (monospace)
  - min-h-[56px] on Start/Stop → big touch target for older learners
  - active:scale-95 → button slightly shrinks on press = satisfying physical feedback
  - Amber when stopped, red when playing → clear state indicator
*/

'use client';

import { Pause, Play, Minus, Plus } from 'lucide-react';
import { useMetronome } from '@/hooks/useMetronome';

interface MetronomeProps {
  defaultBpm?: number;
  minBpm?: number;
  maxBpm?: number;
}

export function Metronome({ defaultBpm = 80, minBpm = 60, maxBpm = 160 }: MetronomeProps) {
  const { isPlaying, bpm, setBpm, toggle } = useMetronome(defaultBpm);

  // Clamp adjustment so BPM never goes below minBpm or above maxBpm
  const adjustBpm = (delta: number) => {
    setBpm((prev) => Math.min(maxBpm, Math.max(minBpm, prev + delta)));
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

      <div className="mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Metronome — Taalam
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Practice your vaythari in time before adding speed
        </p>
      </div>

      {/* ── BPM Display + Increment Buttons ─────────────────────────────── */}
      <div className="mb-5 flex items-center justify-center gap-5">
        <button
          onClick={() => adjustBpm(-5)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 active:scale-95"
          aria-label="Decrease BPM by 5"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* tabular-nums → each digit takes the same width, number stays centered */}
        <div className="text-center">
          <span className="font-mono text-6xl font-black tabular-nums text-amber-400">
            {bpm}
          </span>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">BPM</p>
        </div>

        <button
          onClick={() => adjustBpm(5)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 active:scale-95"
          aria-label="Increase BPM by 5"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* ── Slider ──────────────────────────────────────────────────────── */}
      {/* Styled via accent-color in globals.css */}
      <input
        type="range"
        min={minBpm}
        max={maxBpm}
        step={1}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="mb-5 w-full"
        aria-label="BPM slider"
      />

      {/* ── Preset BPM Buttons ───────────────────────────────────────────── */}
      <div className="mb-5 flex gap-2">
        {[60, 80, 100, 120, 140].map((preset) => (
          <button
            key={preset}
            onClick={() => setBpm(preset)}
            className={`flex-1 rounded-md py-2 text-xs font-bold transition-colors ${
              bpm === preset
                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* ── Start / Stop ─────────────────────────────────────────────────── */}
      <button
        onClick={toggle}
        className={`
          flex min-h-[56px] w-full items-center justify-center gap-3
          rounded-xl text-lg font-bold transition-all duration-150 active:scale-95
          ${isPlaying
            ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40 hover:bg-red-500/30'
            : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
          }
        `}
        aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
      >
        {isPlaying ? (
          <>
            <Pause className="h-6 w-6" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-6 w-6" />
            Start Taalam
          </>
        )}
      </button>

    </div>
  );
}
