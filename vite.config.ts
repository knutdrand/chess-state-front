/// <reference types="vitest/config" />
import { defineConfig, transformWithOxc, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Legacy test files (and their helpers) are .js but contain JSX.
// Vite only parses JSX in .jsx/.tsx, so treat src/**/*.js as JSX.
function jsxInJs(): Plugin {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\/src\/.*\.js$/.test(id) || id.includes('/node_modules/')) return null;
      const result = await transformWithOxc(code, id, {
        lang: 'jsx',
        jsx: { runtime: 'automatic' },
      });
      return { code: result.code, map: result.map };
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs(), react()],
  server: {
    port: 3000,
  },
  build: {
    // Keep CRA's output directory; vercel.json sets outputDirectory to match.
    outDir: 'build',
    // Don't base64-inline small @fontsource subsets into the render-blocking CSS
    // (CRA never inlined fonts either); everything else uses Vite's default.
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|eot)$/.test(filePath) ? false : undefined),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/index.tsx',
        'src/setupTests.js',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/utils/testUtils.js',
      ],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },
    },
  },
});
