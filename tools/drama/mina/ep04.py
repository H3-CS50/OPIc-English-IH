"""EP04 · The Jig — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep04/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 4
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 4
TITLE = 'The Jig'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.bub.khoa{border-color:#3b3b45}
.lock-pill{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 22px;border-radius:999px;
  background:rgba(10,10,18,.72);border:1.5px solid rgba(242,196,90,.7);color:#ffe7a8;font-weight:700;font-size:22px;z-index:4;white-space:nowrap}
.msg{height:640px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;
  background:radial-gradient(ellipse at 50% 30%,#1d1b33 0%,#0b0b12 75%)}
.msg-time{font-family:'Inter Display','Inter',sans-serif;font-weight:300;font-size:120px;line-height:1;letter-spacing:-2px;color:#f2f2f8}
.msg-date{font-weight:600;font-size:28px;color:#b7b7cc;margin-top:8px}
.msg-card{width:820px;margin-top:44px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.18);
  border-radius:34px;padding:26px 32px 30px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
.msg-head{display:flex;align-items:center;gap:16px}
.msg-av{width:54px;height:54px;border-radius:27px;background:#ff4f8f;display:flex;align-items:center;justify-content:center;
  font-weight:900;font-size:28px}
.msg-name{font-weight:800;font-size:30px}
.msg-now{margin-left:auto;font-weight:500;font-size:22px;color:#a9a9bb}
.msg-b{margin-top:18px;margin-left:70px;background:#fff;color:#121218;border-radius:26px 26px 26px 8px;padding:14px 24px 16px;
  display:inline-block;width:fit-content}
.msg-b .en{font-weight:800;font-size:34px;line-height:1.2}
.msg-b .vi{font-weight:500;font-size:24px;color:#5d5d6b;margin-top:4px}
.msg-card{display:flex;flex-direction:column}
.msg-b{align-self:flex-start}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 4</div>'
        '<div class="title">The Jig</div>'
        '<div class="tag">“…You can let go now, Minh.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", 60, 60, [
    cap(28, 28, "Thứ Ba · 00:22", "Line đóng gói"),
], "", None))

P.append(("K02", "K02", 300, 60, [
    bub(24, -275, 640, "This? New jigs. They arrived last week. Faster packing, fewer mistakes.",
        "Cái này à? Jig mới. Về tuần trước. Đóng gói nhanh hơn, ít lỗi hơn.", (560, 330), who="khoa"),
    bub(712, 930, 348, "Relax, Minh. My line doesn't scratch phones.",
        "Bình tĩnh đi, Minh. Line của tôi không làm xước điện thoại đâu.", (600, 380), who="khoa"),
], "", None))

P.append(("K03", "K03", 60, 60, [
    bub(752, 50, 308, "Minh. Take a look.", "Minh. Anh xem thử đi.", (560, 400)),
], "", None))

P.append(("K04", "K04", 60, 60, [
    th(30, 30, 560, "There… a sharp edge on the inner corner.", "(Đây rồi… một cạnh sắc ở góc trong.)"),
], "", None))

P.append(("K05", "K05", 60, 60, [
    th(30, 30, 640, "Right where the frame touches. The same spot as the customer's photos.",
       "(Đúng chỗ viền máy chạm vào. Trùng chỗ trong ảnh khiếu nại của khách.)"),
], "", None))

P.append(("K06", "K06", 230, 60, [
    bub(24, -205, 600, "Khoa-ssi. Explain this. In English.",
        "Khoa-ssi. Giải thích đi. Bằng tiếng Anh.", (-40, -40)),
    bub(722, 600, 338, "It's… uh… the supplier… I mean…",
        "Nó… ờ… nhà cung cấp… ý tôi là…", (600, 420), who="khoa"),
], "", None))

P.append(("K07", "K07", 230, 60, [
    bub(24, -205, 600, "Two minutes. You found it in two minutes.",
        "Hai phút. Anh tìm ra nó trong hai phút.", (560, 420)),
    bub(722, 470, 338, "Your team didn't miss anything, Minh. The jig did.",
        "Đội anh không bỏ sót gì cả, Minh. Là do cái jig.", (640, 420)),
    bub(24, 800, 400, "Let me feel that edge.", "Để em sờ thử cạnh đó xem.", (470, 440)),
], "", None))

P.append(("K08", "K08", 200, 200, [
    bub(24, -175, 520, "It's just a scratch.", "Chỉ xước chút thôi.", (550, 520)),
    sfx(70, 860, "Á—!", 92, -10, cls="sfx-r"),
    bub(746, 560, 314, "…You can let go now, Minh.", "…Anh buông tay được rồi đấy, Minh.", (600, 520)),
    th(30, 1630, 760, "She's not pulling away either.", "(Cô ấy cũng đâu có rút tay lại.)"),
], "", None))

P.append(("K09", "K09", 200, 200, [
    bub(24, -175, 560, "That wasn't luck, was it?", "Đó không phải may mắn, đúng không?", (540, 690)),
    bub(460, 745, 600, "You've done this before.", "Anh từng làm thế này rồi.", (540, 690)),
], "", None))

P.append(("K10", "K10", 540, 60, [
    bub(24, -515, 640, "Tell me about a time when you found a quality problem that other people had missed.",
        "Kể em nghe về một lần anh phát hiện lỗi chất lượng mà người khác đã bỏ sót.", (300, -60)),
    bub(380, -240, 676, "What was the problem, how did you report it… and what happened after that?",
        "Lỗi gì, anh báo cáo thế nào… và sau đó chuyện gì xảy ra?", (560, 300)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(240, 40, f'{LOCK.format(s=30)}<span>Photocard “Good Catch” đang khóa · nói đạt để mở</span>',
        w=600, cls="lock-pill"),
    raw(70, 140, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000012 · Công việc OQC</div>'
        '<div class="k11-en">Tell me about a time when you found a quality problem that other people had missed. '
        'What was the problem, how did you report it, and what happened after that?</div>'
        '<div class="k11-vi">Kể cho Mina một lần anh phát hiện lỗi chất lượng mà người khác bỏ sót: '
        'lỗi gì, anh báo cáo thế nào, sau đó ra sao.</div>'
        '<div class="chips"><span>50–70 giây</span><span>70+ từ</span><span>5+ từ nối</span>'
        '<span>Kể bằng thì quá khứ</span></div>'
        '<div class="k11-foot">Bối cảnh → lỗi gì → anh làm gì → kết quả<br>'
        'Kể chung chung, không nêu tên model hay dữ liệu nội bộ<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 200, 150, [
    bub(24, -175, 620, "So that's how you see what others don't.",
        "Thì ra đó là cách anh nhìn ra những thứ người khác không thấy.", (540, 420)),
    bub(722, 500, 338, "Seoul gets the real cause at eight. With your name on it.",
        "Tám giờ trụ sở sẽ nhận được nguyên nhân thật. Kèm tên anh.", (640, 420)),
    th(30, 975, 640, "She's looking at me differently now.", "(Cô ấy nhìn mình khác hẳn rồi.)"),
], "", None))

P.append(("K13", "K13", 60, 60, [
    bub(24, 60, 400, "I'll call the supplier. Tonight.",
        "Tôi sẽ gọi nhà cung cấp. Ngay tối nay.", (560, 330), who="khoa"),
    bub(24, 420, 360, "…Good catch, Minh.", "…Bắt lỗi giỏi đấy, Minh.", (540, 360), who="khoa"),
], "", None))

P.append(("K14", "K14", 220, 200, [
    bub(24, -195, 620, "The lights here are on a timer.", "Đèn ở đây hẹn giờ đấy.", (540, 330)),
    sfx(40, 40, "Tách.", 64, -6),
    bub(800, 50, 260, "…Don't move.", "…Đừng cử động.", (640, 260)),
    th(30, 745, 640, "Ten centimeters… five…", "(Mười phân… năm phân…)"),
], "", None))

P.append(("K15", "K15", 60, 150, [
    sfx(40, 60, "TÁCH!", 96, -8, cls="sfx-r"),
    bub(760, 130, 300, "Mina-ssi.", "Mina-ssi.", (650, 400), who="khoa"),
    bub(712, 560, 348, "…Dinner tomorrow? I know the best rooftop in town.",
        "…Tối mai đi ăn nhé? Tôi biết nhà hàng sân thượng đẹp nhất thành phố.", (620, 420), who="khoa"),
    th(30, 1480, 760, "Of all the timing…", "(Đúng lúc thật…)"),
], "", None))

P.append(("K15C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">01:12</div>'
        '<div class="msg-date">Thứ Ba</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">Can\'t sleep.</div><div class="vi">Không ngủ được.</div></div>'
        '<div class="msg-b"><div class="en">Your fault.</div><div class="vi">Tại anh đấy.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 640))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 5 · Save Me?</div>'
        '<div class="end-s">Thứ Ba 19:30 · Nhà hàng sân thượng</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 5 · Photocard “Good Catch”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“Good Catch” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 200, 190, [
    bub(24, -175, 560, "You told me what you found. Not how.",
        "Anh kể anh tìm ra cái gì. Chưa kể anh tìm ra thế nào.", (540, 380)),
    bub(722, 740, 338, "When was it? What happened? What did you do?",
        "Khi nào? Chuyện gì xảy ra? Anh đã làm gì?", (620, 380)),
    raw(290, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina đang chờ</span>', w=500, cls="pill"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 200, 220, [
    bub(24, -175, 520, "…Did I fall asleep?", "…Em ngủ quên à?", (540, 520)),
    cap(24, 24, "06:10"),
    bub(744, 130, 316, "How long were you watching me?", "Anh nhìn em bao lâu rồi?", (640, 500)),
    bub(24, 1300, 470, "…Stay. Five more minutes.", "…Ở lại đi. Năm phút nữa thôi.", (760, 1290)),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “6:10 AM”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
