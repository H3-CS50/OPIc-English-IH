"""Bộ đề cố định: 30 đề cấp 3–4 (mục tiêu IM) + 30 đề cấp 5–6 (mục tiêu IH/AL).

Cấu trúc mỗi đề (15 câu, theo tài liệu lớp và nguồn cộng đồng):
  1 giới thiệu → 3 combo (2–4, 5–7, 8–10) → role-play 11–13 → 14–15
  cấp 3–4: 14–15 là 2 câu đầu của một combo đột xuất dễ/vừa; cấp 5–6: 14–15 là combo nâng cao (so sánh → vấn đề xã hội).
Combo 1–3 xen kẽ 2 Survey + 1 đột xuất và 1 Survey + 2 đột xuất (nguồn cộng đồng: tỉ lệ thay đổi theo đề).
Survey giả định theo lựa chọn phổ biến (lớp khuyên tránh "Quán bar"); không dùng câu nhánh OQC.
Chọn combo tham lam: chủ đề ít dùng nhất trong bộ → combo ít dùng nhất (cả hai bộ) → ngẫu nhiên có seed cố định.
"""
import random
from collections import Counter, defaultdict

SURVEY_TOPICS = ["movies", "concerts", "music", "parks", "walking", "hiking", "beach", "domestic_trips", "overseas_trips",
                 "vacation_home", "housing", "work"]
N_TESTS = 30


def combo_pools(app_q):
    groups = defaultdict(list)
    for q in app_q:
        groups[q["combo_id"]].append(q)
    pools = defaultdict(list)
    for cid, qs in groups.items():
        qs = sorted(qs, key=lambda q: q["combo_order"])
        if any(q["oqc_branch"] for q in qs) or qs[0]["topic"] in ("oqc_work", "rp_work_training"):
            continue
        slots = {q["mock_slot"] for q in qs}
        t = qs[0]["topic"]
        if "intro" in slots:
            pools["intro"] += [{"id": f"{cid}#{i}", "topic": t, "qs": [q]} for i, q in enumerate(qs)]
        elif all(q["prompt_type"] == "roleplay_ask_ava" for q in qs):
            pools["ava"] += [{"id": f"{cid}#{i}", "topic": t, "qs": [q]} for i, q in enumerate(qs)]
        elif any(s.startswith("rp_") for s in slots):
            if len(qs) == 3 and [q["prompt_type"] for q in qs][1:] == ["roleplay_problem", "roleplay_experience"]:
                pools["rp"].append({"id": cid, "topic": t, "qs": qs})
        elif "adv" in slots:
            if len(qs) >= 2:
                pools["adv"].append({"id": cid, "topic": t, "qs": qs[:2]})
        elif len(qs) == 3:
            cat = qs[0]["topic_category"]
            if cat == "survey" and t in SURVEY_TOPICS:
                pools["survey"].append({"id": cid, "topic": t, "qs": qs})
            elif cat == "unexpected":
                pools["unexpected"].append({"id": cid, "topic": t, "qs": qs})
    for k in pools:
        pools[k].sort(key=lambda c: c["id"])
    return pools


HARD = {"challenging": 2, "medium": 1, "easy": 0}
STORY = {"past_recent", "past_first", "memorable_experience", "problem_experience", "roleplay_experience"}


def bad_start(c):
    """Combo thật thường mở đầu bằng câu miêu tả / thói quen; combo mở đầu bằng câu kể chuyện thì xếp sau."""
    return int(c["qs"][0]["prompt_type"] in STORY)


def hardness(c):
    return sum(HARD.get(q["difficulty_design"], 1) for q in c["qs"])


def build_tests(app_q, seed=2026):
    pools = combo_pools(app_q)
    rnd = random.Random(seed)
    global_use = Counter()
    sets = []
    for level, prefix, title in (("34", "IM", "Cấp 3–4 · mục tiêu IM"), ("56", "IH", "Cấp 5–6 · mục tiêu IH / AL")):
        topic_use = Counter()
        combo_use = Counter()
        tests = []

        def pick(pool, avoid_topics, prefer=None):
            cands = [c for c in pool if c["topic"] not in avoid_topics] or pool

            def key(c):
                pref = 0
                if prefer == "easy":
                    pref = hardness(c)
                elif prefer == "hard":
                    pref = -hardness(c)
                return (topic_use[c["topic"]], bad_start(c), combo_use[c["id"]], global_use[c["id"]], pref, rnd.random())

            c = min(cands, key=key)
            topic_use[c["topic"]] += 1
            combo_use[c["id"]] += 1
            global_use[c["id"]] += 1
            return c

        for n in range(1, N_TESTS + 1):
            used_topics = set()
            intro = pools["intro"][(n - 1) % len(pools["intro"])]
            plan = ["survey", "survey", "unexpected"] if n % 2 else ["survey", "unexpected", "unexpected"]
            rnd.shuffle(plan)
            combos = []
            for kind in plan:
                c = pick(pools[kind], used_topics, "easy" if level == "34" else "hard")
                used_topics.add(c["topic"])
                combos.append(c)
            rp = pick(pools["rp"], used_topics)
            rp_qs = list(rp["qs"])
            if level == "56" and n % 4 == 0 and pools["ava"]:
                ava = pools["ava"][(n // 4) % len(pools["ava"])]
                rp_qs = [ava["qs"][0]] + rp_qs[1:]
            if level == "34":
                last = pick(pools["unexpected"], used_topics | {rp["topic"]}, "easy")
                last_qs = last["qs"][:2]
            else:
                last = pick(pools["adv"], used_topics, "hard")
                last_qs = last["qs"][:2]
            items = [intro["qs"][0]] + [q for c in combos for q in c["qs"]] + rp_qs + last_qs
            tests.append({
                "id": f"{prefix}-{n:02d}",
                "no": n,
                "level": level,
                "qids": [q["question_id"] for q in items],
                "sections": [
                    {"name": "Giới thiệu", "topic": intro["topic"]},
                    *[{"name": f"Combo {i + 1}", "topic": c["topic"], "kind": k} for i, (c, k) in enumerate(zip(combos, plan))],
                    {"name": "Role-play", "topic": rp["topic"]},
                    {"name": "Câu 14–15", "topic": last["topic"], "kind": "adv" if level == "56" else "unexpected"},
                ],
            })
        sets.append({"id": f"L{level}", "level": level, "title": title, "tests": tests})
    return sets, pools


def check_tests(sets, pools, app_q, issue):
    """Kiểm tra: 15 câu khác nhau, đúng thứ tự dạng câu, độ phủ chủ đề."""
    byid = {q["question_id"]: q for q in app_q}
    ok = True
    stats = {}
    for s in sets:
        topics = Counter()
        combos_seen = set()
        for t in s["tests"]:
            q = [byid[i] for i in t["qids"]]
            if len(q) != 15 or len(set(t["qids"])) != 15:
                ok = False
                issue("FAIL", "fixed_tests", f"{t['id']}: {len(q)} câu / {len(set(t['qids']))} khác nhau")
            if q[0]["mock_slot"] != "intro" or q[11]["prompt_type"] != "roleplay_problem" or q[12]["prompt_type"] != "roleplay_experience":
                ok = False
                issue("FAIL", "fixed_tests", f"{t['id']}: sai thứ tự giới thiệu / role-play")
            if s["level"] == "56" and not all(x["mock_slot"] == "adv" for x in q[13:]):
                ok = False
                issue("FAIL", "fixed_tests", f"{t['id']}: câu 14–15 không phải câu nâng cao")
            secs = [x["topic"] for x in t["sections"][1:4]]
            if len(set(secs)) != 3:
                issue("WARN", "fixed_tests", f"{t['id']}: combo trùng chủ đề {secs}")
            for x in t["sections"]:
                topics[x["topic"]] += 1
            combos_seen.update(byid[i]["combo_id"] for i in t["qids"])
        all_unexp = {c["topic"] for c in pools["unexpected"]}
        all_rp = {c["topic"] for c in pools["rp"]}
        all_survey = {c["topic"] for c in pools["survey"]}
        miss = sorted((all_unexp | all_rp | all_survey) - set(topics))
        if miss:
            issue("WARN", "fixed_tests_coverage", f"{s['id']}: chưa phủ chủ đề {miss}")
        stats[s["id"]] = {
            "tests": len(s["tests"]),
            "topics_covered": len(set(topics)),
            "unexpected_topics": f"{len(all_unexp & set(topics))}/{len(all_unexp)}",
            "roleplay_topics": f"{len(all_rp & set(topics))}/{len(all_rp)}",
            "survey_topics": f"{len(all_survey & set(topics))}/{len(all_survey)}",
            "distinct_combos": len(combos_seen),
            "max_topic_repeats": max(topics.values()),
        }
    return ok, stats
