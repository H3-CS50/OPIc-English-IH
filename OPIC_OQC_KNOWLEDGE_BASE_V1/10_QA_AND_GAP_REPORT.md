# 10 — QA & gap report

Ngày: 2026-10-22 · Phiên bản dữ liệu 1.0.0

## 1. Checklist kiểm định

### 1a. Kiểm tra tự động (`tools/kb/build_kb.py`, chạy lại mỗi lần build)

<!-- AUTO-CHECKS START -->
| Kiểm tra | Kết quả |
|---|---|
| `schema_question` | **PASS** |
| `schema_sample_answer` | **PASS** |
| `schema_source` | **PASS** |
| `unique_question_ids` | **PASS** |
| `unique_answer_ids` | **PASS** |
| `unique_source_ids` | **PASS** |
| `provenance_links` | **PASS** |
| `target_language_english_only` | **PASS** |
| `level_label_type` | **PASS** |
| `question_near_duplicates` | **PASS** |
| `answer_sets_complete` | **PASS** |
| `levels_rewritten_not_padded` | **PASS** |
| `no_secrets_or_company_names` | **PASS** |
| `human_review` | **NEEDS_REVIEW** |
| `jsonl_parse` | **PASS** |
| `coach_prompt_present` | **PASS** |

Số lỗi FAIL: 0 · cần xem lại: 0. Chi tiết trong `validation_report.json`.
<!-- AUTO-CHECKS END -->

### 1b. Kiểm tra theo yêu cầu dự án

| # | Kiểm tra | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | Source validation: mỗi nguồn có URL, title, tier, trạng thái truy cập; không có nguồn giả | **PASS** | 27 nguồn. Nguồn chỉ thấy qua đoạn trích tìm kiếm được ghi `snippet_only` (SRC-0102) |
| 2 | Citation validation: claim về format/rating có nguồn | **PASS** | Mọi claim chính thức trong 02/03 có mã nguồn và trang |
| 3 | Language validation: câu hỏi và bài mẫu là tiếng Anh tự nhiên | **PASS (tự động) / NEEDS_REVIEW (người)** | Đã tự đọc lại; chưa có người bản ngữ hoặc giáo viên duyệt |
| 4 | Target-language validation: không lẫn tiếng Hàn hay tiếng Việt trong trường tiếng Anh | **PASS** | Kiểm tra bằng regex |
| 5 | Level-label validation: phân biệt official, author-reported, analyst estimate, practice target | **PASS** | Bài mẫu: `practice_target_not_official_rating`. Nhãn "IH+" trong tài liệu người dùng ghi là author-reported (SRC-U08) |
| 6 | Copyright validation: nội dung chưa rõ quyền không vào APK | **PASS** | APK chỉ chứa nội dung AI viết mới, 1 câu trích ACTFL rất ngắn, và tài liệu v1 do AI viết |
| 7 | Question duplication | **PASS** | Không có cặp câu nào giống nhau ≥ 0.8 |
| 8 | Answer quality: các mức khác nhau về năng lực thể hiện, không chỉ độ dài | **PASS (tự động) / NEEDS_REVIEW (người)** | Độ trùng văn bản giữa các mức < 0.6. Có `key_differences_vi` cho từng bộ |
| 9 | Hallucination audit | **PASS (tự kiểm)** | Đã gỡ các claim chưa xác minh khỏi tài liệu v1 (độ khó 1–6, "dưới 1 phút không thể IH", "tự sửa lỗi là điểm cộng") |
| 10 | Text/audio boundary | **PASS** | Prompt bắt buộc `not_assessed`; code app cũng ép lại khi chỉ có transcript |
| 11 | Bias & accessibility | **PASS (thiết kế)** | Prompt cấm trừ điểm vì accent; chỉ nhận xét khi ảnh hưởng tới việc người nghe hiểu |
| 12 | Human review | **NEEDS_REVIEW** | Chưa có giáo viên hoặc rater được chứng nhận duyệt bất kỳ record nào |

## 2. Nguồn: thành công / thất bại

| Nguồn | Kết quả |
|---|---|
| SRC-0001 ACTFL OPIc page | ✅ Đọc được. Bảng tiêu chí theo level là ảnh, phải lấy từ Familiarization Guide |
| SRC-0002 Familiarization Guide 2024 (URL trong prompt) | ✅ Đọc được |
| SRC-0003 Proficiency Guidelines 2024 PDF | ⚠️ Một phần: công cụ đọc khoảng 100k/135k ký tự. Phần Speaking (tr.12–23) đã đủ |
| SRC-0004 Guidelines resource page | ⚠️ Chuyển hướng tới trang Terms; nội dung động không lấy được |
| SRC-0005 Tips for test takers | ✅ |
| SRC-0006 Use of Guidelines / official tests | ✅ |
| SRC-0007 Can-Do Statements | ⚠️ Một phần: chưa đọc các PDF Intermediate/Advanced |
| Language Testing International (LTI) | ❌ **NOT COMPLETED**: chưa mở trang LTI, ví dụ quy định lịch thi tại Việt Nam |
| Nguồn cộng đồng tiếng Hàn | ✅ SRC-0101 đọc được (trang Hàn, thi tiếng Anh). SRC-0102 chỉ thấy đoạn trích |
| Tài liệu người dùng | ✅ PDF: 13 file, có 1 bản trùng y hệt. Project docs: đã đọc OPIc_Questions.xlsx, Role plays, Combo 2, Overview, Lesson 1, Mock Test 01, Issue_Practice. ⚠️ **NOT COMPLETED**: Combo 3, Lesson 2–5 và 12–15, 15 deck Mock Test còn lại chưa đọc chi tiết |

**File trùng trong Project:**
- 13 deck Mock Test được tải lên 2 lần (16 file khác nhau).
- `OPIc_Questions.xlsx` có 2 bản.
- `OPIc - Sample Answer - IH.pdf` có 2 bản (MD5 giống nhau).

## 3. Mâu thuẫn giữa nguồn

| Chủ đề | Nguồn chính thức | Nguồn khác | Xử lý |
|---|---|---|---|
| Số lựa chọn Self-Assessment | 5 mô tả → 5 form (SRC-0001, SRC-0002) | 6 mức 1–6 (SRC-0101, SRC-U13, SRC-U14) | Theo ACTFL; ghi nhận 6 mức như cách hiển thị địa phương **chưa xác minh**. App dùng "độ khó 3–4 / 5–6" chỉ như nhãn luyện tập |
| Số câu, cấu trúc combo | Không công bố | 12/15 câu, combo 3 câu, Q11–13 role-play, Q14–15 nâng cao | Dùng làm cấu trúc thi thử, có ghi "thiết kế app" |
| Nghe lại câu hỏi | Không nêu | Nghe lại 1 lần trong khoảng 5 giây đầu (SRC-U13) | App cho nghe lại 1 lần trong thi thử, có ghi là từ tài liệu luyện thi |
| Độ dài câu trả lời | "Hãy nói nhiều nhất có thể" (SRC-0005); không có mức số | 70–90 từ (SRC-U13); 1:30–2:00 (lớp học) | Không dùng làm tiêu chí. Chỉ có thanh thời gian gợi ý |
| Học thuộc | Lời nói học thuộc có thể khiến không vượt quá Novice (SRC-0005) | Template điền chỗ trống (SRC-U09) | App dạy khung linh hoạt, cảnh báo không học thuộc |
| IM1/IM2/IM3 | Không thấy trong Guidelines 2024 | Phổ biến trong kết quả ở Hàn/Việt | App gộp thành IM, ghi chưa xác minh |
| Phân loại survey/random | Chỉ nói Survey quyết định nhóm chủ đề | Mỗi tài liệu chia chủ đề hơi khác nhau (ví dụ Housing, Work là survey hay random) | App dùng một phân loại thống nhất; không khẳng định chủ đề nào chắc chắn xuất hiện |

## 4. Quyền sử dụng chưa rõ

- **Tài liệu người dùng (SRC-U01…U15): REUSE_RIGHTS_UNCLEAR.** Gồm sách, slide của giáo viên và lớp SEVT, bảng câu hỏi. Các tài liệu này chỉ dùng để tham khảo phân loại; **không** đóng gói vào APK. Người dùng có thể tự nhập bộ câu hỏi của mình vào app (chỉ lưu trên máy).
- **ACTFL Guidelines và Can-Do:** chỉ được dùng cho mục đích giáo dục phi lợi nhuận. Nếu app được thương mại hóa, cần xin phép ACTFL cho phần mô tả level, hoặc thay bằng mô tả hoàn toàn tự xây dựng.
- **Tên "OPIc":** là tên bài thi của ACTFL. **Chưa kiểm tra** đăng ký nhãn hiệu. Trước khi phát hành công khai hoặc thu phí, nên đổi tên app hoặc tìm hiểu quy định dùng tên.
- **Learner answers trong `OPIc_Questions.xlsx`:** thuộc về người viết. Không dùng làm bài mẫu trong APK.

## 5. Giả thuyết cần kiểm nghiệm

1. Ước tính luyện tập của AI (Claude/Gemini) có tương quan với rating OPIc thật. Cần dữ liệu: người học đã có kết quả chính thức ghi âm lại 10–15 câu.
2. Gemini nghe audio cho nhận xét về độ trôi chảy đủ ổn định để hữu ích. Cần so sánh nhiều lần chấm cùng một file.
3. Vòng "main gap → nói lại" giúp cải thiện nhanh hơn luyện tự do. Cần so sánh hai nhóm người học.
4. Thời lượng gợi ý theo mục tiêu không khiến người học nói lan man. Cần theo dõi transcript.
5. Nhánh OQC có ích cho người làm nhà máy mà không làm lệch phân bố chủ đề.

## 6. Giới hạn của việc chấm level bằng AI

- Model không phải rater được chứng nhận và không được huấn luyện theo quy trình ACTFL.
- Một câu trả lời không thể hiện khả năng **duy trì** năng lực qua cả bài phỏng vấn.
- Chuyển giọng nói thành chữ có thể nghe nhầm từ, đặc biệt với giọng Việt. Người học nên sửa transcript trước khi chấm.
- Nhận xét phát âm từ audio là gần đúng. Không dùng để kết luận về accent.
- Kết quả có thể dao động giữa các lần chấm và giữa các model. App giới hạn độ tin cậy từng câu ở mức "trung bình".

## 7. Dữ liệu cần thu thập tiếp

- Bộ ghi âm có rating chính thức (có đồng ý của người nói) để hiệu chỉnh prompt.
- Thêm bài mẫu cho các dạng còn ít:
  - `news_report`, `preference_opinion`, `comparison_two`
  - `issue_concern` trong role-play
  - câu hỏi "ask Ava" ở nhiều chủ đề hơn
- Đọc nốt Combo 3, Lesson 2–15 và các deck Mock Test của người dùng để kiểm tra độ phủ chủ đề (không chép nội dung).
- Đọc phần còn lại của Guidelines 2024 và các PDF Can-Do (Intermediate, Advanced) để bổ sung descriptor cho tự đánh giá.
- Thông tin chính thức từ LTI hoặc đơn vị tổ chức tại Việt Nam về Self-Assessment hiển thị 6 mức.

## 8. Cần người duyệt trước khi phát hành rộng

1. Giáo viên hoặc rater duyệt 24 bộ bài mẫu: mức IM/IH/AL có hợp lý không, tiếng Anh có tự nhiên không.
2. Duyệt 142 câu hỏi: văn phong giống OPIc, độ khó phù hợp `target_practice_levels`.
3. Duyệt `03_IM_IH_AL_PROFICIENCY_MATRIX.md` đối chiếu nguyên văn Guidelines.
4. Thử AI Coach trên 20–30 bài nói thật. Kiểm tra trích dẫn có đúng nguyên văn không, có tự nhận "rating" không.
5. Kiểm tra pháp lý: tên app, điều khoản ACTFL, chính sách dữ liệu giọng nói.
