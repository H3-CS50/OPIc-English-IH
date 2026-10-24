"""EP05 · Save Me? — tuyến Mina: bóng thoại, toạ độ và CSS riêng của tập.

Ảnh gốc: mina/art/ep05/<KHOÁ>.webp · Dựng: python3 tools/drama/build.py --ep 5
"""
from comic_engine import *  # noqa: F401,F403  (bub, th, cap, sfx, raw, MIC, LOCK, css_h, scr, e)

EP = 5
TITLE = 'Save Me?'
QBG = 'P1'  # ảnh làm nền mờ cho thẻ câu hỏi

CSS = r""".pc-label{display:flex;align-items:center;justify-content:center;gap:14px;color:#ffd1e2;font-weight:700;font-size:26px;z-index:4}
.bub.khoa{border-color:#3b3b45}
.bub.whisper{border-style:dashed;border-width:3.5px}
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
.chatwrap{z-index:4}
.chatwrap .msg-card{background:rgba(32,30,52,.92)}
.scr{transform-origin:0 0;z-index:2;color:#121218}
.scr-in{padding:58px 22px 20px}
.scr-top{display:flex;align-items:center;gap:12px;font-weight:800;font-size:28px;padding-bottom:12px;border-bottom:2px solid #e3e3ec}
.scr-av{width:40px;height:40px;border-radius:20px;background:#ff4f8f;color:#fff;display:inline-flex;align-items:center;
  justify-content:center;font-weight:900;font-size:22px;flex:none}
.scr-av.grp{background:#3d6bff}
.scr-who{font-weight:600;font-size:20px;color:#7a7a88;margin-top:16px}
.scr-b{margin-top:16px;background:#ececf3;border-radius:22px 22px 22px 6px;padding:12px 18px;font-weight:700;font-size:30px;
  line-height:1.2;width:fit-content;max-width:256px}
.scr-b.big{font-size:46px}
.scr-b.sm{font-size:24px;margin-top:8px}
.notif{background:rgba(28,28,40,.94);border:1.5px solid rgba(255,255,255,.16);border-radius:30px;padding:22px 30px 26px;color:#fff;
  z-index:4;box-shadow:0 14px 40px rgba(0,0,0,.5)}
.nt-head{display:flex;align-items:center;gap:14px}
.nt-app{font-weight:800;font-size:26px}
.nt-now{margin-left:auto;font-weight:500;font-size:22px;color:#a9a9bb}
.nt-who{font-weight:700;font-size:24px;color:#9fb3ff;margin-top:12px}
.nt-en{font-weight:800;font-size:33px;line-height:1.25;margin-top:6px}
.nt-vi{font-weight:500;font-size:25px;line-height:1.3;color:#c9c9dc;margin-top:8px}
"""

P = []  # (khoá, ảnh hoặc None, đệm trên, đệm dưới, [phần tử], class thêm, chiều cao cố định)


def chat(x, y, name, time, msgs):
    b = "".join(f'<div class="msg-b"><div class="en">{e(en)}</div><div class="vi">{e(vi)}</div></div>'
                for en, vi in msgs)
    return raw(x, y, (f'<div class="msg-card"><div class="msg-head"><span class="msg-av">M</span>'
                      f'<span class="msg-name">{e(name)}</span><span class="msg-now">{e(time)}</span></div>{b}</div>'),
               w=820, cls="chatwrap")


K01_PT, K15_PT = 60, 330
# góc màn hình (TL, TR, BR, BL) đo trên ảnh gốc, đổi sang toạ độ hiển thị rộng 1080
_s1 = 1080 / 1264
K01_Q = [(x * _s1, y * _s1) for x, y in [(500, 518), (645, 474), (928, 622), (780, 694)]]
_s2 = 1080 / 848
K15_Q = [(x * _s2, y * _s2) for x, y in [(230, 470), (339, 478), (327, 690), (213, 682)]]

K01_SCREEN = ('<div class="scr-in"><div class="scr-top"><span class="scr-av">M</span>Mina</div>'
              '<div class="scr-b big">Save me?</div>'
              '<div class="scr-b">Rooftop restaurant, 30th floor. Now.</div></div>')
K15_SCREEN = ('<div class="scr-in"><div class="scr-top"><span class="scr-av grp">Q</span>OQC Weekly</div>'
              '<div class="scr-who">Team Leader Yoon</div>'
              '<div class="scr-b sm">Weekly meeting moved to 8:00 tomorrow. Minh will present the HOLD report — in English.</div></div>')

P.append(("COVER", "COVER", 0, 0, [
    raw(0, 0, "", cls="cover-shade"),
    raw(64, 1150, (
        '<div class="kicker">OPIc DRAMA · TUYẾN MINA</div>'
        '<div class="ep">Tập 5</div>'
        '<div class="title">Save Me?</div>'
        '<div class="tag">“You were jealous tonight.”</div>'
        '<div class="disc">Truyện tạo bằng AI · Nhân vật hư cấu · Câu hỏi luyện tập OPIc</div>'), w=952, cls="cover-text"),
], "", None))

P.append(("K01", "K01", K01_PT, 420, [
    cap(24, 24, "Thứ Ba · 19:30", "Phòng OQC"),
    th(600, 24, 456, "So she said yes to Khoa…", "(Vậy là cô ấy đã nhận lời Khoa…)"),
    scr(K01_Q, 300, 632, K01_SCREEN, K01_PT),
    chat(130, 755, "Mina", "19:30", [("Save me?", "Cứu em với?"),
                                     ("Rooftop restaurant, 30th floor. Now.", "Nhà hàng sân thượng, tầng 30. Ngay bây giờ.")]),
], "", None))

P.append(("K02", "K02", 290, 60, [
    bub(24, -265, 680, "…and that's why Korean and Vietnamese management styles complement each other perfectly.",
        "…và đó là lý do phong cách quản lý Hàn và Việt bổ sung cho nhau hoàn hảo.", (337, 218), who="khoa"),
    cap(690, 24, "19:58", "Nhà hàng sân thượng"),
], "", None))

P.append(("K03", "K03", 60, 60, [
    bub(24, 60, 360, "Minh! You made it.", "Minh! Anh tới rồi.", (540, 360)),
], "", None))

P.append(("K04", "K04", 60, 60, [
    bub(24, 40, 340, "Minh. What a… surprise.", "Minh. Đúng là… bất ngờ.", (540, 340), who="khoa"),
], "", None))

P.append(("K05", "K05", 60, 60, [
    bub(744, 110, 316, "He's been talking for forty minutes.", "Anh ta nói suốt bốn mươi phút rồi.",
        (600, 520), who="mina whisper"),
    bub(800, 470, 240, "Help.", "Cứu em.", (640, 560), who="mina whisper"),
], "", None))

P.append(("K05B", "K05B", 60, 200, [
    th(30, 40, 470, "…Is that her foot?", "(…Đó là chân cô ấy à?)"),
    th(30, 745, 860, "Khoa is still talking. She's still smiling at him.",
       "(Khoa vẫn đang nói. Cô ấy vẫn mỉm cười với anh ta.)"),
], "", None))

P.append(("K06", "K06", 230, 60, [
    bub(24, -205, 660, "Khoa-ssi. Tell me about the people you work with.",
        "Khoa-ssi. Kể tôi nghe về những người anh làm cùng đi.", (540, 420)),
], "", None))

P.append(("K07", "K07", 380, 60, [
    bub(24, -355, 780, "My colleagues are friendly and hardworking. We help each other, and we have a good "
        "relationship. So, these are the people I work with.",
        "Đồng nghiệp của tôi thân thiện và chăm chỉ. Chúng tôi giúp đỡ nhau và có mối quan hệ tốt. "
        "Vậy đó là những người tôi làm cùng.", (540, 420), who="khoa"),
], "", None))

P.append(("K08", "K08", 60, 60, [
    bub(760, 60, 300, "That sounds like a textbook.", "Nghe như sách giáo khoa.", (600, 420)),
    bub(760, 340, 300, "Who are they? Give me one name.", "Họ là ai? Cho tôi một cái tên.", (620, 440)),
], "", None))

P.append(("K09", "K09", 60, 60, [
    bub(24, 40, 400, "…Uh. Well… everyone is… nice.", "…Ờ. Thì… ai cũng… tốt.", (520, 240), who="khoa"),
    th(700, 30, 356, "Khoa… froze?", "(Khoa… đứng hình à?)"),
], "", None))

P.append(("K10", "K10", 540, 60, [
    bub(24, -515, 640, "Your turn, Minh. Tell me about the people you work with.",
        "Tới lượt anh, Minh. Kể em nghe về những người anh làm cùng.", (300, -60)),
    bub(380, -240, 676, "What are your coworkers like, and how do you work together as a team?",
        "Đồng nghiệp anh là người thế nào, và cả đội làm việc cùng nhau ra sao?", (540, 450)),
    bub(744, 600, 316, "Real people. Not a textbook.", "Người thật. Không phải sách giáo khoa.", (620, 520)),
], "", None))

P.append(("K11", None, 60, 60, [
    raw(0, 0, "", cls="k11-bg"),
    raw(240, 40, f'{LOCK.format(s=30)}<span>Photocard “Rooftop” đang khóa · nói đạt để mở</span>',
        w=600, cls="lock-pill"),
    raw(70, 140, (
        f'<div class="mic">{MIC.format(s=64)}</div>'
        '<div class="k11-kicker">LƯỢT CỦA ANH</div>'
        '<div class="k11-code">Q-000008 · Công việc</div>'
        '<div class="k11-en">Tell me about the people you work with. What are your coworkers like, '
        'and how do you usually work together as a team?</div>'
        '<div class="k11-vi">Kể cho Mina về những người anh làm cùng: họ là người thế nào '
        'và cả đội thường làm việc cùng nhau ra sao.</div>'
        '<div class="chips"><span>50–60 giây</span><span>65+ từ</span><span>5+ từ nối</span>'
        '<span>Nhắc ít nhất 2 người cụ thể</span></div>'
        '<div class="k11-foot">Một người tiêu biểu → cả đội làm việc ra sao → một ví dụ → cảm nhận của anh<br>'
        'Nói về người thật, chuyện thật · không đọc bài mẫu<br>'
        'Bấm mic trong app để trả lời · Trả lời đạt để mở trang tiếp</div>'), w=940, cls="k11-card"),
], "", 1080))

P.append(("SEP_GOOD", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 2</div><div class="sep-t">Khi trả lời đạt</div>'
              '<div class="sep-s">Mở bằng Phân tích bài nói trên máy · không tốn lượt AI</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K12", "K12", 200, 150, [
    bub(24, -175, 640, "Now that's a team I'd want to work with.",
        "Đó mới là một đội em muốn làm cùng.", (560, 430)),
    th(30, 975, 600, "She laughed. Khoa didn't.", "(Cô ấy bật cười. Khoa thì không.)"),
], "", None))

P.append(("K13", "K13", 60, 60, [
    bub(24, 120, 380, "Excuse me. Urgent call from the supplier.",
        "Xin lỗi. Nhà cung cấp gọi gấp.", (540, 330), who="khoa"),
    bub(744, 220, 316, "Enjoy your… dinner.", "Chúc hai người… ăn ngon.", (640, 360), who="khoa"),
], "", None))

P.append(("K14", "K14", 60, 220, [
    bub(24, 30, 340, "You were jealous tonight.", "Tối nay anh ghen đấy.", (520, 300)),
    bub(780, 60, 270, "Admit it.", "Thừa nhận đi.", (640, 280)),
    th(30, 745, 900, "Her perfume… the city lights… and her lips, this close.",
       "(Mùi nước hoa… ánh đèn thành phố… và đôi môi cô ấy, gần thế này.)"),
], "", None))

P.append(("K15", "K15", K15_PT, 150, [
    raw(40, -305, (
        '<div class="nt-head"><span class="scr-av grp">Q</span><span class="nt-app">OQC Weekly</span>'
        '<span class="nt-now">bây giờ</span></div>'
        '<div class="nt-who">Team Leader Yoon</div>'
        '<div class="nt-en">Weekly meeting moved to 8:00 tomorrow. Minh will present the HOLD report — in English.</div>'
        '<div class="nt-vi">Họp tuần dời lên 8:00 sáng mai. Minh thuyết trình báo cáo HOLD — bằng tiếng Anh.</div>'),
        w=1000, cls="notif"),
    scr(K15_Q, 300, 582, K15_SCREEN, K15_PT),
    sfx(40, 470, "Rrr… Rrr…", 58, -8),
    bub(744, 120, 316, "…Saved by your boss.", "…Sếp anh cứu anh rồi đấy.", (600, 470)),
    bub(744, 700, 316, "Looks like you'll need me tomorrow, too. …Walk me home?",
        "Có vẻ mai anh cũng cần em đấy. …Đưa em về nhé?", (620, 480)),
    th(30, 1480, 820, "In English… in front of Team Leader Yoon.",
       "(Bằng tiếng Anh… trước mặt Team Leader Yoon.)"),
], "", None))

P.append(("K15C", None, 0, 0, [
    raw(0, 0, (
        '<div class="msg-time">23:58</div>'
        '<div class="msg-date">Thứ Ba</div>'
        '<div class="msg-card">'
        '<div class="msg-head"><span class="msg-av">M</span><span class="msg-name">Mina</span><span class="msg-now">bây giờ</span></div>'
        '<div class="msg-b"><div class="en">Couldn\'t stop thinking about the rooftop.</div>'
        '<div class="vi">Cứ nghĩ mãi về sân thượng.</div></div>'
        '<div class="msg-b"><div class="en">…The view, I mean.</div><div class="vi">…Ý em là cảnh đẹp ấy.</div></div>'
        '</div>'), w=1080, cls="msg"),
], "", 720))

P.append(("K15B", None, 0, 0, [
    raw(0, 0, (
        '<div class="end-k">CÒN TIẾP…</div>'
        '<div class="end-t">Tập 6 · The Weekly Meeting</div>'
        '<div class="end-s">Thứ Tư 08:00 · Phòng họp</div>'
        '<div class="end-r">+10 ♥ · Mở khóa Tập 6 · Photocard “Rooftop”</div>'), w=1080, cls="end"),
], "", 520))

P.append(("P1", "P1", 60, 120, [
    raw(0, 1640, '<span class="pill-k">PHOTOCARD</span><span>“Rooftop” · mở khi trả lời đạt</span>',
        w=1080, cls="pc-label"),
], "", None))

P.append(("SEP_RETRY", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 3</div><div class="sep-t">Khi chưa đạt</div>'
              '<div class="sep-s">App hiện thêm 1–2 gợi ý từ Phân tích bài nói, rồi cho nói lại</div>', w=1080, cls="sep"),
], "", 340))

P.append(("K16", "K16", 200, 190, [
    bub(24, -175, 600, "Hmm. That's still a textbook, Minh.", "Hừm. Vẫn là sách giáo khoa đấy, Minh.", (540, 420)),
    bub(722, 560, 338, "Pick one coworker. What's that person like? Tell me one real story.",
        "Chọn một đồng nghiệp. Người đó thế nào? Kể em một chuyện thật.", (620, 420)),
    raw(290, 1110, f'{MIC.format(s=40)}<span>NÓI LẠI · Mina đang chờ</span>', w=500, cls="pill"),
], "", None))

P.append(("SEP_BONUS", None, 0, 0, [
    raw(0, 0, '<div class="sep-k">PHẦN 4</div><div class="sep-t">Cảnh thưởng</div>'
              '<div class="sep-s">Mở khi AI Coach ước tính đạt mục tiêu luyện tập<br>(ước tính luyện tập, không phải điểm OPIc chính thức)</div>',
        w=1080, cls="sep"),
], "", 340))

P.append(("K17", "K17", 60, 220, [
    cap(24, 24, "21:40"),
    bub(740, 110, 320, "Don't tell anyone I can't walk in heels.",
        "Đừng kể với ai là em không đi nổi giày cao gót nhé.", (560, 420)),
    sfx(50, 330, "Chụt.", 72, -10, cls="sfx-r"),
    bub(24, 560, 300, "And… thanks for saving me.", "Và… cảm ơn anh đã cứu em.", (420, 480)),
    raw(120, 1642, '<span class="pill-k">CẢNH THƯỞNG</span><span>+5 ♥ · Ảnh hiếm “Barefoot”</span>',
        w=840, cls="pill pill-gold"),
], "", None))

P.append(("K17B", "K17B", 60, 420, [
    chat(130, 755, "Mina", "23:40", [("You still have my lipstick on your collar.", "Cổ áo anh vẫn còn dính son của em đấy."),
                                     ("Wash it before the meeting. 😉", "Giặt trước buổi họp nhé. 😉")]),
], "", None))
