/*
  Lesson Page — The server-rendered entry point for each lesson URL.

  URL Pattern: /learn/[moduleId]/[lessonId]
  Examples:
    /learn/aadyapaadam/lesson-1
    /learn/shingari-level-1/lesson-2

  THIS IS A SERVER COMPONENT (no 'use client').
  Server components run on the server (or at build time for static pages).
  They can:
  - Read from files, databases, APIs directly (no useEffect needed)
  - NOT use useState, useEffect, onClick, or any browser APIs

  THE DATA FLOW:
  ─────────────
  1. User visits /learn/aadyapaadam/lesson-1
  2. Next.js calls this function with params = { moduleId: 'aadyapaadam', lessonId: 'lesson-1' }
  3. We call getLesson() to find the lesson data in curriculum.json
  4. We pass the lesson as a prop to LessonView (a client component)
  5. LessonView handles all the interactive UI

  NEXT.JS 15 ASYNC PARAMS:
  ─────────────────────────
  In Next.js 14: params was a plain object { moduleId: string, lessonId: string }
  In Next.js 15: params is a PROMISE — you must await it before reading.
  This is a breaking change. Forgetting to await causes a runtime error.

  STATIC GENERATION (generateStaticParams):
  ───────────────────────────────────────────
  At build time, Next.js calls generateStaticParams() to get a list of all possible
  [moduleId, lessonId] combinations. It pre-renders each one as a static HTML file.

  Benefits:
  - Pages load instantly (pre-built HTML, no server processing needed)
  - Works offline / on CDN edge
  - Perfect for Vercel deployment (all pages served from CDN edge nodes globally)

  When you ADD new lessons to curriculum.json, run `npm run build` again to
  regenerate the static pages.
*/

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLesson, getModule, curriculum, getAllLessonPaths } from '@/lib/curriculum';
import { AppShell } from '@/components/layout/AppShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { LessonView } from '@/components/lesson/LessonView';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PageProps {
  // Next.js 15: params is a Promise, not a plain object
  params: Promise<{ moduleId: string; lessonId: string }>;
}

// ─── Static Generation ───────────────────────────────────────────────────────
// Called once at build time. Returns all valid [moduleId, lessonId] pairs.
// Next.js will call this page function once for each returned combination.
export function generateStaticParams() {
  return getAllLessonPaths();
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────
// Next.js calls this to set the <title> and <meta description> for each lesson page.
// This runs on the server so search engines and social media can read it.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleId, lessonId } = await params;
  const lesson = getLesson(moduleId, lessonId);
  const lessonModule = getModule(moduleId);

  if (!lesson) return { title: 'Lesson Not Found' };

  return {
    title: `${lesson.title} — ${lessonModule?.title} | Chenda Class`,
    description: lesson.description,
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function LessonPage({ params }: PageProps) {
  // Await params (Next.js 15 requirement)
  const { moduleId, lessonId } = await params;

  // Load lesson data from curriculum.json (via lib helper)
  const lesson = getLesson(moduleId, lessonId);

  // If the URL doesn't match any lesson (e.g., /learn/fake-module/lesson-99),
  // notFound() triggers Next.js's built-in 404 page
  if (!lesson) notFound();

  return (
    <AppShell
      /*
        The sidebar is passed as a prop (React node) to AppShell.
        AppShell doesn't know what the sidebar contains — it just renders it in the correct column.
        This pattern is called "composition" — flexible and decoupled.
      */
      sidebar={
        <Sidebar
          curriculum={curriculum}
          activeModuleId={moduleId}
          activeLessonId={lessonId}
        />
      }
    >
      {/*
        LessonView is a client component. Passing `lesson` as a prop crosses
        the server→client boundary. Next.js serializes the data to JSON.
        All data must be serializable (no functions, classes, Dates — just plain objects).
      */}
      <LessonView lesson={lesson} />
    </AppShell>
  );
}
