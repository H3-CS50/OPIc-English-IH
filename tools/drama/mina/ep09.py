"""EP09 · Not Because of Me — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep09/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 9
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 9
TITLE = 'Not Because of Me'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.nowrap{white-space:nowrap}
.note{font-family:'DejaVu Sans',sans-serif;font-style:normal}
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
.pp{width:760px;height:300px;padding:40px 50px;color:#1d1d24;font-family:'DejaVu Sans Mono',monospace;mix-blend-mode:multiply}
.pp-t{font-weight:700;font-size:58px;letter-spacing:2px;color:#b3123a}
.pp-s{font-weight:700;font-size:38px;margin-top:6px}
.pp-l{font-weight:700;font-size:34px;margin-top:22px;color:#333}
.pp-r{font-weight:700;font-size:34px;margin-top:8px;color:#b3123a}
.pp2{width:700px;padding:70px 30px 0 250px}
.pp-s2{font-weight:700;font-size:32px;line-height:1.5;color:#b3123a;white-space:nowrap}
.ph{width:300px;height:640px;background:#fbfcfe;padding:70px 22px 20px;color:#1b2333;display:flex;flex-direction:column;gap:14px}
.ph-app{font-weight:800;font-size:24px;color:#3d6bff}
.ph-subj{font-weight:900;font-size:30px;line-height:1.15}
.ph-b{font-weight:600;font-size:26px;line-height:1.25}
.ph-hl{font-weight:900;font-size:28px;line-height:1.2;color:#b3123a;background:#ffe3ea;padding:8px 10px;border-radius:8px}
.trans{background:rgba(24,24,38,.95);border:1.5px solid rgba(255,255,255,.16);border-radius:26px;padding:22px 30px;color:#fff;z-index:4}
.tr-k{font-weight:800;font-size:22px;letter-spacing:4px;color:#ff6fa6;margin-bottom:8px}
.tr-l{font-weight:500;font-size:27px;line-height:1.35;color:#dcdcea}
.tr-l b{color:#ffd1e2}
.scr-av{width:44px;height:44px;border-radius:22px;background:#ff4f8f;color:#fff;display:inline-flex;align-items:center;
  justify-content:center;font-weight:900;font-size:18px;flex:none}
.scr-av.grp{background:#3d6bff}
.notif{background:rgba(28,28,40,.94);border:1.5px solid rgba(255,255,255,.16);border-radius:30px;padding:22px 30px 26px;color:#fff;
  z-index:4;box-shadow:0 14px 40px rgba(0,0,0,.5)}
.nt-head{display:flex;align-items:center;gap:14px}
.nt-app{font-weight:800;font-size:26px}
.nt-now{margin-left:auto;font-weight:500;font-size:22px;color:#a9a9bb}
.nt-en{font-weight:800;font-size:33px;line-height:1.25;margin-top:12px}
.nt-vi{font-weight:500;font-size:25px;line-height:1.3;color:#c9c9dc;margin-top:8px}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


S32, S23 = 1080 / 1264, 1080 / 848
K03_PT, K06_PT, K15_PT = 60, 250, 520
# K03: nửa trên tờ giấy (không che cây bút)
K03_Q = [(552, 190), (945, 155), (955, 322), (533, 348)]
K03_PAPER = ('<div class="pp"><div class="pp-t">WITHDRAWAL REQUEST</div>'
             '<div class="pp-s">CL PROMOTION COMMITTEE</div>'
             '<div class="pp-l">MINA · HQ QUALITY</div>'
             '<div class="pp-r">SENT: SAT 19:58</div></div>')
# K06: tờ khiếu nại cũ, chữ dồn về phía phải để không đè lên ngón tay
K06_Q = [(800, 620), (1100, 665), (1030, 800), (680, 735)]
K06_PAPER = ('<div class="pp pp2"><div class="pp-s2">CUSTOMER CLAIM · SUN 19:10</div>'
             '<div class="pp-s2">3 UNITS · FRAME SCRATCH</div></div>')
K15_Q = [(220, 424), (330, 461), (270, 700), (141, 672)]
K15_SCREEN = ('<div class="ph"><div class="ph-app">HQ Quality</div><div class="ph-subj">Assignment update</div>'
              '<div class="ph-b">Your Vietnam assignment ends this weekend.</div>'
              '<div class="ph-hl">Return flight: Mon 08:10</div></div>')

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 9</div>'
        '<div class="title">Not Because of Me</div>'
        '<div class="tag">“I want you to earn it.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", 60, 200, [
    cap(24, 24, "Thứ Bảy · 20:00", "Phòng OQC"),
    th(30, 745, 680, "Same room. Same black folder.", "(Cùng căn phòng. Cùng tập hồ sơ đen.)"),
], "", None))

P.append(("K02", "K02", 260, 60, [
    bub(24, -235, 400, "You came.", "Anh đến rồi.", (470, 180)),
    bub(600, -235, 456, "Open it.", "Mở ra đi.", (560, 180)),
], "", None))

P.append(("K03", "K03", K03_PT, 470, [
    scr(K03_Q, 760, 300, K03_PAPER, K03_PT, S32),
    raw(60, 755, (
        '<div class="tr-k">TỜ ĐƠN · DỊCH</div>'
        '<div class="tr-l">Đơn xin rút · Hội đồng thăng cấp CL</div>'
        '<div class="tr-l">Mina · Chất lượng trụ sở · <b>Đã gửi: 19:58 thứ Bảy</b></div>'), w=960, cls="trans"),
    th(30, 935, 900, "She withdrew… from my committee? Then my interview…",
       "(Cô ấy rút… khỏi hội đồng chấm mình? Vậy buổi phỏng vấn của mình…)"),
], "", None))

P.append(("K04", "K04", 470, 60, [
    bub(24, -445, 720, "HR will find someone new. It may take a while… but it'll be fair.",
        "Nhân sự sẽ tìm người chấm mới. Có thể mất thời gian… nhưng sẽ công bằng.", (300, -40)),
    bub(300, -205, 756, "I want you to earn it. Not because of me.",
        "Em muốn anh tự giành lấy nó. Không phải nhờ em.", (540, 300)),
], "", None))

P.append(("K05", "K05", 260, 60, [
    bub(24, -235, 500, "As of 7:58, I'm not your evaluator anymore.",
        "Từ 7 giờ 58, em không còn là người chấm anh nữa.", (520, 190)),
    bub(560, -235, 496, "So tonight… I can help you as much as I want.",
        "Nên tối nay… em muốn giúp anh bao nhiêu cũng được.", (580, 190)),
], "", None))

P.append(("K06", "K06", K06_PT, 60, [
    bub(24, -225, 500, "Your real interview won't ask what you did.",
        "Buổi phỏng vấn thật sẽ không hỏi anh đã làm gì.", (720, 220)),
    bub(560, -225, 496, "It'll ask what it means.", "Nó sẽ hỏi chuyện đó có ý nghĩa gì.", (760, 220)),
    scr(K06_Q, 700, 300, K06_PAPER, K06_PT, S32),
], "", None))

P.append(("K07", "K07", 250, 60, [
    bub(24, -225, 500, "Three scratched phones. One angry customer.", "Ba chiếc điện thoại xước. Một khách hàng giận dữ.",
        (520, 300)),
    bub(560, -225, 496, "And twenty thousand units stopped.", "Và hai mươi nghìn máy phải dừng lại.", (560, 300)),
], "", None))

P.append(("K08", "K08", 260, 60, [
    bub(24, -235, 760, "Customers today expect very high quality from electronic products.",
        "Ngày nay khách hàng kỳ vọng chất lượng rất cao ở các sản phẩm điện tử.", (535, 200)),
], "", None))

P.append(("K09", "K09", 420, 60, [
    bub(24, -395, 680, "What happens when a product does not meet those expectations…",
        "Chuyện gì xảy ra khi một sản phẩm không đáp ứng kỳ vọng đó…", (300, -40)),
    bub(300, -205, 756, "…and what can companies do to prevent such problems?",
        "…và công ty có thể làm gì để ngăn những vấn đề như vậy?", (540, 290)),
], "", None))

P.append(("K10", "K10", 230, 60, [
    bub(24, -205, 560, "Talk to me like a CL3, Minh.", "Nói với em như một CL3 đi, Minh.", (560, 200)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(250, 40, f'{LOCK.format(s=30)}<span>Photocard “One Dance” đang khóa · nói đạt để mở</span>',
        w=580, cls="lock-pill"),
    raw(70, 130, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000138 · Công việc OQC</div>'
        '<div class="k11-en">Customers today expect very high quality from electronic products. What happens when a '
        'product does not meet those expectations, and what can companies do to prevent such problems?</div>'
        '<div class="k11-vi">Nói cho Mina: khi sản phẩm không đạt kỳ vọng của khách thì chuyện gì xảy ra, '
        'và công ty có thể làm gì để ngăn những vấn đề như vậy.</div>'
        '<div class="chips"><span>50–70 giây</span><span>75+ từ</span><span>5+ từ nối</span>'
        '<span>Vấn đề → hậu quả → giải pháp + ví dụ</span></div>'
        '<div class="k11-foot">Nêu vấn đề → nguyên nhân → ảnh hưởng tới mọi người → giải pháp (should, need to…) → một ví dụ thật (for example…)<br>'
        'Ví dụ giữ chung chung, không nêu tên khách hàng hay số liệu thật<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 260, 60, [
    bub(24, -235, 520, "That's not an inspector's answer anymore.", "Đó không còn là câu trả lời của người kiểm hàng nữa.",
        (520, 300)),
    bub(580, -235, 476, "That's a manager's answer.", "Đó là câu trả lời của một quản lý.", (580, 300)),
], "", None))

P.append(("K13", "K13", 260, 60, [
    bub(24, -235, 760, "One dance. Then you go back to studying.", "Một điệu thôi. Rồi anh quay lại học tiếp.",
        (560, 190)),
    sfx(250, 640, "♪ ♫", 72, -8, cls="sfx-w note"),
], "", None))

P.append(("K14", "K14", 260, 220, [
    bub(24, -235, 470, "After your interview…", "Sau buổi phỏng vấn…", (520, 330)),
    bub(560, -235, 496, "…you can kiss me.", "…anh được hôn em.", (560, 330)),
    th(30, 1640, 480, "Why not now?", "(Sao không phải bây giờ?)"),
], "", None))

P.append(("K15", "K15", K15_PT, 220, [
    raw(40, -495, (
        '<div class="nt-head"><span class="scr-av grp">HQ</span><span class="nt-app">HQ Quality · Assignment update</span>'
        '<span class="nt-now">bây giờ</span></div>'
        '<div class="nt-en">Your Vietnam assignment ends this weekend. Return flight: Mon 08:10</div>'
        '<div class="nt-vi">Đợt công tác Việt Nam của bạn kết thúc cuối tuần này. Chuyến bay về: 08:10 thứ Hai</div>'),
        w=1000, cls="notif"),
    bub(24, -235, 520, "…Seoul wants me back.", "…Trụ sở gọi em về.", (600, 330)),
    bub(600, -235, 456, "Monday morning.", "Sáng thứ Hai.", (640, 330)),
    scr(K15_Q, 300, 640, K15_SCREEN, K15_PT, S23),
    sfx(40, 300, "Ting.", 64, -8),
    th(30, 1571, 680, "Monday… that's in two days.", "(Thứ Hai… chỉ còn hai ngày.)"),
], "", None))

P.append(("K15C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">23:30</div>'
        '<div class="msg-date">Thứ Bảy</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">Tomorrow. Factory rooftop. Sunset.</div><div class="vi">Mai. Sân thượng nhà máy. Lúc hoàng hôn.</div></div>'
        '<div class="msg-b"><div class="en">Last lesson. Three questions. Don\'t be late.</div><div class="vi">Bài học cuối. Ba câu hỏi. Đừng đến muộn.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 720))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 10 · Golden Hour</div>'
        '<div class="end-s">Chủ Nhật 17:20 · Sân thượng nhà máy</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 10 · Photocard “One Dance”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“One Dance” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 470, 190, [
    bub(24, -445, 700, "You told me what happens. Not why, or what we can do.",
        "Anh mới nói chuyện gì xảy ra. Chưa nói vì sao, và mình làm được gì.", (300, -40)),
    bub(320, -205, 736, "Problem, effect, solution. Then one real example.",
        "Vấn đề, hậu quả, giải pháp. Rồi một ví dụ thật.", (530, 170)),
    raw(240, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina đang chờ</span>', w=600, cls="pill nowrap"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 260, 220, [
    bub(24, -235, 420, "I'm keeping this.", "Em giữ cái này.", (540, 190)),
    bub(480, -235, 576, "Want it back? Come get it in Seoul.", "Muốn lấy lại thì sang Seoul mà lấy.", (580, 190)),
    cap(24, 24, "21:40", "Phòng OQC"),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Your Tie”</span>',
        w=840, cls="pill pill-gold"),
], "", None))
