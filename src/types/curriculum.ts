// ─── RhythmCard — Beat-by-beat breakdown ──────────────────────────────────────
// Shows each syllable of a pattern as an individual card with its strike type.
// Used in the RhythmCard component for Lesson 1.
export interface RhythmBeat {
  ml: string;     // Malayalam syllable, e.g. "ത", "കി", "ധിം"
  en: string;     // Latin transliteration, e.g. "Tha", "ki", "DHIM"
  type: string;   // Strike type label, e.g. "Stick", "Hand/Tap", "Power Strike"
}

export interface RhythmPattern {
  title: string;      // e.g. "Essential Pattern 1"
  subtitle: string;   // e.g. "Basic Shingari Ennam (Chempada)"
  cycleName: string;  // e.g. "8 BEAT CYCLE"
  beats: RhythmBeat[];
  emphasis: string;   // Instruction shown in the Emphasis tip card
  targetSpeed: string; // Instruction shown in the Target Speed tip card
}

// ─── Vaythari (rhythmic chant) ────────────────────────────────────────────────
// Each lesson can have multiple vaythari patterns, e.g. slow version + fast version
export interface VaythariSyllable {
  ml: string; // Malayalam syllable, e.g. "ത"
  en: string; // Latin transliteration, e.g. "Tha"
}

export interface VaythariItem {
  label: string;          // e.g. "Basic Pattern", "Kizha Kaalam"
  text: string;           // Malayalam Unicode, e.g. "തക്കിട്ട തരികിട"
  transliteration: string; // Latin phonetics for non-Malayalam readers
  tempo: 'slow' | 'medium' | 'fast';
  // Optional: individual syllables for the metronome to step through beat-by-beat
  syllables?: VaythariSyllable[];
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
  rhythmPatterns?: RhythmPattern[]; // Optional — only lessons that need beat breakdown have this
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
