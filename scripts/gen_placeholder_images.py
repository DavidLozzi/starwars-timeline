#!/usr/bin/env python3
"""Generate synthetic placeholder portraits for the Marvel timeline pack.

Reads sites/marvel/data.json and, for every `character` entry, writes a
400x400 PNG to sites/marvel/public/images/<basename of imageUrl>: a solid
background colour keyed off the entry's `universe` (so universes group
visually on the timeline), the character's initials in large type, and the
display name wrapped underneath.

These are deliberately plain flat-colour cards — no network access, no
copyrighted artwork, no reuse of any Star Wars asset. Zero third-party
dependencies beyond PIL (Pillow), which is already installed.

Usage:
    python3 scripts/gen_placeholder_images.py [--force]

By default, files that already exist are left untouched (this preserves the
five original skeleton portraits). Pass --force to regenerate everything.
"""

import argparse
import json
import os
import re
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(REPO_ROOT, "sites", "marvel", "data.json")
IMAGES_DIR = os.path.join(REPO_ROOT, "sites", "marvel", "public", "images")

CANVAS_SIZE = 400

# One background colour per universe id, chosen for visual separation from
# each other (this is the whole point: the eye should group characters by
# universe at a glance). `None`/unknown universes fall back to a neutral
# grey so the script never crashes on an entry with no `universe`.
UNIVERSE_COLORS = {
    "mcu": (178, 34, 52),         # Marvel red
    "raimi": (30, 58, 138),       # deep blue (classic Raimi Spidey)
    "amazing": (185, 28, 28),     # bright crimson (Amazing suit red)
    "ssu": (23, 23, 23),          # near-black (Venom/symbiote)
    "fox-xmen": (67, 56, 202),    # indigo (X-Men uniform blue-violet)
    "fox-ff": (37, 99, 235),      # FF blue
    "defenders": (120, 53, 15),   # gritty brown (Hell's Kitchen)
    "pre-mcu": (75, 85, 99),      # slate grey (dated one-offs)
    "shared": (55, 65, 81),       # neutral dark grey (unused by characters)
}
DEFAULT_COLOR = (90, 90, 90)

TEXT_COLOR = (255, 255, 255)

FONT_CANDIDATES = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/HelveticaNeue.ttc",
]


def load_font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def get_initials(name):
    """Initials from a display title, ignoring parenthetical disambiguators
    like "(MCU)" and apostrophes/punctuation (e.g. T'Challa -> TC)."""
    base = re.sub(r"\([^)]*\)", "", name)
    words = re.findall(r"[A-Za-z0-9]+", base)
    if not words:
        return "?"
    initials = "".join(w[0].upper() for w in words[:3])
    return initials or "?"


def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_centered_text(draw, text, font, center_x, y, fill):
    w, h = text_size(draw, text, font)
    draw.text((center_x - w / 2, y), text, font=font, fill=fill)
    return h


def make_portrait(title, universe):
    color = UNIVERSE_COLORS.get(universe, DEFAULT_COLOR)
    img = Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), color)
    draw = ImageDraw.Draw(img)

    initials = get_initials(title)
    initials_font = load_font(140)
    initials_h = draw_centered_text(
        draw, initials, initials_font, CANVAS_SIZE / 2, 90, TEXT_COLOR
    )

    # Wrap the display name underneath the initials.
    name_font = load_font(28)
    wrapped_lines = textwrap.wrap(title, width=16) or [title]
    line_height = 34
    total_text_h = len(wrapped_lines) * line_height
    start_y = CANVAS_SIZE - 60 - total_text_h
    y = start_y
    for line in wrapped_lines:
        draw_centered_text(draw, line, name_font, CANVAS_SIZE / 2, y, TEXT_COLOR)
        y += line_height

    return img


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force",
        action="store_true",
        help="regenerate every character portrait, even if the file already exists",
    )
    args = parser.parse_args()

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    characters = [e for e in data if e.get("type") == "character"]

    os.makedirs(IMAGES_DIR, exist_ok=True)

    written = 0
    skipped = 0

    for char in characters:
        image_url = char.get("imageUrl")
        title = char.get("title", "Unknown")
        if not image_url:
            print(f"WARNING: character {title!r} has no imageUrl, skipping", file=sys.stderr)
            continue

        basename = os.path.basename(image_url)
        out_path = os.path.join(IMAGES_DIR, basename)

        if os.path.exists(out_path) and not args.force:
            skipped += 1
            continue

        img = make_portrait(title, char.get("universe"))
        img.save(out_path, "PNG")
        written += 1

    print(f"Placeholder portraits: {written} written, {skipped} skipped (of {len(characters)} characters).")


if __name__ == "__main__":
    main()
