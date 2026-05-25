import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    copyPublicDir: false,
    lib: {
      entry: [
        resolve(__dirname, 'src/domstatejsx/index.ts'),
        resolve(__dirname, 'src/domstatejsx/jsx-dev-runtime.ts'),
        resolve(__dirname, 'src/domstatejsx/jsx-runtime.ts'),
        resolve(__dirname, 'src/domstatejsx/vite-plugin.ts'),
      ],
    },
  },
  plugins: [
    dts({
      include: ['src/domstatejsx/**/*.ts', 'src/domstatejsx/**/*.tsx'],
    }),
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '/src/domstatejsx',
  },
});
