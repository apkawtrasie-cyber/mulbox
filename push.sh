#!/usr/bin/env bash
# Push do origin/main z tokenem z .env.local (token NIE jest zapisywany w git config).
# Użycie:  ./push.sh            -> push gałęzi main
#          ./push.sh nazwa      -> push wskazanej gałęzi
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env.local ]; then
  echo "Brak .env.local — nie znajdę GITHUB_TOKEN." >&2
  exit 1
fi

TOKEN=$(grep '^GITHUB_TOKEN=' .env.local | head -1 | cut -d= -f2- | sed -E 's/^["'\'']//; s/["'\'']$//')
if [ -z "${TOKEN:-}" ]; then
  echo "GITHUB_TOKEN pusty w .env.local." >&2
  exit 1
fi

BRANCH="${1:-main}"
git push "https://${TOKEN}@github.com/apkawtrasie-cyber/mulbox.git" "$BRANCH"
