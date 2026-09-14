import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// Named ROOT_DIR rather than __dirname: Vite bundles this CJS-package config
// through esbuild and injects its own __dirname, so shadowing it is unsafe.
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Which site pack this build serves. Mirrors build_scripts/site.mjs, which
// resolves the same env var for the Node-side build scripts.
const SITE = process.env.SITE || 'starwars';

export default defineConfig({
  plugins: [
    react(),
    // Only files imported with an explicit `?react` suffix become components;
    // plain `import x from './y.svg'` stays a URL import, as it was under CRA.
    svgr(),
  ],

  // Static assets ship from the selected pack instead of a repo-root public/.
  publicDir: `sites/${SITE}/public`,

  resolve: {
    // Vitest inherits resolve.alias from this same config, so the tests
    // resolve @site/... without a separate alias block.
    alias: {
      '@site': path.resolve(ROOT_DIR, 'sites', SITE),
      '@siteConfig': path.resolve(ROOT_DIR, 'sites', SITE, 'site.config.mjs'),
    },
  },

  build: {
    // Kept as `build` (not Vite's default `dist`) so CI's `cp -r ./build/* ./docs`
    // and the /build entry in .gitignore keep working untouched.
    outDir: 'build',
    sourcemap: true,
  },

  server: {
    port: 3000,
    open: true,
    // reserved ngrok tunnel domain for local dev sharing (see .claude/skills/ngrok)
    allowedHosts: ['artistic-guinea-sensible.ngrok-free.app'],
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
