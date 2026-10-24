"""EP07 · Blackout — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep07/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 7
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 7
TITLE = 'Blackout'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.bub.khoa{border-color:#3b3b45}
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
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 7</div>'
        '<div class="title">Blackout</div>'
        '<div class="tag">“Is it the dark… or me?”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", 60, 200, [
    cap(24, 24, "Thứ Năm · 21:10", "Phòng ESD · lô hàng xuất lúc 23:00"),
    th(30, 745, 760, "Busiest day of the year. Almost over.", "(Ngày bận nhất năm. Sắp xong rồi.)"),
], "", None))

P.append(("K02", "K02", 60, 60, [
    bub(24, 80, 380, "Last box. Then dinner's on me.", "Hộp cuối. Xong em mời anh ăn tối.", (600, 430)),
    bub(770, 100, 290, "We earned it today.", "Hôm nay mình xứng đáng mà.", (660, 420)),
], "", None))

P.append(("K03", "K03", 60, 60, [
    sfx(60, 330, "ẦM!", 120, -10, cls="sfx-r"),
    sfx(360, 30, "Phụt.", 60, 4),
    bub(810, 60, 250, "…Minh?", "…Minh?", (680, 250)),
], "", None))

P.append(("K04", "K04", 60, 60, [
    th(30, 30, 600, "Electronic lock. No power… no way out.", "(Khóa điện tử. Mất điện… không ra được.)"),
    sfx(470, 860, "Cạch. Cạch.", 64, -6),
], "", None))

P.append(("K05", "K05", 230, 150, [
    bub(24, -205, 600, "I… don't do well in the dark.", "Em… sợ bóng tối lắm.", (540, 500)),
    th(30, 1480, 560, "Her hand is shaking.", "(Tay cô ấy đang run.)"),
], "", None))

P.append(("K06", "K06", 60, 200, [
    bub(24, 80, 300, "Don't let go.", "Đừng buông tay em.", (470, 580)),
    th(30, 1630, 700, "Ten centimeters. Maybe less.", "(Mười phân. Có khi còn ít hơn.)"),
], "", None))

P.append(("K07", "K07", 60, 150, [
    bub(24, 60, 400, "The AC's dead. It's getting so hot in here.", "Điều hòa tắt rồi. Nóng quá.", (560, 470)),
    th(30, 1480, 560, "Don't look. Don't look.", "(Đừng nhìn. Đừng nhìn.)"),
], "", None))

P.append(("K08", "K08", 60, 60, [
    bub(24, 30, 360, "Sit with me. And talk.", "Ngồi với em. Rồi nói chuyện đi.", (520, 200)),
    bub(790, 40, 270, "Your voice helps.", "Nghe giọng anh em đỡ sợ.", (600, 210)),
], "", None))

P.append(("K09", "K09", 290, 60, [
    bub(24, -265, 720, "Tell me about a day at work that was especially busy or stressful.",
        "Kể em nghe về một ngày làm việc đặc biệt bận rộn hay căng thẳng.", (580, 430)),
], "", None))

P.append(("K10", "K10", 60, 240, [
    bub(640, 40, 420, "Why was it so busy, what did you do… and how did the day end?",
        "Vì sao bận đến thế, anh đã làm gì… và ngày đó kết thúc ra sao?", (480, 450)),
    bub(360, 1640, 690, "Keep talking until the lights come back.", "Cứ nói đến khi đèn sáng lại nhé.", (420, 500)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(260, 40, f'{LOCK.format(s=30)}<span>Photocard “Blackout” đang khóa · nói đạt để mở</span>',
        w=560, cls="lock-pill"),
    raw(70, 140, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000009 · Công việc</div>'
        '<div class="k11-en">Tell me about a day at work that was especially busy or stressful. Why was it so busy, '
        'what did you do, and how did the day end?</div>'
        '<div class="k11-vi">Kể cho Mina về một ngày làm việc đặc biệt bận rộn hoặc căng thẳng: vì sao bận như vậy, '
        'anh đã làm gì, và ngày đó kết thúc thế nào.</div>'
        '<div class="chips"><span>50–70 giây</span><span>70+ từ</span><span>5+ từ nối</span>'
        '<span>Kể ở thì quá khứ</span><span>Có câu kết</span></div>'
        '<div class="k11-foot">Bối cảnh (khi nào, ở đâu) → vì sao bận → anh đã làm gì → ngày đó kết thúc ra sao, vì sao còn nhớ<br>'
        'Câu kết: in the end · finally · at the end of the day<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 200, 60, [
    bub(24, -175, 560, "You survived that day.", "Anh đã vượt qua được ngày đó.", (480, 420)),
    bub(790, 60, 270, "…So we'll survive tonight.", "…Vậy đêm nay mình cũng sẽ qua.", (650, 420)),
], "", None))

P.append(("K13", "K13", 260, 150, [
    bub(24, -235, 520, "Your heart's beating so fast, Minh.", "Tim anh đập nhanh quá, Minh.", (500, 500)),
    bub(570, -235, 486, "Is it the dark… or me?", "Vì bóng tối… hay vì em?", (560, 500)),
    th(30, 1480, 480, "Five centimeters…", "(Năm phân…)"),
], "", None))

P.append(("K14", "K14", 230, 60, [
    bub(24, -205, 560, "Power's back. Mina-ssi, are you—", "Có điện rồi. Mina-ssi, cô có—", (430, 210), who="khoa"),
    bub(640, -170, 240, "…Oh.", "…Ồ.", (440, 220), who="khoa"),
    sfx(540, 20, "Tách!", 70, -6),
    sfx(170, 290, "Bíp.", 54, -4),
], "", None))

P.append(("K15", "K15", 260, 150, [
    bub(300, -235, 640, "Enjoy it while it lasts, Minh. You'll see tomorrow.",
        "Tận hưởng đi khi còn có thể, Minh. Mai anh sẽ biết.", (930, 140), who="khoa"),
    bub(24, 40, 330, "I'm fine, Khoa-ssi.", "Tôi ổn, Khoa-ssi.", (480, 440)),
    th(30, 1480, 420, "…See what?", "(…Biết gì?)"),
], "", None))

P.append(("K15C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">00:40</div>'
        '<div class="msg-date">Thứ Sáu</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">About what I asked you in the dark…</div><div class="vi">Câu em hỏi anh trong bóng tối…</div></div>'
        '<div class="msg-b"><div class="en">You still haven\'t answered.</div><div class="vi">Anh vẫn chưa trả lời đấy.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 720))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 8 · The Evaluator</div>'
        '<div class="end-s">Thứ Sáu 08:30 · Hộp thư đến</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 8 · Photocard “Blackout”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“Blackout” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 400, 190, [
    bub(24, -375, 600, "That's it? It's still dark, Minh.", "Hết rồi à? Vẫn tối mà, Minh.", (300, -40)),
    bub(360, -225, 696, "Why was it busy? What did you do first? How did it end?",
        "Vì sao bận? Anh làm gì trước? Rồi kết thúc ra sao?", (460, 420)),
    raw(240, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina vẫn đang sợ</span>', w=600, cls="pill nowrap"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 230, 220, [
    bub(24, -205, 470, "You're getting wet.", "Anh ướt hết rồi kìa.", (520, 480)),
    bub(540, -205, 500, "…Then come closer.", "…Vậy thì lại gần đây.", (580, 480)),
    cap(24, 24, "22:30", "Cổng nhà máy"),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “One Umbrella”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
