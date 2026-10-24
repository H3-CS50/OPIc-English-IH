"""EP02 · The Black Folder — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep02/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 2
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 2
TITLE = 'The Black Folder'
QBG = 'K10'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1130, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 2</div>'
        '<div class="title">The Black Folder</div>'
        '<div class="tag">“This stays between us.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", 70, 60, [
    cap(28, 28, "Thứ Hai · 22:57", "Phòng OQC · chỉ còn hai người"),
], "", None))

P.append(("K02", "K02", 60, 60, [
    sfx(70, 560, "Soạt.", 64, -6),
], "", None))

P.append(("K03", "K03", 210, 60, [
    bub(30, -185, 640, "Before you open this, I need you to promise me one thing.",
        "Trước khi anh mở nó, tôi cần anh hứa một điều.", (540, 318)),
], "", None))

P.append(("K04", "K04", 160, 60, [
    th(30, -135, 520, "Promise… what?", "(Hứa… điều gì?)"),
    bub(24, 760, 480, "This stays between us. Until we know what really happened.",
        "Chuyện này chỉ hai ta biết. Cho đến khi rõ chuyện gì thật sự đã xảy ra.", (540, 365)),
], "", None))

P.append(("K05", "K05", 60, 250, [
    raw(30, 26, (
        '<div class="lbl-row">CUSTOMER CLAIM · SUN 19:10</div>'
        '<div class="lbl-row">3 UNITS · FRAME SCRATCH</div>'
        '<div class="lbl-row lbl-red">HOLD ORDER · PREPARED: SUN 21:30</div>'), w=640, cls="label"),
    th(60, 700, 960,
       "The customer complained on Sunday evening… and Seoul held the lot that night.",
       "(Khách hàng khiếu nại tối Chủ nhật… và trụ sở HOLD lô ngay đêm đó.)"),
], "", None))

P.append(("K06", "K06", 60, 60, [
    bub(680, 70, 380, "Seoul thinks your team missed it.",
        "Trụ sở cho rằng đội anh đã bỏ sót.", (385, 330)),
    bub(700, 400, 330, "I don't. Not yet.", "Tôi thì chưa nghĩ vậy.", (395, 335)),
], "", None))

P.append(("K07", "K07", 60, 60, [
    bub(730, 80, 330, "Then prove me right.", "Vậy hãy chứng minh là tôi đúng.", (545, 382)),
], "", None))

P.append(("K08", "K08", 60, 60, [
    bub(736, 24, 326, "Twenty samples from the held lot. We check them again. Together.",
        "Hai mươi mẫu từ lô bị HOLD. Chúng ta kiểm lại. Cùng nhau.", (560, 185)),
], "", None))

P.append(("K09", "K09", 450, 60, [
    bub(24, -425, 560, "But first, I want to hear it from you.",
        "Nhưng trước hết, tôi muốn nghe từ chính anh.", (420, 20)),
    bub(400, -215, 656, "You check the quality of products before they're shipped to customers…",
        "Anh kiểm tra chất lượng sản phẩm trước khi giao cho khách hàng…", (640, 30)),
], "", None))

P.append(("K10", "K10", 230, 60, [
    bub(24, -205, 660, "So explain to me, step by step, how you usually inspect a product.",
        "Vậy hãy giải thích cho tôi, từng bước, anh thường kiểm tra một sản phẩm thế nào.", (540, 316)),
    bub(24, 800, 420, "Slowly. Like you're teaching me.", "Chậm thôi. Như thể anh đang dạy tôi.", (530, 330)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(70, 110, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000010 · Công việc OQC</div>'
        '<div class="k11-en">In your job, you check the quality of products before they are shipped to customers. '
        'Explain to me, step by step, how you usually inspect a product.</div>'
        '<div class="k11-vi">Kể cho Mina từng bước anh thường kiểm tra một sản phẩm trước khi giao cho khách.</div>'
        '<div class="chips"><span>50–60 giây</span><span>65+ từ</span><span>5+ từ nối</span>'
        '<span>First → Then → After that → Finally</span></div>'
        '<div class="k11-foot">Nói chung chung, không nêu quy trình nội bộ của công ty<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 180, 150, [
    bub(24, -160, 520, "Clear. Logical. I followed every step.",
        "Rõ ràng. Mạch lạc. Tôi theo kịp từng bước.", (540, 305)),
    th(30, 975, 600, "She's… actually impressed?", "(Cô ấy… thật sự ấn tượng à?)"),
], "", None))

P.append(("K13", "K13", 60, 60, [
    bub(730, 24, 330, "Twenty samples. Checked your way. Not one scratch.",
        "Hai mươi mẫu. Kiểm theo cách của anh. Không một vết xước.", (545, 200)),
], "", None))

P.append(("K14", "K14", 200, 60, [
    bub(24, -175, 560, "So the scratch happens after you. Not before.",
        "Vậy vết xước xảy ra sau khâu của anh. Không phải trước.", (540, 330)),
    bub(716, 430, 344, "Who touches the phones after you, Minh?",
        "Ai chạm vào điện thoại sau anh, Minh?", (560, 335)),
], "", None))

P.append(("K15", "K15", 60, 190, [
    cap(14, 236, "23:48"),
    th(150, 690, 780, "The packing area… at this hour?", "(Khu đóng gói… giờ này sao?)"),
], "", None))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 3 · Show Me Where You Work</div>'
        '<div class="end-s">23:52 · Xưởng sản xuất</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 3 · Photocard “11 PM”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“11 PM” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 180, 190, [
    bub(24, -160, 540, "You jumped from step one to the end.",
        "Anh nhảy từ bước một xuống bước cuối luôn.", (540, 295)),
    bub(744, 330, 316, "Again. First… then… after that.", "Lại nào. First… then… after that.", (560, 300)),
    raw(290, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina đang chờ</span>', w=500, cls="pill"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 60, 220, [
    cap(24, 24, "23:30"),
    bub(20, 120, 340, "I haven't eaten since Seoul. Don't judge me.",
        "Tôi chưa ăn gì từ lúc rời Seoul. Đừng phán xét.", (530, 380)),
    bub(722, 300, 338, "Here. You look worse than I do.", "Đây. Trông anh còn tệ hơn tôi.", (545, 380)),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Midnight Noodles”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
