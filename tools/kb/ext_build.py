"""Combo bổ sung (AI soạn, 2026-10): dựng câu hỏi + kiểm tra chất lượng tự động.

Kiểm tra (mỗi câu):
  - câu hỏi 15–60 từ; role-play mở đầu đúng công thức OPIc (RA/RP/RE)
  - độ dài bài mẫu theo nhóm dạng câu (khớp bảng thời lượng IH của app, cho phép lệch nhẹ)
  - câu kể chuyện phải dùng thì quá khứ; role-play hỏi phải có ≥3 câu hỏi; role-play vấn đề phải có ≥2 phương án
  - không lẫn tiếng Việt / chỗ trống; nhân vật nhất quán (vợ + con gái)
  - không trùng quá mức với câu hỏi / bài mẫu đã có (độ trùng cụm 5 từ)
  - tỉ lệ từ thông dụng (có trong bảng nghĩa ~2.800 từ gốc của app)
"""
import importlib.util
import re
from pathlib import Path

HERE = Path(__file__).parent
CODES = {
    "D": "description", "R": "routine", "P": "preference_opinion", "PR": "past_recent", "PF": "past_first",
    "M": "memorable_experience", "X": "problem_experience", "CC": "comparison_change", "C2": "comparison_two",
    "RA": "roleplay_ask", "RV": "roleplay_ask_ava", "RP": "roleplay_problem", "RE": "roleplay_experience",
    "I": "issue_concern", "N": "news_report",
}
# Nhóm độ dài (số từ bài mẫu IH), khớp app/src/durations.js (IH) với tốc độ nói 100–120 từ/phút, nới ±10%.
GROUP = {"D": "short", "R": "short", "P": "short", "C2": "adv", "PR": "story", "PF": "story", "M": "story", "X": "story",
         "RE": "story", "RA": "ask", "RV": "ask", "RP": "problem", "CC": "adv", "I": "adv", "N": "adv"}
WORDS = {"short": (90, 135), "story": (130, 175), "ask": (65, 110), "problem": (95, 140), "adv": (125, 175)}
RP_OPEN = {"RA": "I'd like to give you a situation", "RP": "I'm sorry, but there is a problem", "RE": "That's the end of the situation"}
VI = re.compile(r"[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]", re.I)
IRREG_PAST = set("""was were had did went lent slipped sat ran held spent woke kept fell paid came took made got gave saw knew thought brought bought caught taught felt left kept slept met sent
spent built lost paid said told sold heard held stood understood found ran sat began drank swam sang wrote rode drove ate fell forgot
grew threw flew drew wore broke chose spoke woke stole hid shook led fed won hung became could would""".split())


def words(s):
    return re.findall(r"[A-Za-z']+", s)


def shingles(text, n=5):
    w = [x.lower() for x in words(text)]
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


def load_packs():
    combos = []
    for f in sorted((HERE / "ext_pack").glob("ext_*.py")):
        spec = importlib.util.spec_from_file_location(f.stem, f)
        m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(m)
        combos += [{**c, "file": f.name} for c in m.C]
    return combos


def qa_item(code, q, a, known_q, known_a, common):
    """Trả về danh sách (mức, mô tả) cho một câu."""
    out = []
    nq, na = len(words(q)), len(words(a))
    if not 15 <= nq <= 60:
        out.append(("WARN", f"câu hỏi {nq} từ (nên 15–60)"))
    if code in RP_OPEN and not q.startswith(RP_OPEN[code]):
        out.append(("FAIL", f"role-play {code} không mở đầu bằng '{RP_OPEN[code]}…'"))
    lo, hi = WORDS[GROUP[code]]
    if not lo <= na <= hi:
        out.append(("FAIL" if na < lo * 0.85 or na > hi * 1.15 else "WARN", f"bài mẫu {na} từ (nhóm {GROUP[code]}: {lo}–{hi})"))
    if GROUP[code] == "story":
        past = sum(1 for w in words(a) if w.lower().endswith("ed") or w.lower() in IRREG_PAST)
        if past < 8:
            out.append(("FAIL", f"câu kể chuyện chỉ có {past} động từ quá khứ"))
    if code in ("RA", "RV") and a.count("?") < 3:
        out.append(("FAIL", f"role-play hỏi chỉ có {a.count('?')} câu hỏi (cần ≥3)"))
    if code == "RP":
        alts = len(re.findall(r"\b(could you|could we|could i|we could|i could|if that's not possible|if not|or,|or if|instead)\b", a, re.I))
        if alts < 2:
            out.append(("FAIL", "role-play vấn đề chưa đưa đủ 2 phương án"))
    for t in (q, a):
        if VI.search(t):
            out.append(("FAIL", "lẫn chữ tiếng Việt có dấu"))
        if re.search(r"\[|\]|TODO|XXX|\{|\}", t):
            out.append(("FAIL", "còn chỗ trống / ký hiệu lạ"))
    if re.search(r"\bmy (son|husband|boyfriend|girlfriend)\b|\bmy sons\b", a, re.I):
        out.append(("FAIL", "lệch nhân vật mẫu (vợ + con gái)"))
    body = q
    for f in list(RP_OPEN.values()) + ["I'd like to give you a situation and ask you to act it out"]:
        if body.startswith(f):
            body = body.split('.', 1)[1] if '.' in body else body
    sq, sa = shingles(body), shingles(a)
    simq = max((len(sq & k) / max(1, len(sq)) for k in known_q), default=0)
    sima = max((len(sa & k) / max(1, len(sa)) for k in known_a), default=0)
    if simq > 0.5:
        out.append(("FAIL", f"câu hỏi trùng {simq:.0%} cụm 5 từ với câu đã có"))
    if sima > 0.2:
        out.append(("FAIL", f"bài mẫu trùng {sima:.0%} cụm 5 từ với bài đã có"))
    if common:
        # bỏ tên riêng (viết hoa) và dạng quá khứ bất quy tắc / đại từ mà bảng nghĩa lưu ở dạng gốc
        extra = IRREG_PAST | set("him them we're i'm you're they're it's that's i've i'll later best better got told understood".split())
        ws = [w.lower() for w in words(a) if len(w) > 2 and not w[0].isupper()]
        rate = sum(1 for w in ws if w in extra or common(w)) / max(1, len(ws))
        if rate < 0.85:
            out.append(("WARN", f"từ thông dụng chỉ {rate:.0%}"))
    return out


def build_ext(issue, TOPICS, PROMPT_TYPES, EXPECTED_EVIDENCE, FRAMEWORKS, LEVELS, SCHEMA_VERSION, PERSONA_VI, existing, common=None):
    """existing: các câu đã có (câu của app + của lớp) để kiểm tra trùng. Trả về (rows, report)."""
    combos = load_packs()
    known_q = [shingles(q["question_text"]) for q in existing]
    known_a = [shingles(q.get("sample_answer_ih", "")) for q in existing if q.get("sample_answer_ih")]
    rows, report = [], []
    seen_ids = set()
    n = 0
    for c in combos:
        if c["id"] in seen_ids:
            issue("FAIL", "ext_combo", f"duplicate combo id {c['id']}")
        seen_ids.add(c["id"])
        if c["topic"] not in TOPICS:
            issue("FAIL", "ext_taxonomy", f"{c['id']}: unknown topic {c['topic']}")
            continue
        cat = c["cat"]
        class_type = "Role-plays" if cat == "role_play" else "Combo-2" if cat == "issue" else "Combo-3"
        need = 2 if cat == "issue" else 3
        if len(c["items"]) != need:
            issue("FAIL", "ext_combo", f"{c['id']}: {len(c['items'])} câu, cần {need}")
        if cat == "role_play" and [i[0] for i in c["items"]] != ["RA", "RP", "RE"]:
            issue("FAIL", "ext_combo", f"{c['id']}: role-play phải theo thứ tự RA → RP → RE")
        for order, (code, q, a) in enumerate(c["items"], 1):
            n += 1
            ptype = CODES[code]
            p_label, funcs, frames, diff, slot = PROMPT_TYPES[ptype]
            if cat == "issue":
                slot, diff = "adv", "challenging"
            elif cat != "role_play":
                slot = "combo"
            qid = f"EX-{n:04d}"
            found = qa_item(code, q, a, known_q, known_a, common)
            for sev, msg in found:
                issue(sev, "ext_quality", f"{qid} ({c['id']} câu {order}): {msg}")
            report.append({"question_id": qid, "combo": c["id"], "type": code, "words": len(words(a)), "problems": [m for _, m in found]})
            known_q.append(shingles(q))
            known_a.append(shingles(a))
            rows.append({
                "question_id": qid,
                "test_language": "English",
                "topic": c["topic"],
                "topic_label_vi": TOPICS[c["topic"]][0],
                "topic_category": cat,
                "subtopic": p_label,
                "question_text": q,
                "prompt_type": ptype,
                "communicative_functions": funcs,
                "time_frame_targets": frames,
                "target_practice_levels": ["IH", "AL"] if diff == "challenging" else list(LEVELS),
                "difficulty_design": diff,
                "mock_slot": slot,
                "combo_id": f"EX-{c['id']}",
                "combo_order": order,
                "oqc_branch": False,
                "source_id": c["src"],
                "source_url": None,
                "content_origin": "AI_generated_original",
                "copyright_status": "original",
                "expected_evidence": EXPECTED_EVIDENCE[ptype],
                "follow_up_questions": [],
                "scaffolding_hints": [],
                "answer_framework": FRAMEWORKS[ptype],
                "review_status": "ai_checked",
                "schema_version": SCHEMA_VERSION,
                "origin_set": "ext",
                "source_index": n - 1,
                "class_type": class_type,
                "sample_answer_ih": a,
                "sample_word_count": len(words(a)),
                "sample_origin": "AI_generated_original",
                "sample_level_label_type": "practice_target_not_official_rating",
                "sample_persona_vi": PERSONA_VI,
            })
    return rows, report
