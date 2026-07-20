import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    // Only files imported with an explicit `?react` suffix become components;
    // plain `import x from './y.svg'` stays a URL import, as it was under CRA.
    svgr(),
  ],

  build: {
    // Kept as `build` (not Vite's default `dist`) so CI's `cp -r ./build/* ./docs`
    // and the /build entry in .gitignore keep working untouched.
    outDir: 'build',
    sourcemap: true,
  },

  server: {
    port: 3000,
    open: true,
  },

  test: {
    environment: 'jsdom',
    // `globals` exposes describe/it/expect without importing them, matching the
    // CRA/Jest style the existing tests are written in.
    globals: true,
    setupFiles: './src/setupTests.js',
    css: false,
  },
});
