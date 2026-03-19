/*
  Metronome — "Shingari Tempo Master"

  WHAT CHANGED FROM THE OLD VERSION:
  ────────────────────────────────────
  1. Sound: square wave at 880Hz (High A). Square waves have more harmonic content
     than sine → sharper, more percussive "Tak" sound — closer to a real woodblock.

  2. Scheduler: requestAnimationFrame instead of setTimeout.
     requestAnimationFrame syncs with the browser's repaint cycle (60fps).
     This is better for the VISUAL beat dots — they update in sync with the screen.
     The audio scheduling still uses AudioContext.currentTime (hardware clock),
     so timing precision is unchanged.

  3. Beat visualiser: 8 dots, one glows amber + scales up for the current beat.
     The eighth beat of Chempada tala is made visually distinct.

  4. Controls: Rewind/FastForward (-5/+5 BPM) + Play/Square (start/stop).
     Simpler and more finger-friendly than the previous slider + presets.

  IMPROVEMENT OVER THE ORIGINAL CODE SHARED:
  ────────────────────────────────────────────
  The provided code re-created a new AudioContext on every BPM change (because
  `bpm` was in the useEffect dependency array). AudioContexts are expensive browser
  resources — browsers warn when you create too many.

  Fix: BPM is tracked via `bpmRef`. The scheduler always reads `bpmRef.current`,
  so BPM changes take effect on the next tick WITHOUT restarting the scheduler or
  creating a new AudioContext.

  webkitAudioContext:
  ────────────────────
  Older Safari versions use `window.webkitAudioContext` instead of `window.AudioContext`.
  We declare it on `Window` so TypeScript doesn't complain.
*/

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, FastForward, Rewind } from 'lucide-react';

// Tell TypeScript that older Safari exposes AudioContext under this vendor-prefixed name
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface MetronomeProps {
  defaultBpm?: number;
  minBpm?: number;
  maxBpm?: number;
}

export function Metronome({ defaultBpm = 80, minBpm = 40, maxBpm = 200 }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(defaultBpm);
  const [currentBeat, setCurrentBeat] = useState(-1); // -1 = not playing, no beat highlighted

  // Refs that persist across renders without causing re-renders themselves
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // KEY PATTERN: bpmRef mirrors the bpm state, but it's readable synchronously
  // inside the scheduler closure. This means BPM changes are picked up on the
  // very next tick — no need to restart the scheduler when BPM changes.
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm; // Always in sync with state

  // ─── Click sound generator ──────────────────────────────────────────────────
  // Called ahead of time (scheduled for `time` in the future, not played right now).
  // Square wave = richer harmonic content = sharper, more woodblock-like sound.
  const playTakSound = (time: number) => {
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    osc.type = 'square';                   // Sharper than 'sine' — closer to a real Tak
    osc.frequency.setValueAtTime(880, time); // High A note — clear and cutting

    envelope.gain.setValueAtTime(0.2, time);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05); // 50ms decay

    osc.connect(envelope);
    envelope.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  };

  // ─── Scheduler via requestAnimationFrame ────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      // Stop: cancel pending animation frame, reset beat display
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      setCurrentBeat(-1);
      return;
    }

    // Create AudioContext lazily on first play (browser autoplay policy requires
    // AudioContext to be created inside a user gesture handler)
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext!)();
    }
    // Resume in case the browser suspended the context (happens after inactivity)
    audioContextRef.current.resume();

    let nextTickTime = audioContextRef.current.currentTime;
    let beatIndex = 0;

    const scheduler = () => {
      // Look-ahead window: 100ms.
      // Schedule all beats that fall within the next 100ms.
      // requestAnimationFrame runs ~60 times/sec (every ~16ms),
      // so we always stay well ahead of playback.
      while (nextTickTime < audioContextRef.current!.currentTime + 0.1) {
        playTakSound(nextTickTime);

        // Advance by one beat interval using the CURRENT bpm (via ref)
        // This is how BPM changes take effect immediately without restarting
        nextTickTime += 60.0 / bpmRef.current;

        // Update beat display — cycle through 0–7 (Chempada tala = 8 beats)
        setCurrentBeat(beatIndex % 8);
        beatIndex++;
      }

      animFrameRef.current = requestAnimationFrame(scheduler);
    };

    scheduler();

    // Cleanup: runs when isPlaying becomes false or component unmounts
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]); // BPM changes are handled via bpmRef — no restart needed

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const adjustBpm = (delta: number) => {
    setBpm((prev) => Math.min(maxBpm, Math.max(minBpm, prev + delta)));
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border-2 border-amber-600 bg-zinc-900 p-8 text-center shadow-xl">

      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-amber-500">
        Shingari Tempo Master
      </h3>

      {/* ── BPM Display ───────────────────────────────────────────────────── */}
      {/*
        font-mono → monospace so digits don't shift width (120 vs 80 have same visual footprint)
        tracking-tighter → tighter letter spacing looks better at large sizes
      */}
      <div className="mb-6 font-mono text-6xl font-black tracking-tighter text-white">
        {bpm}{' '}
        <span className="text-xs font-normal text-zinc-500">BPM</span>
      </div>

      {/* ── Beat Visualiser ───────────────────────────────────────────────── */}
      {/*
        8 dots = 8-beat Chempada tala cycle.
        The active dot: glows amber, scales up 125%, and has a box-shadow glow.
        shadow-[0_0_10px_#f59e0b] is a Tailwind arbitrary value — custom CSS shadow
        using the amber-500 hex color (#f59e0b) to create a glow effect.
        transition-all duration-100 → smooth but fast transition (too slow looks laggy)
      */}
      <div className="mb-8 flex justify-center gap-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-all duration-100 ${
              i === currentBeat
                ? 'scale-125 bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-center gap-6">

        {/* -5 BPM */}
        <button
          onClick={() => adjustBpm(-5)}
          className="rounded-full bg-zinc-800 p-3 text-white hover:bg-zinc-700 active:scale-95"
          aria-label="Decrease BPM by 5"
        >
          <Rewind size={24} />
        </button>

        {/* Play / Stop — large central button */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="rounded-full bg-amber-600 p-6 text-white transition-transform hover:bg-amber-500 active:scale-95"
          aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
        >
          {/*
            Square icon with fill="white" → solid filled square (stop symbol).
            Play icon with fill="white" → solid filled triangle (play symbol).
            Lucide icons are SVG outlines by default; fill="white" makes them solid.
          */}
          {isPlaying
            ? <Square size={32} fill="white" />
            : <Play size={32} fill="white" />
          }
        </button>

        {/* +5 BPM */}
        <button
          onClick={() => adjustBpm(5)}
          className="rounded-full bg-zinc-800 p-3 text-white hover:bg-zinc-700 active:scale-95"
          aria-label="Increase BPM by 5"
        >
          <FastForward size={24} />
        </button>

      </div>

      <p className="text-xs italic text-zinc-500">
        Adjust speed to match your group&apos;s progress.
      </p>

    </div>
  );
}
