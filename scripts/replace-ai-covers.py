"""Composite clean type onto the photographic plates."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PLATES = Path(r"C:\Users\iszun\.cursor\projects\c-Users-iszun-Documents-GitHub-igorszuniewicz\assets")
COVERS = ROOT / "old/public/assets/audio/covers"
THUMBS = COVERS / "thumbs"
S = 1024
THUMB = 520

TITLE = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 44)
ARTIST = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 20)

JOBS = [
    ("plate-cage.png", "Cage.jpg", "Cage.webp", "CAGE", "IGOR SZUNIEWICZ"),
    ("plate-cathedral.png", "Cathedral Of Time_track_cover.jpg", "Cathedral Of Time_track_cover.webp", "CATHEDRAL OF TIME", "IGOR SZUNIEWICZ"),
    ("plate-edge.png", "EdgeOfLife.jpg", "EdgeOfLife.webp", "EDGE OF LIFE", "IGOR SZUNIEWICZ"),
    ("plate-sync.png", "Syncopations.jpg", "Syncopations.webp", "SYNCOPATIONS", "IGOR SZUNIEWICZ"),
    ("plate-obsidian.png", "Tribal.jpg", "Tribal.webp", "OBSIDIAN", "IGOR SZUNIEWICZ"),
    ("plate-psy.png", "PSY.jpg", "PSY.webp", "PSYCHEDELIC JOURNEY", "IGOR SZUNIEWICZ"),
    ("plate-astro.png", "Astrophonic Dance_track_cover.jpg", "Astrophonic Dance_track_cover.webp", "ASTROPHONIC DANCE", "IGOR SZUNIEWICZ"),
]


def square(im):
    im = im.convert("RGB")
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return im.crop((left, top, left + side, top + side)).resize((S, S), Image.Resampling.LANCZOS)


def scrim(im):
    overlay = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(720, S):
        a = int(170 * ((y - 720) / (S - 720)))
        d.line([(0, y), (S, y)], fill=(8, 8, 10, a))
    return Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")


def letter(im, title, artist):
    d = ImageDraw.Draw(im)
    d.text((56, 860), title, font=TITLE, fill=(244, 240, 232))
    d.text((56, 920), artist, font=ARTIST, fill=(210, 204, 196))
    return im


def save(im, jpg_name, webp_name):
    im.save(COVERS / jpg_name, "JPEG", quality=92, optimize=True)
    im.resize((THUMB, THUMB), Image.Resampling.LANCZOS).save(
        THUMBS / webp_name, "WEBP", quality=84, method=6
    )
    print("wrote", jpg_name)


if __name__ == "__main__":
    for plate, jpg, webp, title, artist in JOBS:
        im = square(Image.open(PLATES / plate))
        im = letter(scrim(im), title, artist)
        save(im, jpg, webp)
