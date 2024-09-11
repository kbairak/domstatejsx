// return partial config (recommended)
export default function domstatejsxPlugin() {
  return {
    name: 'return-partial',
    config: () => ({
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'domstatejsx',
      },
    }),
  };
}
