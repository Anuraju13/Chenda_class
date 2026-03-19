// This file is the data access layer. Components never import curriculum.json directly —
// they import from here. This way, if you ever switch from JSON to a database,
// you only change this one file.

import curriculumData from '@/data/curriculum.json';
import type { Curriculum, Module, Lesson } from '@/types/curriculum';

// ─── YouTube ID extractor ──────────────────────────────────────────────────────
// Accepts either a bare video ID ("yVktAkMDGDE") or a full YouTube URL
// ("https://www.youtube.com/watch?v=yVktAkMDGDE" or "https://youtu.be/yVktAkMDGDE").
// Returns just the 11-character video ID that the IFrame API expects.
function extractYouTubeId(input: string): string {
  if (!input || input.startsWith('REPLACE_')) return input;
  try {
    const url = new URL(input);
    // youtu.be short links: the path IS the ID
    if (url.hostname === 'youtu.be') return url.pathname.slice(1);
    // Standard watch?v= URLs
    const v = url.searchParams.get('v');
    if (v) return v;
  } catch {
    // Not a URL — treat the whole string as a bare ID
  }
  return input;
}

// Normalise all youtubeId fields so the rest of the app always gets bare IDs
function normaliseIds(data: typeof curriculumData): Curriculum {
  return {
    modules: data.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => ({
        ...lesson,
        youtubeId: extractYouTubeId(lesson.youtubeId),
      })),
    })),
  } as Curriculum;
}

export const curriculum = normaliseIds(curriculumData);

export function getModule(moduleId: string): Module | undefined {
  return curriculum.modules.find((m) => m.id === moduleId);
}

export function getLesson(moduleId: string, lessonId: string): Lesson | undefined {
  return getModule(moduleId)?.lessons.find((l) => l.id === lessonId);
}

// Returns all [moduleId, lessonId] combos — used by Next.js to pre-generate
// every lesson page at build time (Static Site Generation)
export function getAllLessonPaths(): { moduleId: string; lessonId: string }[] {
  return curriculum.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      moduleId: module.id,
      lessonId: lesson.id,
    }))
  );
}
