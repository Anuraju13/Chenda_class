// ─── Vaythari (rhythmic chant) ────────────────────────────────────────────────
// Each lesson can have multiple vaythari patterns, e.g. slow version + fast version
export interface VaythariItem {
  label: string;          // e.g. "Basic Pattern", "Kizha Kaalam"
  text: string;           // Malayalam Unicode, e.g. "തക്കിട്ട തരികിട"
  transliteration: string; // Latin phonetics for non-Malayalam readers
  tempo: 'slow' | 'medium' | 'fast';
}

// ─── BPM Range ────────────────────────────────────────────────────────────────
export interface BpmRange {
  min: number;  // suggested starting BPM for this lesson
  max: number;  // target performance BPM
}

// ─── Lesson ───────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;             // URL slug, e.g. "lesson-1"
  title: string;          // English title
  malayalamTitle: string; // Malayalam title (shown prominently)
  youtubeId: string;      // The video ID from the YouTube URL (e.g. "dQw4w9WgXcQ")
  description: string;    // Short lesson summary
  vaythari: VaythariItem[];
  bpmRange: BpmRange;
  durationMinutes?: number;
}

// ─── Module ───────────────────────────────────────────────────────────────────
// A module is a chapter/level in the learning track
export interface Module {
  id: string;             // URL slug, e.g. "aadyapaadam"
  title: string;          // English display name
  malayalamTitle: string; // Malayalam display name
  level: string;          // Subtitle shown in sidebar, e.g. "Foundations"
  color: 'amber' | 'orange' | 'red' | 'purple';
  lessons: Lesson[];
}

// ─── Full Curriculum ──────────────────────────────────────────────────────────
export interface Curriculum {
  modules: Module[];
}
