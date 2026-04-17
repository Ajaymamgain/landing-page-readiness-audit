#!/usr/bin/env bash
# Keep claude-skills/ in sync with cursor-skills/ (run after editing skills).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
rsync -a --delete "${ROOT}/cursor-skills/" "${ROOT}/claude-skills/"
echo "Synced cursor-skills/ -> claude-skills/"
