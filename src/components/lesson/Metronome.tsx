/*
  Metronome — "Shingari Tempo Master" (v4)

  NEW IN THIS VERSION: syllable-linked beat display
  ──────────────────────────────────────────────────
  When a `syllables` prop is passed (from the lesson's vaythari), the 8 generic
  dots are replaced with the actual rhythmic syllables as cards (ത, കി, ട).
  Each card lights up amber when that syllable is the current beat — so students
  can see exactly which syllable they should be striking at any moment.

  If no syllables are provided, the component falls back to the original 8-dot display.

  HOW THE CYCLE LENGTH WORKS:
  ─────────────────────────────
  The scheduler always ticks at BPM (one tick per beat). We track a running
  `beatIndex` that increments every tick. The active slot is:
    beatIndex % syllablesCountRef.current
  where syllablesCountRef holds the syllable count (or 8 for dots).
  Storing it in a ref means the scheduler picks up changes to the syllable list
  without restarting — same pattern as bpmRef.

  When not playing, currentBeat = -1, so -1 % n = -1 in JS, which never equals
  any valid index. Nothing is highlighted. Clean initial state.
*/

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import type { VaythariSyllable } from '@/types/curriculum';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface MetronomeProps {
  defaultBpm?: number;
  minBpm?: number;
  maxBpm?: number;
  // Optional: syllables from the lesson's vaythari (e.g. [{ml:"ത",en:"Tha"}, ...])
  // When provided, replaces the 8-dot display with labelled syllable cards.
  syllables?: VaythariSyllable[];
}

export function Metronome({ defaultBpm = 80, minBpm = 40, maxBpm = 200, syllables }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(defaultBpm);
  const [currentBeat, setCurrentBeat] = useState(-1); // -1 = not playing

  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // bpmRef mirrors bpm state so the scheduler reads the latest BPM
  // without needing to restart when the user changes BPM.
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  // syllablesCountRef mirrors the syllable count so the scheduler uses
  // the correct cycle length even if syllables prop changes.
  const syllablesCountRef = useRef(syllables?.length ?? 8);
  syllablesCountRef.current = syllables?.length ?? 8;

  // ─── Click sound generator ──────────────────────────────────────────────────
  // beatIdx 0 = downbeat (1000 Hz accent), all others = 800 Hz regular tick.
  const playClick = (time: number, beatIdx: number) => {
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(beatIdx === 0 ? 1000 : 800, time);

    envelope.gain.setValueAtTime(0.1, time);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  };

  // ─── Scheduler via requestAnimationFrame ────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      setCurrentBeat(-1);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext!)();
    }
    audioContextRef.current.resume();

    let nextTickTime = audioContextRef.current.currentTime;
    let beatIndex = 0;

    const scheduler = () => {
      while (nextTickTime < audioContextRef.current!.currentTime + 0.1) {
        // Use syllablesCountRef so the cycle matches however many syllables
        // (or 8 for the default dots) are currently displayed.
        const beatIdx = beatIndex % syllablesCountRef.current;
        playClick(nextTickTime, beatIdx);
        nextTickTime += 60.0 / bpmRef.current;
        setCurrentBeat(beatIdx);
        beatIndex++;
      }
      animFrameRef.current = requestAnimationFrame(scheduler);
    };

    scheduler();

    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const adjustBpm = (delta: number) => {
    setBpm((prev) => Math.min(maxBpm, Math.max(minBpm, prev + delta)));
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#12141d] p-8 rounded-[40px] border-2 border-amber-600/30 w-full text-center shadow-2xl">

      <h2 className="text-amber-500 font-bold text-xs tracking-[0.3em] uppercase mb-8">
        Shingari Tempo Master
      </h2>

      {/* ── BPM Display ───────────────────────────────────────────────────── */}
      <div className="relative inline-block mb-10">
        <div className="text-8xl font-black text-white tracking-tighter">{bpm}</div>
        <span className="absolute bottom-4 -right-10 text-[10px] text-zinc-600 font-bold">BPM</span>
      </div>

      {/* ── Beat Visualiser ───────────────────────────────────────────────── */}
      {/*
        Two modes:
        A) syllables provided → labelled cards, one per syllable, cycling through them
        B) no syllables → 8 generic amber dots (Chempada tala)
      */}
      {syllables && syllables.length > 0 ? (
        /*
          Syllable card mode.
          Each card shows the Malayalam character (large) + transliteration (small below).
          Active card: amber background highlight + slight scale-up.
          Inactive cards: dimmed to 40% opacity so the active one stands out clearly.
          font-malayalam → Manjari font for correct Malayalam glyph rendering.
        */
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {syllables.map((syl, i) => (
            <div
              key={i}
              className={`flex flex-col items-center px-4 py-3 rounded-2xl border transition-all duration-75 ${
                i === currentBeat
                  ? 'bg-amber-500/20 border-amber-500/70 scale-110 shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                  : 'bg-zinc-800/40 border-zinc-700/50 opacity-40'
              }`}
            >
              <span className="font-malayalam text-3xl font-bold text-amber-100 leading-tight">
                {syl.ml}
              </span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                {syl.en}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Dot mode — 8 dots for Chempada tala */
        <div className="flex justify-center gap-3 mb-12">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-75 ${
                i === currentBeat
                  ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4">

        <button
          onClick={() => adjustBpm(-5)}
          className="p-4 bg-zinc-900 rounded-full text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-90"
          aria-label="Decrease BPM by 5"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="h-24 w-24 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-amber-500 transition-transform active:scale-95"
          aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
        >
          {isPlaying
            ? <Square size={36} fill="white" />
            : <Play size={40} className="ml-2" fill="white" />
          }
        </button>

        <button
          onClick={() => adjustBpm(5)}
          className="p-4 bg-zinc-900 rounded-full text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-90"
          aria-label="Increase BPM by 5"
        >
          <ChevronRight size={32} />
        </button>

      </div>

      <p className="mt-10 text-zinc-600 text-[11px] italic uppercase tracking-wider">
        Adjust speed to match your group&apos;s progress.
      </p>

    </div>
  );
}
