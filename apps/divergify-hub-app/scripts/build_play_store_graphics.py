#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


APP_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = APP_ROOT / "public"
OUTPUT_DIR = APP_ROOT / "output" / "playwright" / "play-store" / "branding"

MARK_PATH = PUBLIC_DIR / "brand-north-star.png"
WORDMARK_PATH = PUBLIC_DIR / "brand-wordmark-clean.png"

BG = (35, 33, 71)
BG_GLOW = (47, 45, 96)
TEXT = (249, 238, 210, 255)


def ensure_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def contain(image: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / image.width, max_h / image.height)
    size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
    return image.resize(size, Image.Resampling.LANCZOS)


def make_background(width: int, height: int) -> Image.Image:
    base = Image.new("RGB", (width, height), BG)
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse(
        (-width * 0.1, height * 0.15, width * 0.65, height * 1.05),
        fill=(*BG_GLOW, 120),
    )
    draw.ellipse(
        (width * 0.35, -height * 0.05, width * 1.05, height * 0.9),
        fill=(*BG_GLOW, 90),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(width, height) // 12))
    base = Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")
    return base


def paste_centered(canvas: Image.Image, asset: Image.Image, center_x: int, center_y: int) -> None:
    x = center_x - asset.width // 2
    y = center_y - asset.height // 2
    canvas.paste(asset, (x, y), asset)


def tint_asset(image: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    tinted = Image.new("RGBA", image.size, color)
    tinted.putalpha(image.getchannel("A"))
    return tinted


def build_hi_res_icon(mark: Image.Image) -> Path:
    canvas = make_background(512, 512)
    mark_resized = contain(mark, 320, 360)
    paste_centered(canvas, mark_resized, 256, 256)
    out = OUTPUT_DIR / "hi-res-icon-512.png"
    canvas.save(out, format="PNG", optimize=True)
    return out


def build_feature_graphic(mark: Image.Image, wordmark: Image.Image) -> Path:
    canvas = make_background(1024, 500).convert("RGBA")
    mark_resized = contain(mark, 180, 210)
    wordmark_resized = contain(tint_asset(wordmark, TEXT), 500, 120)

    paste_centered(canvas, mark_resized, 512, 160)
    paste_centered(canvas, wordmark_resized, 512, 360)

    out = OUTPUT_DIR / "feature-graphic-1024x500.png"
    canvas.convert("RGB").save(out, format="PNG", optimize=True)
    return out


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    mark = ensure_rgba(MARK_PATH)
    wordmark = ensure_rgba(WORDMARK_PATH)

    icon_path = build_hi_res_icon(mark)
    feature_path = build_feature_graphic(mark, wordmark)

    print(f"Saved {icon_path}")
    print(f"Saved {feature_path}")


if __name__ == "__main__":
    main()
