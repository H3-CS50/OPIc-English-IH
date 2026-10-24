"""EP08 · The Evaluator — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep08/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 8
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 8
TITLE = 'The Evaluator'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.bub.khoa{border-color:#3b3b45}
.bub.yoon{border-color:#25324a}
.bub.whisper{border-style:dashed;border-width:3.5px}
.nowrap{white-space:nowrap}
.lock-pill{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 22px;border-radius:999px;
  background:rgba(10,10,18,.72);border:1.5px solid rgba(242,196,90,.7);color:#ffe7a8;font-weight:700;font-size:22px;z-index:4;white-space:nowrap}
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
.ml{width:780px;height:560px;padding:34px 40px;background:#fbfcfe;color:#1b2333;display:flex;flex-direction:column;gap:14px}
.ml-top{font-weight:800;font-size:30px;color:#7a869c;letter-spacing:2px;text-transform:uppercase;border-bottom:3px solid #e1e6ef;padding-bottom:12px}
.ml-subj{font-weight:900;font-size:42px;line-height:1.15;color:#1f3b73}
.ml-row{font-weight:600;font-size:30px;line-height:1.25}
.ml-hl{font-weight:900;font-size:32px;line-height:1.2;color:#b3123a;background:#ffe3ea;padding:8px 12px;border-radius:8px}
.trans{background:rgba(24,24,38,.95);border:1.5px solid rgba(255,255,255,.16);border-radius:26px;padding:22px 30px;color:#fff;z-index:4}
.tr-k{font-weight:800;font-size:22px;letter-spacing:4px;color:#ff6fa6;margin-bottom:8px}
.tr-l{font-weight:500;font-size:27px;line-height:1.35;color:#dcdcea}
.tr-l b{color:#ffd1e2}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


K01_PT = 60
_s = 1080 / 1264
K01_Q = [(x * _s, y * _s) for x, y in [(133, 233), (565, 245), (615, 540), (183, 601)]]
K01_SCREEN = ('<div class="ml"><div class="ml-top">Inbox</div>'
              '<div class="ml-row"><b>From:</b> HR</div>'
              '<div class="ml-subj">CL3 Promotion — Pre-interview</div>'
              '<div class="ml-row"><b>Candidate:</b> Minh · Fri 09:30 · Room 5F</div>'
              '<div class="ml-row"><b>Panel:</b> Team Leader Yoon · Mentor Kang ·</div>'
              '<div class="ml-hl">Mina (HQ Quality) — CL Promotion Evaluator</div></div>')

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 8</div>'
        '<div class="title">The Evaluator</div>'
        '<div class="tag">“Every night was real. Every word.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", K01_PT, 470, [
    cap(700, 24, "Thứ Sáu · 08:30", "Phòng OQC"),
    scr(K01_Q, 780, 560, K01_SCREEN, K01_PT),
    raw(60, 755, (
        '<div class="tr-k">EMAIL · DỊCH</div>'
        '<div class="tr-l">Từ: Nhân sự · Phỏng vấn sơ bộ thăng cấp CL3</div>'
        '<div class="tr-l">Ứng viên: Minh · 09:30 thứ Sáu · Phòng 5F</div>'
        '<div class="tr-l">Hội đồng: Team Leader Yoon · Mentor Kang · <b>Mina (Chất lượng trụ sở) — người chấm thăng cấp CL</b></div>'),
        w=960, cls="trans"),
    th(30, 1015, 640, "Mina… is my evaluator?", "(Mina… là người chấm mình?)"),
], "", None))

P.append(("K02", "K02", 260, 60, [
    bub(24, -235, 420, "You didn't know?", "Anh không biết à?", (520, 300), who="khoa"),
    bub(24, 560, 340, "I got the same email yesterday. She's been grading us since Monday.",
        "Hôm qua tôi cũng nhận email đó. Cô ấy chấm bọn mình từ hôm thứ Hai rồi.", (440, 520), who="khoa"),
], "", None))

P.append(("K03", "K03", 230, 170, [
    bub(24, -205, 560, "All those late nights…", "Mấy đêm làm muộn đó…", (480, 330), who="khoa whisper"),
    bub(730, 60, 330, "Did you really think they were about you?", "Anh tưởng thật sự là vì anh à?",
        (650, 330), who="khoa"),
    th(30, 985, 900, "The black folder. The factory walk. The dark room…",
       "(Tập hồ sơ đen. Buổi đi xưởng. Căn phòng tối…)"),
], "", None))

P.append(("K04", "K04", 300, 60, [
    bub(24, -275, 460, "Mina-ssi. We're starting.", "Mina-ssi. Bắt đầu thôi.", (290, 160), who="yoon"),
    bub(560, -275, 300, "Minh, I—", "Minh, em—", (560, 200)),
    cap(820, 24, "09:25", "Hành lang tầng 5"),
], "", None))

P.append(("K05", "K05", 230, 60, [
    bub(24, -205, 400, "Sit down, Minh.", "Mời ngồi, Minh.", (542, 175), who="yoon"),
    cap(620, -190, "09:30", "Phòng phỏng vấn sơ bộ CL3"),
], "", None))

P.append(("K06", "K06", 230, 170, [
    bub(24, -205, 640, "Good morning. I'm Mina, HQ Quality.", "Chào anh. Tôi là Mina, phòng chất lượng trụ sở.",
        (540, 300)),
    th(30, 985, 680, "So formal. Like we've never met.", "(Xa cách thế. Như chưa từng quen.)"),
], "", None))

P.append(("K07", "K07", 230, 60, [
    bub(24, -205, 560, "Mina-ssi will ask the first question.", "Câu đầu tiên do Mina-ssi hỏi.", (520, 230),
        who="kang"),
], "", None))

P.append(("K08", "K08", 260, 60, [
    bub(24, -235, 760, "Quality standards in factories have changed over time.",
        "Tiêu chuẩn chất lượng ở các nhà máy đã thay đổi theo thời gian.", (540, 330)),
], "", None))

P.append(("K09", "K09", 260, 60, [
    bub(24, -235, 820, "How has the way your team checks product quality changed since you started working?",
        "Từ khi anh bắt đầu đi làm, cách đội anh kiểm tra chất lượng sản phẩm đã thay đổi thế nào?", (300, -60)),
    sfx(560, 470, "Cộc. Cộc.", 66, -6),
], "", None))

P.append(("K10", "K10", 230, 300, [
    bub(24, -205, 460, "Take your time, Minh.", "Cứ từ từ, Minh.", (520, 330)),
    th(30, 1640, 860, "Two taps. Our signal from the meeting. “Slowly.”",
       "(Hai cái gõ. Ám hiệu của hai đứa từ buổi họp. “Chậm thôi.”)"),
    th(30, 1790, 600, "She's still on my side.", "(Cô ấy vẫn đứng về phía mình.)"),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(230, 40, f'{LOCK.format(s=30)}<span>Photocard “The Evaluator” đang khóa · nói đạt để mở</span>',
        w=620, cls="lock-pill"),
    raw(70, 140, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000137 · Công việc OQC</div>'
        '<div class="k11-en">Quality standards in factories have changed over time. How has the way your team '
        'checks product quality changed since you started working?</div>'
        '<div class="k11-vi">Kể cho hội đồng: từ khi anh bắt đầu đi làm, cách đội anh kiểm tra chất lượng '
        'sản phẩm đã thay đổi thế nào.</div>'
        '<div class="chips"><span>50–70 giây</span><span>75+ từ</span><span>5+ từ nối</span>'
        '<span>Trước kia → bây giờ</span></div>'
        '<div class="k11-foot">Trước kia (used to…) → bây giờ → 2 điểm khác biệt cụ thể → vì sao thay đổi, tác động<br>'
        'Nói thay đổi chung của nghề, không nêu quy trình nội bộ<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 60, 170, [
    th(30, 985, 700, "For one second… she smiled.", "(Chỉ một giây thôi… cô ấy đã cười.)"),
], "", None))

P.append(("K13", "K13", 300, 60, [
    bub(24, -275, 500, "That's the answer of someone who has really done the job.",
        "Đó là câu trả lời của người thật sự làm nghề.", (282, 150), who="kang"),
    bub(560, -275, 496, "Thank you, Minh. Results next week.", "Cảm ơn anh, Minh. Tuần sau có kết quả.",
        (740, 150), who="yoon"),
], "", None))

P.append(("K14", "K14", 460, 220, [
    bub(24, -435, 360, "Minh. Wait.", "Minh. Đợi đã.", (300, -60)),
    bub(400, -435, 656, "I was going to tell you. After today.", "Em định nói với anh. Sau hôm nay.", (560, 300)),
    cap(24, 24, "10:05", "Cầu thang thoát hiểm"),
    bub(260, 1640, 560, "Every night was real. Every word.", "Mọi đêm đều là thật. Mọi lời đều thật.",
        (500, 1400)),
], "", None))

P.append(("K15", "K15", 260, 220, [
    bub(24, -235, 520, "…You're right. Not like this.", "…Anh nói đúng. Không phải thế này.", (520, 330)),
    bub(600, -235, 456, "Give me one day.", "Cho em một ngày.", (560, 330)),
    th(30, 1640, 700, "Not while she's grading me.", "(Không phải khi cô ấy còn đang chấm mình.)"),
], "", None))

P.append(("K15C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">23:50</div>'
        '<div class="msg-date">Thứ Sáu</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">I never pretended. Not once.</div><div class="vi">Em chưa từng giả vờ. Chưa một lần nào.</div></div>'
        '<div class="msg-b"><div class="en">Tomorrow, 8 PM. OQC room. Please come.</div><div class="vi">Mai, 8 giờ tối. Phòng OQC. Anh đến nhé.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 720))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 9 · Not Because of Me</div>'
        '<div class="end-s">Thứ Bảy 20:00 · Phòng OQC</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 9 · Photocard “The Evaluator”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“The Evaluator” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 400, 190, [
    bub(24, -375, 640, "You told me how it is now. What was it like before?",
        "Anh mới nói bây giờ thế nào. Trước kia thì sao?", (300, -40)),
    bub(360, -205, 696, "Then and now. Two real differences. And why it changed.",
        "Trước và nay. Hai điểm khác thật sự. Và vì sao thay đổi.", (540, 300)),
    raw(240, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Hội đồng đang chờ</span>', w=600, cls="pill nowrap"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 60, 220, [
    cap(110, 24, "19:00", "Phòng phỏng vấn trống"),
    bub(100, 150, 280, "I hoped you'd come back.", "Em đã mong anh quay lại.", (500, 380)),
    bub(760, 330, 290, "Tomorrow I stop being your evaluator. …Then I'm just Mina.",
        "Mai em thôi làm người chấm của anh. …Rồi em chỉ là Mina thôi.", (600, 400)),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Just Mina”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
