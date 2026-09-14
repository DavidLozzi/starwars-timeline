#!/usr/bin/env bash
# WU-1: SEO regression baseline.
#
# Builds the CURRENT tree exactly as CI/local devs do (prepJson.js, then a
# full build + prerender) and snapshots every SEO-relevant output into a
# baseline directory. Run this once, before any refactor that touches the
# data pipeline, build scripts, or generated HTML — then compare against it
# with scripts/seo-compare.sh after each change.
#
# Usage: scripts/seo-baseline.sh [baseline-dir]
#   Default baseline dir matches this session's scratchpad (see below).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DEFAULT_BASE="/private/tmp/claude-501/-Volumes-T9-git-starwars-timeline/bf10279a-d7c7-4dec-830a-906a57e22729/scratchpad/seo-baseline"
BASE="${1:-$DEFAULT_BASE}"
SITE="${SITE:-starwars}"

echo "==> Building tree for baseline capture"
( cd build_scripts && node prepJson.js )
npm run build:full

echo "==> Writing baseline into $BASE"
rm -rf "$BASE"
mkdir -p "$BASE/data" "$BASE/public" "$BASE/character"

# Resolve the pack layout, falling back to the pre-refactor locations so this
# script still works against an older checkout (mirrors seo-compare.sh).
if [ -d "sites/$SITE/generated" ]; then
  DATA_DIR="sites/$SITE/generated"
else
  DATA_DIR="src/data"
fi
if [ -d "sites/$SITE/public" ]; then
  PUBLIC_DIR="sites/$SITE/public"
else
  PUBLIC_DIR="public"
fi

cp "$DATA_DIR"/*.json "$BASE/data/"
cp "$PUBLIC_DIR/sitemap.xml" "$PUBLIC_DIR/starwars_movies.html" "$PUBLIC_DIR/starwars_tvshows.html" "$PUBLIC_DIR/starwars_characters.html" "$BASE/public/"
cp index.html "$BASE/index.html"
cp -r build/character/. "$BASE/character/"

DATA_COUNT=$(find "$BASE/data" -maxdepth 1 -name '*.json' | wc -l | tr -d ' ')
PUBLIC_COUNT=$(find "$BASE/public" -maxdepth 1 -type f | wc -l | tr -d ' ')
CHAR_COUNT=$(find "$BASE/character" -maxdepth 1 -name '*.html' | wc -l | tr -d ' ')

echo "==> Baseline written to $BASE"
echo "  data:      $DATA_COUNT file(s)"
echo "  public:    $PUBLIC_COUNT file(s)"
echo "  character: $CHAR_COUNT file(s)"
