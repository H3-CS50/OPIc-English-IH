"""EP10 · Golden Hour — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep10/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 10
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 10
TITLE = 'Golden Hour'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.nowrap{white-space:nowrap}
.bub.whisper{border-style:dashed;border-width:3.5px}
.lock-pill{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 22px;border-radius:999px;
  background:rgba(10,10,18,.72);border:1.5px solid rgba(242,196,90,.7);color:#ffe7a8;font-weight:700;font-size:22px;z-index:4;white-space:nowrap}
.dots{font-family:'DejaVu Sans',sans-serif;font-size:30px;letter-spacing:10px;color:#ffb3cf;margin-bottom:6px}
.msg{height:720px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;
  background:radial-gradient(ellipse at 50% 30%,#1d1b33 0%,#0b0b12 75%)}
.msg-time{font-family:'Inter Display','Inter',sans-serif;font-weight:300;font-size:120px;line-height:1;letter-spacing:-2px;color:#f2f2f8}
.msg-date{font-weight:600;font-size:28px;color:#b7b7cc;margin-top:8px}
.msg-card{width:820px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.18);
  border-radius:34px;padding:26px 32px 30px;box-shadow:0 18px 50px rgba(0,0,0,.45);display:flex;flex-direction:column;color:#fff}
.msg .msg-card{margin-top:44px}
.msg-head{display:flex;align-items:center;gap:16px}
.msg-av{width:54px;height:54px;border-radius:27px;background:#ff4f8f;display:flex;align-items:center;justify-content:center;
  font-weight:900;font-size:28px}
.msg-name{font-weight:800;font-size:30px}
.msg-now{margin-left:auto;font-weight:500;font-size:22px;color:#a9a9bb}
.msg-b{margin-top:18px;margin-left:70px;background:#fff;color:#121218;border-radius:26px 26px 26px 8px;padding:14px 24px 16px;
  width:fit-content;align-self:flex-start}
.msg-b .en{font-weight:800;font-size:34px;line-height:1.2}
.msg-b .vi{font-weight:500;font-size:24px;color:#5d5d6b;margin-top:4px}
.scr{transform-origin:0 0;z-index:2}
.ph{width:300px;height:560px;background:#fbfcfe;padding:64px 22px 20px;color:#1b2333;display:flex;flex-direction:column;gap:12px}
.ph-app{font-weight:800;font-size:22px;color:#3d6bff}
.ph-subj{font-weight:900;font-size:30px;line-height:1.15}
.ph-b{font-weight:600;font-size:26px;line-height:1.2}
.ph-hl{font-weight:900;font-size:26px;line-height:1.2;color:#0f7a3a;background:#dff5e6;padding:8px 10px;border-radius:8px}
.sign{width:560px;height:334px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1b1b24;
  font-family:'Inter Display','Inter',sans-serif;mix-blend-mode:multiply}
.sg1{font-weight:900;font-size:120px;letter-spacing:6px;line-height:1}
.sg2{font-weight:800;font-size:46px;letter-spacing:8px;color:#b3123a;margin-top:10px}
.scr-av{width:44px;height:44px;border-radius:22px;background:#ff4f8f;color:#fff;display:inline-flex;align-items:center;
  justify-content:center;font-weight:900;font-size:18px;flex:none}
.scr-av.grp{background:#0f7a3a}
.notif{background:rgba(28,28,40,.94);border:1.5px solid rgba(255,255,255,.16);border-radius:30px;padding:22px 30px 26px;color:#fff;
  z-index:4;box-shadow:0 14px 40px rgba(0,0,0,.5)}
.nt-head{display:flex;align-items:center;gap:14px}
.nt-app{font-weight:800;font-size:26px}
.nt-now{margin-left:auto;font-weight:500;font-size:22px;color:#a9a9bb}
.nt-en{font-weight:800;font-size:33px;line-height:1.25;margin-top:12px}
.nt-vi{font-weight:500;font-size:25px;line-height:1.3;color:#c9c9dc;margin-top:8px}
.endtrue{height:600px;background:radial-gradient(ellipse at center,#4a2a08 0%,#1a0f12 60%,#0e0f15 85%)}
.endtrue .end-k{color:#f2c45a;font-size:34px}
.endtrue .end-r{background:rgba(242,196,90,.15);border-color:rgba(242,196,90,.6);color:#ffe7a8}
.end-r2{margin-top:14px !important}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


S23 = 1080 / 848
K16_PT, K18_PT = 520, 300
K16_Q = [(521, 897), (700, 868), (754, 1205), (562, 1233)]
K16_SCREEN = ('<div class="ph"><div class="ph-app">HR · Inbox</div>'
              '<div class="ph-subj">Promotion interview: confirmed.</div>'
              '<div class="ph-b">Candidate: Minh</div><div class="ph-b">Wed 09:00</div>'
              '<div class="ph-hl">New panel assigned</div></div>')
K18_Q = [(285, 782), (567, 779), (569, 946), (289, 951)]
K18_SIGN = '<div class="sign"><div class="sg1">MINH</div><div class="sg2">TEAM LEAD</div></div>'


def qcard(n, code, en, vi, chips, foot, dots):
    ch = "".join(f"<span>{c}</span>" for c in chips)
    return [
        raw(0, 0, "", cls="k11-bg"),
        raw(250, 40, f'{LOCK.format(s=30)}<span>Qua cả ba câu để mở True ending</span>', w=580, cls="lock-pill"),
        raw(70, 130, (
            f'<div class="mic">{MIC.format(s=64)}</div>'
            f'<div class="dots">{dots}</div>'
            f'<div class="k11-kicker">CÂU {n}/3</div>'
            f'<div class="k11-code">{code}</div>'
            f'<div class="k11-en">{en}</div>'
            f'<div class="k11-vi">{vi}</div>'
            f'<div class="chips">{ch}</div>'
            f'<div class="k11-foot">{foot}<br>Bấm mic trong app để trả lời · Trả lời đạt để mở phần tiếp</div>'),
            w=940, cls="k11-card"),
    ]


def sep(k, t, s):
    return raw(0, 0, f'<div class="sep-k">{k}</div><div class="sep-t">{t}</div><div class="sep-s">{s}</div>',
               w=1080, cls="sep")


P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA · TẬP CUỐI</div>'
        '<div class="ep">Tập 10</div>'
        '<div class="title">Golden Hour</div>'
        '<div class="tag">“I can\'t wait until Wednesday.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

# ---------- Phần 1 ----------
P.append(("K01", "K01", 60, 200, [
    cap(24, 24, "Chủ Nhật · 17:20", "Sân thượng nhà máy"),
    th(30, 745, 700, "Her last evening in Vietnam.", "(Buổi tối cuối cùng của cô ấy ở Việt Nam.)"),
], "", None))

P.append(("K02", "K02", 470, 60, [
    bub(24, -445, 420, "You're on time. Good.", "Anh đúng giờ. Tốt.", (300, -60)),
    bub(300, -265, 756, "Last lesson, Minh. Three questions in a row, like the real test.",
        "Bài cuối, Minh. Ba câu liên tiếp, như bài thi thật.", (550, 330)),
], "", None))

P.append(("K03", "K03", 260, 170, [
    bub(24, -235, 680, "Pass all three, and I'll tell you a secret.",
        "Qua cả ba câu, em sẽ nói anh nghe một bí mật.", (590, 380)),
    th(30, 985, 520, "Another secret?", "(Lại một bí mật nữa?)"),
], "", None))

P.append(("K04", "K04", 470, 60, [
    bub(24, -445, 640, "I'd like to give you a situation and ask you to act it out.",
        "Em đưa anh một tình huống, anh hãy đóng vai nhé.", (300, -60)),
    bub(380, -235, 676, "I'm your manager. I've just assigned you to a new project.",
        "Em là quản lý của anh. Em vừa giao cho anh một dự án mới.", (640, 400)),
], "", None))

P.append(("K05", "K05", 260, 60, [
    bub(24, -235, 600, "Ask your manager three or four questions about the project.",
        "Hỏi quản lý của anh ba, bốn câu về dự án đi.", (590, 350)),
    bub(680, -235, 376, "Go on. I'm waiting.", "Nào. Em đang chờ.", (620, 350)),
], "", None))

P.append(("Q1", None, 60, 60, qcard(
    1, "EX-0040 · Role-play: dự án ở công ty",
    "I'd like to give you a situation and ask you to act it out. Your manager has just assigned you to a new "
    "project. Ask your manager three or four questions about the project.",
    "Đóng vai: quản lý (Mina) vừa giao cho anh một dự án mới. Hãy hỏi quản lý 3–4 câu về dự án.",
    ["30–45 giây", "40+ từ", "3–4 câu hỏi khác nhau", "Could you…? I was wondering if…"],
    "Chào, nói mục đích → 3–4 câu hỏi khác nhau (what · when · who · how) → cảm ơn, hẹn liên lạc<br>"
    "Dự án trong role-play là giả định",
    "●○○"), "", 1080))

# ---------- Phần 2 ----------
P.append(("SEP_P2", None, 0, 0, [sep("PHẦN 2", "Khi đạt câu 1", "Mở bằng Phân tích bài nói trên máy · không tốn lượt AI · +5 ♥")], "", 340))

P.append(("K06", "K06", 470, 60, [
    bub(24, -445, 700, "Good questions. Here's my answer: the project is called 'Seoul'.",
        "Hỏi hay đấy. Câu trả lời của em: dự án tên là “Seoul”.", (300, -60)),
    bub(360, -235, 696, "A joint quality project between HQ and your factory.",
        "Dự án chất lượng chung giữa trụ sở và nhà máy anh.", (610, 340)),
], "", None))

P.append(("K07", "K07", 260, 60, [
    bub(24, -235, 560, "And the Vietnam lead… is you. If you pass your interview.",
        "Và trưởng nhóm phía Việt Nam… là anh. Nếu anh qua phỏng vấn.", (600, 390)),
    bub(620, -235, 436, "That's not the secret, by the way.", "Mà đó chưa phải bí mật đâu.", (640, 390)),
], "", None))

P.append(("K08", "K08", 260, 60, [
    bub(24, -235, 360, "Uh-oh. A problem.", "Ôi. Có chuyện rồi.", (560, 380)),
    bub(420, -235, 636, "I'm sorry, but there is a problem I need you to resolve.",
        "Xin lỗi, có một vấn đề anh cần giải quyết.", (600, 380)),
], "", None))

P.append(("K09", "K09", 560, 60, [
    bub(24, -535, 640, "A client has asked to move the project deadline two weeks earlier.",
        "Khách hàng muốn dời hạn chót của dự án lên sớm hai tuần.", (300, -60)),
    bub(300, -275, 756, "Call your manager, explain the situation, and suggest two or three alternatives. …Ring, ring.",
        "Gọi cho quản lý, giải thích tình hình và đề xuất hai, ba phương án. …Reng reng.", (570, 350)),
], "", None))

P.append(("Q2", None, 60, 60, qcard(
    2, "EX-0041 · Role-play: dự án ở công ty",
    "I'm sorry, but there is a problem I need you to resolve. A client has asked to move the project deadline "
    "two weeks earlier. Call your manager, explain the situation, and suggest two or three alternatives.",
    "Khách hàng muốn dời hạn chót dự án lên sớm hai tuần. Gọi cho quản lý (Mina), giải thích tình hình "
    "và đề xuất 2–3 phương án.",
    ["45–60 giây", "60+ từ", "4+ từ nối", "2–3 phương án"],
    "Anh là ai, gọi về việc gì → vấn đề → 2–3 phương án (We could… / Another option…) → xin phản hồi, chào<br>"
    "Khách hàng và hạn chót trong role-play là giả định",
    "●●○"), "", 1080))

# ---------- Phần 3 ----------
P.append(("SEP_P3", None, 0, 0, [sep("PHẦN 3", "Khi đạt câu 2", "Mở bằng Phân tích bài nói trên máy · không tốn lượt AI · +5 ♥")], "", 340))

P.append(("K10", "K10", 260, 60, [
    bub(24, -235, 760, "Three options, and you stayed calm. I'd hire you.",
        "Ba phương án, mà anh vẫn bình tĩnh. Em sẽ tuyển anh.", (530, 420)),
], "", None))

P.append(("K11", "K11", 260, 60, [
    bub(24, -235, 480, "That's the end of the situation.", "Tình huống kết thúc.", (520, 560)),
    bub(560, -235, 496, "Last question. And this one is real.", "Câu cuối. Và câu này là thật.", (580, 560)),
], "", None))

P.append(("K12", "K12", 560, 200, [
    bub(24, -535, 640, "Have you ever had a difficult problem at work that you had to solve?",
        "Anh đã bao giờ gặp một vấn đề khó trong công việc mà anh phải tự giải quyết chưa?", (300, -60)),
    bub(380, -255, 676, "Tell me what happened and how you handled it.",
        "Kể em nghe chuyện gì đã xảy ra và anh đã xử lý thế nào.", (570, 560)),
    th(30, 1635, 900, "The hardest problem I ever solved… wasn't a phone.",
       "(Vấn đề khó nhất mình từng giải… không phải một chiếc điện thoại.)"),
], "", None))

P.append(("Q3", None, 60, 60, qcard(
    3, "EX-0042 · Role-play: kể trải nghiệm",
    "That's the end of the situation. Have you ever had a difficult problem at work or school that you had to "
    "solve? Tell me what happened and how you handled it.",
    "Kể cho Mina về một vấn đề khó anh từng phải giải quyết ở công ty hoặc trường học: chuyện gì đã xảy ra "
    "và anh đã xử lý thế nào.",
    ["50–70 giây", "70+ từ", "5+ từ nối", "Kể ở thì quá khứ"],
    "Bối cảnh → vấn đề → anh đã làm gì → kết quả + cảm nghĩ<br>"
    "Kể chung chung, không nêu tên khách hàng, model hay số liệu nội bộ",
    "●●●"), "", 1080))

# ---------- True ending ----------
P.append(("SEP_TRUE", None, 0, 0, [sep("TRUE ENDING", "Khi đạt câu 3", "Đạt cả ba câu · mở bí mật cuối cùng của Mina")], "", 340))

P.append(("K13", "K13", 260, 60, [
    bub(24, -235, 520, "You were afraid of English. Now look at you.", "Anh từng sợ tiếng Anh. Giờ nhìn anh xem.",
        (520, 470)),
    bub(580, -235, 476, "And not once did you blame anyone.", "Và chưa một lần anh đổ lỗi cho ai.", (580, 470)),
], "", None))

P.append(("K14", "K14", 260, 60, [
    bub(24, -235, 380, "Here's my secret.", "Bí mật của em đây.", (520, 350)),
    bub(440, -235, 616, "I asked Seoul for this project… so I could come back to you.",
        "Em xin trụ sở dự án này… để em được quay lại với anh.", (580, 350)),
], "", None))

P.append(("K15", "K15", 470, 60, [
    bub(24, -445, 420, "You passed, Minh.", "Anh qua rồi, Minh.", (300, -60), who="mina whisper"),
    bub(480, -445, 576, "I said after your interview…", "Em đã nói là sau buổi phỏng vấn…", (700, -60)),
    bub(300, -235, 756, "…but I can't wait until Wednesday.", "…nhưng em không đợi được tới thứ Tư.", (450, 200)),
    cap(24, 24, "17:58"),
], "", None))

P.append(("K16", "K16", K16_PT, 60, [
    raw(40, -495, (
        '<div class="nt-head"><span class="scr-av grp">HR</span><span class="nt-app">HR · Promotion interview: confirmed.</span>'
        '<span class="nt-now">bây giờ</span></div>'
        '<div class="nt-en">Candidate: Minh · Wed 09:00 · New panel assigned</div>'
        '<div class="nt-vi">Nhân sự · Lịch phỏng vấn thăng cấp: đã xác nhận. Ứng viên: Minh · 09:00 thứ Tư · Đã có hội đồng mới</div>'),
        w=1000, cls="notif"),
    bub(24, -235, 470, "Told you. You earned it.", "Em nói rồi mà. Anh tự giành được nó.", (540, 520)),
    bub(560, -235, 496, "See you in Seoul, Minh.", "Hẹn gặp anh ở Seoul, Minh.", (580, 520)),
    scr(K16_Q, 300, 560, K16_SCREEN, K16_PT, S23),
    sfx(40, 200, "Ting.", 64, -8),
], "", None))

P.append(("K16C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">07:35</div>'
        '<div class="msg-date">Thứ Hai · chuyến bay 08:10</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">Boarding now.</div><div class="vi">Em lên máy bay đây.</div></div>'
        '<div class="msg-b"><div class="en">Pass that interview. Then come find me.</div><div class="vi">Qua phỏng vấn đi. Rồi sang tìm em.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 720))

P.append(("K16B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">TRUE ENDING</div>'
        '<div class="end-t">Tuyến Mina · Hoàn thành</div>'
        '<div class="end-s">Chủ Nhật 17:58 · Sân thượng nhà máy</div>'
        '<div class="end-r">+20 ♥ · Huy hiệu “Let\'s handle this together”</div>'
        '<div class="end-r end-r2">Photocard “Golden Hour” · Bộ sưu tập Mina 10/10</div>'), w=1080, cls="end endtrue"),
], "", 600))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“Golden Hour” · mở khi qua cả ba câu</span>',
        w=1080, cls="pc-label"),
], "", None))

# ---------- Nói lại ----------
P.append(("SEP_RETRY", None, 0, 0, [sep("NÓI LẠI", "Khi chưa đạt một câu",
                                         "Dùng chung một ảnh, đổi lời theo câu chưa đạt · câu đã đạt được giữ lại")], "", 340))

for n, a_en, a_vi, b_en, b_vi in [
    (1, "That's only one question, Minh. A good team lead asks more.",
     "Mới một câu thôi, Minh. Trưởng nhóm giỏi phải hỏi nhiều hơn.",
     "Ask me three or four: what, when, who, how.", "Hỏi em ba, bốn câu: cái gì, khi nào, ai, thế nào."),
    (2, "You told me the problem. Where are my options?", "Anh nói vấn đề rồi. Phương án của em đâu?",
     "Give me two or three alternatives, then ask what I think.", "Đưa em hai, ba phương án, rồi hỏi ý em."),
    (3, "That's a summary, not a story.", "Đó là tóm tắt, chưa phải câu chuyện.",
     "What happened first? What did you do? How did it end?", "Chuyện gì xảy ra trước? Anh đã làm gì? Kết thúc ra sao?"),
]:
    P.append((f"R{n}", "R", 470, 190, [
        bub(24, -445, 640, a_en, a_vi, (300, -60)),
        bub(360, -235, 696, b_en, b_vi, (640, 300)),
        raw(290, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Câu {n}/3</span>', w=500, cls="pill nowrap"),
    ], "", None))

# ---------- Cảnh thưởng ----------
P.append(("SEP_BONUS", None, 0, 0, [sep("CẢNH THƯỞNG", "Thêm năm phút",
                                         "Mở khi AI Coach ước tính đạt mục tiêu luyện tập ở câu 3<br>(ước tính luyện tập, không phải điểm OPIc chính thức)")], "", 340))

P.append(("K17", "K17", 260, 130, [
    bub(24, -235, 470, "Stay. Five more minutes.", "Ở lại đi. Thêm năm phút nữa.", (650, 500)),
    bub(560, -235, 496, "…No. Make it ten.", "…Không. Mười phút.", (700, 500)),
    cap(24, 24, "18:30", "Đèn nhà máy vừa bật"),
    raw(120, 1528, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Five More Minutes”</span>',
        w=840, cls="pill pill-gold"),
], "", None))

# ---------- Epilogue ----------
P.append(("SEP_EPI", None, 0, 0, [sep("EPILOGUE", "Ba tháng sau",
                                       "Mở khi đã mở từ 5 cảnh thưởng trong tuyến Mina (Tập 1–10)")], "", 340))

P.append(("K18", "K18", K18_PT, 220, [
    bub(24, -275, 480, "Welcome to Seoul, Team Lead.", "Chào mừng tới Seoul, Trưởng nhóm.", (540, 440)),
    bub(560, -275, 496, "You're late. …I missed you.", "Anh đến muộn. …Em nhớ anh.", (580, 440)),
    cap(24, 24, "Ba tháng sau · Sân bay Incheon", "Họp khởi động dự án “Seoul” tại trụ sở"),
    scr(K18_Q, 560, 334, K18_SIGN, K18_PT, S23),
    raw(170, 1642, '<span class="pill-k">EPILOGUE</span><span>Ảnh hiếm “Incheon”</span>',
        w=740, cls="pill pill-gold"),
], "", None))
