"""EP03 · Show Me Where — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep03/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 3
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 3
TITLE = 'Show Me Where'
QBG = 'K10'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.bub.khoa{border-color:#3b3b45}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1060, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 3</div>'
        '<div class="title">Show Me Where<br>You Work</div>'
        '<div class="tag">“Make me see it, Minh.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", 70, 60, [
    cap(28, 28, "Thứ Hai · 23:52", "Xưởng sản xuất"),
], "", None))

P.append(("K02", "K02", 200, 60, [
    bub(24, -175, 540, "I've seen fifty factories, Minh.",
        "Tôi đã đi qua năm mươi nhà máy rồi, Minh.", (545, 405)),
    bub(722, 560, 338, "At night, they all look the same.",
        "Ban đêm, nhà máy nào cũng giống nhau.", (650, 440)),
], "", None))

P.append(("K03", "K03", 60, 60, [
    bub(24, 40, 330, "But I don't know this one. You do.",
        "Nhưng nhà máy này tôi chưa biết. Anh thì biết.", (545, 385)),
], "", None))

P.append(("K04", "K04", 60, 60, [
    sfx(110, 548, "Cạch!", 70, -8),
    bub(722, 28, 338, "Don't. Say. Anything.", "Đừng. Nói. Gì. Cả.", (570, 275)),
], "", None))

P.append(("K05", "K05", 60, 60, [
    bub(24, 24, 470, "Seoul gave me a floor plan. Lines, numbers, arrows.",
        "Trụ sở đưa tôi một bản sơ đồ. Toàn line, con số và mũi tên.", (790, 250)),
    bub(24, 300, 300, "It tells me nothing.", "Chẳng nói lên điều gì cả.", (790, 260)),
], "", None))

P.append(("K06", "K06", 170, 60, [
    th(30, -140, 620, "First time… she looks tired.", "(Lần đầu tiên… trông cô ấy mệt.)"),
    bub(24, 580, 320, "I want to see it the way you see it.",
        "Tôi muốn nhìn nó theo cách anh nhìn.", (520, 420)),
], "", None))

P.append(("K07", "K07", 60, 60, [
    bub(758, 70, 302, "Describe the place where you work.",
        "Hãy tả nơi anh làm việc.", (570, 445)),
], "", None))

P.append(("K08", "K08", 450, 60, [
    bub(24, -425, 600, "What does your workplace look like…",
        "Nơi làm việc của anh trông thế nào…", (430, 20)),
    bub(400, -215, 656, "…and what equipment or tools do you use every day?",
        "…và hằng ngày anh dùng những thiết bị, dụng cụ gì?", (640, 30)),
], "", None))

P.append(("K09", "K09", 60, 200, [
    th(140, 745, 800, "Big picture first… then the details.", "(Toàn cảnh trước… rồi đến chi tiết.)"),
], "", None))

P.append(("K10", "K10", 60, 60, [
    bub(24, 40, 320, "Make me see it, Minh.", "Làm tôi hình dung ra đi, Minh.", (545, 380)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(70, 120, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000007 · Công việc</div>'
        '<div class="k11-en">Describe the place where you work. What does your workplace look like, '
        'and what equipment or tools do you use every day?</div>'
        '<div class="k11-vi">Tả cho Mina nơi anh làm việc trông thế nào và hằng ngày anh dùng thiết bị, dụng cụ gì.</div>'
        '<div class="chips"><span>50–60 giây</span><span>65+ từ</span><span>5+ từ nối</span>'
        '<span>Nơi làm việc + thiết bị, dụng cụ</span></div>'
        '<div class="k11-foot">Toàn cảnh → 2–3 chi tiết → cảm nhận của anh<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 180, 150, [
    bub(24, -160, 520, "…Okay. Now I can see it.", "…Được rồi. Giờ thì em thấy rồi.", (545, 430)),
    th(30, 975, 600, "She smiled. For real this time.", "(Cô ấy cười. Lần này là thật.)"),
], "", None))

P.append(("K13", "K13", 60, 60, [
    bub(752, 60, 308, "What? I'm allowed to smile after midnight.",
        "Sao? Qua nửa đêm thì em được cười chứ.", (640, 400)),
], "", None))

P.append(("K14", "K14", 60, 60, [
    bub(570, 24, 486, "The packing area. Let's handle this together.",
        "Khu đóng gói. Chúng ta cùng xử lý vụ này.", (425, 250)),
], "", None))

P.append(("K15", "K15", 220, 150, [
    cap(24, -196, "00:20 · Line đóng gói", "Khoa · 31 · Quản lý line đóng gói"),
    bub(730, 40, 330, "Mina-ssi. Working late… with him?",
        "Mina-ssi. Làm muộn thế… với anh ta à?", (630, 420), who="khoa"),
    th(30, 1480, 820, "Khoa. What's he doing here at midnight?",
       "(Khoa. Nửa đêm anh ta làm gì ở đây?)"),
], "", None))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 4 · The Jig</div>'
        '<div class="end-s">00:20 · Line đóng gói</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 4 · Photocard “First Smile”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“First Smile” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 180, 190, [
    bub(24, -160, 480, "I still can't picture it.", "Tôi vẫn chưa hình dung ra.", (545, 380)),
    bub(730, 320, 330, "What do you see? What do you use every day?",
        "Anh nhìn thấy gì? Hằng ngày anh dùng những gì?", (630, 360)),
    raw(290, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina đang chờ</span>', w=500, cls="pill"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 60, 220, [
    cap(24, 24, "01:15"),
    bub(20, 130, 320, "It's cold. Don't make it weird.", "Lạnh mà. Đừng nghĩ linh tinh.", (530, 420)),
    bub(722, 330, 338, "Forget Khoa. Tonight, you were the one who showed me around.",
        "Quên Khoa đi. Tối nay, người dẫn em đi là anh.", (620, 430)),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Your Jacket”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
