/*
  Sidebar — The left navigation panel showing all modules and lessons.

  'use client' is needed because:
  - useState (tracks which modules are expanded/collapsed)
  - onClick on module headers (accordion toggle)

  DESIGN PATTERN — Accordion Navigation:
  ────────────────────────────────────────
  Each module header is clickable and toggles its lesson list open/closed.
  We store the expanded module IDs in a Set<string>.
  The active module starts expanded by default.

  ACTIVE STATE HIGHLIGHTING:
  ────────────────────────────
  The currently-viewed lesson gets special amber styling:
  - Left border: border-l-2 border-amber-500 → a visual "you are here" indicator
  - Background: bg-amber-500/20 → 20% opacity amber fill
  - Text: text-amber-300 → slightly brighter

  LUCIDE ICONS:
  ─────────────
  Lucide React is a tree-shakeable icon library. We import only what we use.
  Each icon is an SVG component — it respects className for sizing and color.
*/

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, BookOpen, Music, Zap, Star, Drum } from 'lucide-react';
import type { Curriculum } from '@/types/curriculum';

interface SidebarProps {
  curriculum: Curriculum;
  activeModuleId: string;
  activeLessonId: string;
}

// Map module color → Lucide icon component
const MODULE_ICONS = {
  amber: BookOpen,
  orange: Music,
  red: Zap,
  purple: Star,
} as const;

// Map module color → Tailwind text color class
const MODULE_ACCENT = {
  amber: 'text-amber-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
} as const;

export function Sidebar({ curriculum, activeModuleId, activeLessonId }: SidebarProps) {
  // Set of module IDs that are currently expanded.
  // Initialize with the active module open so users see their current position.
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set([activeModuleId])
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">

      {/* ── Brand Header ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <Drum className="h-6 w-6 text-amber-500" />
          <div>
            {/* Chenda Class in Malayalam — uses Manjari font */}
            <h1 className="font-malayalam text-lg font-bold leading-tight text-amber-400">
              ചെണ്ട ക്ലാസ്
            </h1>
            <p className="text-xs text-slate-500">Chenda Learning Platform</p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tree ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {curriculum.modules.map((module) => {
          const Icon = MODULE_ICONS[module.color];
          const accentColor = MODULE_ACCENT[module.color];
          const isExpanded = expandedModules.has(module.id);
          const isActiveModule = module.id === activeModuleId;

          return (
            <div key={module.id} className="mb-1">

              {/* ── Module Header Button ──────────────────────────────────── */}
              <button
                onClick={() => toggleModule(module.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-800 ${
                  isActiveModule ? 'bg-slate-800/70' : ''
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${accentColor}`} />

                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${isActiveModule ? accentColor : 'text-slate-200'}`}>
                    {module.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">{module.level}</p>
                </div>

                {/* Chevron only shown if module has lessons */}
                {module.lessons.length > 0 && (
                  isExpanded
                    ? <ChevronDown className="h-3 w-3 flex-shrink-0 text-slate-500" />
                    : <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-500" />
                )}

                {/* Coming soon badge for empty modules */}
                {module.lessons.length === 0 && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600">
                    Soon
                  </span>
                )}
              </button>

              {/* ── Lesson List ───────────────────────────────────────────── */}
              {isExpanded && module.lessons.length > 0 && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                  {module.lessons.map((lesson, idx) => {
                    const isActive =
                      module.id === activeModuleId && lesson.id === activeLessonId;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${module.id}/${lesson.id}`}
                        className={`flex items-start gap-2 rounded-md px-2 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'border-l-2 border-amber-500 bg-amber-500/15 pl-1.5 font-medium text-amber-300'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className="mt-0.5 flex-shrink-0 text-xs text-slate-600">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="leading-snug">{lesson.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-xs text-slate-600">Melbourne Chenda Sangham</p>
        <p className="text-xs text-slate-700">കേരളീയ ചെണ്ടവിദ്യ</p>
      </div>

    </div>
  );
}
