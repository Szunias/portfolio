"""Cage as a one-color metal mark. No generated picture."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
COVERS = ROOT / "old/public/assets/audio/covers"
THUMBS = COVERS / "thumbs"
S = 1024


def save(im):
    im.save(COVERS / "Cage.jpg", "JPEG", quality=92, optimize=True)
    im.resize((520, 520), Image.Resampling.LANCZOS).save(
        THUMBS / "Cage.webp", "WEBP", quality=84, method=6
    )


def skull(d, ink):
    # cranium
    d.ellipse([292, 150, 732, 560], fill=ink)
    # jaw
    d.polygon([(360, 470), (664, 470), (700, 690), (640, 760), (384, 760), (324, 690)], fill=ink)
    # eyes
    d.ellipse([360, 300, 470, 430], fill=(8, 8, 8))
    d.ellipse([554, 300, 664, 430], fill=(8, 8, 8))
    # nose
    d.polygon([(512, 430), (468, 530), (556, 530)], fill=(8, 8, 8))
    # teeth gaps
    for x in (420, 470, 520, 570, 620):
        d.rectangle([x - 6, 640, x + 6, 740], fill=(8, 8, 8))


def main():
    im = Image.new("RGB", (S, S), (8, 8, 8))
    bone = Image.new("RGB", (S, S), (8, 8, 8))
    d = ImageDraw.Draw(bone)
    ink = (232, 224, 214)
    skull(d, ink)
    # bars cut the skull
    for x in range(118, 920, 92):
        d.rectangle([x, 0, x + 28, S], fill=(8, 8, 8))
    im = Image.composite(bone, im, bone.convert("L").point(lambda p: 255 if p > 20 else 0))
    im = Image.blend(im, Image.effect_noise((S, S), 22).convert("RGB"), 0.06)
    d = ImageDraw.Draw(im)
    d.text((64, 830), "CAGE", font=ImageFont.truetype("C:/Windows/Fonts/ariblk.ttf", 92), fill=ink)
    d.text((68, 940), "IGOR SZUNIEWICZ", font=ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 24), fill=(168, 160, 152))
    save(im)
    print("wrote Cage")


if __name__ == "__main__":
    main()
