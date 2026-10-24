"""EP06 · The Weekly Meeting — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep06/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 6
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 6
TITLE = 'The Weekly Meeting'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.bub.khoa{border-color:#3b3b45}
.bub.yoon{border-color:#25324a}
.bub.whisper{border-style:dashed;border-width:3.5px}
.egg{font-size:24px}
.nowrap{white-space:nowrap}
.lock-pill{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 22px;border-radius:999px;
  background:rgba(10,10,18,.72);border:1.5px solid rgba(242,196,90,.7);color:#ffe7a8;font-weight:700;font-size:22px;z-index:4;white-space:nowrap}
.msg{height:760px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;
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
.sl{width:800px;height:470px;padding:34px 44px;background:#f7f9fc;color:#1b2333;display:flex;flex-direction:column}
.sl-bar{background:#1f3b73;color:#fff;font-weight:900;font-size:58px;letter-spacing:4px;padding:18px 28px;border-radius:10px}
.sl-sub{font-weight:600;font-size:30px;color:#4b5873;margin-top:16px}
.sl-row{height:22px;border-radius:11px;background:#d9dfea;margin-top:26px}
.sl-row.w1{width:86%}.sl-row.w2{width:72%}.sl-row.w3{width:58%}
.sl-foot{margin-top:auto;align-self:flex-end;font-weight:700;font-size:28px;color:#7a869c}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


K01_PT = 60
_s1 = 1080 / 1264
K01_Q = [(x * _s1, y * _s1) for x, y in [(662, 312), (1053, 321), (1024, 542), (625, 549)]]
K01_SCREEN = ('<div class="sl"><div class="sl-bar">HOLD REPORT</div>'
              '<div class="sl-sub">Weekly Meeting · Wed 08:00</div>'
              '<div class="sl-row w1"></div><div class="sl-row w2"></div><div class="sl-row w3"></div>'
              '<div class="sl-foot">1 / 20</div></div>')

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 6</div>'
        '<div class="title">The Weekly Meeting</div>'
        '<div class="tag">“Slowly. Like you\'re teaching me.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", K01_PT, 200, [
    cap(24, 24, "Thứ Tư · 07:40", "Phòng OQC"),
    scr(K01_Q, 800, 470, K01_SCREEN, K01_PT),
    th(30, 745, 820, "Three hours of sleep. Twenty slides. In English.",
       "(Ngủ được ba tiếng. Hai mươi slide. Bằng tiếng Anh.)"),
], "", None))

P.append(("K02", "K02", 60, 60, [
    bub(24, 60, 380, "You look like you didn't sleep.", "Trông anh như cả đêm không ngủ.", (560, 380)),
    bub(744, 120, 316, "Drink this. Then breathe.", "Uống đi. Rồi hít thở.", (600, 400)),
], "", None))

P.append(("K03", "K03", 250, 60, [
    bub(24, -225, 470, "Minh. The HOLD report.", "Minh. Báo cáo HOLD.", (572, 190), who="yoon"),
    bub(560, -165, 380, "In English, please.", "Bằng tiếng Anh.", (590, 190), who="yoon"),
    cap(24, 24, "08:00", "Phòng họp tầng 3"),
], "", None))

P.append(("K04", "K04", 60, 160, [
    bub(24, 40, 360, "Is this a report or a race?", "Đây là báo cáo hay cuộc đua vậy?", (500, 300), who="khoa"),
    th(30, 985, 640, "Too fast… I'm reading too fast.", "(Nhanh quá… mình đang đọc quá nhanh.)"),
], "", None))

P.append(("K05", "K05", 60, 220, [
    th(610, 40, 440, "…Her shoe. Again.", "(…Lại là chân cô ấy.)"),
    bub(260, 755, 620, "Slowly. Like you're teaching me.", "Chậm thôi. Như thể anh đang dạy em.",
        (300, 420), who="mina whisper"),
], "", None))

P.append(("K06", "K06", 60, 60, [
    bub(24, 40, 360, "You know this better than anyone in this room.",
        "Anh hiểu chuyện này hơn bất kỳ ai trong phòng.", (520, 360), who="mina whisper"),
], "", None))

P.append(("K06B", "K06B", 130, 160, [
    raw(90, -100, '<span class="pill-k">TRỨNG PHỤC SINH</span><span>chỉ hiện nếu đã mở cảnh thưởng Tập 5</span>',
        w=900, cls="pill pill-gold egg"),
    bub(24, 40, 330, "…Nice collar, Minh.", "…Cổ áo đẹp đấy, Minh.", (500, 300), who="khoa"),
    th(30, 975, 680, "The lipstick. I forgot to wash it.", "(Vết son. Mình quên giặt.)"),
], "", None))

P.append(("K07", "K07", 60, 60, [
    bub(24, 30, 220, "Stop.", "Dừng lại.", (520, 220), who="yoon"),
    bub(720, 40, 336, "Close the laptop. No slides.", "Gập laptop lại. Không slide.", (600, 230), who="yoon"),
], "", None))

P.append(("K08", "K08", 450, 60, [
    bub(24, -425, 640, "Think about the problem you had to deal with this week.",
        "Hãy nghĩ về sự cố anh phải xử lý tuần này.", (300, -60), who="yoon"),
    bub(380, -225, 676, "What happened, who was involved, and what did you do to solve it?",
        "Chuyện gì đã xảy ra, những ai liên quan, và anh đã làm gì để giải quyết?", (540, 480), who="yoon"),
], "", None))

P.append(("K09", "K09", 60, 60, [
    bub(24, 40, 340, "In your own words, Minh.", "Bằng lời của anh, Minh.", (530, 380), who="kang"),
], "", None))

P.append(("K10", "K10", 60, 60, [
    bub(24, 80, 380, "Your words. Not the slides.", "Lời của anh. Không phải slide.", (560, 430), who="mina whisper"),
    bub(24, 400, 320, "I'm right here.", "Em ở ngay đây.", (560, 460)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(220, 40, f'{LOCK.format(s=30)}<span>Photocard “Under the Table” đang khóa · nói đạt để mở</span>',
        w=640, cls="lock-pill"),
    raw(70, 140, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000006 · Công việc</div>'
        '<div class="k11-en">Think about a problem you had to deal with at work recently. What happened, '
        'who was involved, and what did you do to solve it?</div>'
        '<div class="k11-vi">Kể cho cả phòng họp về một sự cố anh vừa xử lý ở công ty: chuyện gì đã xảy ra, '
        'những ai liên quan và anh đã làm gì để giải quyết.</div>'
        '<div class="chips"><span>50–70 giây</span><span>70+ từ</span><span>5+ từ nối</span>'
        '<span>Kể ở thì quá khứ</span><span>Nhắc người liên quan</span></div>'
        '<div class="k11-foot">Bối cảnh → sự cố → ai liên quan → anh đã làm gì (2–3 bước) → kết quả, bài học<br>'
        'Kể chung chung, không nêu tên khách hàng, mã model hay số liệu nội bộ<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 60, 160, [
    bub(24, 40, 360, "Clear. Honest. No excuses.", "Rõ ràng. Trung thực. Không đổ lỗi.", (540, 330), who="yoon"),
    bub(720, 60, 340, "That's a report I can send to Seoul.", "Báo cáo này tôi gửi trụ sở được.",
        (600, 330), who="yoon"),
    th(30, 985, 700, "Did Team Leader Yoon just… smile?", "(Team Leader Yoon vừa… cười à?)"),
], "", None))

P.append(("K13", "K13", 60, 60, [
    bub(24, 80, 330, "…You gave my team the credit.", "…Anh ghi công cho đội tôi.", (520, 420), who="khoa"),
    bub(790, 150, 270, "…Thanks.", "…Cảm ơn.", (640, 420), who="khoa"),
], "", None))

P.append(("K14", "K14", 260, 220, [
    bub(24, -235, 500, "You talk too fast when you're nervous.", "Anh mà run là nói nhanh lắm.", (560, 230)),
    bub(560, -235, 496, "But you didn't stop. I liked that.", "Nhưng anh không dừng lại. Em thích thế.", (600, 230)),
    cap(24, 24, "09:05", "Phòng họp trống"),
    th(30, 745, 820, "The door is open. Anyone could walk in…", "(Cửa đang mở. Ai cũng có thể bước vào…)"),
], "", None))

P.append(("K15", "K15", 460, 160, [
    bub(24, -435, 480, "Minh. One more thing.", "Minh. Còn một việc.", (300, -60), who="yoon"),
    bub(340, -230, 716, "Your CL3 pre-interview is Friday morning. Be ready.",
        "Sáng thứ Sáu là buổi phỏng vấn sơ bộ CL3 của anh. Chuẩn bị đi.", (870, 380), who="yoon"),
    sfx(850, 190, "Cạch.", 70, -8),
    th(30, 1480, 640, "Why did Mina look away?", "(Sao Mina lại nhìn đi chỗ khác?)"),
], "", None))

P.append(("K15C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">23:14</div>'
        '<div class="msg-date">Thứ Tư</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">You were good today.</div><div class="vi">Hôm nay anh giỏi lắm.</div></div>'
        '<div class="msg-b"><div class="en">…Next time, I\'ll fix your tie before the meeting. Not after.</div>'
        '<div class="vi">…Lần sau em chỉnh cà vạt cho anh trước buổi họp. Không phải sau.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 760))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 7 · Blackout</div>'
        '<div class="end-s">Thứ Năm 21:10 · Phòng ESD</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 7 · Photocard “Under the Table”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“Under the Table” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 260, 190, [
    bub(24, -235, 720, "You told them the ending. Not the story.", "Anh mới kể cái kết. Chưa kể câu chuyện.",
        (520, 380), who="mina whisper"),
    bub(24, 40, 340, "What happened? Who was there? What did you do, step by step?",
        "Chuyện gì xảy ra? Ai có mặt? Anh đã làm gì, từng bước một?", (520, 400), who="mina whisper"),
    raw(170, 1011, f'{MIC.format(s=40)}<span>NÓI LẠI · Team Leader Yoon đang chờ</span>', w=740, cls="pill nowrap"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 60, 220, [
    cap(24, 24, "12:30", "Sân thượng văn phòng"),
    bub(744, 130, 316, "I made too much. Open.", "Em làm dư. Há miệng nào.", (580, 450)),
    bub(680, 1180, 380, "…It's just kimbap, Minh. Don't look at me like that.",
        "…Chỉ là kimbap thôi mà, Minh. Đừng nhìn em kiểu đó.", (580, 470)),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Kimbap”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
