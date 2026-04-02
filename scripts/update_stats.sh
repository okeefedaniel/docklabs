#!/usr/bin/env bash
# Compute aggregate stats across DockLabs repos and update index.html
# Uses unauthenticated GitHub API with retry (60 req/hr limit)
set -euo pipefail

REPOS="beacon harbor bounty lookout keel docklabs yeoman purser"
BYTES_PER_LINE=40
API="https://api.github.com"

total_files=0
total_bytes=0
project_count=0
failed_repos=0

fetch() {
  # Retry up to 3 times with backoff
  local url="$1" attempt=0
  while [ $attempt -lt 3 ]; do
    if [ -n "${GH_TOKEN:-}" ]; then
      result=$(curl -sf -H "Authorization: token $GH_TOKEN" "$url" 2>/dev/null) && echo "$result" && return 0
    else
      result=$(curl -sf "$url" 2>/dev/null) && echo "$result" && return 0
    fi
    attempt=$((attempt + 1))
    sleep $((attempt * 2))
  done
  echo ""
}

for repo in $REPOS; do
  # File count from git tree
  tree_json=$(fetch "$API/repos/okeefedaniel/$repo/git/trees/main?recursive=1")
  files=$(echo "$tree_json" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(sum(1 for t in d.get('tree',[]) if t['type']=='blob'))
except: print(0)" 2>/dev/null)
  total_files=$((total_files + files))

  sleep 1

  # Byte count from language stats
  lang_json=$(fetch "$API/repos/okeefedaniel/$repo/languages")
  bytes=$(echo "$lang_json" | python3 -c "
import sys,json
try: print(sum(json.load(sys.stdin).values()))
except: print(0)" 2>/dev/null)
  total_bytes=$((total_bytes + bytes))

  project_count=$((project_count + 1))
  if [ "$files" -eq 0 ]; then
    failed_repos=$((failed_repos + 1))
  fi
  echo "  $repo: $files files, $bytes bytes"

  sleep 1
done

# Estimate lines of code (round to nearest thousand)
total_lines=$((total_bytes / BYTES_PER_LINE))
lines_rounded=$(( (total_lines / 1000) * 1000 ))

# Format numbers with commas
fmt_num() { python3 -c "print(f'{$1:,}')"; }
fmt_files=$(fmt_num "$total_files")
fmt_lines=$(fmt_num "$lines_rounded")

stats_line="${project_count} projects. ${fmt_files} files. ${fmt_lines}+ lines of code. And still building."

echo "Stats: $stats_line"

# Only update if ALL repos returned data (guard against rate limiting)
if [ "$failed_repos" -gt 0 ]; then
  echo "WARNING: $failed_repos repo(s) returned 0 files (likely rate-limited). Skipping update to preserve existing stats."
  exit 0
fi

# Update index.html — replace the stats-line paragraph content
INDEX="${1:-index.html}"
if [ -f "$INDEX" ]; then
  sed -i.bak "s|<p class=\"stats-line\" id=\"stats-line\">.*</p>|<p class=\"stats-line\" id=\"stats-line\">${stats_line}</p>|" "$INDEX"
  rm -f "${INDEX}.bak"
  echo "Updated $INDEX"
else
  echo "ERROR: $INDEX not found" >&2
  exit 1
fi
