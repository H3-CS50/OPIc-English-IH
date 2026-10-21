"""Xây và kiểm định knowledge base OPIc OQC.

Chạy:  python3 tools/kb/build_kb.py
Đầu ra:
  OPIC_OQC_KNOWLEDGE_BASE_V1/01_SOURCE_REGISTER.csv
  OPIC_OQC_KNOWLEDGE_BASE_V1/04_QUESTION_TAXONOMY.md
  OPIC_OQC_KNOWLEDGE_BASE_V1/05_QUESTION_BANK_SEED.jsonl
  OPIC_OQC_KNOWLEDGE_BASE_V1/06_IM_IH_AL_SAMPLE_ANSWERS.jsonl
  OPIC_OQC_KNOWLEDGE_BASE_V1/08_DATA_SCHEMA.json
  OPIC_OQC_KNOWLEDGE_BASE_V1/11_DATASET_MANIFEST.json
  OPIC_OQC_KNOWLEDGE_BASE_V1/validation_report.json
  app/src/kb.json, app/src/coach_schema.json, app/src/coach_prompt.txt
"""
import csv
import difflib
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from taxonomy import (TOPICS, PROMPT_TYPES, EXPECTED_EVIDENCE, FRAMEWORKS, LEVELS, SCHEMA_VERSION)  # noqa: E402
from questions_src import COMBOS  # noqa: E402
from answers_src_a import SETS_A  # noqa: E402
from answers_src_b import SETS_B  # noqa: E402
from sources import SOURCES, ACCESS_DATE  # noqa: E402
import schemas  # noqa: E402

import jsonschema  # noqa: E402

ROOT = HERE.parent.parent
KB = ROOT / "OPIC_OQC_KNOWLEDGE_BASE_V1"
APP_SRC = ROOT / "app" / "src"

issues = []  # (severity, check, message)


def issue(sev, check, msg):
    issues.append({"severity": sev, "check": check, "message": msg})


def qid(n):
    return f"Q-{n:06d}"


def words(s):
    return len(re.findall(r"[A-Za-z0-9'’-]+", s))


# ---------------------------------------------------------------- questions
def build_questions():
    out = []
    seen = set()
    for combo in COMBOS:
        topic = combo["topic"]
        if topic not in TOPICS:
            issue("FAIL", "taxonomy", f"{combo['combo_id']}: unknown topic {topic}")
            continue
        label_vi, _label_en, category = TOPICS[topic]
        kind = combo["kind"]
        for order, (num, ptype, text, hints, follow) in enumerate(combo["questions"], start=1):
            if num in seen:
                issue("FAIL", "id_unique", f"duplicate question number {num}")
            seen.add(num)
            if ptype not in PROMPT_TYPES:
                issue("FAIL", "taxonomy", f"{qid(num)}: unknown prompt_type {ptype}")
                continue
            p_label, funcs, frames, diff, slot = PROMPT_TYPES[ptype]
            if kind == "adv":
                slot, cat, diff = "adv", "issue", "challenging"
            elif kind == "intro":
                cat = "intro"
            else:
                cat = category
            levels = ["IH", "AL"] if diff == "challenging" else list(LEVELS)
            official = num == 1
            out.append({
                "question_id": qid(num),
                "test_language": "English",
                "topic": topic,
                "topic_label_vi": label_vi,
                "topic_category": cat,
                "subtopic": p_label,
                "question_text": text,
                "prompt_type": ptype,
                "communicative_functions": funcs,
                "time_frame_targets": frames,
                "target_practice_levels": levels,
                "difficulty_design": diff,
                "mock_slot": slot,
                "combo_id": combo["combo_id"],
                "combo_order": order,
                "oqc_branch": bool(combo.get("oqc", False)),
                "source_id": "SRC-0002" if official else "SRC-AI-0001",
                "source_url": "https://www.actfl.org/uploads/files/general/OPIc_Familiarization_Guide.pdf" if official else None,
                "content_origin": "official_excerpt_reference" if official else "AI_generated_original",
                "copyright_status": "short_quote_official" if official else "original",
                "expected_evidence": EXPECTED_EVIDENCE[ptype],
                "follow_up_questions": follow,
                "scaffolding_hints": hints,
                "answer_framework": FRAMEWORKS[ptype],
                "review_status": "ai_checked",
                "schema_version": SCHEMA_VERSION,
            })
    out.sort(key=lambda q: q["question_id"])
    return out


# ---------------------------------------------------------------- answers
def build_answers(questions):
    by_id = {q["question_id"]: q for q in questions}
    out = []
    n = 0
    for s in SETS_A + SETS_B:
        q = by_id.get(qid(s["qid"]))
        if not q:
            issue("FAIL", "answer_link", f"{s['set_id']}: question {qid(s['qid'])} not found")
            continue
        for lvl in LEVELS:
            a = s[lvl]
            n += 1
            out.append({
                "answer_id": f"A-{n:06d}",
                "set_id": s["set_id"],
                "question_id": q["question_id"],
                "target_practice_level": lvl,
                "answer_text": a["text"].strip(),
                "word_count": words(a["text"]),
                "persona_vi": s["persona_vi"],
                "content_origin": "AI_generated_original",
                "source_id": "SRC-AI-0001",
                "level_label_type": "practice_target_not_official_rating",
                "demonstrated_features": a["demonstrates"],
                "improvement_notes_vi": [a["next_level"]],
                "what_this_answer_demonstrates": a["demonstrates"],
                "what_not_to_memorize": s["not_memorize_vi"],
                "how_to_personalize": s["personalize_vi"],
                "possible_follow_up_questions": s["follow_ups"] or q["follow_up_questions"],
                "next_level_improvement": a["next_level"],
                "set_key_differences_vi": s["key_differences_vi"],
                "personalization_prompts": [s["personalize_vi"]],
                "review_status": "ai_checked",
                "schema_version": SCHEMA_VERSION,
            })
    return out


# ---------------------------------------------------------------- validation
def validate(questions, answers, sources):
    schema = schemas.bundle()
    res = {}

    def check(entity, rows, key):
        v = jsonschema.Draft202012Validator({**schema, **schema["$defs"][entity]})
        bad = 0
        for r in rows:
            errs = list(v.iter_errors(r))
            for e in errs[:3]:
                issue("FAIL", f"schema_{entity}", f"{r.get(key)}: {e.message}")
            bad += bool(errs)
        res[f"schema_{entity}"] = "PASS" if bad == 0 else "FAIL"

    check("question", questions, "question_id")
    check("sample_answer", answers, "answer_id")
    check("source", sources, "source_id")

    # unique ids
    for name, rows, key in (("question", questions, "question_id"), ("answer", answers, "answer_id"), ("source", sources, "source_id")):
        c = Counter(r[key] for r in rows)
        d = [k for k, v in c.items() if v > 1]
        res[f"unique_{name}_ids"] = "PASS" if not d else "FAIL"
        for k in d:
            issue("FAIL", "id_unique", f"duplicate {name} id {k}")

    # provenance: every source_id referenced exists
    src_ids = {s["source_id"] for s in sources}
    missing = {r["source_id"] for r in questions + answers if r["source_id"] and r["source_id"] not in src_ids}
    res["provenance_links"] = "PASS" if not missing else "FAIL"
    for m in missing:
        issue("FAIL", "provenance", f"unknown source_id {m}")

    # language: English text must not contain Vietnamese diacritics / Hangul
    vi = re.compile(r"[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]", re.I)
    hangul = re.compile(r"[가-힯ᄀ-ᇿ]")
    lang_bad = 0
    for r in questions:
        for t in [r["question_text"], *r["follow_up_questions"]]:
            if vi.search(t) or hangul.search(t):
                lang_bad += 1
                issue("FAIL", "language", f"{r['question_id']}: non-English characters in English field")
    for r in answers:
        if vi.search(r["answer_text"]) or hangul.search(r["answer_text"]):
            lang_bad += 1
            issue("FAIL", "language", f"{r['answer_id']}: non-English characters in answer_text")
    res["target_language_english_only"] = "PASS" if lang_bad == 0 else "FAIL"

    # level labels
    lbl_bad = [a for a in answers if a["level_label_type"] != "practice_target_not_official_rating"]
    res["level_label_type"] = "PASS" if not lbl_bad else "FAIL"

    # duplicate / near-duplicate questions
    texts = [(q["question_id"], q["question_text"].lower()) for q in questions]
    near = []
    for i in range(len(texts)):
        for j in range(i + 1, len(texts)):
            r = difflib.SequenceMatcher(None, texts[i][1], texts[j][1]).ratio()
            if r >= 0.8:
                near.append((texts[i][0], texts[j][0], round(r, 2)))
    res["question_near_duplicates"] = "PASS" if not near else "NEEDS_REVIEW"
    for a, b, r in near:
        issue("NEEDS_REVIEW", "duplication", f"{a} ~ {b} similarity {r}")

    # answer sets: one per level, word count ordering (informative only — length is NOT the level criterion)
    sets = {}
    for a in answers:
        sets.setdefault(a["set_id"], {})[a["target_practice_level"]] = a
    order_note = []
    for sid, lv in sets.items():
        if set(lv) != set(LEVELS):
            issue("FAIL", "answer_sets", f"{sid}: missing level(s)")
        wc = [lv[l]["word_count"] for l in LEVELS if l in lv]
        if wc != sorted(wc):
            order_note.append(sid)
    res["answer_sets_complete"] = "PASS" if all(set(v) == set(LEVELS) for v in sets.values()) else "FAIL"

    # answer text overlap between levels of the same set (should be rewritten, not padded)
    pad = []
    for sid, lv in sets.items():
        if all(l in lv for l in LEVELS):
            r1 = difflib.SequenceMatcher(None, lv["IM"]["answer_text"], lv["IH"]["answer_text"]).ratio()
            r2 = difflib.SequenceMatcher(None, lv["IH"]["answer_text"], lv["AL"]["answer_text"]).ratio()
            if max(r1, r2) > 0.6:
                pad.append((sid, round(r1, 2), round(r2, 2)))
    res["levels_rewritten_not_padded"] = "PASS" if not pad else "NEEDS_REVIEW"
    for p in pad:
        issue("NEEDS_REVIEW", "answer_quality", f"{p[0]}: high text overlap between levels {p[1:]}")

    # sensitive content check (simple patterns): no company-internal identifiers / secrets
    secret = re.compile(r"(api[_-]?key|sk-ant-|AIza[0-9A-Za-z_-]{20,}|password\s*[:=]|samsung)", re.I)
    sec_bad = [r for r in questions + answers if secret.search(json.dumps(r, ensure_ascii=False))]
    res["no_secrets_or_company_names"] = "PASS" if not sec_bad else "NEEDS_REVIEW"
    for r in sec_bad:
        issue("NEEDS_REVIEW", "sensitive", f"{r.get('question_id') or r.get('answer_id')}: matches sensitive pattern")

    res["human_review"] = "NEEDS_REVIEW"  # chưa có giáo viên/rater rà soát
    return res, sets


# ---------------------------------------------------------------- outputs
def write_jsonl(path, rows):
    with open(path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def write_sources_csv(path, rows):
    cols = list(schemas.SOURCE["required"])
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in rows:
            w.writerow({k: (" | ".join(v) if isinstance(v, list) else ("" if v is None else v)) for k, v in r.items()})


def write_taxonomy_md(path, questions):
    by_topic = Counter(q["topic"] for q in questions)
    by_type = Counter(q["prompt_type"] for q in questions)
    lines = [
        "# 04 — Question taxonomy (OPIc OQC)",
        "",
        "> File này được sinh tự động từ `tools/kb/taxonomy.py` và `tools/kb/questions_src.py`. Sửa ở nguồn rồi chạy lại `python3 tools/kb/build_kb.py`.",
        "",
        "## 1. Căn cứ của từng nhóm",
        "",
        "| Nhóm phân loại | Căn cứ | Ghi chú |",
        "|---|---|---|",
        "| Background Survey quyết định nhóm chủ đề | **Chính thức** — SRC-0001, SRC-0002 (p.4) | ACTFL không công bố danh sách chủ đề đầy đủ. |",
        "| Chủ đề *survey* vs *unexpected/random* | **Cộng đồng / tài liệu luyện thi** — SRC-0101, SRC-U10, SRC-U11, SRC-U13 | Thiết kế của app; không khẳng định chủ đề nào chắc chắn xuất hiện. |",
        "| Dạng câu (miêu tả, kể, so sánh, role-play, vấn đề) | **Diễn giải** từ FACT (SRC-0003) + chương sách SRC-U01 | Functions trong Guidelines: describe, narrate, ask questions, handle complications… |",
        "| Khung thời gian mục tiêu | **Diễn giải** từ descriptor IM/IH/AL (SRC-0003) | Advanced: narrate & describe in major time frames. |",
        "| `difficulty_design` (easy/medium/challenging) | **Thiết kế sư phạm của app** | Không phải rating chính thức. |",
        "| `mock_slot` (intro/combo/rp_*/adv) | **Cộng đồng** — SRC-0101, SRC-U01, SRC-U13 | Cấu trúc 15 câu chưa được ACTFL xác nhận. |",
        "| `oqc_branch` | **Thiết kế của app** | Nhánh tùy chọn cho người làm nhà máy/kiểm tra chất lượng; mặc định tắt trong thi thử. |",
        "",
        "## 2. Chủ đề",
        "",
        "| key | Tiếng Việt | English | Nhóm | Số câu |",
        "|---|---|---|---|---|",
    ]
    for k, (vi, en, cat) in TOPICS.items():
        lines.append(f"| `{k}` | {vi} | {en} | {cat} | {by_topic.get(k, 0)} |")
    lines += ["", "## 3. Dạng câu hỏi (prompt_type)", "",
              "| key | Tên | Chức năng giao tiếp | Khung thời gian | Độ khó thiết kế | Khung phát triển ý (scaffold) | Số câu |",
              "|---|---|---|---|---|---|---|"]
    for k, (vi, funcs, frames, diff, _slot) in PROMPT_TYPES.items():
        lines.append(f"| `{k}` | {vi} | {', '.join(funcs)} | {', '.join(frames)} | {diff} | {FRAMEWORKS[k]} | {by_type.get(k, 0)} |")
    lines += ["", "## 4. Combo và vị trí trong thi thử (thiết kế app)", "",
              "| Vị trí | Nội dung app dùng | Căn cứ |", "|---|---|---|",
              "| Q1 | 1 câu `self_introduction` | Câu mở đầu được ACTFL mô tả là không chấm (SRC-0002 p.5) |",
              "| Q2–4, Q5–7 | 2 combo chủ đề *survey* mà người học chọn | Cộng đồng (SRC-0101) |",
              "| Q8–10 | 1 combo chủ đề *unexpected* | Cộng đồng |",
              "| Q11–13 | 1 bộ role-play (hỏi → giải quyết vấn đề → kể trải nghiệm) | Cộng đồng + SRC-U01 ch.7–8 |",
              "| Q14–15 | Độ khó cao: 1 cặp `adv` (thay đổi + vấn đề/tin tức). Độ khó vừa: 2 câu đầu của một combo khác | Cộng đồng; chưa xác minh chính thức |",
              "", "## 5. Quy tắc nội dung", "",
              "- Mọi câu (trừ Q-000001) là `AI_generated_original`, viết mới theo chức năng, không chép câu chữ từ tài liệu bản quyền.",
              "- Mỗi chủ đề có câu kiểm tra nhiều chức năng; mỗi chức năng xuất hiện ở nhiều chủ đề.",
              "- Level không được gán theo độ khó từ vựng. `target_practice_levels` chỉ cho biết câu phù hợp để luyện ở mức nào.",
              "- Nhánh OQC chỉ chiếm "
              f"{sum(q['oqc_branch'] for q in questions)}/{len(questions)} câu để không lấn át chủ đề đời sống.",
              ""]
    path.write_text("\n".join(lines), encoding="utf-8")


def extract_prompt():
    md = (KB / "07_AI_COACH_GRADING_PROMPT.md").read_text(encoding="utf-8")
    m = re.search(r"<!-- PROMPT START -->\s*```text\n(.*?)\n```\s*<!-- PROMPT END -->", md, re.S)
    if not m:
        issue("FAIL", "coach_prompt", "07_AI_COACH_GRADING_PROMPT.md: prompt block not found")
        return ""
    return m.group(1)


def main():
    KB.mkdir(exist_ok=True)
    questions = build_questions()
    answers = build_answers(questions)
    sources = [{**s, "access_date": ACCESS_DATE} for s in SOURCES]
    # reorder keys to schema order
    sources = [{k: s[k] for k in schemas.SOURCE["required"]} for s in sources]

    results, sets = validate(questions, answers, sources)

    write_jsonl(KB / "05_QUESTION_BANK_SEED.jsonl", questions)
    write_jsonl(KB / "06_IM_IH_AL_SAMPLE_ANSWERS.jsonl", answers)
    write_sources_csv(KB / "01_SOURCE_REGISTER.csv", sources)
    write_taxonomy_md(KB / "04_QUESTION_TAXONOMY.md", questions)
    (KB / "08_DATA_SCHEMA.json").write_text(json.dumps(schemas.bundle(), ensure_ascii=False, indent=2), encoding="utf-8")

    # re-parse every JSONL line to prove it parses
    parse_ok = True
    for fn in ("05_QUESTION_BANK_SEED.jsonl", "06_IM_IH_AL_SAMPLE_ANSWERS.jsonl"):
        for i, line in enumerate((KB / fn).read_text(encoding="utf-8").splitlines(), 1):
            try:
                json.loads(line)
            except json.JSONDecodeError as e:
                parse_ok = False
                issue("FAIL", "jsonl_parse", f"{fn}:{i}: {e}")
    results["jsonl_parse"] = "PASS" if parse_ok else "FAIL"

    prompt = extract_prompt()
    results["coach_prompt_present"] = "PASS" if prompt else "FAIL"

    # ---- app bundle
    APP_SRC.mkdir(parents=True, exist_ok=True)
    app_q = [{k: q[k] for k in ("question_id", "topic", "topic_category", "question_text", "prompt_type", "target_practice_levels",
                               "difficulty_design", "mock_slot", "combo_id", "combo_order", "oqc_branch", "expected_evidence",
                               "follow_up_questions", "scaffolding_hints", "answer_framework", "time_frame_targets",
                               "content_origin")} for q in questions]
    app_sets = []
    for sid, lv in sorted(sets.items()):
        any_a = lv["IM"]
        app_sets.append({
            "set_id": sid, "question_id": any_a["question_id"], "persona_vi": any_a["persona_vi"],
            "key_differences_vi": any_a["set_key_differences_vi"], "not_memorize_vi": any_a["what_not_to_memorize"],
            "personalize_vi": any_a["how_to_personalize"],
            "levels": {l: {"answer_id": lv[l]["answer_id"], "text": lv[l]["answer_text"], "word_count": lv[l]["word_count"],
                           "demonstrates": lv[l]["what_this_answer_demonstrates"], "next_level": lv[l]["next_level_improvement"]}
                       for l in LEVELS},
        })
    kb_json = {
        "schema_version": SCHEMA_VERSION,
        "dataset_version": "1.0.0",
        "topics": {k: {"vi": v[0], "en": v[1], "category": v[2]} for k, v in TOPICS.items()},
        "prompt_types": {k: {"vi": v[0], "functions": v[1], "time_frames": v[2], "difficulty": v[3]} for k, v in PROMPT_TYPES.items()},
        "frameworks": FRAMEWORKS,
        "questions": app_q,
        "answer_sets": app_sets,
        "sources": [{k: s[k] for k in ("source_id", "title", "publisher_or_author", "tier", "url", "access_status")} for s in sources],
    }
    (APP_SRC / "kb.json").write_text(json.dumps(kb_json, ensure_ascii=False), encoding="utf-8")
    (APP_SRC / "coach_schema.json").write_text(json.dumps(schemas.COACH_RESULT, ensure_ascii=False), encoding="utf-8")
    (APP_SRC / "coach_prompt.txt").write_text(prompt, encoding="utf-8")

    # ---- bảng kiểm tra tự động trong 10_QA_AND_GAP_REPORT.md
    qa = KB / "10_QA_AND_GAP_REPORT.md"
    if qa.exists():
        rows = ["| Kiểm tra | Kết quả |", "|---|---|"] + [f"| `{k}` | **{v}** |" for k, v in results.items()]
        rows.append(f"\nSố lỗi FAIL: {sum(i['severity'] == 'FAIL' for i in issues)} · cần xem lại: {sum(i['severity'] != 'FAIL' for i in issues)}. Chi tiết trong `validation_report.json`.")
        txt = qa.read_text(encoding="utf-8")
        txt = re.sub(r"<!-- AUTO-CHECKS START -->.*?<!-- AUTO-CHECKS END -->",
                     "<!-- AUTO-CHECKS START -->\n" + "\n".join(rows) + "\n<!-- AUTO-CHECKS END -->", txt, flags=re.S)
        qa.write_text(txt, encoding="utf-8")

    # ---- validation report + manifest
    report = {"generated_on": ACCESS_DATE, "checks": results, "issues": issues}
    (KB / "validation_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    def sha(p):
        return hashlib.sha256(p.read_bytes()).hexdigest()

    files = sorted(p for p in KB.iterdir() if p.is_file() and p.name != "11_DATASET_MANIFEST.json")
    manifest = {
        "dataset": "OPIC_OQC_KNOWLEDGE_BASE_V1",
        "dataset_version": "1.0.0",
        "schema_version": SCHEMA_VERSION,
        "created_on": ACCESS_DATE,
        "test_language": "English",
        "record_counts": {
            "questions": len(questions),
            "sample_answers": len(answers),
            "sample_answer_sets": len(sets),
            "sources": len(sources),
        },
        "questions_by_topic": dict(Counter(q["topic"] for q in questions)),
        "questions_by_prompt_type": dict(Counter(q["prompt_type"] for q in questions)),
        "questions_by_category": dict(Counter(q["topic_category"] for q in questions)),
        "questions_by_target_level": {l: sum(l in q["target_practice_levels"] for q in questions) for l in LEVELS},
        "questions_by_content_origin": dict(Counter(q["content_origin"] for q in questions)),
        "oqc_branch_questions": sum(q["oqc_branch"] for q in questions),
        "sample_answers_by_level": dict(Counter(a["target_practice_level"] for a in answers)),
        "sample_answer_word_count_range": {l: [min(a["word_count"] for a in answers if a["target_practice_level"] == l),
                                               max(a["word_count"] for a in answers if a["target_practice_level"] == l)] for l in LEVELS},
        "sources_by_tier": dict(Counter(str(s["tier"]) for s in sources)),
        "sources_by_access_status": dict(Counter(s["access_status"] for s in sources)),
        "validation_status": results,
        "known_limitations": [
            "Toàn bộ câu hỏi (trừ Q-000001) và bài mẫu do AI viết; chưa có giáo viên hoặc rater được chứng nhận rà soát.",
            "Nhãn IM/IH/AL trên bài mẫu là mục tiêu luyện tập, không phải rating chính thức.",
            "Cấu trúc 15 câu, số lần nghe lại và độ khó 1–6 dựa trên nguồn cộng đồng/tài liệu luyện thi, chưa được ACTFL xác nhận.",
            "Descriptor ACTFL được tóm tắt/diễn giải, không chép nguyên văn; cần đối chiếu PDF trước khi phát hành thương mại.",
        ],
        "checksums_sha256": {p.name: sha(p) for p in files},
    }
    (KB / "11_DATASET_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({"counts": manifest["record_counts"], "checks": results,
                      "fails": [i for i in issues if i["severity"] == "FAIL"][:20],
                      "review": [i for i in issues if i["severity"] != "FAIL"][:20]}, ensure_ascii=False, indent=1))
    return 0 if not any(i["severity"] == "FAIL" for i in issues) else 1


if __name__ == "__main__":
    raise SystemExit(main())
