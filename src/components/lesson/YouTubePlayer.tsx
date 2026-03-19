/*
  YouTubePlayer — Renders the container <div> that YouTube's IFrame API will replace
  with an <iframe> player.

  This is a PRESENTATIONAL component — it has no logic, only layout.
  The actual YouTube player is managed by useYouTubePlayer hook in LessonView.

  THE 16:9 ASPECT RATIO TRICK:
  ─────────────────────────────
  YouTube videos are 16:9 (widescreen). We want the player to be full-width
  on any screen size while always keeping the 16:9 ratio.

  The padding-top trick:
    - A div with padding-top: 56.25% has a top padding that is 56.25% of its WIDTH.
    - 56.25% = 9/16 = the reciprocal of 16:9.
    - So the div is always exactly 16:9, regardless of screen width.
    - The inner div (absolute inset-0) fills this space completely.

  Alternative: Tailwind's 'aspect-video' class (aspect-ratio: 16/9) also works
  in modern browsers, but the padding trick has better support for older devices.
*/

interface YouTubePlayerProps {
  playerId: string; // Must match the ID used in useYouTubePlayer hook
}

export function YouTubePlayer({ playerId }: YouTubePlayerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      {/* 16:9 aspect ratio container */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {/*
          This div has id=playerId. YouTube's IFrame API finds it by ID
          and replaces it with the <iframe> player element.
          absolute inset-0 → positions it to fill the parent exactly.
        */}
        <div
          id={playerId}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
