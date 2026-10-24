"""EP01 · Explain It to Me — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep01/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 1
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 1
TITLE = 'Explain It to Me'
QBG = 'K10'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""""""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1130, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 1</div>'
        '<div class="title">Explain It to Me</div>'
        '<div class="tag">“Let\'s handle this together.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", 70, 60, [
    cap(28, 28, "Thứ Hai · 05:40", "Nova Electronics Vietnam · KCN Sông Cầu"),
], "", None))

P.append(("K02", "K02", 60, 60, [
    raw(258, 326, '<div class="scr1">LOT HOLD</div><div class="scr2">20,000 units</div>', w=350, cls="screen"),
    sfx(700, 120, "BÍP!", 92, -10, "sfx-r"),
    sfx(860, 250, "BÍP!", 76, 9, "sfx-r"),
], "", None))

P.append(("K03", "K03", 60, 60, [
    sfx(150, 1240, "Cộp.", 60, -8),
    sfx(790, 1320, "Cộp.", 60, 7),
], "", None))

P.append(("K04", "K04", 190, 60, [
    bub(40, -165, 560, "You're Minh. The OQC manager for this line.",
        "Anh là Minh. Quản lý OQC của line này.", (560, 470)),
    cap(24, 950, "Mina · 29", "Kỹ sư chất lượng · trụ sở Seoul"),
], "", None))

P.append(("K05", "K05", 60, 190, [
    bub(24, 34, 400, "Twenty thousand phones. On hold at five forty a.m.",
        "Hai mươi nghìn điện thoại. Bị HOLD lúc 5 giờ 40 sáng.", (540, 265)),
    bub(690, 330, 370, "Explain it to me. In English.",
        "Giải thích cho tôi. Bằng tiếng Anh.", (575, 270)),
    th(150, 730, 780, "In English… right now?", "(Bằng tiếng Anh… ngay bây giờ á?)"),
], "", None))

P.append(("K06", "K06", 230, 60, [
    bub(320, -205, 740,
        "Minh-ssi. She just flew in from headquarters. Her report goes straight to Seoul.",
        "Anh Minh. Cô ấy vừa bay từ trụ sở sang. Báo cáo của cô ấy gửi thẳng về Seoul.",
        (775, 400), who="kang"),
    bub(18, 130, 300, "I don't report everything.", "Tôi không báo cáo mọi thứ.", (398, 410)),
], "", None))

P.append(("K07", "K07", 170, 60, [
    th(30, -140, 620, "The lot… uh… I… the…", "(Lô hàng… ờ… tôi… cái…)"),
    bub(720, 70, 340, "Wait. Slow down. Breathe.", "Khoan. Chậm thôi. Thở đã.", (610, 440)),
    bub(24, 790, 440, "I'm not asking for a perfect answer.",
        "Tôi không cần một câu trả lời hoàn hảo.", (560, 470)),
], "", None))

P.append(("K08", "K08", 60, 60, [
    bub(24, 30, 430, "I don't fix problems with strangers.",
        "Tôi không xử lý sự cố với người lạ.", (575, 212)),
    bub(690, 360, 372, "So before we begin, I'd like to get to know you a little.",
        "Nên trước khi bắt đầu, tôi muốn biết về anh một chút.", (590, 225)),
], "", None))

P.append(("K09", "K09", 450, 250, [
    bub(24, -425, 600, "Tell me about your job, the people in your life…",
        "Kể tôi nghe về công việc của anh, những người trong cuộc sống của anh…", (430, 20)),
    bub(430, -205, 626, "…and the things you enjoy doing in your free time.",
        "…và những việc anh thích làm lúc rảnh.", (620, 30)),
    th(110, 640, 860,
       "Why does this feel less like an interview… and more like she's trying to figure me out?",
       "(Sao cảm giác không giống phỏng vấn… mà như cô ấy đang tìm hiểu mình?)"),
], "", None))

P.append(("K10", "K10", 170, 60, [
    bub(30, -140, 380, "Forty-five seconds.", "Bốn mươi lăm giây.", (525, 390)),
    bub(636, 830, 424, "Don't give me a speech. Talk to me.",
        "Đừng đọc diễn văn. Nói chuyện với tôi.", (560, 420)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(70, 150, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000002 · Giới thiệu bản thân</div>'
        '<div class="k11-en">Before we begin, I\'d like to get to know you a little. Tell me about your job, '
        'the people in your life, and the things you enjoy doing in your free time.</div>'
        '<div class="k11-vi">Kể cho Mina về công việc, những người trong cuộc sống của anh và việc anh thích làm lúc rảnh.</div>'
        '<div class="chips"><span>30–45 giây</span><span>50+ từ</span><span>4+ từ nối</span><span>đủ 3 ý</span></div>'
        '<div class="k11-foot">Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 170, 170, [
    bub(590, -150, 460, "Hm. Not bad, Minh.", "Hừm. Không tệ, Minh.", (500, 405)),
    bub(700, 320, 360, "You're more interesting than your reports.",
        "Anh thú vị hơn mấy bản báo cáo của anh đấy.", (545, 420)),
    th(30, 980, 560, "Was that… a compliment?", "(Vừa rồi… là khen à?)"),
], "", None))

P.append(("K13", "K13", 60, 60, [
    bub(24, 100, 330, "Let's handle this together.", "Chúng ta cùng xử lý vụ này.", (565, 395)),
], "", None))

P.append(("K14", "K14", 60, 60, [
    bub(640, 380, 420,
        "Eleven tonight. OQC room. You need to see something before I report to Seoul.",
        "Mười một giờ tối nay. Phòng OQC. Anh cần xem một thứ trước khi tôi báo cáo về Seoul.",
        (590, 320)),
], "", None))

P.append(("K15", "K15", 60, 300, [
    raw(36, 36, (
        '<div class="lbl-row">HOLD ORDER · LINE 3 · 20,000 UNITS</div>'
        '<div class="lbl-row">EFFECTIVE: MON 05:40</div>'
        '<div class="lbl-row lbl-red">PREPARED: SUN 21:30</div>'), w=640, cls="label"),
    th(40, 720, 640, "Prepared… Sunday night?", "(Soạn từ… tối Chủ nhật?)"),
    th(300, 920, 750, "She knew before the lot was even on hold.", "(Cô ấy biết trước cả khi lô bị HOLD.)"),
], "", None))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 2 · The Black Folder</div>'
        '<div class="end-s">11:00 PM · Phòng OQC</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 2 · Photocard “5:40 AM”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 60, 190, [
    bub(24, 46, 280, "That's it?", "Hết rồi à?", (548, 380)),
    bub(24, 730, 440, "I still don't know you, Minh. Try again.",
        "Tôi vẫn chưa biết gì về anh, Minh. Nói lại đi.", (540, 400)),
    raw(290, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina đang chờ</span>', w=500, cls="pill"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 60, 220, [
    cap(24, 24, "06:30"),
    bub(20, 110, 330, "Black, no sugar. I guessed.", "Đen, không đường. Tôi đoán vậy.", (545, 365)),
    bub(722, 250, 338, "Don't tell Mentor Kang I was nice to you.",
        "Đừng kể với Mentor Kang là tôi tử tế với anh nhé.", (590, 370)),
    bub(600, 990, 460, "And the folder on my desk? Forget you saw it. For now.",
        "Còn tập hồ sơ trên bàn tôi? Quên là anh đã thấy nó đi. Tạm thời thế.", (590, 420)),
    raw(120, 1482, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Black, No Sugar”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
