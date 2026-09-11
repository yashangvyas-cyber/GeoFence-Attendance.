#!/usr/bin/env bash
# THE GATE. Run before showing any screen.
#   npm run verify
# Renders each built screen, strips app chrome from both sides, scores against the
# crawled DOM, and names every divergence.
set -e
LIB=/home/yashang/.gemini/antigravity/scratch/CollabCrawl
cd "$(dirname "$0")/.."
node .verify/snap.cjs > /dev/null
for pair in attendance_self attendance_team attendance_organization operational_config_business_unit; do
  python3 .verify/scope.py ".verify/$pair.html" ".verify/$pair.scoped.html" >/dev/null 2>&1 || continue
  echo "───── $pair ─────"
  python3 "$LIB/_tools/verify_fidelity.py" ".verify/$pair.scoped.html" people "$pair" 2>/dev/null \
    | sed -n '4,11p' || echo "  no reference DOM"
done
