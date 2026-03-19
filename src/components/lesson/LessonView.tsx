/*
  LessonView — The central orchestrator for a lesson page.

  'use client' is required because:
  - useState (tracks current playback rate)
  - useYouTubePlayer hook (browser API)

  ARCHITECTURE PATTERN — "Lifting State Up":
  ────────────────────────────────────────────
  The YouTube player (in YouTubePlayer.tsx) and the speed buttons (PlaybackController)
  need to communicate. The player needs to receive the selected speed.

  Rather than having them talk to each other directly, we "lift" the shared state
  (currentRate) up to their common parent — this component, LessonView.

  Data flow:
    User clicks "0.5×" button in PlaybackController
    → handleRateChange(0.5) called in LessonView
    → setCurrentRate(0.5) updates state → PlaybackController re-renders with active button highlighted
    → setPlaybackRate(0.5) calls the YouTube player API

  The YouTube player itself doesn't re-render — it's controlled imperatively via the hook.

  SERVER vs CLIENT BOUNDARY:
  ───────────────────────────
  The page.tsx (server component) fetches the lesson data and passes it as props here.
  This component and everything it renders is the "client island" — interactive JS.
  VaythariCard is imported here but it's a server component — Next.js handles this correctly.
*/

'use client';

import { useState } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { YouTubePlayer } from './YouTubePlayer';
import { PlaybackController } from './PlaybackController';
import { VaythariCard } from './VaythariCard';
import { Metronome } from './Metronome';
import type { Lesson } from '@/types/curriculum';

// The element ID that YouTube's IFrame API will target.
// Must match what we pass to useYouTubePlayer and YouTubePlayer.
const PLAYER_ID = 'chenda-yt-player';

interface LessonViewProps {
  lesson: Lesson;
}

export function LessonView({ lesson }: LessonViewProps) {
  const [currentRate, setCurrentRate] = useState(1);

  // Hook provides setPlaybackRate — a function that calls player.setPlaybackRate()
  const { setPlaybackRate } = useYouTubePlayer(PLAYER_ID, lesson.youtubeId);

  function handleRateChange(rate: number) {
    setCurrentRate(rate);
    setPlaybackRate(rate); // Calls YouTube IFrame API
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">

      {/* ── Lesson Header ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Malayalam title — uses Manjari font, amber color */}
        <p className="font-malayalam text-xl font-bold text-amber-400 lg:text-2xl">
          {lesson.malayalamTitle}
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-100 lg:text-3xl">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-400 lg:text-base">
            {lesson.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            Suggested BPM: {lesson.bpmRange.min}–{lesson.bpmRange.max}
          </span>
          {lesson.durationMinutes && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
              {lesson.durationMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* ── Lesson Content Stack ──────────────────────────────────────────── */}
      {/*
        On mobile: single column stack (default flex-col)
        On desktop (lg): two-column grid for Vaythari + Metronome side by side
      */}
      <div className="space-y-6">

        {/* 1. YouTube Player */}
        <YouTubePlayer playerId={PLAYER_ID} />

        {/* 2. Playback Speed Controller */}
        <PlaybackController onRateChange={handleRateChange} currentRate={currentRate} />

        {/* 3. Vaythari Card + Metronome — side by side on large screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VaythariCard items={lesson.vaythari} />
          <Metronome
            defaultBpm={lesson.bpmRange.min}
            minBpm={60}
            maxBpm={160}
          />
        </div>

      </div>
    </div>
  );
}
