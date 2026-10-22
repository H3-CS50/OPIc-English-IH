# Dữ liệu từ điển (tra từ trong app)

| File | Nội dung | Nguồn / giấy phép |
|---|---|---|
| `gloss_1.txt` … `gloss_7.txt` | Nghĩa tiếng Việt cho ~2.800 từ gốc xuất hiện trong câu hỏi, bài mẫu, từ vựng của app. Mỗi dòng `từ|loại từ|nghĩa` | AI (Claude) soạn mới cho dự án, 2026-10-22. Chưa có giáo viên duyệt |
| `ipa_en_US.txt` | Phiên âm IPA Anh–Mỹ, ~125.000 từ | [ipa-dict](https://github.com/open-dict-data/ipa-dict) `en_US`, dựa trên cmudict-ipa — MIT License (xem `IPA_LICENSE.txt`) |

`tools/kb/build_kb.py` kiểm định và sinh `app/src/gloss.json` (đóng gói vào app) và `app/www/dict/ipa-en.txt` (app tải khi cần).
Thêm từ: thêm dòng vào một file `gloss_*.txt` (không trùng từ), rồi chạy lại `python3 tools/kb/build_kb.py`.
