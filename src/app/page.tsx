/*
  Root Page — Handles the URL: /

  This is a simple redirect page. When someone visits the root of the app,
  we immediately send them to the first lesson.

  WHY REDIRECT INSTEAD OF CONTENT?
  ──────────────────────────────────
  The LMS makes most sense starting at Lesson 1, not a blank dashboard.
  If you later want a proper home page (progress overview, welcome screen),
  replace the redirect with real JSX content.

  redirect() is a Next.js server function — it sends an HTTP 307 redirect header.
  The browser immediately navigates to the new URL with no flash of content.
*/

import { redirect } from 'next/navigation';
import { curriculum } from '@/lib/curriculum';

export default function HomePage() {
  // Find the first module that has at least one lesson
  const firstModule = curriculum.modules.find((m) => m.lessons.length > 0);
  const firstLesson = firstModule?.lessons[0];

  if (firstModule && firstLesson) {
    redirect(`/learn/${firstModule.id}/${firstLesson.id}`);
  }

  // Fallback: shown if curriculum.json has no lessons yet
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
      <p className="font-malayalam text-4xl text-amber-400">ചെണ്ട ക്ലാസ്</p>
      <p className="text-slate-400">
        No lessons found. Open{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300">
          src/data/curriculum.json
        </code>{' '}
        and add your first lesson.
      </p>
    </div>
  );
}
