/*
  YouTubePlayer — Renders the container for the YouTube IFrame player.

  Two modes:
  1. Real video (videoId is a valid ID) — renders the target div that YouTube's
     IFrame API replaces with an <iframe> player.
  2. Placeholder (videoId missing or starts with REPLACE_) — renders a "video
     coming soon" UI so there's no broken blank space on lessons without a video yet.

  THE 16:9 ASPECT RATIO TRICK:
  ─────────────────────────────
  padding-top: 56.25% = 9/16 — the div's top padding is always 56.25% of its width,
  which keeps the container exactly 16:9 at any screen width.
*/

interface YouTubePlayerProps {
  playerId: string;
  videoId?: string; // passed so we can show a placeholder for lessons without a video
}

function isPlaceholder(videoId?: string): boolean {
  return !videoId || videoId.startsWith('REPLACE_');
}

export function YouTubePlayer({ playerId, videoId }: YouTubePlayerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>

        {isPlaceholder(videoId) ? (
          /* ── Placeholder: lesson video not added yet ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
            <p className="text-sm font-semibold text-slate-500">Video coming soon</p>
            <p className="text-xs text-slate-600">
              Add a YouTube link in curriculum.json to enable the player
            </p>
          </div>
        ) : (
          /* ── Target div: YouTube SDK replaces this with <iframe> ── */
          <div
            id={playerId}
            className="absolute inset-0 h-full w-full"
          />
        )}

      </div>
    </div>
  );
}
