"""OPIc Drama · dựng truyện tranh và xuất vào app (một lệnh cho cả 10 tập).

  python3 tools/drama/build.py                 # dựng lại cả 10 tập → tools/drama/out/epXX/panels_png/*.png
  python3 tools/drama/build.py --ep 4          # chỉ Tập 4 (nhiều tập: --ep 4,5,10)
  python3 tools/drama/build.py --ep 10 --only K15,K17   # chỉ chụp lại vài khung
  python3 tools/drama/build.py --pdf           # thêm PDF từng tập + PDF trọn bộ (khi dựng đủ 10 tập)
  python3 tools/drama/build.py --app           # xuất WebP 900 px + manifest.json vào app/www/drama/mina/
  python3 tools/drama/build.py --app --no-render   # chỉ xuất lại từ PNG đã dựng

Cần: Python 3.10+, pillow, numpy, playwright (Chromium), pypdf (PDF trọn bộ).
Ảnh gốc: tools/drama/mina/art/epXX/<KHOÁ>.webp.
"""
import argparse
import importlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import comic_engine as E  # noqa: E402
from mina import story  # noqa: E402

REPO = HERE.parent.parent
OUT = HERE / "out"
APP_DIR = REPO / "app" / "www" / "drama" / "mina"
APP_W, APP_Q = 900, 75


def load(ep):
    return importlib.import_module(f"mina.ep{ep:02d}")


def ep_dir(ep):
    return OUT / f"ep{ep:02d}"


def safe(s):
    return "".join(c if c.isalnum() else "_" for c in s).strip("_").replace("__", "_")


def do_pdf(eps):
    from PIL import Image
    books = []
    for ep in eps:
        m = load(ep)
        order = json.loads((ep_dir(ep) / "order.json").read_text())
        pages = [Image.open(ep_dir(ep) / "panels_png" / f"{k}.png").convert("RGB") for k in order]
        f = ep_dir(ep) / f"EP{ep:02d}_Mina_{safe(m.TITLE)}_truyen_tranh.pdf"
        pages[0].save(f, save_all=True, append_images=pages[1:], resolution=144, quality=88)
        books.append((ep, m.TITLE, len(pages), f))
        del pages
        print("PDF", f.relative_to(REPO))
    if [b[0] for b in books] == list(range(1, 11)):
        # trọn bộ: nối PDF từng tập (ít tốn bộ nhớ), thêm mục lục từng tập
        from pypdf import PdfReader, PdfWriter
        f = OUT / "Mina_EP01-EP10_tron_bo.pdf"
        w, i = PdfWriter(), 0
        for ep, title, n, src in books:
            for pg in PdfReader(str(src)).pages:
                w.add_page(pg)
            w.add_outline_item(f"Tập {ep} · {title}", i)
            i += n
        w.write(str(f))
        print("PDF", f.relative_to(REPO), i, "trang")


def do_app(eps):
    from PIL import Image
    APP_DIR.mkdir(parents=True, exist_ok=True)
    mf = APP_DIR / "manifest.json"
    old = json.loads(mf.read_text()) if mf.exists() else {}
    by_ep = {e["ep"]: e for e in old.get("episodes", [])}
    total = 0
    for ep in eps:
        m = load(ep)
        meta = story.EPISODES[ep]
        order = json.loads((ep_dir(ep) / "order.json").read_text())
        d = APP_DIR / f"ep{ep:02d}"
        d.mkdir(exist_ok=True)
        for f in d.glob("*.webp"):
            if f.stem not in order:
                f.unlink()
        sizes = {}
        for k in order:
            im = Image.open(ep_dir(ep) / "panels_png" / f"{k}.png").convert("RGB")
            h = round(im.height * APP_W / im.width)
            im = im.resize((APP_W, h), Image.LANCZOS)
            im.save(d / f"{k}.webp", "WEBP", quality=APP_Q, method=6)
            sizes[k] = [APP_W, h]
            total += (d / f"{k}.webp").stat().st_size
        by_ep[ep] = {
            "ep": ep,
            "title": m.TITLE,
            "tag": meta["tag"],
            "dir": f"ep{ep:02d}",
            "questions": meta["q"],
            "photocard": meta.get("photocard"),
            "bonus": meta.get("bonus"),
            "badge": meta.get("badge"),
            "sections": story.sections(ep, order),
            "panels": sizes,
        }
    data = {"route": story.ROUTE, "episodes": [by_ep[k] for k in sorted(by_ep)]}
    mf.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"app: {len(eps)} tập · {total / 1e6:.1f} MB WebP → {APP_DIR.relative_to(REPO)}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ep", default="1-10", help="tập cần dựng: 4 | 4,5,10 | 1-10")
    ap.add_argument("--only", default="", help="chỉ chụp lại các khung này (K15,K17)")
    ap.add_argument("--pdf", action="store_true")
    ap.add_argument("--app", action="store_true")
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    eps = []
    for part in a.ep.split(","):
        lo, _, hi = part.partition("-")
        eps += list(range(int(lo), int(hi or lo) + 1))
    for ep in eps:
        if a.no_render:
            continue
        m = load(ep)
        only = set(filter(None, a.only.split(","))) or None
        order = E.render(m, HERE / "mina" / "art" / f"ep{ep:02d}", ep_dir(ep), only=only)
        print(f"EP{ep:02d} · {m.TITLE}: {len(order)} khung")
    if a.pdf:
        do_pdf(eps)
    if a.app:
        do_app(eps)


if __name__ == "__main__":
    main()
