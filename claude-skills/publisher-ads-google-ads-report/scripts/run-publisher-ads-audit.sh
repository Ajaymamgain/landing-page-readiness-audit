#!/usr/bin/env bash
set -euo pipefail
# Run from a Node project root where lighthouse and lighthouse-plugin-publisher-ads are installed locally.
URL="${1:?Usage: $0 <url> [output-path-without-extension]}"
OUT="${2:-./reports/publisher-ads-run}"

exec npx lighthouse "$URL" \
  --plugins=lighthouse-plugin-publisher-ads \
  --output=json --output=html \
  --output-path="$OUT" \
  --chrome-flags="--headless=new" \
  --quiet