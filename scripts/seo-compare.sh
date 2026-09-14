#!/usr/bin/env bash
# WU-1: SEO regression comparison.
#
# Rebuilds the tree (same two commands as seo-baseline.sh) and diffs the
# output against a previously captured baseline. Exits non-zero and prints
# every offending path on any diff; exits 0 on a byte-for-byte match.
#
# Reads output from the pack layout (sites/$SITE/generated,
# sites/$SITE/public) when it exists, falling back to the pre-refactor
# layout (src/data, public/) otherwise — so this same script both gates the
# post-refactor tree and self-checks cleanly against the pre-refactor tree.
#
# Usage: SITE=starwars scripts/seo-compare.sh [baseline-dir]
#   Default baseline dir matches this session's scratchpad (see below).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DEFAULT_BASE="/private/tmp/claude-501/-Volumes-T9-git-starwars-timeline/bf10279a-d7c7-4dec-830a-906a57e22729/scratchpad/seo-baseline"
BASE="${1:-$DEFAULT_BASE}"
SITE="${SITE:-starwars}"

if [ ! -d "$BASE" ]; then
  echo "Baseline not found at $BASE — run scripts/seo-baseline.sh first." >&2
  exit 1
fi

echo "==> Building tree for comparison (SITE=$SITE)"
( cd build_scripts && node prepJson.js )
npm run build:full

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

echo "==> Comparing against baseline $BASE (data: $DATA_DIR, public: $PUBLIC_DIR)"

FAIL=0
DIFF_PATHS=()

normalize_html() {
  sed -E 's#/assets/([A-Za-z0-9]+)-[A-Za-z0-9_-]{8}\.(js|css)#/assets/\1-HASH.\2#g' "$1"
}

diff_file() {
  local baseline="$1" current="$2" label="$3"
  if [ ! -f "$baseline" ]; then
    echo "MISSING in baseline: $label"
    FAIL=1
    DIFF_PATHS+=("$label (missing in baseline)")
    return
  fi
  if [ ! -f "$current" ]; then
    echo "MISSING in current: $label"
    FAIL=1
    DIFF_PATHS+=("$label (missing in current)")
    return
  fi
  if ! diff -q "$baseline" "$current" > /dev/null 2>&1; then
    echo "DIFF: $label"
    FAIL=1
    DIFF_PATHS+=("$label")
  fi
}

diff_file_normalized() {
  local baseline="$1" current="$2" label="$3"
  if [ ! -f "$baseline" ]; then
    echo "MISSING in baseline: $label"
    FAIL=1
    DIFF_PATHS+=("$label (missing in baseline)")
    return
  fi
  if [ ! -f "$current" ]; then
    echo "MISSING in current: $label"
    FAIL=1
    DIFF_PATHS+=("$label (missing in current)")
    return
  fi
  if ! diff -q <(normalize_html "$baseline") <(normalize_html "$current") > /dev/null 2>&1; then
    echo "DIFF: $label"
    FAIL=1
    DIFF_PATHS+=("$label")
  fi
}

echo "==> Comparing data JSON"
for f in "$BASE"/data/*.json; do
  name="$(basename "$f")"
  diff_file "$f" "$DATA_DIR/$name" "data/$name"
done

echo "==> Comparing public SEO files"
for f in "$BASE"/public/*; do
  name="$(basename "$f")"
  diff_file "$f" "$PUBLIC_DIR/$name" "public/$name"
done

echo "==> Comparing index.html"
diff_file "$BASE/index.html" "index.html" "index.html"

echo "==> Comparing prerendered character pages (hash-normalized)"
BASE_COUNT=$(find "$BASE/character" -maxdepth 1 -name '*.html' | wc -l | tr -d ' ')
CUR_COUNT=$(find build/character -maxdepth 1 -name '*.html' | wc -l | tr -d ' ')
if [ "$BASE_COUNT" != "$CUR_COUNT" ]; then
  echo "DIFF: character page count baseline=$BASE_COUNT current=$CUR_COUNT"
  FAIL=1
  DIFF_PATHS+=("character page count")
fi

for f in "$BASE"/character/*.html; do
  name="$(basename "$f")"
  diff_file_normalized "$f" "build/character/$name" "character/$name"
done

echo
if [ "$FAIL" -ne 0 ]; then
  echo "SEO COMPARE FAILED — ${#DIFF_PATHS[@]} diffing path(s):"
  for p in "${DIFF_PATHS[@]}"; do
    echo "  - $p"
  done
  exit 1
fi

echo "SEO COMPARE PASSED — zero diffs."
exit 0
