
// src/components/layout/ThemeInitializer.tsx
"use client"; // This component must be a client component

import { useEffect } from 'react';

// This script runs early to set the theme before the page fully renders, preventing FOUC.
const clientScript = `
  (function() {
    try {
      const theme = localStorage.getItem('chessmate-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // In case localStorage or matchMedia is not available (e.g., SSR pre-render)
      console.warn('Could not set initial theme:', e);
    }
  })();
`;

export default function ThemeInitializer() {
  // Although the script tag runs the code, this ensures React knows it's part of the render.
  // It doesn't do anything visual itself.
  useEffect(() => {
    // This effect is mostly for correctness in React's lifecycle,
    // the main work is done by the script tag immediately.
  }, []);

  return <script dangerouslySetInnerHTML={{ __html: clientScript }} />;
}
