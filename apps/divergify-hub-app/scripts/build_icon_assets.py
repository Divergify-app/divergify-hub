#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


APP_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = APP_ROOT / "public"
ANDROID_RES_DIR = APP_ROOT / "android" / "app" / "src" / "main" / "res"

BG = (35, 33, 71)
BG_GLOW = (47, 45, 96)
CREAM = (249, 238, 210, 255)
GOLD = (205, 169, 119, 255)
PERIWINKLE = (145, 143, 162, 140)

ANDROID_ICON_SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

ANDROID_FOREGROUND_SIZES = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}


def contain(image: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / image.width, max_h / image.height)
    size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
    return image.resize(size, Image.Resampling.LANCZOS)


def paste_centered(canvas: Image.Image, asset: Image.Image) -> None:
    x = (canvas.width - asset.width) // 2
    y = (canvas.height - asset.height) // 2
    canvas.paste(asset, (x, y), asset)


def make_background(width: int, height: int) -> Image.Image:
    base = Image.new("RGBA", (width, height), (*BG, 255))
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse(
        (-width * 0.08, height * 0.12, width * 0.62, height * 1.02),
        fill=(*BG_GLOW, 140),
    )
    draw.ellipse(
        (width * 0.38, -height * 0.04, width * 1.02, height * 0.82),
        fill=(*BG_GLOW, 110),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(width, height) // 12))
    return Image.alpha_composite(base, glow)


def north_star_points(cx: float, cy: float, outer: float, inner: float) -> list[tuple[float, float]]:
    return [
        (cx, cy - outer),
        (cx + inner, cy - inner),
        (cx + outer, cy),
        (cx + inner, cy + inner),
        (cx, cy + outer),
        (cx - inner, cy + inner),
        (cx - outer, cy),
        (cx - inner, cy - inner),
    ]


def build_north_star_mark(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas, "RGBA")

    center = size / 2
    outer = size * 0.40
    inner = size * 0.075
    ring = size * 0.30
    stroke_width = max(2, round(size * 0.012))
    ring_width = max(2, round(size * 0.01))
    dot_radius = max(4, round(size * 0.04))

    draw.ellipse(
        (center - ring, center - ring, center + ring, center + ring),
        outline=PERIWINKLE,
        width=ring_width,
    )

    points = north_star_points(center, center, outer, inner)
    draw.polygon(points, fill=GOLD)
    draw.line(points + [points[0]], fill=CREAM, width=stroke_width)
    draw.ellipse(
        (center - dot_radius, center - dot_radius, center + dot_radius, center + dot_radius),
        fill=CREAM,
    )
    return canvas


def build_app_icon(size: int, mark_ratio: float) -> Image.Image:
    canvas = make_background(size, size)
    mark = build_north_star_mark(max(64, round(size * mark_ratio)))
    paste_centered(canvas, mark)
    return canvas


def build_round_icon(size: int, mark_ratio: float) -> Image.Image:
    square = build_app_icon(size, mark_ratio)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(square, (0, 0), mask)
    return out


def build_android_foreground(size: int, mark_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mark = build_north_star_mark(max(64, round(size * mark_ratio)))
    paste_centered(canvas, mark)
    return canvas


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def write_icon_svg(path: Path) -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#232147" />
  <g transform="translate(56 56) scale(2)">
    <circle cx="100" cy="100" r="60" fill="none" stroke="#918FA2" stroke-opacity="0.55" stroke-width="2" />
    <path
      d="M100 20L115 85L180 100L115 115L100 180L85 115L20 100L85 85L100 20Z"
      fill="#CDA977"
      stroke="#F9EED2"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <circle cx="100" cy="100" r="8" fill="#F9EED2" />
  </g>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def build_public_assets() -> None:
    save_png(build_north_star_mark(512), PUBLIC_DIR / "brand-north-star.png")
    save_png(build_app_icon(192, 0.68), PUBLIC_DIR / "icon-192.png")
    save_png(build_app_icon(512, 0.68), PUBLIC_DIR / "icon-512.png")
    save_png(build_app_icon(512, 0.56), PUBLIC_DIR / "icon-512-maskable.png")
    save_png(build_app_icon(180, 0.68), PUBLIC_DIR / "apple-touch-icon.png")
    write_icon_svg(PUBLIC_DIR / "icon.svg")


def build_android_assets() -> None:
    for density, size in ANDROID_ICON_SIZES.items():
        dir_path = ANDROID_RES_DIR / f"mipmap-{density}"
        save_png(build_app_icon(size, 0.68), dir_path / "ic_launcher.png")
        save_png(build_round_icon(size, 0.68), dir_path / "ic_launcher_round.png")

    for density, size in ANDROID_FOREGROUND_SIZES.items():
        dir_path = ANDROID_RES_DIR / f"mipmap-{density}"
        save_png(build_android_foreground(size, 0.62), dir_path / "ic_launcher_foreground.png")


def main() -> None:
    build_public_assets()
    build_android_assets()
    print("Updated North Star icon assets for web and Android.")


if __name__ == "__main__":
    main()
