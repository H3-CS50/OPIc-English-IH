# OPIc OQC — luyện nói OPIc tiếng Anh (IM · IH · AL)

App Android và bộ dữ liệu luyện nói **OPIc English**, theo lộ trình **IM → IH → AL**.

> Đây là công cụ **luyện tập**. Nhãn IM/IH/AL trong app chỉ là mục tiêu luyện tập hoặc ước tính luyện tập, không phải rating ACTFL chính thức.

## 📱 Tải app

Vào [Releases](../../releases/latest), tải file **`OPIc-OQC.apk`** rồi mở để cài. Bản mới cài đè lên bản cũ (kể cả bản "OPIc IH" v1) và giữ nguyên lịch sử luyện tập.

### App có gì

| Tab | Tính năng |
|---|---|
| 🎤 **Luyện** | Chọn mục tiêu IM/IH/AL. Lọc theo bộ câu hỏi (của lớp / của app), nhóm, chủ đề, dạng câu, có nhánh OQC tùy chọn. Nghe câu hỏi, ẩn/hiện chữ, xem gợi ý khung. 📝 Chuyển giọng nói thành chữ hoặc 🎙️ ghi âm. **AI Coach** nhận xét theo FACT, chỉ ra một khoảng trống chính và giao **bài nói lại**. Có 📖 bài mẫu (3 cấp với câu của app, bài mẫu IH với câu của lớp), ✅ tự kiểm tra, 📋 copy nhờ Claude chấm |
| 📝 **Thi thử** | 15 câu trong 40 phút: giới thiệu → 3 combo → role-play → câu nâng cao. Chọn nguồn câu hỏi (lớp / app / cả hai), chủ đề Survey và độ khó. Nghe lại câu hỏi 1 lần. Sau khi nộp: chấm từng câu hoặc cả bài, xem ước tính tổng |
| 📚 **Học** | 258 câu hỏi của lớp (mỗi câu có bài mẫu IH) + 142 câu hỏi của app; 24 bộ bài mẫu IM/IH/AL; ma trận cấp độ; khung trả lời; tài liệu; flashcard |
| 📈 **Tiến bộ** | Thống kê, chuỗi ngày luyện, ước tính theo dạng câu, 🎯 luyện điểm yếu, lịch sử |
| ⚙️ **Cài đặt** | Chọn AI: **Claude** (chấm theo chữ), **Gemini** (nghe được ghi âm, có gói miễn phí) hoặc chỉ copy. Key chỉ lưu trên máy. Nhập bộ câu hỏi riêng (JSON/CSV) |

## 📂 Cấu trúc repo

| Thư mục | Nội dung |
|---|---|
| [`OPIC_OQC_KNOWLEDGE_BASE_V1/`](OPIC_OQC_KNOWLEDGE_BASE_V1/) | Knowledge base: nguồn đã kiểm chứng, phát hiện chính thức từ ACTFL, ma trận IM/IH/AL, taxonomy, ngân hàng câu hỏi, bài mẫu, prompt AI Coach, schema, product spec, báo cáo QA, manifest. Bắt đầu đọc từ [`00_README.md`](OPIC_OQC_KNOWLEDGE_BASE_V1/00_README.md) |
| [`tools/kb/`](tools/kb/) | Nguồn dữ liệu và script `build_kb.py` sinh + kiểm định dữ liệu (chạy trong CI) |
| [`app/`](app/) | App Capacitor (Android). `npm run build` → `npx cap sync android` → Gradle |
| [`01-cau-hoi-bai-mau/`](01-cau-hoi-bai-mau/), [`02-templates/`](02-templates/), [`03-flashcards/`](03-flashcards/) | Thư viện v1 (bài mẫu IH, khung trả lời, flashcard), vẫn hiển thị trong app |

## 🔧 Cập nhật nội dung

1. Sửa `tools/kb/questions_src.py` (thêm câu với số id mới), `answers_src_*.py` hoặc `OPIC_OQC_KNOWLEDGE_BASE_V1/07_AI_COACH_GRADING_PROMPT.md`.
   Câu hỏi của lớp: `tools/kb/class_pack/class_questions_src.json`, bài mẫu IH trong `tools/kb/class_pack/ans_*.py`, dạng câu trong `tools/kb/class_pack/class_meta.py`.
2. Push lên GitHub. CI chạy kiểm định dữ liệu và kiểm thử logic, rồi build APK và đăng lên Releases.

## ⚠️ Lưu ý

- 258 câu hỏi của lớp do người dùng tự soạn. Các câu hỏi khác và mọi bài mẫu do AI viết, **chưa có giáo viên duyệt**. Xem [`10_QA_AND_GAP_REPORT.md`](OPIC_OQC_KNOWLEDGE_BASE_V1/10_QA_AND_GAP_REPORT.md).
- **Đừng học thuộc bài mẫu.** ACTFL lưu ý rằng lời nói học thuộc có thể khiến thí sinh không vượt được mức Novice. Hãy học khung và cụm từ, rồi kể chuyện thật của bạn.
- Khi chấm, câu hỏi và bài nói được gửi tới nhà cung cấp AI bạn chọn. Đừng đưa thông tin nội bộ công ty vào câu trả lời.
