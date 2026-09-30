"""
One-off icon generator for Unwind Puzzles. Run from the project root:
    python scripts/generate-icons.py

Produces /public/icons/* (favicons, PWA/app icons, maskable variants) and
/public/icons/variants/* (the wordmark icon at preview sizes, for the
/dev/icons page), from the source files in /brand.
"""
from PIL import Image, ImageDraw, ImageFilter
import os
import json

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


BLUE_ICON = (47, 107, 255)  # #2F6BFF — the brief's target blue for this icon specifically


def build_wordmark_icon_master(canvas_size=1024, unwind_width_frac=0.86, gap_frac=0.04):
    """The new app icon: "unwind" (white, blue i-dot) + "PUZZLES" (blue)
    below it, zoomed to fill the icon, wind-mark swooshes left out.

    No SVG of the wordmark exists (only the flat wordmark.png raster used
    by the splash screen). Rather than hand-tracing new path data — which
    would only ever approximate the real hand-lettered mark — the three
    pieces (unwind letters, the puzzle-piece dot, PUZZLES) were separated
    out of that raster by connected-component flood-fill (see
    wordmark-mask-bboxes.json for each piece's bbox in shared source-image
    coordinates, which is what lets this function position the dot
    correctly relative to the letters below). Each piece is high enough
    resolution (unwind: 1226x367) that scaling down to icon sizes, or the
    mild upscale PUZZLES needs here, never upscales a small source image.
    """
    unwind = Image.open(os.path.join(BRAND, "wordmark-unwind-mask.png")).convert("L")
    dot = Image.open(os.path.join(BRAND, "wordmark-dot-mask.png")).convert("L")
    puzzles = Image.open(os.path.join(BRAND, "wordmark-puzzles-mask.png")).convert("L")
    with open(os.path.join(BRAND, "wordmark-mask-bboxes.json")) as f:
        bboxes = json.load(f)

    # The dot's position relative to the unwind-letters bbox, in the shared
    # source coordinate space both were cut from — this is what lets the
    # dot land in the right place above the "i" at any target scale.
    dot_off_x = bboxes["dot"][0] - bboxes["unwind"][0]
    dot_off_y = bboxes["dot"][1] - bboxes["unwind"][1]

    scale = (canvas_size * unwind_width_frac) / unwind.width
    unwind_w, unwind_h = round(unwind.width * scale), round(unwind.height * scale)
    unwind_scaled = unwind.resize((unwind_w, unwind_h), Image.LANCZOS)
    dot_w, dot_h = round(dot.width * scale), round(dot.height * scale)
    dot_scaled = dot.resize((dot_w, dot_h), Image.LANCZOS)
    dot_off_x, dot_off_y = round(dot_off_x * scale), round(dot_off_y * scale)

    # PUZZLES: squeeze horizontally first (tighter letter-spacing), then a
    # mild dilate (bolder strokes), THEN scale — in that order, so tightening
    # the spacing before the final width-match means more of that width goes
    # to the letterforms themselves rather than the gaps between them.
    squeezed_w = round(puzzles.width * 0.90)
    puzzles_work = puzzles.resize((squeezed_w, puzzles.height), Image.LANCZOS)
    puzzles_work = puzzles_work.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MaxFilter(3))
    puzzles_scale = unwind_w / puzzles_work.width  # "same width as unwind, edges aligned"
    puzzles_w, puzzles_h = unwind_w, round(puzzles_work.height * puzzles_scale)
    puzzles_scaled = puzzles_work.resize((puzzles_w, puzzles_h), Image.LANCZOS)
    assert puzzles_h >= unwind_h * 0.20, "PUZZLES fell under the 20%-of-unwind-height floor"

    gap = round(canvas_size * gap_frac)
    # Vertical centering ignores the dot, per the brief — the "block" is
    # just the letters + gap + PUZZLES.
    group_h = unwind_h + gap + puzzles_h
    top = (canvas_size - group_h) // 2
    left = (canvas_size - unwind_w) // 2  # unwind and PUZZLES share this width, so also this x

    canvas = Image.new("RGBA", (canvas_size, canvas_size), NAVY + (255,))

    def paste_tinted(mask_img, color, x, y):
        tint = Image.new("RGBA", mask_img.size, color + (255,))
        tint.putalpha(mask_img)
        canvas.alpha_composite(tint, (x, y))

    paste_tinted(unwind_scaled, (255, 255, 255), left, top)
    paste_tinted(dot_scaled, BLUE_ICON, left + dot_off_x, top + dot_off_y)
    paste_tinted(puzzles_scaled, BLUE_ICON, left, top + unwind_h + gap)

    return canvas


def save_sizes(master, sizes, name_fmt, folder):
    for s in sizes:
        resized = master.resize((s, s), Image.LANCZOS)
        resized.save(os.path.join(folder, name_fmt.format(s)))


mascot_master = build_mascot_master()

# Favicon (browser tab icon): unchanged, still the mascot mark.
save_sizes(mascot_master, [16, 32, 48], "favicon-{}.png", OUT)
mascot_master.resize((256, 256), Image.LANCZOS).save(
    os.path.join(OUT, "favicon.ico"),
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)

# App icon (home screen / install prompt / app switcher): the "unwind
# PUZZLES" wordmark, zoomed in. New filenames (not a rewrite of the old
# icon-*.png/apple-touch-icon.png) so nothing keeps serving a stale cached
# icon — see index.html and vite.config.ts for where these get wired in.
wordmark_master = build_wordmark_icon_master(1024, unwind_width_frac=0.86)
wordmark_maskable_master = build_wordmark_icon_master(1024, unwind_width_frac=0.68)

wordmark_master.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "apple-touch-icon-wordmark.png"))
save_sizes(wordmark_master, [192, 512, 1024], "icon-wordmark-{}.png", OUT)
save_sizes(wordmark_maskable_master, [192, 512], "icon-wordmark-{}-maskable.png", OUT)

# /dev/icons preview: the new wordmark icon at the sizes that matter, plus
# the maskable version (shown inside a circle mask by the page itself).
for s in [180, 120, 60, 40]:
    wordmark_master.resize((s, s), Image.LANCZOS).save(os.path.join(VARIANTS, f"wordmark-{s}.png"))
wordmark_maskable_master.resize((180, 180), Image.LANCZOS).save(
    os.path.join(VARIANTS, "wordmark-maskable-180.png")
)

print("Generated icons into", OUT)
