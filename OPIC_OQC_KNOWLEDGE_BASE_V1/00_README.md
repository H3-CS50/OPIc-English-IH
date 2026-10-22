# OPIc OQC Knowledge Base V1

Bộ dữ liệu và tài liệu nền cho app Android **OPIc OQC**. App giúp người học luyện nói **OPIc English** theo lộ trình **IM → IH → AL**.

> ⚠️ **Đây là hệ thống luyện tập, không phải hệ thống chấm hay cấp điểm chính thức.**
> - Mọi nhãn IM/IH/AL trong bộ dữ liệu và trong app chỉ là *mục tiêu luyện tập* hoặc *ước tính luyện tập*.
> - Rating ACTFL chính thức chỉ có từ bài thi OPIc chính thức, do Language Testing International tổ chức và do rater được chứng nhận chấm (xem `02_OFFICIAL_FINDINGS.md` §6).

- **Phiên bản dữ liệu:** 1.0.0
- **Schema:** 1.0
- **Ngày tạo:** 2026-10-22
- **Ngôn ngữ thi:** tiếng Anh

## Các file

| File | Nội dung |
|---|---|
| `00_README.md` | File này |
| `01_SOURCE_REGISTER.csv` | 27 nguồn đã kiểm tra thực tế, kèm tier, trạng thái truy cập và quyền sử dụng |
| `02_OFFICIAL_FINDINGS.md` | OPIc là gì, quy trình thi, FACT, ngôn ngữ tự phát, bản quyền; phân biệt thông tin chính thức với thông tin cộng đồng |
| `03_IM_IH_AL_PROFICIENCY_MATRIX.md` | Ma trận IM/IH/AL theo FACT: descriptor chính thức (tóm tắt), diễn giải, bằng chứng, điểm nghẽn, bài tập, độ tin cậy |
| `04_QUESTION_TAXONOMY.md` | Chủ đề, dạng câu, khung thời gian, vị trí trong thi thử; nêu căn cứ của từng nhóm *(file sinh tự động)* |
| `05_QUESTION_BANK_SEED.jsonl` | 142 câu hỏi luyện tập (141 câu do AI viết mới, 1 câu trích ngắn từ ACTFL) |
| `06_IM_IH_AL_SAMPLE_ANSWERS.jsonl` | 72 bài mẫu = 24 bộ × (IM, IH, AL), cùng câu hỏi và cùng nhân vật, kèm giải thích tiếng Việt |
| `07_AI_COACH_GRADING_PROMPT.md` | System prompt cho AI Coach (app dùng nguyên văn) và mẫu tin nhắn người dùng |
| `08_DATA_SCHEMA.json` | JSON Schema: source, question, sample_answer, coach_result, practice_session (MVP), progress (Later) |
| `09_APK_CONTENT_PRODUCT_SPEC.md` | Module app, ưu tiên P0/P1/P2, kiến trúc hiện tại và kiến trúc FastAPI + SQL Server sau này |
| `10_QA_AND_GAP_REPORT.md` | Kết quả kiểm định, khoảng trống, mâu thuẫn giữa nguồn, quyền sử dụng, việc cần làm tiếp |
| `12_CLASS_QUESTION_BANK.jsonl` | 258 câu hỏi của lớp (người dùng tự soạn) + 1 bài mẫu IH do AI viết cho mỗi câu *(file sinh tự động)* |
| `13_VOCAB_BANK.jsonl` | 1241 từ & cụm từ cho tab Từ vựng: 618 mục từ app OPIc AL Vocab của người dùng + flashcard v1 + phần AI viết mới có nguồn tham khảo *(file sinh tự động)* |
| `11_DATASET_MANIFEST.json` | Số lượng record, trạng thái kiểm định, checksum SHA-256 *(file sinh tự động)* |
| `validation_report.json` | Chi tiết từng phép kiểm tra tự động *(file sinh tự động)* |

## Định nghĩa nhãn

| Trường | Giá trị | Ý nghĩa |
|---|---|---|
| `content_origin` | `AI_generated_original` | Do Claude viết mới cho dự án |
| | `official_excerpt_reference` | Trích ngắn từ tài liệu ACTFL, có ghi nguồn |
| | `user_provided` | Câu hỏi của người dùng. `origin_set: class` = bộ câu hỏi của lớp, đóng gói trong APK (người dùng sở hữu); `origin_set: imported` = tự nhập trong app, chỉ lưu trên máy |
| `target_practice_levels` | IM / IH / AL | Câu phù hợp để luyện ở mức nào. **Không phải** độ khó chính thức |
| `level_label_type` | `practice_target_not_official_rating` | Bắt buộc với mọi bài mẫu |
| `difficulty_design` | easy / medium / challenging | Nhãn sư phạm của app |
| `mock_slot` | intro / combo / rp_ask / rp_problem / rp_experience / adv | Vị trí trong thi thử. Cấu trúc này lấy từ tài liệu luyện thi, chưa được ACTFL xác nhận |
| `review_status` | draft → ai_checked → human_reviewed → approved | Hiện tại mọi record mới ở mức `ai_checked` |
| `tier` (nguồn) | 1 official · 2 educational · 3 community/learner · 4 AI-generated | Thứ bậc tin cậy |

## Cách cập nhật

1. Sửa nguồn trong `tools/kb/`:
   - `questions_src.py`: thêm câu với **số id mới**, không đánh số lại.
   - `answers_src_*.py`, `sources.py`, `taxonomy.py`.
   - Từ vựng: `vocab/opic_al_vocab_app.json`, `vocab/ext_*.py`, `vocab/topics.py`.
   - Câu hỏi của lớp: `class_pack/class_questions_src.json` (câu hỏi), `class_pack/ans_*.py` (bài mẫu IH), `class_pack/class_meta.py` (dạng câu, chủ đề).
   - Prompt AI Coach: sửa trong `07_AI_COACH_GRADING_PROMPT.md`.
2. Chạy `python3 tools/kb/build_kb.py`. Script kiểm định schema, ID, liên kết nguồn, ngôn ngữ, câu trùng và bí mật. Nếu có lỗi FAIL, script trả mã lỗi.
3. Push lên GitHub. CI chạy lại bước 2. Nếu đạt, CI build APK và đăng lên Releases.

## Nguyên tắc đã áp dụng

- ACTFL là chuẩn cho format và tiêu chí. Tài liệu bên ngoài chỉ dùng để gợi ý chủ đề, dạng câu và chiến lược học.
- Không chép câu hỏi hay bài mẫu từ tài liệu có bản quyền. Tài liệu người dùng cung cấp chỉ dùng làm tham khảo nội bộ (`REUSE_RIGHTS_UNCLEAR`), trừ bộ câu hỏi của lớp (SRC-U10) mà người dùng xác nhận là tự soạn.
- Không quy level về số từ, từ khó hay idiom. Ba bài mẫu khác nhau ở cách thực hiện nhiệm vụ và tổ chức ý.
- Chỉ có transcript thì không đánh giá phát âm hay độ trôi chảy.
- Khuyến khích cá nhân hóa, không khuyến khích học thuộc.
