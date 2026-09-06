#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Richard's Tree Care — original image importer
#
# Pulls every photograph that was published on the legacy hibu/Duda site
# (richards-treecare.co.uk) and drops it into images/gallery/ under a
# descriptive, SEO-friendly filename.
#
# Safe to re-run: existing files are skipped unless you pass --force.
#
#   ./scripts/download-images.sh          # download anything missing
#   ./scripts/download-images.sh --force  # re-download everything
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/images/gallery"
SRC="$ROOT/_source/original-images"
CDN="https://irp-cdn.multiscreensite.com/b99f84cd/import/base"
FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

mkdir -p "$OUT" "$SRC"

# legacy-id <TAB> destination filename
MAP=$(cat <<'EOM'
1303124982	felling-cut-chainsaw.jpg
1357820409	mature-tree-barn-reduction.jpg
1395334846	bare-crown-tree-removal.jpg
1427119135	tall-tree-beside-barn.jpg
1484562817	logs-stacked-site-clearance.jpg
1736785272	mature-conifer-crown-work.jpg
1761583898	sectional-felling-stump.jpg
1945187492	garden-trees-climbing-lines.jpg
2072272011	mature-tree-open-lawn.jpg
264354351	climber-rigging-tall-tree.jpg
377037326	dismantling-trunk-blue-sky.jpg
407807426	woodchipper-site-clearance.jpg
674578836	climber-dismantling-crown.jpg
828826192	crown-reduction-completed.jpg
EOM
)

fetch () { # url dest
  local url="$1" dest="$2"
  if [[ -s "$dest" && $FORCE -eq 0 ]]; then
    printf '  skip  %s\n' "$(basename "$dest")"; return
  fi
  if curl -fsSL --retry 3 --retry-delay 2 -o "$dest.tmp" "$url"; then
    mv "$dest.tmp" "$dest"
    printf '  ok    %-38s %6s bytes\n' "$(basename "$dest")" "$(wc -c < "$dest" | tr -d ' ')"
  else
    rm -f "$dest.tmp"
    printf '  FAIL  %s\n' "$(basename "$dest")" >&2
  fi
}

echo "Importing gallery images -> images/gallery/"
while IFS=$'\t' read -r id name; do
  [[ -z "$id" ]] && continue
  fetch "$CDN/Satellite_$id.jpg" "$OUT/$name"
done <<< "$MAP"

echo
echo "Archiving legacy assets -> _source/original-images/"
fetch "$CDN/Satellite_1197424432.jpg" "$SRC/legacy-hero-banner.jpg"
fetch "https://irp-cdn.multiscreensite.com/b99f84cd/dms3rep/multi/Richard-logo-322x100.png" "$SRC/legacy-logo.png"

echo
if command -v python3 >/dev/null 2>&1; then
  echo "Trimming the legacy gold frame baked into each JPEG..."
  python3 "$ROOT/scripts/trim-borders.py" || echo "  (skipped - pillow not installed: pip install pillow)"
fi

echo
echo "Done. $(ls -1 "$OUT" | wc -l | tr -d ' ') images in images/gallery/"
echo "NOTE: these are the original low-resolution files (approx 230x307 to 290x387)."
echo "      Phase 2: replace with high-resolution originals and generate 1x/2x WebP."
