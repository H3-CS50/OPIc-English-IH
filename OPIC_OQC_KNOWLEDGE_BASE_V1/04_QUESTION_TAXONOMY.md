# 04 — Question taxonomy (OPIc OQC)

> File này được sinh tự động từ `tools/kb/taxonomy.py` và `tools/kb/questions_src.py`. Sửa ở nguồn rồi chạy lại `python3 tools/kb/build_kb.py`.

## 1. Căn cứ của từng nhóm

| Nhóm phân loại | Căn cứ | Ghi chú |
|---|---|---|
| Background Survey quyết định nhóm chủ đề | **Chính thức** — SRC-0001, SRC-0002 (p.4) | ACTFL không công bố danh sách chủ đề đầy đủ. |
| Chủ đề *survey* vs *unexpected/random* | **Cộng đồng / tài liệu luyện thi** — SRC-0101, SRC-U10, SRC-U11, SRC-U13 | Thiết kế của app; không khẳng định chủ đề nào chắc chắn xuất hiện. |
| Dạng câu (miêu tả, kể, so sánh, role-play, vấn đề) | **Diễn giải** từ FACT (SRC-0003) + chương sách SRC-U01 | Functions trong Guidelines: describe, narrate, ask questions, handle complications… |
| Khung thời gian mục tiêu | **Diễn giải** từ descriptor IM/IH/AL (SRC-0003) | Advanced: narrate & describe in major time frames. |
| `difficulty_design` (easy/medium/challenging) | **Thiết kế sư phạm của app** | Không phải rating chính thức. |
| `mock_slot` (intro/combo/rp_*/adv) | **Cộng đồng** — SRC-0101, SRC-U01, SRC-U13 | Cấu trúc 15 câu chưa được ACTFL xác nhận. |
| `oqc_branch` | **Thiết kế của app** | Nhánh tùy chọn cho người làm nhà máy/kiểm tra chất lượng; mặc định tắt trong thi thử. |

## 2. Chủ đề

| key | Tiếng Việt | English | Nhóm | Số câu |
|---|---|---|---|---|
| `self_intro` | Giới thiệu bản thân | Self-introduction | intro | 3 |
| `work` | Công việc | Work | survey | 6 |
| `oqc_work` | Công việc OQC / nhà máy | Quality inspection work (optional OQC branch) | survey | 5 |
| `housing` | Nhà ở | Home / Housing | survey | 8 |
| `movies` | Xem phim | Movies | survey | 6 |
| `music` | Nghe nhạc | Music | survey | 3 |
| `parks` | Công viên | Parks | survey | 3 |
| `walking` | Đi bộ / chạy bộ | Walking & jogging | survey | 3 |
| `beach` | Đi biển | Beaches | survey | 3 |
| `domestic_trips` | Du lịch trong nước | Domestic trips | survey | 3 |
| `overseas_trips` | Du lịch nước ngoài | Overseas trips | survey | 3 |
| `vacation_home` | Nghỉ lễ ở nhà | Vacations at home | survey | 3 |
| `technology` | Công nghệ | Technology | unexpected | 5 |
| `phones` | Điện thoại | Mobile phones | unexpected | 5 |
| `internet` | Internet | Internet | unexpected | 5 |
| `weather` | Thời tiết | Weather & seasons | unexpected | 3 |
| `transportation` | Giao thông | Transportation | unexpected | 5 |
| `recycling` | Tái chế / môi trường | Recycling & environment | unexpected | 5 |
| `holidays` | Ngày lễ | Holidays | unexpected | 5 |
| `health` | Sức khỏe | Health | unexpected | 5 |
| `family_friends` | Gia đình & bạn bè | Family & friends | unexpected | 3 |
| `restaurants` | Nhà hàng / ăn ngoài | Restaurants & eating out | unexpected | 3 |
| `banks` | Ngân hàng | Banks | unexpected | 3 |
| `appointments` | Cuộc hẹn | Appointments | unexpected | 3 |
| `furniture` | Đồ nội thất | Furniture | unexpected | 3 |
| `shopping` | Mua sắm | Shopping | unexpected | 5 |
| `geography` | Địa lý đất nước | Geography | unexpected | 3 |
| `industry` | Ngành nghề / việc làm | Industry & jobs | unexpected | 2 |
| `rp_hotel` | Role-play: khách sạn | Role-play: hotel | role_play | 3 |
| `rp_clothing` | Role-play: cửa hàng quần áo | Role-play: clothing store | role_play | 3 |
| `rp_cinema` | Role-play: rạp phim | Role-play: movie theater | role_play | 3 |
| `rp_phone_store` | Role-play: cửa hàng điện thoại | Role-play: phone store | role_play | 3 |
| `rp_travel` | Role-play: đại lý du lịch | Role-play: travel agency | role_play | 3 |
| `rp_furniture` | Role-play: cửa hàng nội thất | Role-play: furniture store | role_play | 3 |
| `rp_gym` | Role-play: phòng gym | Role-play: fitness center | role_play | 3 |
| `rp_restaurant_friend` | Role-play: hẹn bạn ăn tối | Role-play: dinner with a friend | role_play | 3 |
| `rp_work_training` | Role-play: khóa đào tạo ở công ty | Role-play: workplace training (OQC branch) | role_play | 3 |
| `rp_ask_ava` | Role-play: đặt câu hỏi cho Ava | Role-play: ask the interviewer | role_play | 3 |

## 3. Dạng câu hỏi (prompt_type)

| key | Tên | Chức năng giao tiếp | Khung thời gian | Độ khó thiết kế | Khung phát triển ý (scaffold) | Số câu |
|---|---|---|---|---|---|---|
| `self_introduction` | Tự giới thiệu | self_present, describe | present | easy | Who I am → what I do → who I live with → what I enjoy and why | 3 |
| `description` | Miêu tả người / nơi / vật | describe | present | easy | Direct answer → overall picture → 2–3 details → what I like / feel | 28 |
| `routine` | Thói quen, hoạt động thường làm | describe, sequence_events | present | easy | How often → step by step → small details → why / how it feels | 19 |
| `preference_opinion` | Sở thích / lựa chọn + lý do | state_preference, give_reasons | present | easy | Preference → reason 1 → reason 2 + example → wrap-up | 2 |
| `past_recent` | Kể lần gần nhất | narrate_past, sequence_events | past | medium | When / where / who → what happened in order → feelings → result | 7 |
| `past_first` | Kể lần đầu / quá trình hình thành sở thích | narrate_past, describe | past, present | medium | Starting point → who / what got me into it → how it changed → now | 6 |
| `memorable_experience` | Trải nghiệm đáng nhớ / bất ngờ | narrate_past, handle_complication | past | medium | Background → the special moment → what happened next → why I remember it | 11 |
| `problem_experience` | Kể sự cố và cách giải quyết | narrate_past, handle_complication | past | challenging | Background → the problem → what I tried → result / lesson | 9 |
| `comparison_change` | So sánh quá khứ – hiện tại / sự thay đổi | compare, describe, narrate_past | past, present | medium | In the past → now → 2 concrete differences → why it changed / impact | 15 |
| `comparison_two` | So sánh hai đối tượng | compare, describe | present | medium | Introduce A and B → similarities → differences + examples → my view | 2 |
| `roleplay_ask` | Role-play: hỏi 3–4 câu để lấy thông tin | ask_questions, handle_transaction | present, future | easy | Greeting + purpose → 3–4 different questions → thanks / closing | 9 |
| `roleplay_ask_ava` | Role-play: đặt câu hỏi cho người phỏng vấn | ask_questions | present, past, future | easy | Short reaction → 3–4 questions about the interviewer → closing | 3 |
| `roleplay_problem` | Role-play: giải thích vấn đề + đưa phương án | explain_problem, propose_alternatives, handle_complication | past, present, future | challenging | Who I am + why I'm calling → the problem → 2–3 alternatives → closing | 9 |
| `roleplay_experience` | Role-play: kể trải nghiệm liên quan | narrate_past, handle_complication | past | medium | Background → the problem → what I did → result / lesson | 9 |
| `issue_concern` | Vấn đề / mối quan tâm xã hội | discuss_issue, give_reasons, propose_solutions | present, future | challenging | The issue → causes → effects → solutions / my opinion + example | 7 |
| `news_report` | Kể lại một tin tức | report_event, narrate_past, give_opinion | past, present | challenging | What / when / where I heard → main events → reactions → my opinion | 3 |

## 4. Combo và vị trí trong thi thử (thiết kế app)

| Vị trí | Nội dung app dùng | Căn cứ |
|---|---|---|
| Q1 | 1 câu `self_introduction` | Câu mở đầu được ACTFL mô tả là không chấm (SRC-0002 p.5) |
| Q2–4, Q5–7 | 2 combo chủ đề *survey* mà người học chọn | Cộng đồng (SRC-0101) |
| Q8–10 | 1 combo chủ đề *unexpected* | Cộng đồng |
| Q11–13 | 1 bộ role-play (hỏi → giải quyết vấn đề → kể trải nghiệm) | Cộng đồng + SRC-U01 ch.7–8 |
| Q14–15 | Độ khó cao: 1 cặp `adv` (thay đổi + vấn đề/tin tức). Độ khó vừa: 2 câu đầu của một combo khác | Cộng đồng; chưa xác minh chính thức |

## 5. Quy tắc nội dung

- Mọi câu (trừ Q-000001) là `AI_generated_original`, viết mới theo chức năng, không chép câu chữ từ tài liệu bản quyền.
- Mỗi chủ đề có câu kiểm tra nhiều chức năng; mỗi chức năng xuất hiện ở nhiều chủ đề.
- Level không được gán theo độ khó từ vựng. `target_practice_levels` chỉ cho biết câu phù hợp để luyện ở mức nào.
- Nhánh OQC chỉ chiếm 8/142 câu để không lấn át chủ đề đời sống.
