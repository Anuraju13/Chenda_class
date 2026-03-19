/*
  useMetronome — Precise metronome using the Web Audio API.

  WHY NOT setInterval?
  ─────────────────────
  JavaScript's setInterval is controlled by the browser's event loop.
  The event loop can be delayed by other tasks (rendering, network, etc.).
  At 120 BPM, each beat is 500ms apart. A 50ms delay sounds terrible.

  THE LOOK-AHEAD SCHEDULER PATTERN:
  ───────────────────────────────────
  Instead of scheduling one click at a time, we:
  1. Run a scheduling function every 25ms (via setTimeout).
  2. Each time it runs, we look 100ms into the future.
  3. We schedule ALL clicks that fall in that 100ms window.
  4. Web Audio API runs on a dedicated audio thread — immune to JS event loop delays.

  Result: Clicks are scheduled with microsecond precision, even if JS is busy.

  THE AUDIOCONTEXT RULE:
  ───────────────────────
  Modern browsers require a user gesture (click/tap) before allowing audio.
  This prevents websites from auto-playing sounds without permission.
  So we create the AudioContext lazily — only when the user presses Start.

  CLICK SOUND DESIGN:
  ────────────────────
  We use an OscillatorNode (a sine wave generator) at 1000Hz.
  We then apply a GainNode to fade it out quickly (50ms).
  Result: a crisp 'tick' sound, no audio file needed.
*/

'use client';

import { useState, useRef, useCallback } from 'react';

const SCHEDULE_AHEAD_TIME = 0.1; // Look 100ms ahead (in seconds) for upcoming beats
const LOOKAHEAD_INTERVAL = 25;   // Run the scheduler every 25ms

// ─── Click sound generator ────────────────────────────────────────────────────
// 'when' is an AudioContext timestamp (in seconds) for precise scheduling.
// This runs BEFORE the click plays — it tells the audio hardware when to fire.
function scheduleClick(audioCtx: AudioContext, when: number) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Connect: oscillator → gain → speakers
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // Sound design: 1000Hz = a clear, bright click sound
  osc.frequency.value = 1000;

  // Volume envelope: start at 0.7, exponentially decay to near-silence in 50ms
  // exponentialRampToValueAtTime cannot reach 0 (would require infinity time),
  // so we use 0.001 (effectively silent).
  gain.gain.setValueAtTime(0.7, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.05);

  osc.start(when);
  osc.stop(when + 0.05); // Automatically clean up the oscillator after 50ms
}

// ─── The Hook ─────────────────────────────────────────────────────────────────
export function useMetronome(initialBpm = 80) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(initialBpm);

  // Refs for values used inside the scheduler closure.
  // We use refs (not state) because state updates are async and batched —
  // the scheduler needs the current BPM synchronously.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextClickTimeRef = useRef(0); // AudioContext timestamp of next scheduled click
  const bpmRef = useRef(bpm);

  // Keep bpmRef in sync with bpm state.
  // This pattern lets the scheduler closure always read the latest BPM
  // without being recreated every time BPM changes.
  bpmRef.current = bpm;

  // ─── The scheduler function ───────────────────────────────────────────────
  const scheduler = useCallback(() => {
    const audioCtx = audioCtxRef.current!;

    // Schedule all beats that fall within the look-ahead window
    while (nextClickTimeRef.current < audioCtx.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleClick(audioCtx, nextClickTimeRef.current);

      // Advance to the next beat: 60 seconds / BPM = seconds per beat
      // e.g., 80 BPM → 60/80 = 0.75 seconds between clicks
      nextClickTimeRef.current += 60.0 / bpmRef.current;
    }

    // Schedule the next scheduler run (25ms later)
    timerRef.current = setTimeout(scheduler, LOOKAHEAD_INTERVAL);
  }, []); // No dependencies — the function reads from refs, not state

  // ─── Start ───────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    // Create AudioContext on first user interaction (browser autoplay policy)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    // Resume if the context was suspended (browser may suspend idle contexts)
    audioCtxRef.current.resume();

    // Start scheduling from right now
    nextClickTimeRef.current = audioCtxRef.current.currentTime;
    scheduler();
    setIsPlaying(true);
  }, [scheduler]);

  // ─── Stop ────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    // Note: we don't close() the AudioContext — expensive to recreate.
    // We just stop scheduling new clicks.
  }, []);

  // ─── Toggle ──────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  return { isPlaying, bpm, setBpm, start, stop, toggle };
}
