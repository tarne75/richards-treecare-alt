#!/usr/bin/env python3
"""
Richard's Tree Care — gallery image pipeline.

Reads the full-resolution masters in _source/gallery-originals/ and writes
web-ready derivatives into images/gallery/:

    <name>-400.webp    grid thumbnail, 1x
    <name>-800.webp    grid thumbnail 2x / hero / about figure 2x
    <name>-1400.webp   lightbox
    <name>-800.jpg     fallback for anything without WebP support

Tiers are chosen from actual display sizes, not from the masters: grid cells are
140-280 CSS px, the hero and about figures cap at 340, and the lightbox caps at
620 CSS px tall. Nothing here is ever displayed at more than roughly half the
master's width, so the masters themselves are never served.

Nothing else reads the masters, so they never ship to a visitor.

The gallery is rendered from window.RTC_DATA.gallery in js/data.js. This script
does NOT write that list — it prints the intrinsic width/height of every image
so you can keep the entries accurate, and warns about any mismatch between the
two. Adding a photo is therefore:

    1. drop the file into _source/gallery-originals/
    2. python3 scripts/build-gallery.py
    3. add an entry (file, w, h, alt, caption) to the gallery array in data.js

Run:  python3 scripts/build-gallery.py
Deps: pillow  (pip install pillow)
"""
import json
import os
import re
import sys

from PIL import Image, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_source", "gallery-originals")
OUT = os.path.join(ROOT, "images", "gallery")
DATA_JS = os.path.join(ROOT, "js", "data.js")

WIDTHS = (400, 800, 1400)
# Foliage and bare branches are detail-dense and compress badly. These values
# were picked by sweeping quality against file size on the four busiest images
# in the set, not guessed. A light unsharp mask pays for itself at the small
# tiers (the browser is not downscaling much, so perceived sharpness matters)
# but is pure cost at 1400, where the browser downscales anyway.
WEBP_QUALITY = {400: 66, 800: 70, 1400: 66}
SHARPEN_UP_TO = 800
JPEG_QUALITY = 75
JPEG_FALLBACK_WIDTH = 800


def derivatives(path, name):
    """Write every derivative for one master. Returns (width, height, bytes)."""
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    w, h = im.size
    written = 0

    for target in WIDTHS:
        if target > w:
            # Never upscale — a smaller master simply gets fewer tiers.
            continue
        resized = im.resize((target, round(h * target / w)), Image.LANCZOS)
        if target <= SHARPEN_UP_TO:
            resized = resized.filter(
                ImageFilter.UnsharpMask(radius=0.6, percent=40, threshold=3)
            )
        wp = os.path.join(OUT, "%s-%d.webp" % (name, target))
        resized.save(wp, "WEBP", quality=WEBP_QUALITY[target], method=6)
        written += os.path.getsize(wp)

        if target == JPEG_FALLBACK_WIDTH:
            jp = os.path.join(OUT, "%s-%d.jpg" % (name, target))
            resized.save(jp, "JPEG", quality=JPEG_QUALITY,
                         optimize=True, progressive=True)
            written += os.path.getsize(jp)

    return w, h, written


def declared_gallery():
    """Pull the gallery array out of data.js so we can cross-check it."""
    if not os.path.exists(DATA_JS):
        return None
    src = open(DATA_JS, encoding="utf-8").read()
    m = re.search(r"gallery:\s*(\[.*?\n  \])", src, re.S)
    if not m:
        return None
    block = m.group(1)
    out = {}
    for entry in re.finditer(
        r"file:\s*'([^']+)'.*?w:\s*(\d+).*?h:\s*(\d+)", block, re.S
    ):
        out[entry.group(1)] = (int(entry.group(2)), int(entry.group(3)))
    return out


def main():
    if not os.path.isdir(SRC):
        sys.exit("No masters found at _source/gallery-originals/")
    os.makedirs(OUT, exist_ok=True)
    for stale in os.listdir(OUT):
        os.remove(os.path.join(OUT, stale))

    masters = sorted(
        f for f in os.listdir(SRC)
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    )
    if not masters:
        sys.exit("_source/gallery-originals/ is empty")

    print("Building %d images -> images/gallery/\n" % len(masters))
    sizes = {}
    total = 0
    for f in masters:
        name = os.path.splitext(f)[0]
        w, h, written = derivatives(os.path.join(SRC, f), name)
        sizes[name] = (w, h)
        total += written
        print("  %-32s %5dx%-5d  ->  %6.1f KB of derivatives"
              % (name, w, h, written / 1024))

    print("\n  %d derivatives, %.1f MB total"
          % (len(os.listdir(OUT)), total / 1024 / 1024))

    # ---- cross-check against data.js -------------------------------------
    declared = declared_gallery()
    if declared is None:
        print("\n(could not read the gallery array from js/data.js — skipping check)")
        return

    problems = []
    for name, (w, h) in sizes.items():
        if name not in declared:
            problems.append("  NOT IN data.js:   %s" % name)
        elif declared[name] != (w, h):
            problems.append("  WRONG w/h:        %s — data.js says %dx%d, actual %dx%d"
                            % (name, declared[name][0], declared[name][1], w, h))
    for name in declared:
        if name not in sizes:
            problems.append("  NO SUCH MASTER:   %s (listed in data.js)" % name)

    print()
    if problems:
        print("data.js needs attention:")
        print("\n".join(problems))
        print("\nCorrect w/h values for every master:")
        for name, (w, h) in sorted(sizes.items()):
            print("    { file: '%s', w: %d, h: %d, ... }," % (name, w, h))
        sys.exit(1)
    print("data.js matches all %d images." % len(sizes))


if __name__ == "__main__":
    main()
