"""Sinh dữ liệu tra từ cho app:

- app/src/gloss.json      : {từ: [loại từ, nghĩa tiếng Việt]} — đóng gói vào app.js
- app/www/dict/ipa-en.txt : "từ<TAB>/ipa/" — app tải khi cần (không làm chậm lúc mở app)

Phiên âm: ipa-dict en_US (MIT). Đổi ɹ→r, ɫ→l cho giống ký hiệu từ điển học thuật quen thuộc,
chỉ giữ cách đọc đầu tiên.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
DDIR = HERE / "dict"
POS = {"n", "v", "adj", "adv", "prep", "conj", "pron", "det", "num", "int", "aux", "phr", "abbr"}


VOWELS = set("aeiouæɑɒɔəɛɪʊʌɝɚ")


def stressed_schwa(ipa):
    """cmudict-ipa ghi cả âm AH có trọng âm là /ə/; từ điển học thuật ghi /ʌ/ (vd. study /ˈstʌdi/)."""
    out = list(ipa)
    for i, ch in enumerate(out):
        if ch in "ˈˌ":
            for j in range(i + 1, len(out)):
                if out[j] in VOWELS:
                    if out[j] == "ə":
                        out[j] = "ʌ"
                    break
    return "".join(out)


def build_dict(issue):
    gloss, seen_in = {}, {}
    for f in sorted(DDIR.glob("gloss_*.txt")):
        for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip() or line.startswith("#"):
                continue
            parts = line.split("|")
            if len(parts) != 3 or not all(p.strip() for p in parts):
                issue("FAIL", "dict_format", f"{f.name}:{i}: '{line[:50]}'")
                continue
            w, pos, mean = (p.strip() for p in parts)
            w = w.lower()
            if pos not in POS:
                issue("FAIL", "dict_pos", f"{f.name}:{i}: unknown POS '{pos}'")
            if w in gloss:
                issue("FAIL", "dict_duplicate", f"{w} in {f.name} and {seen_in[w]}")
                continue
            gloss[w] = [pos, mean]
            seen_in[w] = f.name

    ipa = {}
    for line in (DDIR / "ipa_en_US.txt").read_text(encoding="utf-8").splitlines():
        if "\t" not in line:
            continue
        w, p = line.split("\t", 1)
        first = p.split(",")[0].strip()
        ipa[w.lower()] = stressed_schwa(first.replace("ɹ", "r").replace("ɫ", "l"))

    # Từ chức năng: dùng dạng đọc nhẹ (weak form) như từ điển học tập.
    ipa.update({"the": "/ðə/", "a": "/ə/", "an": "/ən/", "of": "/əv/", "to": "/tə/", "and": "/ənd/", "from": "/frəm/", "was": "/wəz/"})
    with_ipa = sum(1 for w in gloss if w in ipa)
    out_gloss = ROOT / "app" / "src" / "gloss.json"
    out_gloss.write_text(json.dumps(gloss, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    wdir = ROOT / "app" / "www" / "dict"
    wdir.mkdir(parents=True, exist_ok=True)
    (wdir / "ipa-en.txt").write_text("".join(f"{w}\t{p}\n" for w, p in sorted(ipa.items())), encoding="utf-8")
    return {"gloss_entries": len(gloss), "ipa_entries": len(ipa), "gloss_with_ipa": with_ipa}
