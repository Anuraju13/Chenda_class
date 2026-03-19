// This file is the data access layer. Components never import curriculum.json directly —
// they import from here. This way, if you ever switch from JSON to a database,
// you only change this one file.

import curriculumData from '@/data/curriculum.json';
import type { Curriculum, Module, Lesson } from '@/types/curriculum';

export const curriculum = curriculumData as Curriculum;

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
