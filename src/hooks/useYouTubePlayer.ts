/*
  useYouTubePlayer — Manages the YouTube IFrame Player API lifecycle.

  HOW THE YOUTUBE IFRAME API WORKS:
  ──────────────────────────────────
  1. You add a <script src="https://www.youtube.com/iframe_api"> to the page.
  2. YouTube's servers send back JavaScript code.
  3. That JS code calls window.onYouTubeIframeAPIReady() when it's loaded.
  4. Inside that callback, you create: new YT.Player('elementId', config)
  5. YouTube replaces your <div id="elementId"> with an <iframe> containing the player.
  6. You can then call player.setPlaybackRate(0.5) to slow it down.

  THE RACE CONDITION PROBLEM:
  ────────────────────────────
  If the user navigates from lesson-1 to lesson-2, the component unmounts and remounts.
  But the YouTube API script is already loaded — window.YT already exists.
  So we can't wait for onYouTubeIframeAPIReady to fire again.
  We must check window.YT?.Player first and initialize immediately if it's there.
*/

'use client'; // This file uses browser APIs — must run on the client, not the server

import { useEffect, useRef, useCallback } from 'react';

// ─── Minimal YouTube type declarations ────────────────────────────────────────
// The YouTube IFrame API is not a npm package — it's a browser global injected
// via their script tag. We declare the types ourselves so TypeScript is happy.
interface YTPlayer {
  setPlaybackRate(rate: number): void;
  destroy(): void;
  playVideo(): void;
  pauseVideo(): void;
}

interface YTPlayerConfig {
  videoId: string;
  playerVars?: {
    enablejsapi?: number;
    origin?: string;
    rel?: number;
    modestbranding?: number;
    color?: string;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// ─── The Hook ─────────────────────────────────────────────────────────────────
export function useYouTubePlayer(elementId: string, videoId: string) {
  // useRef stores the player instance without triggering re-renders.
  // We never need to re-render when the player is ready — we just call methods on it.
  const playerRef = useRef<YTPlayer | null>(null);

  // useCallback memoizes the function so it doesn't change on every render.
  // This is important if we ever pass it as a prop to a child component.
  const setPlaybackRate = useCallback((rate: number) => {
    // Optional chaining (?.) — if the player isn't ready yet, this silently does nothing
    playerRef.current?.setPlaybackRate(rate);
  }, []);

  useEffect(() => {
    // ── Guard: skip for placeholder or missing video IDs ─────────────────────
    // Lessons without a real YouTube video yet have "REPLACE_WITH_..." as the ID.
    // Passing that to YouTube's API throws an uncaught "Invalid video id" error
    // which crashes the entire React tree. We bail out early instead.
    if (!videoId || videoId.startsWith('REPLACE_')) return;

    // ── Step 1: Load the YouTube API script (only once) ──────────────────────
    // We check for an existing script tag with id='yt-iframe-api' to prevent
    // loading the script twice if the user navigates between lessons.
    if (!document.getElementById('yt-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'yt-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      // Appending to <head> starts the download immediately
      document.head.appendChild(script);
    }

    // ── Step 2: Initialize the player ────────────────────────────────────────
    const initPlayer = () => {
      // Wrap in try/catch — YouTube's API throws synchronously for bad IDs
      // and that error would otherwise crash React's render tree.
      try {
        playerRef.current = new window.YT.Player(elementId, {
          videoId,
          playerVars: {
            enablejsapi: 1,      // CRITICAL: must be 1 for setPlaybackRate to work
            origin: window.location.origin, // Required for postMessage security
            rel: 0,              // Don't show related videos from other channels
            modestbranding: 1,   // Smaller YouTube logo
            color: 'white',      // White progress bar (looks better on dark background)
          },
          events: {
            onReady: () => {
              console.log('YouTube player ready');
            },
          },
        });
      } catch (e) {
        console.warn('YouTube player failed to initialize:', e);
      }
    };

    // ── Step 3: Handle the race condition ─────────────────────────────────────
    if (window.YT?.Player) {
      // API already loaded (navigating between lessons) — initialize immediately
      initPlayer();
    } else {
      // API not yet loaded — set the callback that YouTube will call when ready.
      // We chain with any existing callback to avoid overwriting another hook instance.
      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        existingCallback?.();
        initPlayer();
      };
    }

    // ── Cleanup: destroy the player when the component unmounts ───────────────
    // This prevents memory leaks and ensures no orphaned player instances.
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [elementId, videoId]); // Re-run if we navigate to a different lesson (different videoId)

  return { setPlaybackRate };
}
