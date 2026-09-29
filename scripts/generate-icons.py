"""
One-off icon generator for Unwind Puzzles. Run from the project root:
    python scripts/generate-icons.py

Produces /public/icons/* (favicons, PWA/app icons, maskable variants) and
/public/icons/variants/* (vertical-logo vs mascot-only, for the /dev/icons
comparison page), from the source files in /brand.
"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "brand")
OUT = os.path.join(ROOT, "public", "icons")
VARIANTS = os.path.join(OUT, "variants")
os.makedirs(VARIANTS, exist_ok=True)

NAVY = (4, 7, 58)


def rounded_mask(size, radius_frac):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    r = int(size * radius_frac)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    return mask


def is_close(p, color, tol):
    return all(abs(p[i] - color[i]) <= tol for i in range(3))


def content_bbox(img, bg, tol=18, step=2):
    w, h = img.size
    px = img.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(0, h, step):
        for x in range(0, w, step):
            p = px[x, y]
            if len(p) == 4 and p[3] < 200:
                continue
            if not is_close(p, bg, tol):
                found = True
                if x < minx:
                    minx = x
                if x > maxx:
                    maxx = x
                if y < miny:
                    miny = y
                if y > maxy:
                    maxy = y
    if not found:
        return (0, 0, w, h)
    return (minx, miny, maxx, maxy)


def build_mascot_master():
    """icon.png is a big blue canvas with a rounded navy tile in the middle
    containing the mascot. Crop the tile, then flatten its baked-in rounded
    corners (which bleed the outer blue) back to solid navy so we get a
    clean, full-bleed navy square with just the mascot on it."""
    img = Image.open(os.path.join(BRAND, "icon.png")).convert("RGBA")
    bg = img.getpixel((2, 2))[:3]  # outer blue
    l, t, r, b = content_bbox(img, bg, tol=10, step=4)
    tile = img.crop((l, t, r + 1, b + 1))
    size = min(tile.size)
    tile = tile.crop((0, 0, size, size))

    clean = Image.new("RGBA", (size, size), NAVY + (255,))
    mask = rounded_mask(size, radius_frac=0.24)
    clean.paste(tile, (0, 0), mask)
    return clean


def build_vertical_master():
    """logo-vertical.png is mascot+wordmark on a full navy square, sitting
    in the upper portion with empty navy below. Tighten the crop to the
    real content, pad it evenly, and re-square so it reads as an icon."""
    img = Image.open(os.path.join(BRAND, "logo-vertical.png")).convert("RGBA")
    l, t, r, b = content_bbox(img, NAVY, tol=16, step=3)
    cw, ch = r - l, b - t
    pad = int(max(cw, ch) * 0.18)
    l, t, r, b = l - pad, t - pad, r + pad, b + pad
    side = max(r - l, b - t)
    cx, cy = (l + r) // 2, (t + b) // 2
    half = side // 2
    l, t, r, b = cx - half, cy - half, cx + half, cy + half

    square = Image.new("RGBA", (side, side), NAVY + (255,))
    src = img.crop((max(l, 0), max(t, 0), min(r, img.width), min(b, img.height)))
    paste_x = max(0, -l)
    paste_y = max(0, -t)
    square.paste(src, (paste_x, paste_y))
    return square


def maskable_from(master, out_size, safe_fraction=0.62):
    """Re-pad content so it sits comfortably inside Android's 80% safe
    circle regardless of the master's own framing."""
    bg = NAVY
    l, t, r, b = content_bbox(master, bg, tol=16, step=2)
    content = master.crop((l, t, r, b))
    cw, ch = content.size
    scale = (out_size * safe_fraction) / max(cw, ch)
    content = content.resize((max(1, int(cw * scale)), max(1, int(ch * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (out_size, out_size), NAVY + (255,))
    cx = (out_size - content.size[0]) // 2
    cy = (out_size - content.size[1]) // 2
    canvas.paste(content, (cx, cy), content)
    return canvas


def save_sizes(master, sizes, name_fmt, folder):
    for s in sizes:
        resized = master.resize((s, s), Image.LANCZOS)
        resized.save(os.path.join(folder, name_fmt.format(s)))


mascot_master = build_mascot_master()
vertical_master = build_vertical_master()

# Favicons: always the mascot mark.
save_sizes(mascot_master, [16, 32, 48], "favicon-{}.png", OUT)
mascot_master.resize((256, 256), Image.LANCZOS).save(
    os.path.join(OUT, "favicon.ico"),
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)

# Default production app icon set: mascot-only, per the user's decision
# after comparing both at /dev/icons (the vertical logo's text turns to
# mush at small sizes; the mascot alone reads clearly and boldly).
mascot_master.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "apple-touch-icon.png"))
save_sizes(mascot_master, [192, 512], "icon-{}.png", OUT)
maskable_from(mascot_master, 192).save(os.path.join(OUT, "icon-192-maskable.png"))
maskable_from(mascot_master, 512).save(os.path.join(OUT, "icon-512-maskable.png"))

# Comparison variants for /dev/icons (both at 48 / 96 / 180).
for s in [48, 96, 180]:
    vertical_master.resize((s, s), Image.LANCZOS).save(os.path.join(VARIANTS, f"vertical-{s}.png"))
    mascot_master.resize((s, s), Image.LANCZOS).save(os.path.join(VARIANTS, f"mascot-{s}.png"))

print("Generated icons into", OUT)
