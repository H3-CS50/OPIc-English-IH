"""Tạo icon và màn chờ (splash) Android: bong bóng thoại trắng có chữ "OPIc".

Chạy: python3 tools/icon/make_icons.py
Ghi đè các file PNG trong app/android/app/src/main/res (mipmap-* và drawable*/splash.png).
Font: Inter Black (SIL Open Font License).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
RES = ROOT / "app/android/app/src/main/res"
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
BG = (22, 78, 99, 255)        # #164E63, trùng màu nền icon thích ứng
INK = (22, 78, 99, 255)       # chữ "OPI"
ACCENT = (194, 65, 12, 255)   # chữ "c" (#C2410C)
WHITE = (255, 255, 255, 255)
S = 4                          # vẽ to gấp 4 rồi thu nhỏ cho mịn


def bubble(w):
    """Bong bóng thoại rộng w px (đã nhân S), trả ảnh RGBA trong suốt."""
    h = int(w * 0.80)
    body_h = int(h * 0.80)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, body_h], radius=int(w * 0.22), fill=WHITE)
    d.polygon([(int(w * 0.18), body_h - 2), (int(w * 0.40), body_h - 2), (int(w * 0.13), h - 1)], fill=WHITE)
    # chữ OPIc canh giữa phần thân
    size = int(w * 0.36)
    font = ImageFont.truetype(FONT, size)
    parts = [("OPI", INK), ("c", ACCENT)]
    widths = [d.textlength(t, font=font) for t, _ in parts]
    total = sum(widths) + int(w * 0.005)
    x = (w - total) / 2
    asc_box = d.textbbox((0, 0), "OPI", font=font)
    y = (body_h - (asc_box[3] - asc_box[1])) / 2 - asc_box[1]
    for (t, col), tw in zip(parts, widths):
        d.text((x, y), t, font=font, fill=col)
        x += tw + int(w * 0.005)
    return im


def place(canvas_px, frac, bg=None, shape=None):
    """Ảnh vuông canvas_px, bong bóng rộng frac * cạnh, canh giữa."""
    n = canvas_px * S
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    if bg:
        d = ImageDraw.Draw(im)
        if shape == "round":
            d.ellipse([0, 0, n - 1, n - 1], fill=bg)
        else:
            d.rounded_rectangle([0, 0, n - 1, n - 1], radius=int(n * 0.18), fill=bg)
    b = bubble(int(n * frac))
    im.alpha_composite(b, ((n - b.width) // 2, (n - b.height) // 2 + int(b.height * 0.06)))
    return im.resize((canvas_px, canvas_px), Image.LANCZOS)


DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for name, k in DENS.items():
    d = RES / f"mipmap-{name}"
    place(int(48 * k), 0.72, BG).save(d / "ic_launcher.png")
    place(int(48 * k), 0.68, BG, "round").save(d / "ic_launcher_round.png")
    place(int(108 * k), 0.52).save(d / "ic_launcher_foreground.png")

for f in sorted(RES.glob("drawable*/splash.png")):
    w, h = Image.open(f).size
    side = min(w, h)
    im = Image.new("RGBA", (w * S, h * S), BG)
    b = bubble(int(side * 0.30 * S))
    im.alpha_composite(b, ((w * S - b.width) // 2, (h * S - b.height) // 2))
    im.resize((w, h), Image.LANCZOS).convert("RGB").save(f)
    print("splash", f.relative_to(RES), (w, h))
print("ok")
