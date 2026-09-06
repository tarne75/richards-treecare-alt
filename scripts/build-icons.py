#!/usr/bin/env python3
"""
Richard's Tree Care — raster icon + Open Graph image generator.

The canonical logo is images/favicon.svg / images/logo-mark.svg. Browsers that
cannot use an SVG favicon (and every social platform) need PNGs, so this script
redraws the same mark with Pillow and writes:

    images/favicon-32.png
    images/favicon-180.png   (apple-touch-icon)
    images/favicon-512.png   (PWA / maskable)
    images/og-image.png      (1200x630 social card)

Run:  python3 scripts/build-icons.py
Deps: pillow  (pip install pillow)
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "images")

FOREST_800 = (0x18, 0x32, 0x0f)
FOREST_950 = (0x0a, 0x14, 0x06)
FOREST_300 = (0x8f, 0xc7, 0x7e)
RUST_500   = (0xd0, 0x6a, 0x12)
RUST_600   = (0xb6, 0x52, 0x00)
WHITE      = (0xff, 0xff, 0xff)

SS = 8  # supersample factor for clean edges


def draw_mark(size, canopy, trunk, bg=None, radius_ratio=0.23, pad_ratio=0.0):
    """Draw the tree mark on a `size` x `size` RGBA canvas."""
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if bg is not None:
        r = int(s * radius_ratio)
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=r, fill=bg)

    # The mark is authored on a 48-unit grid (see images/favicon.svg)
    inner = s * (1 - pad_ratio * 2)
    off = (s - inner) / 2
    u = inner / 48.0

    def px(x, y):
        return (off + x * u, off + y * u)

    def circle(cx, cy, rr):
        x0, y0 = px(cx - rr, cy - rr)
        x1, y1 = px(cx + rr, cy + rr)
        d.ellipse([x0, y0, x1, y1], fill=canopy)

    # Trunk (drawn first so the canopy overlaps its top)
    tx0, ty0 = px(21.4, 24.0)
    tx1, ty1 = px(26.6, 41.6)
    d.rounded_rectangle([tx0, ty0, tx1, ty1], radius=int(1.6 * u), fill=trunk)

    # Canopy
    circle(15.2, 21.0, 7.2)
    circle(32.8, 21.0, 7.2)
    circle(24.0, 14.6, 9.0)
    circle(24.0, 22.6, 8.2)

    return img.resize((size, size), Image.LANCZOS)


def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


SERIF = ["/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
         "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"]
SANS  = ["/usr/share/fonts/truetype/lato/Lato-Semibold.ttf",
         "/usr/share/fonts/truetype/lato/Lato-Medium.ttf",
         "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
         "/System/Library/Fonts/Supplemental/Arial.ttf"]


def build_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), FOREST_950)
    d = ImageDraw.Draw(img)

    # Diagonal gradient, forest-800 -> forest-950, warmed on the right
    for y in range(H):
        t = y / H
        for band in (0,):
            pass
        r = int(FOREST_800[0] + (FOREST_950[0] - FOREST_800[0]) * t)
        g = int(FOREST_800[1] + (FOREST_950[1] - FOREST_800[1]) * t)
        b = int(FOREST_800[2] + (FOREST_950[2] - FOREST_800[2]) * t)
        d.line([(0, y), (W, y)], fill=(r, g, b))

    # Soft rust glow, top right
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(60, 0, -1):
        rad = i * 11
        alpha = int(2.2 * (60 - i) / 60 * 26)
        gd.ellipse([W - 210 - rad, -190 - rad, W - 210 + rad, -190 + rad],
                   fill=RUST_600 + (alpha,))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img)

    mark = draw_mark(132, FOREST_300, RUST_500)
    img.paste(mark, (86, 92), mark)

    f_name = font(SERIF, 86)
    f_tag  = font(SERIF, 40)
    f_sub  = font(SANS, 30)
    f_tel  = font(SANS, 27)

    d.text((238, 108), "Richard's", font=f_name, fill=WHITE)
    d.text((238, 196), "Tree Care", font=f_name, fill=WHITE)

    d.line([(88, 336), (1112, 336)], fill=(60, 84, 52), width=2)

    d.text((88, 372), "Healthy, beautiful and safe trees.", font=f_tag, fill=FOREST_300)
    d.text((88, 440),
           "Tree surgery · St Albans · Harpenden · Welwyn Garden City",
           font=f_sub, fill=(196, 210, 188))
    d.text((88, 494), "Over 20 years' experience", font=f_sub, fill=(196, 210, 188))

    # Rust CTA pill, sized to its text
    tel = "01582 621675  ·  07890 262695"
    tb = d.textbbox((0, 0), tel, font=f_tel)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    px, py, pad_x, pad_y = 88, 544, 34, 19
    d.rounded_rectangle([px, py, px + tw + pad_x * 2, py + th + pad_y * 2],
                        radius=(th + pad_y * 2) // 2, fill=RUST_600)
    d.text((px + pad_x - tb[0], py + pad_y - tb[1]), tel, font=f_tel, fill=WHITE)

    img.save(os.path.join(IMAGES, "og-image.png"), optimize=True)
    print("  og-image.png            1200x630")


def main():
    os.makedirs(IMAGES, exist_ok=True)
    print("Generating icons ->", os.path.relpath(IMAGES, ROOT) + "/")

    for size in (32, 180, 512):
        m = draw_mark(size, FOREST_300, RUST_500, bg=FOREST_800, pad_ratio=0.06)
        name = "favicon-%d.png" % size
        m.save(os.path.join(IMAGES, name), optimize=True)
        print("  %-24s%dx%d" % (name, size, size))

    build_og()
    print("Done.")


if __name__ == "__main__":
    main()
