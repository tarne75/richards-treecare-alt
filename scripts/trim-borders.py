#!/usr/bin/env python3
"""
Richard's Tree Care — border trimmer.

The photographs on the legacy hibu site had a gold/yellow frame baked into the
JPEG itself. That frame looks wrong inside the new card layout, so this script
detects and crops any uniform coloured border from every image in
images/gallery/ (and re-encodes at quality 88).

Idempotent: an already-trimmed image has no uniform border left to remove.

Run:  python3 scripts/trim-borders.py
Deps: pillow
"""
import os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY = os.path.join(ROOT, "images", "gallery")

TOL = 62          # per-channel tolerance when judging "same colour as the corner"
MATCH = 0.70      # fraction of a row/column that must match to count as border
MAX_TRIM = 0.06   # never remove more than 6% from any edge in one pass
MAX_TOTAL = 5     # ...and never more than this many pixels from an edge overall


def close(a, b):
    return all(abs(x - y) <= TOL for x, y in zip(a[:3], b[:3]))


def border_extent(px, w, h, axis, from_end, ref):
    """How many rows (axis=1) or columns (axis=0) of border there are."""
    limit = int((h if axis else w) * MAX_TRIM) + 1
    n = 0
    for i in range(limit):
        idx = ((h if axis else w) - 1 - i) if from_end else i
        if axis:
            line = [px[x, idx] for x in range(0, w, max(1, w // 120))]
        else:
            line = [px[idx, y] for y in range(0, h, max(1, h // 120))]
        hits = sum(1 for c in line if close(c, ref))
        if hits / len(line) >= MATCH:
            n += 1
        else:
            break
    return n


def one_pass(im):
    """Detect the uniform border on the current image. Returns a crop box or None."""
    w, h = im.size
    px = im.load()

    # Reference colour: average of the four corner pixels
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    ref = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    left   = border_extent(px, w, h, 0, False, ref)
    right  = border_extent(px, w, h, 0, True,  ref)
    top    = border_extent(px, w, h, 1, False, ref)
    bottom = border_extent(px, w, h, 1, True,  ref)

    if not (left or right or top or bottom):
        return None
    return (left, top, w - right, h - bottom), (left, top, right, bottom)


def trim(path):
    im = Image.open(path).convert("RGB")
    w0, h0 = im.size
    total = [0, 0, 0, 0]

    # Repeat until the edges are stable — the legacy frame is a soft gradient
    # and rarely comes off in a single pass.
    for _ in range(8):
        r = one_pass(im)
        if not r:
            break
        box, amounts = r
        # Clamp so a uniform region *inside* the photo can never be eaten into
        amounts = tuple(min(a, MAX_TOTAL - t) for a, t in zip(amounts, total))
        if not any(amounts):
            break
        w, h = im.size
        im = im.crop((amounts[0], amounts[1], w - amounts[2], h - amounts[3]))
        total = [t + a for t, a in zip(total, amounts)]

    if not any(total):
        return None

    im.save(path, "JPEG", quality=88, optimize=True, progressive=True)
    return (w0, h0, im.size, tuple(total))


def main():
    if not os.path.isdir(GALLERY):
        sys.exit("images/gallery not found — run scripts/download-images.sh first")

    files = sorted(f for f in os.listdir(GALLERY) if f.lower().endswith((".jpg", ".jpeg")))
    changed = 0
    for f in files:
        r = trim(os.path.join(GALLERY, f))
        if r:
            changed += 1
            (w, h), (nw, nh) = (r[0], r[1]), r[2]
            print("  trimmed %-38s %dx%d -> %dx%d  (l%d t%d r%d b%d)"
                  % (f, w, h, nw, nh, *r[3]))
        else:
            print("  clean   %s" % f)
    print("%d of %d images trimmed." % (changed, len(files)))


if __name__ == "__main__":
    main()
