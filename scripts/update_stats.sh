#!/usr/bin/env bash
# Compute aggregate stats across DockLabs repos and update index.html
set -euo pipefail

REPOS="beacon harbor lookout keel docklabs"
BYTES_PER_LINE=40  # conservative estimate for code

total_files=0
total_bytes=0
project_count=0

for repo in $REPOS; do
  # File count from git tree
  files=$(gh api "repos/okeefedaniel/$repo/git/trees/main?recursive=1" \
    --jq '.tree | map(select(.type == "blob")) | length' 2>/dev/null || echo "0")
  total_files=$((total_files + files))

  # Byte count from language stats
  bytes=$(gh api "repos/okeefedaniel/$repo/languages" \
    --jq '[.[]] | add // 0' 2>/dev/null || echo "0")
  total_bytes=$((total_bytes + bytes))

  project_count=$((project_count + 1))
done

# Estimate lines of code (round to nearest thousand)
total_lines=$((total_bytes / BYTES_PER_LINE))
lines_rounded=$(( (total_lines / 1000) * 1000 ))

# Format numbers with commas (portable across macOS and Linux)
fmt_num() { echo "$1" | LC_ALL=en_US.UTF-8 awk '{ printf "%\047d\n", $1 }' 2>/dev/null || echo "$1"; }
fmt_files=$(fmt_num "$total_files")
fmt_lines=$(fmt_num "$lines_rounded")

stats_line="${project_count} projects. ${fmt_files} files. ${fmt_lines}+ lines of code. And still building."

echo "Stats: $stats_line"

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
