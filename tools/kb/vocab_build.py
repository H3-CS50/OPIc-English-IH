"""Gộp từ vựng cho tab Từ vựng:

1. 618 mục của app OPIc AL Vocab (vocab/opic_al_vocab_app.json) — giữ nguyên văn, ưu tiên cao nhất.
2. Flashcard v1 (03-flashcards/anki-opic-ih.tsv) — chỉ thêm mục chưa có.
3. Phần mở rộng AI viết mới (vocab/ext_*.py) — chỉ thêm mục chưa có.

Trùng lặp so theo chữ tiếng Anh đã chuẩn hóa (bỏ hoa/thường, dấu câu, "...").
"""
import csv
import importlib.util
import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
VDIR = HERE / "vocab"

VI_CHARS = re.compile(r"[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]", re.I)


def _load(name):
    spec = importlib.util.spec_from_file_location(name, VDIR / f"{name}.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def norm(en):
    s = en.lower().replace("…", "...").replace("’", "'")
    s = re.sub(r"\.\.\.|[.,!?;:\"()]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def build_vocab(schema_version, issue):
    topics = _load("topics")
    tmap = {t["id"]: t for t in topics.VOCAB_TOPICS}
    items, seen, skipped = [], {}, []

    def add(topic_id, en, vi, ex, note, origin, sources):
        en, vi, ex, note = en.strip(), vi.strip(), (ex or "").strip(), (note or "").strip()
        if topic_id not in tmap:
            issue("FAIL", "vocab_topic", f"unknown vocab topic {topic_id} for '{en}'")
            return
        k = norm(en)
        if k in seen:
            skipped.append({"en": en, "topic": topic_id, "kept_in": seen[k]})
            return
        t = tmap[topic_id]
        seen[k] = topic_id
        items.append({
            "vocab_id": f"{topic_id}::{en}",
            "topic_id": topic_id,
            "en": en, "vi": vi, "example_en": ex, "note_vi": note,
            "kind": t["kind"],
            "target_levels": list(t["levels"]),
            "prompt_types": [] if t["prompt_types"] == "*" else list(t["prompt_types"]),
            "source_ids": list(sources),
            "content_origin": origin,
            "review_status": "ai_checked",
            "schema_version": schema_version,
        })

    # 1) App OPIc AL Vocab — nguyên văn
    app = json.loads((VDIR / "opic_al_vocab_app.json").read_text(encoding="utf-8"))
    n_app = 0
    for deck in app:
        if deck["key"] not in tmap:
            issue("FAIL", "vocab_topic", f"app deck {deck['key']} has no topic")
            continue
        for en, vi, ex in deck["items"]:
            add(deck["key"], en, vi, ex, "", "user_app", ["SRC-U16"])
            n_app += 1

    # 2) Flashcard v1
    n_v1 = 0
    tsv = ROOT / "03-flashcards" / "anki-opic-ih.tsv"
    for row in csv.reader((l for l in tsv.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")), delimiter="\t"):
        vi, en, ex, tag = (row + ["", "", "", ""])[:4]
        topic = topics.V1_TAG_TOPIC.get(tag.strip())
        if not topic:
            issue("WARN", "vocab_v1", f"v1 tag '{tag}' not mapped ('{en}')")
            continue
        before = len(items)
        add(topic, en.replace("…", "..."), vi.replace("…", "..."), ex, "", "AI_generated_original", ["SRC-AI-0002"])
        n_v1 += len(items) - before

    # 3) Mở rộng
    n_ext = 0
    for name in ("ext_a", "ext_b", "ext_c"):
        for chunk in _load(name).CHUNKS:
            for line in chunk["text"].strip().splitlines():
                if not line.strip():
                    continue
                parts = [p.strip() for p in line.split(" | ")]
                if len(parts) not in (3, 4):
                    issue("FAIL", "vocab_format", f"{name}: bad line '{line[:60]}'")
                    continue
                before = len(items)
                add(chunk["topic"], parts[0], parts[1], parts[2], parts[3] if len(parts) == 4 else "", "AI_generated_original", chunk["sources"])
                n_ext += len(items) - before

    # Kiểm tra nhanh
    for it in items:
        if not it["vi"] or not it["example_en"]:
            issue("FAIL", "vocab_complete", f"{it['vocab_id']}: missing meaning or example")
        if any(VI_CHARS.search(re.sub(r"caf[ée]s?", "", it[f], flags=re.I)) for f in ("en", "example_en")):
            issue("WARN", "vocab_language", f"{it['vocab_id']}: Vietnamese letters in English field")
    stats = {
        "total": len(items), "from_app": n_app, "from_v1": n_v1, "new_ai": n_ext,
        "duplicates_skipped": len(skipped), "by_topic": dict(Counter(i["topic_id"] for i in items)),
    }
    return items, topics.VOCAB_TOPICS, stats, skipped


def app_payload(items, topics_list):
    """Dạng gọn cho app: chủ đề + mục (khóa ngắn)."""
    order = {t["id"]: i for i, t in enumerate(topics_list)}
    return {
        "topics": [{k: t[k] for k in ("id", "vi", "icon", "prompt_types", "kb_topics")} for t in topics_list],
        "items": [
            {"id": it["vocab_id"], "t": order[it["topic_id"]], "en": it["en"], "vi": it["vi"], "ex": it["example_en"],
             **({"n": it["note_vi"]} if it["note_vi"] else {}),
             **({"new": 1} if it["content_origin"] == "AI_generated_original" else {}),
             "s": it["source_ids"]}
            for it in items
        ],
    }
