"""OPIc Drama · engine ghép bóng thoại truyện tranh (dùng chung cho mọi tập, mọi tuyến).

Gộp từ 10 script build_tN.py của tuyến Mina. Mỗi tập chỉ còn một file cấu hình (mina/epXX.py)
gồm: EP, TITLE, QBG, CSS riêng và danh sách khung P. Phần chung nằm ở đây:
  - phần tử: bub (bóng thoại), th (suy nghĩ), cap (chú thích), sfx (hiệu ứng chữ), raw (HTML tự do)
  - css_h / scr: dán một khung HTML lên đúng 4 góc màn hình điện thoại, laptop, giấy… (matrix3d)
  - build_html / render: Chromium (Playwright) chụp từng <section> thành PNG rộng 1080 px

Toạ độ phần tử tính theo px trên ảnh đã thu về rộng 1080 (y âm = nằm ở khoảng trống phía trên ảnh).
"""
import html
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

W = 1080
ART_EXT = (".webp", ".jpg", ".png")

e = html.escape


# ---------- phần tử ----------
def bub(x, y, w, en, vi, tip, who="mina"):
    return (f'<div class="el bub {who}" style="left:{x}px;top:{{Y{y}}}px;width:{w}px" '
            f'data-tip="{tip[0]},{{Y{tip[1]}}}"><div class="en">{e(en)}</div><div class="vi">{e(vi)}</div></div>')


def th(x, y, w, en, vi):
    return (f'<div class="el th" style="left:{x}px;top:{{Y{y}}}px;width:{w}px">'
            f'<div class="en">{e(en)}</div><div class="vi">{e(vi)}</div></div>')


def cap(x, y, main, sub=""):
    s = f'<div class="sub">{e(sub)}</div>' if sub else ""
    return f'<div class="el cap" style="left:{x}px;top:{{Y{y}}}px"><div class="main">{e(main)}</div>{s}</div>'


def sfx(x, y, text, size, rot, cls="sfx-w"):
    return (f'<div class="el sfx {cls}" style="left:{x}px;top:{{Y{y}}}px;font-size:{size}px;'
            f'transform:rotate({rot}deg)">{e(text)}</div>')


def raw(x, y, inner, w=None, cls=""):
    ws = f"width:{w}px;" if w else ""
    return f'<div class="el {cls}" style="left:{x}px;top:{{Y{y}}}px;{ws}">{inner}</div>'


MIC = ('<svg viewBox="0 0 24 24" width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" '
       'stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/>'
       '<path d="M5 10v1a7 7 0 0 0 14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/></svg>')

LOCK = ('<svg viewBox="0 0 24 24" width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2.2" '
        'stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/>'
        '<path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>')


def css_h(w, h, dst):
    """matrix3d đưa khung chữ nhật w×h về đúng 4 góc đích (TL, TR, BR, BL)."""
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    A, B = [], []
    for (x, y), (u, v) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    h0, h1, h2, h3, h4, h5, h6, h7 = np.linalg.solve(np.array(A, float), np.array(B, float))
    m = [h0, h3, 0, h6, h1, h4, 0, h7, 0, 0, 1, 0, h2, h5, 0, 1]
    return "matrix3d(" + ",".join(f"{v:.9f}" for v in m) + ")"


def scr(dst, w, h, inner, pt, sc=1):
    """Khung w×h dán lên 4 góc dst (toạ độ ảnh gốc × sc), cộng khoảng trống phía trên pt."""
    d = [(x * sc, y * sc + pt) for x, y in dst]
    return (f'<div class="el scr" style="left:0;top:0;width:{w}px;height:{h}px;'
            f'transform:{css_h(w, h, d)}">{inner}</div>')


CSS_BASE = r"""
*{box-sizing:border-box}
html,body{margin:0;background:#0e0f15}
body{width:1080px;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
section{position:relative;width:1080px;background:#0e0f15;overflow:hidden}
section img.art{display:block;width:1080px;height:auto}
.el{position:absolute}
svg.tails{position:absolute;left:0;top:0;width:1080px;height:100%;pointer-events:none;overflow:visible}
.bub{background:#fff;border:3px solid #16161d;border-radius:40px;padding:20px 28px 22px;color:#121218;
     box-shadow:0 8px 22px rgba(0,0,0,.38);z-index:3}
.bub.kang{border-color:#1b2d4f}
.bub .en{font-weight:800;font-size:35px;line-height:1.2;letter-spacing:-.3px}
.bub .vi{font-weight:500;font-size:26px;line-height:1.28;color:#5d5d6b;margin-top:8px}
.th{background:rgba(12,14,30,.9);border-left:7px solid #6d8dff;border-radius:16px;padding:18px 26px 20px;
    color:#fff;z-index:4;box-shadow:0 8px 22px rgba(0,0,0,.4)}
.th .en{font-style:italic;font-weight:650;font-size:32px;line-height:1.22}
.th .vi{font-weight:500;font-size:25px;line-height:1.28;color:#bfcaff;margin-top:6px}
.cap{background:rgba(8,8,12,.86);border-left:6px solid #e5484d;border-radius:10px;padding:12px 20px 14px;
     color:#fff;z-index:4}
.cap .main{font-weight:800;font-size:32px;line-height:1.15}
.cap .sub{font-weight:500;font-size:22px;color:#c9c9d4;margin-top:4px}
.sfx{font-family:'Inter Display','Inter',sans-serif;font-weight:900;font-style:italic;letter-spacing:1px;z-index:4;
     line-height:1;white-space:nowrap}
.sfx-r{color:#ff3b3b;text-shadow:-4px -4px 0 #fff,4px -4px 0 #fff,-4px 4px 0 #fff,4px 4px 0 #fff,0 5px 0 #fff,0 -5px 0 #fff,
     5px 0 0 #fff,-5px 0 0 #fff,0 10px 18px rgba(0,0,0,.6)}
.sfx-w{color:#fff;text-shadow:-3px -3px 0 #111,3px -3px 0 #111,-3px 3px 0 #111,3px 3px 0 #111,0 4px 0 #111,0 -4px 0 #111,
     4px 0 0 #111,-4px 0 0 #111,0 8px 14px rgba(0,0,0,.6)}
.screen{height:150px;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;
        transform:rotate(-0.6deg);z-index:2}
.scr1{white-space:nowrap;font-weight:900;font-size:54px;letter-spacing:1px;text-shadow:0 0 18px rgba(255,60,60,.9),0 2px 0 rgba(0,0,0,.35)}
.scr2{font-weight:700;font-size:38px;margin-top:4px;text-shadow:0 0 14px rgba(255,60,60,.9)}
.cover-shade{left:0;top:0;width:1080px;height:100%;
  background:linear-gradient(to bottom,rgba(0,0,0,0) 52%,rgba(6,6,10,.78) 68%,rgba(6,6,10,.95) 86%)}
.cover-text{color:#fff;z-index:3}
.cover-text .kicker{font-weight:800;font-size:26px;letter-spacing:6px;color:#ff6fa6}
.cover-text .ep{font-weight:700;font-size:40px;margin-top:14px;color:#e8e8f0}
.cover-text .title{font-family:'Inter Display','Inter',sans-serif;font-weight:900;font-size:96px;line-height:1.02;
  letter-spacing:-1.5px;margin-top:2px}
.cover-text .tag{font-style:italic;font-weight:600;font-size:36px;color:#ffd1e2;margin-top:18px}
.cover-text .disc{font-weight:500;font-size:22px;color:#a9a9b8;margin-top:26px}
.k11-bg{left:0;top:0;width:1080px;height:1080px;background-size:cover;filter:blur(14px) brightness(.38);transform:scale(1.06)}
.k11-card{color:#fff;text-align:center;background:rgba(14,15,26,.72);border:2px solid rgba(255,111,166,.55);
  border-radius:36px;padding:44px 48px 40px;z-index:3;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.mic{width:120px;height:120px;border-radius:60px;margin:0 auto 22px;background:#ff4f8f;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 14px rgba(255,79,143,.22),0 0 0 30px rgba(255,79,143,.1)}
.k11-kicker{font-weight:900;font-size:40px;letter-spacing:6px;color:#ff7fb0}
.k11-code{font-weight:600;font-size:24px;color:#b7b7c8;margin-top:6px}
.k11-en{font-weight:700;font-size:34px;line-height:1.3;margin-top:26px}
.k11-vi{font-weight:500;font-size:26px;line-height:1.35;color:#c9c9dc;margin-top:14px}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:28px}
.chips span{font-weight:700;font-size:25px;padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.1);
  border:1.5px solid rgba(255,255,255,.25)}
.k11-foot{font-weight:500;font-size:23px;color:#a9a9bb;margin-top:26px}
.label{background:#f3efe4;color:#1b1b1b;border-radius:6px;padding:20px 26px;transform:rotate(-2deg);z-index:3;
  border-left:14px solid #d93a3a;box-shadow:0 12px 30px rgba(0,0,0,.55);font-family:'DejaVu Sans Mono',monospace}
.lbl-row{white-space:nowrap;font-weight:700;font-size:27px;line-height:1.5}
.lbl-red{color:#c4161c;background:rgba(220,40,40,.12);display:inline-block;padding:0 8px;margin-left:-8px;border-radius:4px}
.sep{height:340px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;color:#fff;
  background:linear-gradient(180deg,#0e0f15,#1a1424 50%,#0e0f15)}
.sep-k{font-weight:800;font-size:26px;letter-spacing:8px;color:#ff6fa6}
.sep-t{font-weight:900;font-size:56px;margin-top:8px}
.sep-s{font-weight:500;font-size:24px;color:#b4b4c6;margin-top:12px;max-width:900px}
.end{height:520px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;color:#fff;
  background:radial-gradient(ellipse at center,#2a1020 0%,#0e0f15 70%)}
.end-k{font-weight:800;font-size:28px;letter-spacing:10px;color:#ff6fa6}
.end-t{font-family:'Inter Display','Inter',sans-serif;font-weight:900;font-size:64px;margin-top:14px}
.end-s{font-weight:600;font-size:30px;color:#d3d3e0;margin-top:10px}
.end-r{font-weight:700;font-size:26px;margin-top:40px;padding:14px 28px;border-radius:999px;background:rgba(255,111,166,.15);
  border:1.5px solid rgba(255,111,166,.5);color:#ffd1e2}
.pill{display:flex;align-items:center;justify-content:center;gap:16px;padding:18px 30px;border-radius:999px;
  background:#ff4f8f;color:#fff;font-weight:800;font-size:30px;letter-spacing:1px;z-index:4;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.pill-gold{background:linear-gradient(90deg,#3a2a10,#5a3f12);border:2px solid #f2c45a;color:#ffe7a8;font-size:27px;white-space:nowrap}
.pill-k{font-weight:900;color:#1a1206;background:#f2c45a;border-radius:999px;padding:6px 14px;font-size:22px;letter-spacing:2px}
"""

JS = r"""
() => {
  const NS='http://www.w3.org/2000/svg';
  for (const sec of document.querySelectorAll('section')) {
    const bubs = sec.querySelectorAll('.bub[data-tip]');
    if (!bubs.length) continue;
    const under = document.createElementNS(NS,'svg'); under.setAttribute('class','tails'); under.style.zIndex=2;
    const over = document.createElementNS(NS,'svg'); over.setAttribute('class','tails'); over.style.zIndex=3;
    sec.appendChild(under); sec.appendChild(over);
    const sr = sec.getBoundingClientRect();
    for (const b of bubs) {
      const r = b.getBoundingClientRect();
      const x=r.left-sr.left, y=r.top-sr.top, w=r.width, h=r.height;
      const [tx,ty] = b.dataset.tip.split(',').map(Number);
      const cx=x+w/2, cy=y+h/2; let dx=tx-cx, dy=ty-cy; const L=Math.hypot(dx,dy); const ux=dx/L, uy=dy/L;
      const t=Math.min((w/2-18)/Math.abs(ux||1e-9),(h/2-10)/Math.abs(uy||1e-9));
      const ex=cx+ux*t, ey=cy+uy*t;               // điểm trên mép bóng thoại
      const remain=Math.hypot(tx-ex,ty-ey);
      const len=Math.max(34,Math.min(78,remain-14));
      const px=-uy, py=ux, half=19;
      const tipx=ex+ux*(len+8), tipy=ey+uy*(len+8);
      const color = b.classList.contains('kang') ? '#1b2d4f' : '#16161d';
      const p1=document.createElementNS(NS,'polygon');
      p1.setAttribute('points',`${ex-ux*4+px*half},${ey-uy*4+py*half} ${tipx},${tipy} ${ex-ux*4-px*half},${ey-uy*4-py*half}`);
      p1.setAttribute('fill','#fff'); p1.setAttribute('stroke',color); p1.setAttribute('stroke-width','3');
      p1.setAttribute('stroke-linejoin','round'); under.appendChild(p1);
      const h2=half-3.5;
      const p2=document.createElementNS(NS,'polygon');
      p2.setAttribute('points',`${ex-ux*12+px*h2},${ey-uy*12+py*h2} ${tipx-ux*6},${tipy-uy*6} ${ex-ux*12-px*h2},${ey-uy*12-py*h2}`);
      p2.setAttribute('fill','#fff'); over.appendChild(p2);
    }
  }
}
"""


# ---------- dựng HTML và chụp ----------
def art_path(art_dir, key):
    for ext in ART_EXT:
        p = Path(art_dir) / f"{key}{ext}"
        if p.exists():
            return p
    raise FileNotFoundError(f"thiếu ảnh {key} trong {art_dir}")


def disp_h(path):
    w, h = Image.open(path).size
    return round(h * W / w)


def art_keys(ep):
    """Các ảnh gốc một tập cần: ảnh của từng khung + ảnh nền mờ cho thẻ câu hỏi."""
    keys = [fkey for _, fkey, *_ in ep.P if fkey]
    if any("el k11-bg" in "".join(p[4]) for p in ep.P):
        keys.append(ep.QBG)
    return list(dict.fromkeys(keys))


def build_html(ep, art_dir):
    parts = []
    for key, fkey, pt, pb, els, cls, fixed in ep.P:
        body = []
        if fkey:
            ih = disp_h(art_path(art_dir, fkey))
            body.append(f'<img class="art" src="{art_path(art_dir, fkey).resolve().as_uri()}" '
                        f'style="margin-top:{pt}px;margin-bottom:{pb}px">')
        else:
            ih = fixed
            body.append(f'<div style="height:{ih + pt + pb}px"></div>')
        el_html = "\n".join(els)
        # thay {Y<n>} = toạ độ y theo ảnh + khoảng trống phía trên
        el_html = re.sub(r"\{Y(-?\d+)\}", lambda m: str(int(m.group(1)) + pt), el_html)
        if "el k11-bg" in el_html:  # thẻ câu hỏi: nền là ảnh QBG làm mờ
            bg = art_path(art_dir, ep.QBG).resolve().as_uri()
            el_html = el_html.replace('class="el k11-bg" style="', f'class="el k11-bg" style="background-image:url({bg});', 1)
        if key == "COVER":
            el_html = el_html.replace('class="el cover-shade" style="', f'class="el cover-shade" style="height:{ih}px;', 1)
        parts.append(f'<section id="{key}" class="{cls}">{"".join(body)}\n{el_html}\n</section>')
    css = ep.CSS + CSS_BASE
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{"".join(parts)}</body></html>'


def render(ep, art_dir, out_dir, only=None):
    """Chụp từng khung thành out_dir/panels_png/<KEY>.png, ghi out_dir/order.json. Trả về danh sách khoá."""
    from playwright.sync_api import sync_playwright
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    html_path = out_dir / "comic.html"
    html_path.write_text(build_html(ep, art_dir), encoding="utf-8")
    shots = out_dir / "panels_png"
    shots.mkdir(exist_ok=True)
    order = [key for key, *_ in ep.P]
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": 1400}, device_scale_factor=1)
        pg.goto(html_path.resolve().as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_load_state("networkidle")
        pg.evaluate(JS)
        for key in order:
            if only and key not in only:
                continue
            pg.locator(f"section#{key}").screenshot(path=str(shots / f"{key}.png"))
        br.close()
    (out_dir / "order.json").write_text(json.dumps(order))
    return order
