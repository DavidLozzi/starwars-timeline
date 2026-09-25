import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

// Dev only: rerun build_scripts/prepJson.js whenever its inputs change, so an edit
// to data.json shows up in the running app. The app reads the generated
// src/data/*.json, never data.json itself, and forgetting the manual step made
// edits look like they did nothing. Vite's own watcher then picks up the
// regenerated files. prepJson never writes its inputs, so this cannot loop.
const prepJsonOnEdit = () => ({
  name: 'prep-json-on-edit',
  apply: 'serve',
  configureServer(server) {
    const cwd = path.resolve('build_scripts');
    const inputs = ['data.json', 'character_descriptions.json'].map((f) => path.join(cwd, f));
    const log = server.config.logger;
    let timer = null;
    let running = false;
    let again = false;

    const run = () => {
      if (running) {
        again = true;
        return;
      }
      running = true;
      let output = '';
      const child = spawn(process.execPath, ['prepJson.js'], { cwd });
      child.stdout.on('data', (chunk) => { output += chunk; });
      child.stderr.on('data', (chunk) => { output += chunk; });
      child.on('close', (code) => {
        running = false;
        if (code === 0) log.info('prepJson: regenerated src/data', { timestamp: true });
        // Usually a half-saved or hand-broken data.json; the next save retries.
        else log.error(`prepJson failed (exit ${code}):\n${output.trim()}`, { timestamp: true });
        if (again) {
          again = false;
          run();
        }
      });
    };

    server.watcher.add(inputs);
    server.watcher.on('change', (file) => {
      if (!inputs.includes(path.resolve(file))) return;
      // Editors often write a file more than once per save.
      clearTimeout(timer);
      timer = setTimeout(run, 300);
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    // Only files imported with an explicit `?react` suffix become components;
    // plain `import x from './y.svg'` stays a URL import, as it was under CRA.
    svgr(),
    prepJsonOnEdit(),
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
