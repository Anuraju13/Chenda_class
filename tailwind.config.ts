import type { Config } from 'tailwindcss';

const config: Config = {
  // Tailwind scans these files for class names and only includes used classes in the final CSS bundle.
  // If you forget to include a folder here, those classes will be stripped and won't appear in production.
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],

  // 'class' strategy: dark mode is activated by adding the 'dark' class to <html>
  // This gives us full control (not dependent on the user's OS setting)
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        // var(--font-inter) is set in layout.tsx via next/font
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // var(--font-manjari) is set in layout.tsx via next/font
        // Usage: className="font-malayalam" → applies Manjari font
        malayalam: ['var(--font-manjari)', 'var(--font-gayathri)', 'serif'],
      },
    },
  },

  plugins: [],
};

export default config;
