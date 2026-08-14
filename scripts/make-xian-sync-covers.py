"""Restore Syncopations from the original mark. Draw Xian Clash as two clan seals."""
from math import sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
COVERS = ROOT / "old/public/assets/audio/covers"
THUMBS = COVERS / "thumbs"
S = 1024

PAPER = (232, 214, 186)
INK = (18, 14, 12)
RED = (168, 28, 22)
GOLD = (196, 156, 72)
CREAM = (244, 232, 208)


def save(im, jpg_name, webp_name):
    rgb = im.convert("RGB")
    rgb.save(COVERS / jpg_name, "JPEG", quality=92, optimize=True)
    rgb.resize((520, 520), Image.Resampling.LANCZOS).save(
        THUMBS / webp_name, "WEBP", quality=84, method=6
    )


def paper():
    im = Image.new("RGB", (S, S), PAPER)
    stain = Image.effect_noise((S, S), 28).convert("RGB")
    im = Image.blend(im, stain, 0.11)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, S, 36], fill=(48, 22, 16))
    d.rectangle([0, S - 36, S, S], fill=(48, 22, 16))
    return im


def mon_sun(d, cx, cy, r, fill, mark):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=INK, width=10)
    d.ellipse([cx - 38, cy - 70, cx + 38, cy + 6], fill=mark)
    peaks = [
        (cx - 86, cy + 78),
        (cx - 48, cy + 18),
        (cx - 18, cy + 58),
        (cx + 8, cy + 8),
        (cx + 42, cy + 62),
        (cx + 78, cy + 22),
        (cx + 92, cy + 78),
    ]
    d.polygon(peaks, fill=mark)


def mon_wave(d, cx, cy, r, fill, mark):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=INK, width=10)
    for i, y in enumerate((-36, 8, 52)):
        pts = []
        for t in range(0, 21):
            x = cx - 78 + t * 8
            pts.append((x, cy + y + int(14 * sin((t + i * 2) * 0.55))))
        for a, b in zip(pts, pts[1:]):
            d.line([a, b], fill=mark, width=11)
    d.polygon([(cx - 8, cy - 88), (cx + 8, cy - 88), (cx, cy + 4)], fill=mark)


def xian():
    im = paper()
    d = ImageDraw.Draw(im)

    # two house fields
    d.polygon([(0, 36), (470, 36), (390, 988), (0, 988)], fill=RED)
    d.polygon([(1024, 36), (554, 36), (634, 988), (1024, 988)], fill=INK)

    # rip down the join
    rip = []
    x = 512
    for y in range(36, 989, 8):
        x += 10 if (y // 16) % 2 == 0 else -10
        rip.append((x, y))
    d.line(rip, fill=CREAM, width=22)
    d.line(rip, fill=INK, width=6)

    mon_sun(d, 268, 430, 168, CREAM, RED)
    mon_wave(d, 756, 430, 168, CREAM, INK)

    title = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 72)
    small = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 22)
    d.text((72, 64), "XIAN CLASH", font=title, fill=CREAM)
    d.text((76, 148), "MAIN THEME", font=small, fill=GOLD)
    d.text((72, 930), "IGOR SZUNIEWICZ", font=small, fill=CREAM)

    im = Image.blend(im, Image.effect_noise((S, S), 18).convert("RGB"), 0.05)
    save(im, "XianClashCover.jpg", "XianClashCover.webp")
    print("wrote Xian Clash")


def syncopations():
    src = Image.open(COVERS / "Syncopations.png").convert("RGB")
    src = src.resize((S, S), Image.Resampling.LANCZOS)
    save(src, "Syncopations.jpg", "Syncopations.webp")
    print("wrote Syncopations from original mark")


if __name__ == "__main__":
    xian()
    syncopations()
