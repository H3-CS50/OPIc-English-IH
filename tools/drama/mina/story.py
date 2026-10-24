"""Tuyến Mina · dữ liệu cho app: câu hỏi mở khoá, điều kiện đạt, phần thưởng, thứ tự các phần.

build.py --app đọc file này cùng danh sách khung của từng tập (epXX.py) để ghi
app/www/drama/mina/manifest.json. Sửa luật mở khoá hay phần thưởng ở đây rồi chạy lại --app.

Điều kiện đạt (rule) chạy trên máy bằng Phân tích bài nói, không tốn lượt AI:
  words        số từ tối thiểu
  connectors   số từ nối khác nhau tối thiểu (danh sách CONNECTORS trong app/src/analysis.js)
  checks       các điều kiện thêm, mỗi mục {type, min, label}; type do app/src/drama-core.js hiểu:
               ideas (nhóm ý, cần đủ nhóm), sequence, pastVerbs, people, conclusion,
               pastPresent, solution, example, questions, alternatives
Cảnh thưởng: mở khi AI Coach ước tính đạt mục tiêu luyện tập (Cài đặt → Mục tiêu) cho câu hỏi của tập.
Epilogue (Tập 10): mở khi đã mở từ 5 cảnh thưởng trong tuyến.
"""

ROUTE = {
    "id": "mina",
    "name": "Mina",
    "title": "OPIc Drama · Tuyến Mina",
    "blurb": "Kim Mina, kỹ sư chất lượng từ Seoul sang nhà máy 6 tuần. Mỗi tập kết thúc bằng một câu hỏi OPIc: "
             "anh trả lời bằng giọng nói để mở phần tiếp theo.",
    "epilogueNeedsBonus": 5,
}

# ---------- nhóm ý cho điều kiện "ideas" ----------
JOB = ["work", "job", "company", "factory", "engineer", "oqc", "quality", "inspector", "inspection", "department",
       "office", "team", "line", "production", "products", "position", "staff"]
FAMILY = ["family", "wife", "husband", "son", "daughter", "kids", "children", "child", "parents", "mother", "father",
          "mom", "dad", "married", "brother", "sister", "baby", "girlfriend", "boyfriend"]
HOBBY = ["hobby", "hobbies", "free time", "weekend", "weekends", "enjoy", "like to", "love to", "play", "playing",
         "watch", "watching", "reading", "soccer", "football", "badminton", "gym", "fishing", "hiking", "cooking",
         "music", "movies", "travel", "traveling", "running", "jogging", "swimming", "games", "coffee"]
PLACE = ["building", "floor", "room", "office", "area", "desk", "big", "large", "small", "clean", "bright", "quiet",
         "noisy", "looks like", "look like", "located", "inside", "window", "windows", "wall", "walls", "lab",
         "space", "spacious", "line", "lines", "zone", "tables", "table", "lights"]
TOOLS = ["machine", "machines", "equipment", "tool", "tools", "computer", "computers", "laptop", "monitor",
         "microscope", "gauge", "caliper", "scanner", "tester", "jig", "jigs", "system", "device", "devices",
         "camera", "magnifier", "gloves", "software", "printer", "phone", "checklist", "screen"]


def rule(words, connectors, *checks):
    return {"words": words, "connectors": connectors, "checks": list(checks)}


def ck(type_, min_=1, label="", **kw):
    return {"type": type_, "min": min_, "label": label, **kw}


STD_SECTIONS = [
    # (id, điều kiện hiện, khoá đầu, khoá cuối) — khoá cuối có trong P của tập
    ("main", None, "COVER", "K11"),
    ("retry", "fail:q1", "SEP_RETRY", "K16"),
    ("good", "q1", "SEP_GOOD", "P1"),
    ("bonus", "bonus", "SEP_BONUS", None),
]

EPISODES = {
    1: dict(
        tag="Let's handle this together.",
        q=[dict(id="q1", qid="Q-000002", card="K11", hearts=10, rule=rule(
            50, 4,
            ck("ideas", 3, "Nói đủ 3 ý: công việc, gia đình, sở thích",
               groups={"công việc": JOB, "gia đình": FAMILY, "sở thích": HOBBY})))],
        photocard=dict(name="5:40 AM", panel="K13"),
        bonus=dict(name="Black, No Sugar", panel="K17", hearts=5),
        good_end="K15B",
    ),
    2: dict(
        tag="This stays between us.",
        q=[dict(id="q1", qid="Q-000010", card="K11", hearts=10, rule=rule(
            65, 5, ck("sequence", 3, "Ít nhất 3 từ chỉ trình tự (first, then, after that, next, finally)")))],
        photocard=dict(name="11 PM", panel="P1"),
        bonus=dict(name="Midnight Noodles", panel="K17", hearts=5),
    ),
    3: dict(
        tag="Make me see it, Minh.",
        q=[dict(id="q1", qid="Q-000007", card="K11", hearts=10, rule=rule(
            65, 5,
            ck("ideas", 2, "Tả cả 2 ý: nơi làm việc trông thế nào + thiết bị, dụng cụ",
               groups={"nơi làm việc": PLACE, "thiết bị, dụng cụ": TOOLS})))],
        photocard=dict(name="First Smile", panel="P1"),
        bonus=dict(name="Your Jacket", panel="K17", hearts=5),
    ),
    4: dict(
        tag="…You can let go now, Minh.",
        q=[dict(id="q1", qid="Q-000012", card="K11", hearts=10, rule=rule(
            70, 5, ck("pastVerbs", 4, "Kể bằng thì quá khứ: ít nhất 4 động từ quá khứ (found, reported, checked…)")))],
        photocard=dict(name="Good Catch", panel="P1"),
        bonus=dict(name="6:10 AM", panel="K17", hearts=5),
    ),
    5: dict(
        tag="You were jealous tonight.",
        q=[dict(id="q1", qid="Q-000008", card="K11", hearts=10, rule=rule(
            65, 5, ck("people", 2, "Nhắc ít nhất 2 người cụ thể (tên, hoặc coworker / leader / manager…)")))],
        photocard=dict(name="Rooftop", panel="P1"),
        bonus=dict(name="Barefoot", panel="K17", hearts=5),
    ),
    6: dict(
        tag="Slowly. Like you're teaching me.",
        q=[dict(id="q1", qid="Q-000006", card="K11", hearts=10, rule=rule(
            70, 5,
            ck("pastVerbs", 4, "Kể bằng thì quá khứ: ít nhất 4 động từ quá khứ"),
            ck("people", 1, "Nói ai liên quan (leader, coworker, team, customer…)")))],
        photocard=dict(name="Under the Table", panel="P1"),
        bonus=dict(name="Kimbap", panel="K17", hearts=5),
    ),
    7: dict(
        tag="Is it the dark… or me?",
        q=[dict(id="q1", qid="Q-000009", card="K11", hearts=10, rule=rule(
            70, 5,
            ck("pastVerbs", 4, "Kể bằng thì quá khứ: ít nhất 4 động từ quá khứ"),
            ck("conclusion", 1, "Có câu kết (in the end, finally, eventually, at the end of the day)")))],
        photocard=dict(name="Blackout", panel="P1"),
        bonus=dict(name="One Umbrella", panel="K17", hearts=5),
    ),
    8: dict(
        tag="Every night was real. Every word.",
        q=[dict(id="q1", qid="Q-000137", card="K11", hearts=10, rule=rule(
            75, 5, ck("pastPresent", 2, "So sánh trước kia và bây giờ: ≥2 dấu hiệu quá khứ (used to…) và ≥2 dấu hiệu hiện tại (now, these days…)")))],
        photocard=dict(name="The Evaluator", panel="P1"),
        bonus=dict(name="Just Mina", panel="K17", hearts=5),
    ),
    9: dict(
        tag="I want you to earn it.",
        q=[dict(id="q1", qid="Q-000138", card="K11", hearts=10, rule=rule(
            75, 5,
            ck("solution", 1, "Có giải pháp (should, need to, have to, must…)"),
            ck("example", 1, "Có ví dụ (for example, for instance, such as)")))],
        photocard=dict(name="One Dance", panel="P1"),
        bonus=dict(name="Your Tie", panel="K17", hearts=5),
    ),
    10: dict(
        tag="I can't wait until Wednesday.",
        q=[
            dict(id="q1", qid="EX-0040", card="Q1", hearts=5, rule=rule(
                40, 0, ck("questions", 3, "Hỏi ít nhất 3 câu (Could you…? What is…? When does…?)"))),
            dict(id="q2", qid="EX-0041", card="Q2", hearts=5, rule=rule(
                60, 4, ck("alternatives", 2, "Đưa ít nhất 2 phương án (we could…, another option…, alternatively…)"))),
            dict(id="q3", qid="EX-0042", card="Q3", hearts=20, rule=rule(
                70, 5, ck("pastVerbs", 4, "Kể bằng thì quá khứ: ít nhất 4 động từ quá khứ"))),
        ],
        photocard=dict(name="Golden Hour", panel="P1"),
        bonus=dict(name="Five More Minutes", panel="K17", hearts=5),
        badge="Let's handle this together",
        sections=[
            ("part1", None, "COVER", "Q1"),
            ("retry1", "fail:q1", ["SEP_RETRY", "R1"]),
            ("part2", "q1", "SEP_P2", "Q2"),
            ("retry2", "fail:q2", ["SEP_RETRY", "R2"]),
            ("part3", "q2", "SEP_P3", "Q3"),
            ("retry3", "fail:q3", ["SEP_RETRY", "R3"]),
            ("true", "q3", "SEP_TRUE", "P1"),
            ("bonus", "bonus", "SEP_BONUS", "K17"),
            ("epilogue", "epilogue", "SEP_EPI", "K18"),
        ],
    ),
}


def sections(ep, order):
    """Chia danh sách khung của tập thành các phần theo STD_SECTIONS (hoặc sections riêng)."""
    spec = EPISODES[ep].get("sections") or STD_SECTIONS
    out = []
    for item in spec:
        sid, need = item[0], item[1]
        if isinstance(item[2], list):
            keys = item[2]
        else:
            a = order.index(item[2])
            last = item[3]
            if last is None or last not in order:
                # tập không có P1 (Tập 1): phần đạt kết thúc ở khung "còn tiếp"
                last = EPISODES[ep].get("good_end", order[-1]) if sid == "good" else order[-1]
            b = order.index(last)
            keys = order[a:b + 1]
        out.append({"id": sid, "need": need, "panels": keys})
    used = [k for s in out for k in s["panels"]]
    missing = [k for k in order if k not in used]
    assert not missing, (ep, missing)
    return out
