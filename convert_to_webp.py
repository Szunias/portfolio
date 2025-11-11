#!/usr/bin/env python3
"""
Convert PNG images to WebP format with high quality
Optimized for web performance
"""

import os
import sys
from pathlib import Path

from PIL import Image


def convert_png_to_webp(png_path, quality=85):
    """Convert a PNG file to WebP format"""
    try:
        # Open the PNG image
        img = Image.open(png_path)

        # Convert RGBA to RGB if necessary (WebP supports both but RGB is smaller)
        if img.mode == "RGBA":
            # Create a white background
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Generate output path
        webp_path = png_path.with_suffix(".webp")

        # Save as WebP
        img.save(webp_path, "WebP", quality=quality, method=6)

        # Get file sizes
        png_size = os.path.getsize(png_path)
        webp_size = os.path.getsize(webp_path)
        reduction = ((png_size - webp_size) / png_size) * 100

        print(f"✓ {png_path.name}")
        print(f"  PNG:  {png_size / 1024 / 1024:.2f} MB")
        print(f"  WebP: {webp_size / 1024 / 1024:.2f} MB")
        print(f"  Saved: {reduction:.1f}%\n")

        return True
    except Exception as e:
        print(f"✗ Error converting {png_path.name}: {e}\n")
        return False


def main():
    # Files to convert
    covers_dir = Path("assets/images/covers")
    projects_dir = Path("assets/images/projects")
    cv_dir = Path("assets/images/projects-cv")

    files_to_convert = [
        # Covers - ALL large PNG files (music.html)
        covers_dir / "Cage.png",
        covers_dir / "caplanepourmoi.png",
        covers_dir / "Console.png",
        covers_dir / "dwaadwdw.png",
        covers_dir / "EdgeOfLife.png",
        covers_dir / "epka.png",
        covers_dir / "epkam.png",
        covers_dir / "GnosienneAlbumCover.png",
        covers_dir / "keyboard.png",
        covers_dir / "nottoday.png",
        covers_dir / "nottodaydar.png",  # BIGGEST: 4.3MB
        covers_dir / "project5.png",
        covers_dir / "PSY.png",
        covers_dir / "richter.png",
        covers_dir / "Run.png",
        covers_dir / "Syncopations.png",
        covers_dir / "ThatsItCover.png",
        covers_dir / "Tribal.png",
        covers_dir / "XianClashCover.png",
        # CV (if exists)
        cv_dir / "1000016681_upscayl_5x_remacri-4x.png",
        # Large project images
        projects_dir / "amorak.png",
        projects_dir / "NotTodayPic1.png",
        projects_dir / "NotTodayPic2.png",
        projects_dir / "NotTodayPic3.png",
        projects_dir / "NotTodayPic4.png",
        projects_dir / "deserve.png",
        projects_dir / "richter.png",
    ]

    print("=" * 60)
    print("PNG → WebP Conversion")
    print("=" * 60)
    print(f"Converting {len(files_to_convert)} images...\n")

    total_png_size = 0
    total_webp_size = 0
    converted = 0

    for png_file in files_to_convert:
        if not png_file.exists():
            print(f"⚠ Skipping {png_file.name} (not found)\n")
            continue

        # Check if WebP already exists
        webp_file = png_file.with_suffix(".webp")
        if webp_file.exists():
            print(f"⊘ Skipping {png_file.name} (WebP exists)\n")
            continue

        png_size = os.path.getsize(png_file)
        total_png_size += png_size

        if convert_png_to_webp(png_file, quality=85):
            webp_size = os.path.getsize(webp_file)
            total_webp_size += webp_size
            converted += 1

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Converted: {converted} images")
    print(f"Total PNG size:  {total_png_size / 1024 / 1024:.2f} MB")
    print(f"Total WebP size: {total_webp_size / 1024 / 1024:.2f} MB")
    print(
        f"Total saved:     {(total_png_size - total_webp_size) / 1024 / 1024:.2f} MB ({((total_png_size - total_webp_size) / total_png_size) * 100:.1f}%)"
    )
    print("=" * 60)


if __name__ == "__main__":
    main()
