/*
  AppShell — The two-column page layout wrapper.

  LAYOUT STRUCTURE:
  ──────────────────
  Desktop (lg and above):
  ┌──────────────┬────────────────────────────────────────────┐
  │   Sidebar    │              Main Content                  │
  │   (288px)    │              (scrollable)                  │
  │   (fixed)    │                                            │
  └──────────────┴────────────────────────────────────────────┘

  Mobile (below lg):
  ┌────────────────────────────────────────────────────────────┐
  │  ☰  ചെണ്ട ക്ലാസ്                                          │  ← Top bar
  ├────────────────────────────────────────────────────────────┤
  │                    Main Content                            │  ← Scrollable
  └────────────────────────────────────────────────────────────┘

  The sidebar is a DRAWER on mobile — it slides in from the left as an overlay.

  WHY 'h-screen overflow-hidden' on the wrapper:
  ────────────────────────────────────────────────
  We want only the main content area to scroll, not the whole page.
  - h-screen → the shell takes exactly the viewport height
  - overflow-hidden → prevents the shell itself from scrolling
  - The main <main> element has overflow-y-auto → only it scrolls

  This creates a "fixed sidebar, scrolling content" effect, which is the
  standard pattern for learning platforms (Coursera, Udemy, etc.).
*/

'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface AppShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      {/*
        hidden → don't show on mobile
        lg:flex → show as flex column on large screens
        w-72 → 288px wide
        flex-shrink-0 → never compress the sidebar even if content is wide
      */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-slate-800 lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {/* ── Mobile Drawer (overlay) ───────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">

          {/* Sidebar panel */}
          <div className="flex w-72 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950">

            {/* Close button row */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-semibold text-slate-300">Lessons</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{sidebar}</div>
          </div>

          {/*
            Backdrop — clicking outside the drawer closes it.
            backdrop-blur-sm → slightly blurs the content behind, looks premium.
          */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── Right Side (Top Bar + Main Content) ──────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile top bar — only visible below lg breakpoint */}
        <div className="flex h-14 flex-shrink-0 items-center border-b border-slate-800 px-4 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* Brand name in Malayalam for mobile header */}
          <span className="ml-3 font-malayalam text-lg font-bold text-amber-400">
            ചെണ്ട ക്ലാസ്
          </span>
        </div>

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>

      </div>
    </div>
  );
}
