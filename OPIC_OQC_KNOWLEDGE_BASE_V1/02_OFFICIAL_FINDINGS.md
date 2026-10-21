# 02 — Official findings: OPIc English & ACTFL

Ngày truy cập tất cả nguồn: **2026-10-22**. Mã nguồn (SRC-xxxx) tra trong `01_SOURCE_REGISTER.csv`.
Ký hiệu: **[F]** = sự thật được nguồn chính thức xác nhận · **[I]** = diễn giải chuyên môn · **[D]** = đề xuất thiết kế app · **[H]** = giả thuyết cần kiểm nghiệm · **[C]** = thông tin cộng đồng / tài liệu luyện thi, chưa được ACTFL xác nhận.

ACTFL giữ bản quyền các tài liệu này. File này chỉ tóm tắt bằng lời của nhóm và trích rất ngắn, không chép lại các đoạn dài.

---

## 1. OPIc là gì? Kiểm tra ngôn ngữ nào?

- **[F]** OPIc (Oral Proficiency Interview – computer) là bài đánh giá năng lực nói, thi qua internet. Bài thi mô phỏng buổi phỏng vấn trực tiếp (OPI), nhưng câu hỏi do chương trình máy tính và nhân vật ảo **Ava** đưa ra. *(SRC-0001, mục Overview; SRC-0002 p.3)*
- **[F]** OPIc chính thức có nhiều ngôn ngữ: tiếng Anh, Hàn, Nhật, Trung, Tây Ban Nha, Việt… App này **chỉ** phục vụ **OPIc English**. *(SRC-0001, mục Languages)*
- **[F]** Thời gian trung bình 20–40 phút; bài thi trải cả thang ACTFL từ Novice đến Superior. *(SRC-0001; SRC-0002 p.3)*
- **[F]** Bài thi phải diễn ra trong môi trường được giám sát (proctored). Language Testing International (LTI) là đơn vị được cấp phép độc quyền. *(SRC-0002 p.3, p.10)*

## 2. Quy trình bài thi chính thức

| Bước | Nội dung | Căn cứ |
|---|---|---|
| Assessment Integrity, cài đặt âm thanh | Kiểm tra micro, đọc cam kết | **[F]** SRC-0002 p.3–4 |
| Background Survey | Hỏi về công việc, học tập, nơi ở, hoạt động, sở thích; câu trả lời quyết định **nhóm chủ đề** mà thuật toán chọn câu hỏi | **[F]** SRC-0001; SRC-0002 p.4 |
| Self-Assessment | **Năm** mô tả khả năng nói; lựa chọn quyết định đề (form) nào được tạo | **[F]** SRC-0001; SRC-0002 p.4 |
| Hướng dẫn + câu mẫu không tính điểm | Có thể xem lại hướng dẫn và câu mẫu | **[F]** SRC-0002 p.5 |
| Phỏng vấn | Mở đầu: *"Let's start the interview now. Tell me something about yourself."* (không tính điểm); sau đó Ava hỏi các câu **chọn ngẫu nhiên** từ nhóm chủ đề | **[F]** SRC-0002 p.5 |

**Các form và dải rating có thể đạt** *(SRC-0001; SRC-0002 pp.4–5, p.8)* **[F]**

| Form | Trọng tâm | Rating có thể đạt |
|---|---|---|
| 1 | Novice Low – Novice High | NL – IL |
| 2 | Novice High – Intermediate Mid | NL – IH |
| 3 | Intermediate Mid – Advanced Low | NL – AL |
| 4 | Advanced Low – Advanced Mid | IH – AH |
| 5 | Advanced High – Superior | AL – Superior |

- **[I]** Người nhắm IM / IH / AL thường làm đề Form 2–3, có thể Form 4. Hướng dẫn chính thức **không** nêu cụ thể lựa chọn số mấy ứng với form nào.
- **[C]** Tài liệu luyện thi ở Hàn Quốc và Việt Nam mô tả **6 mức tự đánh giá (1–6)**. Theo các nguồn này, mức 1–2 có 12 câu, mức 3–6 có 15 câu, mức 5–6 có thêm 2 câu "nâng cao" (14–15), và giữa bài được chọn lại độ khó một lần. *(SRC-0101, SRC-U13, SRC-U14)* Mô hình này **mâu thuẫn bề ngoài** với mô hình 5 mô tả của ACTFL. Có thể đây là cách hiển thị khác của đơn vị tổ chức tại từng nước. **Chưa xác minh được** → ghi trong `10_QA_AND_GAP_REPORT.md`.
- **[C]** Số lần nghe lại câu hỏi (thường được nói là "nghe lại một lần trong 5 giây đầu") **không có** trong tài liệu chính thức đã đọc. *(SRC-U13; SRC-0002 không đề cập)*

## 3. Cách đánh giá: ACTFL FACT

- **[F]** Proficiency Guidelines 2024 mô tả năng lực theo **bốn tiêu chí FACT**: *(SRC-0003 p.4)*
  - **F — Functions & tasks:** các hoạt động giao tiếp người nói xử lý được.
  - **A — Accuracy:** mức độ chính xác khi dùng ngữ pháp, từ vựng, kiến thức văn hóa – xã hội.
  - **C — Context & content:** những tình huống và chủ đề người nói xử lý được.
  - **T — Text type:** độ dài và độ phức tạp của lời nói, từ từ đơn lẻ đến diễn ngôn nhiều đoạn.
- **[F]** Trang OPIc gọi bốn yếu tố này là Function, Accuracy, Content & Context, Text Type. Accuracy được hiểu là *how well a speaker is understood*, gồm từ vựng, ngữ pháp, phát âm, độ trôi chảy, năng lực ngữ dụng và xã hội – ngôn ngữ. Các yếu tố **được xem xét tổng thể (holistically)**, không chấm riêng rẽ. *(SRC-0001, mục Assessment Factors; SRC-0002 p.6–7)*
- **[F]** Rating chính thức do **hai rater được chứng nhận** chấm ẩn danh. Hai bên phải khớp hoàn toàn cả bậc chính lẫn bậc phụ; nếu lệch thì có rater thứ ba phân xử. *(SRC-0002 p.9)*
- **[I]** ACTFL không công bố trọng số số học hay "điểm cắt" theo số từ. Mọi điểm số 0–100 trong app chỉ là **chỉ số sư phạm nội bộ** (xem 09).

## 4. Ngôn ngữ tự phát và giới hạn của việc học thuộc

- **[F]** OPIc được thiết kế để đánh giá *spontaneous unrehearsed language ability*. Vì thế ACTFL không cung cấp tài liệu luyện tập; chỉ có Familiarization Guide và bản demo. *(SRC-0001, mục Spontaneity)*
- **[F]** Bài đánh giá nhắm vào khả năng dùng ngôn ngữ trong những tình huống người nói *has not rehearsed or encountered previously*. *(SRC-0002 p.6)*
- **[F]** Mẹo chính thức cho thí sinh *(SRC-0005)*:
  - Học dồn sát ngày thi không cải thiện rating.
  - Dùng quá nhiều lời nói học thuộc có thể khiến thí sinh không vượt được mức Novice.
  - Hãy nói nhiều nhất có thể; người hỏi sẽ chuyển chủ đề khi đã đủ bằng chứng.
  - Đừng chạy theo sự hoàn hảo; ngay cả người nói mức Superior cũng mắc lỗi, chỉ là lỗi không thành quy luật.
  - Theo dõi tin tức trước khi thi.
- **[D]** Hệ quả cho app:
  - Không có chức năng "học thuộc bài mẫu".
  - Bài mẫu luôn đi kèm phần "đừng học thuộc" và "cá nhân hóa".
  - AI coach được yêu cầu nhận xét khi câu trả lời nghe chung chung hoặc như học thuộc.
  - Có chế độ ẩn gợi ý và câu hỏi ngẫu nhiên để luyện phản xạ.

## 5. Mô tả chính thức IM / IH / AL (tóm tắt)

Chi tiết và phần diễn giải xem `03_IM_IH_AL_PROFICIENCY_MATRIX.md`.

- **[F] Intermediate Mid:**
  - Xử lý thành công nhiều nhiệm vụ giao tiếp không phức tạp trong tình huống xã hội và giao dịch đơn giản.
  - Hỏi được nhiều kiểu câu hỏi để đáp ứng nhu cầu cơ bản.
  - Lời nói chủ yếu là **chuỗi câu**; có ngập ngừng, diễn đạt lại, tự sửa.
  - Người nghe nhìn chung hiểu được. *(SRC-0003 pp.17–18)*
- **[F] Intermediate High:**
  - Trò chuyện thoải mái, tự tin trong các tình huống quen thuộc.
  - Làm được **nhiều** nhiệm vụ của mức Advanced nhưng **không duy trì được đều đặn**: dấu hiệu là sai khung thời gian hoặc đoạn kể/tả dài bị đứt mạch.
  - Ảnh hưởng tiếng mẹ đẻ hiếm khi cản trở giao tiếp. *(SRC-0003 p.18)*
- **[F] Advanced Low:**
  - Kể và tả ở quá khứ, hiện tại, tương lai, kiểm soát được phần nào thể (aspect), dù thường xử lý từng khung riêng.
  - Nối câu thành **diễn ngôn dài cỡ một đoạn**.
  - Xử lý được một **tình huống phức tạp hoặc diễn biến bất ngờ**.
  - Dùng diễn đạt lại và nói vòng (circumlocution) để giữ mạch giao tiếp. *(SRC-0003 p.20)*

## 6. Bản quyền và quyền sử dụng — điều app phải tuân thủ

- **[F]** Guidelines chỉ được dùng cho mục đích **giáo dục phi lợi nhuận**: phải in đầy đủ, không chỉnh sửa, ghi nguồn ACTFL. Mọi mục đích khác, kể cả thương mại, cần ACTFL cho phép bằng văn bản. *(SRC-0003 p.2; SRC-0006)*
- **[F]** Familiarization Guide: *No portion of this document may be reproduced or reprinted without the written permission of ACTFL.* *(SRC-0002 p.1)*
- **[F]** Chỉ bài thi ACTFL chính thức (qua LTI, rater được chứng nhận) mới cho ra rating ACTFL chính thức. Rating do bên thứ ba tự gọi là "ACTFL rating" là **không chính thức và không hợp lệ**. *(SRC-0006)*
- **[F]** Can-Do Statements: chỉ dùng cho giáo dục, phi lợi nhuận; cấm dùng thương mại hoặc bán. *(SRC-0007)*
- **[D]** Vì vậy app:
  - Không chép văn bản Guidelines hay Familiarization Guide; chỉ tóm tắt bằng lời riêng và ghi nguồn.
  - Gắn nhãn mọi ước tính là **"ước tính luyện tập"**, không bao giờ gọi là "rating".
  - Không dùng logo ACTFL.
  - Nếu sau này thương mại hóa: cần xin phép ACTFL cho phần nội dung dựa trên Guidelines, và rà soát việc dùng tên "OPIc" trong tên app. "OPIc" là tên bài thi của ACTFL; quyền nhãn hiệu chưa được kiểm tra → xem 10.

## 7. Thông tin chính thức vs. chiến lược của bên thứ ba

| Thông tin | Phân loại |
|---|---|
| Background Survey, Self-Assessment, 5 form, Ava, câu mở đầu, FACT, chấm tổng thể, 2 rater | **Chính thức** |
| 15 câu, cấu trúc combo 3 câu, role-play Q11–13, Q14–15 nâng cao, 6 mức độ khó, chọn lại độ khó, nghe lại trong 5 giây | **Cộng đồng / tài liệu luyện thi** |
| "70–90 từ / câu", "1:30–2:00 / câu", "trả lời giống nhau trong combo bị hủy bài" | **Chưa xác minh** — không dùng làm tiêu chí |
| Khung trả lời (Intro → Body → Closing, 5W1H…) | **Chiến lược sư phạm**, không bắt buộc |
