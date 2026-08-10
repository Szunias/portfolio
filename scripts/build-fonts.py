#!/usr/bin/env python3
"""Subset the three self-hosted web fonts into src/assets/fonts/.

Why this exists
---------------
The site used to link fonts.googleapis.com. That cost two cross-origin
handshakes on the critical path and 189 KB of woff2 on the home page, of
which 83 KB was Google's whole `latin-ext` subset of Inter -- pulled in by
exactly three characters ("Mowik", "Kolobrzeg" and a cedilla). With
`display=optional` on top, a slow first visit downloaded all of it and then
rendered the fallback anyway.

Self-hosting a subset removes the third-party origins, cuts the payload to a
fraction, and lets the CSS use `font-display: swap` safely because the files
are small enough to arrive before the swap period ends.

Run this only when the character repertoire or the font versions change:

    python scripts/build-fonts.py

It rewrites src/assets/fonts/*.woff2. The generated files are committed, so a
normal `npm run build` never needs Python or a network connection.

Requires: fonttools>=4.40, brotli.  Source TTFs are the upstream OFL releases
from github.com/google/fonts; the licences ship next to the woff2 files.
"""

import io
import os
import subprocess
import sys
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "src", "assets", "fonts")
UPSTREAM = "https://raw.githubusercontent.com/google/fonts/main/"

# Deliberately wider than what the pages use today, so ordinary copy edits
# (an accented name, a new arrow, a quotation mark) cannot silently fall back
# to a system font. Audited usage today is 108 characters, 15 of them
# non-ASCII; this repertoire is ~250 glyphs and still yields tiny files.
UNICODES = [
    "U+0020-007E",              # basic latin
    "U+00A0",                   # no-break space
    "U+00A9", "U+00AB", "U+00BB",   # (c) << >>
    "U+00AD",                   # soft hyphen
    "U+00B0", "U+00B1", "U+00B7",   # degree, plus-minus, middot
    "U+00D7",                   # multiplication sign
    "U+00C0-00FF",              # latin-1 letters: accents, cedilla, o-acute
    "U+0104-0107",              # A-ogonek, C-acute
    "U+0118-011B",              # E-ogonek, E-caron
    "U+0141-0144",              # L-stroke, N-acute
    "U+015A-015B",              # S-acute
    "U+0179-017E",              # Z-acute, Z-dot, Z-caron
    "U+2013-2014",              # en dash, em dash
    "U+2018-2019", "U+201C-201D",   # curly quotes
    "U+2022", "U+2026",         # bullet, ellipsis
    "U+2190-2193", "U+2197",    # arrows used by the UI
    "U+20AC", "U+2122",         # euro, trade mark
]

# (output stem, upstream path, axis limits, subfamily note)
FAMILIES = [
    # Body copy: Inter at 400 and 500 only. opsz is pinned to 14 (the optical
    # size the layout was designed at) so the variable font keeps one axis.
    ("inter-latin", "ofl/inter/Inter[opsz,wght].ttf",
     {"opsz": 14, "wght": (400, 500)}, "Inter"),
    # Display: Space Grotesk at 500/600/700.
    ("space-grotesk-latin", "ofl/spacegrotesk/SpaceGrotesk[wght].ttf",
     {"wght": (500, 700)}, "Space Grotesk"),
    # Mono: static regular, nothing to instantiate.
    ("ibm-plex-mono-latin", "ofl/ibmplexmono/IBMPlexMono-Regular.ttf",
     None, "IBM Plex Mono"),
]

LICENCES = [
    ("OFL-Inter.txt", "ofl/inter/OFL.txt"),
    ("OFL-SpaceGrotesk.txt", "ofl/spacegrotesk/OFL.txt"),
    ("OFL-IBMPlexMono.txt", "ofl/ibmplexmono/OFL.txt"),
]


def fetch(rel_path):
    url = UPSTREAM + urllib.parse.quote(rel_path, safe="/")
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()


def build_family(stem, upstream_path, axis_limits, label):
    raw = fetch(upstream_path)
    font = TTFont(io.BytesIO(raw))

    options = subset.Options()
    options.layout_features = ["kern", "liga", "clig", "calt", "ccmp", "locl", "mark", "mkmk"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.recalc_bounds = True
    options.drop_tables += ["DSIG"]

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=subset.parse_unicodes(",".join(UNICODES)))
    subsetter.subset(font)

    # Narrow the axes *after* subsetting. Doing it first leaves gvar without a
    # .notdef entry, which fontTools' glyph subsetter then trips over.
    if axis_limits:
        font = instancer.instantiateVariableFont(font, axis_limits, updateFontNames=True)

    dest = os.path.join(OUT, stem + ".woff2")
    font.flavor = "woff2"
    font.save(dest)
    size = os.path.getsize(dest)
    variable = "fvar" in font
    print(f"  {stem}.woff2  {size / 1024:6.1f} KB  "
          f"({label}, {'variable' if variable else 'static'}, "
          f"{font['maxp'].numGlyphs} glyphs)")
    return size


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Subsetting web fonts into src/assets/fonts/")
    total = 0
    for stem, path, limits, label in FAMILIES:
        total += build_family(stem, path, limits, label)
    for name, path in LICENCES:
        with open(os.path.join(OUT, name), "wb") as handle:
            handle.write(fetch(path))
    print(f"  licences: {', '.join(name for name, _ in LICENCES)}")
    print(f"Total woff2: {total / 1024:.1f} KB "
          f"(Google Fonts served 189 KB on the home page)")


if __name__ == "__main__":
    import urllib.parse  # noqa: E402  (kept next to its only use)
    main()
