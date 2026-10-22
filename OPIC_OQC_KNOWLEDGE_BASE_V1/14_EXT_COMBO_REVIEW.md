# 14 · Kiểm tra chất lượng combo bổ sung (2026-10)

35 combo mới (99 câu hỏi + 99 bài mẫu IH) do AI soạn để lấp các chủ đề còn thiếu so với danh sách chủ đề tổng hợp từ nguồn cộng đồng (SRC-0301…0304). Câu hỏi viết lại theo cách hỏi quen thuộc của OPIc, không chép từ nguồn nào. Không có giáo viên duyệt; chất lượng được kiểm theo 3 lớp:

1. **Kiểm tra tự động** (`tools/kb/ext_build.py`, chạy mỗi lần build): độ dài câu hỏi; công thức mở đầu role-play; độ dài bài mẫu theo dạng câu (khớp bảng thời lượng IH trong app); thì quá khứ cho câu kể chuyện; role-play hỏi có ≥3 câu hỏi; role-play vấn đề có ≥2 phương án; không lẫn tiếng Việt / chỗ trống; nhân vật nhất quán; không trùng câu hỏi (>50% cụm 5 từ, bỏ qua câu mở đầu role-play) hay bài mẫu (>20%) đã có; tỉ lệ từ thông dụng. Kết quả chi tiết: `14_EXT_COMBO_QA.json`.
2. **AI chấm độc lập** (một phiên AI riêng, không phải phiên đã viết), theo 5 tiêu chí: giống đề thật, tự nhiên như văn nói, làm đúng yêu cầu câu hỏi, đúng cấp IH, lỗi ngữ pháp / thực tế / lệch nhân vật.
   - Kết quả: **71 đạt, 27 sửa nhỏ, 1 lỗi nặng** trên 99 câu.
   - Lỗi nặng: câu chuyện nghỉ ở nhà thời phong tỏa COVID không khớp tuổi con gái (5 tuổi) → đổi sang kỳ nghỉ mưa mùa hè năm ngoái.
   - Sửa nhỏ tiêu biểu: dùng tai nghe khi đi xe máy (trái luật) → giờ nghỉ trưa; "Vietnamese teacher" → "literature teacher"; "split up" → "divided the work"; "a small surgery" → "minor surgery"; Núi Cốc là hồ, không phải núi; mốc thời gian các câu chuyện cho khớp nhau; bỏ nhắc tên kỳ thi trong bài mẫu.
   - **Tất cả 28 góp ý đã được sửa** trong `tools/kb/ext_pack/*.py`.
3. **Người học góp ý khi dùng** (dự kiến: nút báo câu lạ).

Trạng thái: `review_status = ai_checked`. Chưa có người thật duyệt. Bài mẫu là mục tiêu luyện tập, không phải đáp án chuẩn; không nên học thuộc nguyên văn.
