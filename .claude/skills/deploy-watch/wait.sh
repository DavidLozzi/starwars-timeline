#!/usr/bin/env bash
# Poll timeline.starwars.guide until a pushed change is live.
#   wait.sh file <url-path> <local-file>   live bytes must match the local file (sha256)
#   wait.sh grep <url-path> <string>       live body must contain the string (fixed match)
# Env: TIMEOUT seconds (default 600), INTERVAL seconds (default 20), HOST (default https://timeline.starwars.guide)
# Exit 0 live, 1 timeout. Busts the CDN cache with a query string on every poll.
set -u
mode=${1:?mode}; path=${2:?url path}; want=${3:?local file or string}
host=${HOST:-https://timeline.starwars.guide}; timeout=${TIMEOUT:-600}; interval=${INTERVAL:-20}
start=$(date +%s)
if [ "$mode" = file ]; then want_sha=$(shasum -a 256 "$want" | cut -d' ' -f1); fi
while :; do
  url="$host$path?deploycheck=$(date +%s)"
  if [ "$mode" = file ]; then
    got=$(curl -fsL "$url" | shasum -a 256 | cut -d' ' -f1)
    [ "$got" = "$want_sha" ] && ok=1 || ok=0
  else
    curl -fsL "$url" | grep -qF -- "$want" && ok=1 || ok=0
  fi
  elapsed=$(( $(date +%s) - start ))
  if [ "$ok" = 1 ]; then echo "LIVE after ${elapsed}s: $host$path"; exit 0; fi
  [ "$elapsed" -ge "$timeout" ] && { echo "TIMEOUT after ${elapsed}s: $host$path not updated"; exit 1; }
  sleep "$interval"
done
