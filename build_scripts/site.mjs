// SITE pack resolver.
//
// Every build script (prepJson.js, prerenderCharacters.js, description.js,
// social.js, website.js, getWords.js) needs the same thing: which pack is
// selected (via the SITE env var, defaulting to "starwars"), that pack's
// config, and a set of absolute paths into it. This module is the single
// place that logic lives.
//
// Zero dependencies (only Node builtins): prerenderCharacters.js imports
// modules from this directory and CI never runs `npm install` inside
// build_scripts/, so nothing here may `import` an npm package.
//
// All paths are resolved from import.meta.url, never process.cwd() -- the
// historical build scripts assumed cwd === build_scripts/, but package.json's
// prestart/prebuild hooks invoke prepJson.js from the repo root.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

class SitePackNotFoundError extends Error {
  constructor(id, siteDir) {
    super(`SITE="${id}" has no pack at ${siteDir} (expected a sites/${id}/site.config.mjs)`);
    this.name = 'SitePackNotFoundError';
    this.id = id;
    this.siteDir = siteDir;
  }
}

const THIS_FILE = fileURLToPath(import.meta.url);
// build_scripts/site.mjs -> repo root is one directory up.
const ROOT = path.resolve(path.dirname(THIS_FILE), '..');

export const resolveSite = async () => {
  const id = process.env.SITE || 'starwars';
  const siteDir = path.join(ROOT, 'sites', id);
  const configPath = path.join(siteDir, 'site.config.mjs');

  if (!fs.existsSync(configPath)) {
    throw new SitePackNotFoundError(id, siteDir);
  }

  const configModule = await import(pathToFileURL(configPath).href);
  const config = configModule.default;

  return {
    id,
    config,
    root: ROOT,
    siteDir,
    dataPath: path.join(siteDir, 'data.json'),
    descriptionsPath: path.join(siteDir, 'character_descriptions.json'),
    generatedDir: path.join(siteDir, 'generated'),
    publicDir: path.join(siteDir, 'public'),
    templatePath: path.join(siteDir, 'index.template.html'),
    buildDir: path.join(ROOT, 'build'),
    outDir: path.join(ROOT, 'build', 'character'),
  };
};

export { SitePackNotFoundError };

export default resolveSite;
