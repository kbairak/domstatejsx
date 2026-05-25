import type { Plugin } from 'vite';

/**
 * Vite plugin for domstatejsx
 *
 * Configures JSX transformation to use domstatejsx as the JSX runtime.
 * Supports both legacy Vite (esbuild) and Vite 8+ (oxc).
 */
export default function domstatejsxPlugin(): Plugin {
  return {
    name: 'domstatejsx-plugin',
    config: () => ({
      // Modern Vite 8+ using Oxc
      oxc: {
        jsx: {
          runtime: 'automatic',
          importSource: 'domstatejsx',
        },
      },
      // Legacy Vite <8 using esbuild (backwards compatibility)
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'domstatejsx',
      },
    }),
  };
}
