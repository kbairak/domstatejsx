import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: [
        resolve(__dirname, 'src/lib/domstatejsx/index.js'),
        resolve(__dirname, 'src/lib/domstatejsx/jsx-dev-runtime.js'),
        resolve(__dirname, 'src/lib/domstatejsx/jsx-runtime.js'),
        resolve(__dirname, 'src/lib/domstatejsx/vite-plugin.js'),
      ],
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '/src/lib/domstatejsx',
  },
});
