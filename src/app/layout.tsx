/*
  ROOT LAYOUT — This wraps every single page in the app.
  In Next.js App Router, layout.tsx at the app/ root is special:
  it renders once and persists across page navigations (unlike page.tsx which re-renders).

  This is where we:
  1. Load fonts via next/font (self-hosted from Google Fonts at build time)
  2. Set the <html> lang attribute for accessibility and correct font rendering
  3. Apply the 'dark' class to activate Tailwind's dark mode
  4. Set page metadata (title, description shown in browser tabs and search results)
*/

import type { Metadata } from 'next';
import { Inter, Manjari, Gayathri } from 'next/font/google';
import './globals.css';

/*
  Inter — clean, modern Latin font for all UI text (buttons, labels, headings).
  'variable' mode creates a CSS custom property (--font-inter) instead of
  directly applying the font. This lets Tailwind reference it via font-sans.
*/
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Show fallback font while Inter loads, then swap. Prevents invisible text.
});

/*
  Manjari — a gorgeous modern Malayalam font designed for readability on screens.
  weight: ['100', '400', '700'] loads only 3 weights to keep the bundle small.
  The vaythari text will use weight 700 (bold) for strong visual presence.
*/
const manjari = Manjari({
  subsets: ['malayalam'],
  weight: ['100', '400', '700'],
  variable: '--font-manjari',
  display: 'swap',
});

/*
  Gayathri — another clean Malayalam font, used as fallback in tailwind.config.ts.
  If Manjari fails (rare), Gayathri renders the Malayalam text instead.
*/
const gayathri = Gayathri({
  subsets: ['malayalam'],
  weight: ['400', '700'],
  variable: '--font-gayathri',
  display: 'swap',
});

// Metadata shown in browser tabs, Google search results, and social media previews
export const metadata: Metadata = {
  title: 'Chenda Class — Melam Learning Platform',
  description:
    'Learn Chenda percussion from Aadyapaadam to Shingari Melam. A structured learning track for the Malayali community in Melbourne.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
      lang="ml" tells the browser this page is in Malayalam.
      This affects:
      - Screen readers (pronounce text correctly)
      - Browser spelling/hyphenation
      - Font rendering engines (apply Malayalam-specific rendering rules)

      The three font variables are applied here so every child component
      can use them via Tailwind's font-sans and font-malayalam classes.

      'dark' class → activates darkMode: 'class' in tailwind.config.ts.
      Every dark: variant in our components will now apply.
    */
    <html
      lang="ml"
      className={`${inter.variable} ${manjari.variable} ${gayathri.variable} dark`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
