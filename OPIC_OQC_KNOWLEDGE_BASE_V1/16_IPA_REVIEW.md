# 16 · Kiểm tra nội dung mục Học IPA (2026-10-22)

Nội dung: `app/src/ipa-data.js` — 40 âm (16 nguyên âm, 24 phụ âm), 32 cặp âm dễ nhầm, 8 bài học. Ký hiệu theo kiểu Anh–Mỹ của từ điển trong app (ipa-dict en_US), có đối chiếu kiểu Anh–Anh.

1. **Kiểm tra tự động** (test của app): mọi từ ví dụ phải chứa đúng âm đang dạy trong phiên âm của app; mọi cặp âm có phiên âm hợp lệ và khác nhau; mọi âm nằm trong ít nhất một bài.
2. **AI rà độc lập** (một phiên AI riêng, vai chuyên gia ngữ âm Anh–Mỹ/Anh–Anh và ngữ âm tiếng Việt Bắc/Nam): **5 lỗi lớn, 40 góp ý nhỏ — đã sửa hết.**
   - Lỗi lớn: /ɔ/ kiểu Mỹ ứng với cả /ɔː/ và /ɒ/ kiểu Anh (long, dog); /dʒ/ không so với "gi" (miền Bắc đọc /z/); quy tắc "t đọc nhẹ như đ" chỉ khi âm tiết sau không nhấn (hotel vẫn bật hơi); Bài 5 có 7 âm, không phải 8.
   - Góp ý nhỏ tiêu biểu: so sánh tiếng Việt ghi rõ theo miền (v, w/qu, s, l/n, d); "ng" lấy ví dụ "sang" thay "sông" (tiếng Việt khép môi sau o/ô/u); bật hơi không áp dụng sau "s"; bảng -s/-ed tách rõ âm rung; thêm dòng ɑr, ɔr, æ/ɑː vào bảng Anh–Mỹ; cảnh báo can /kən/ – can't /kænt/; đổi cặp low/law thành so/saw và man/men thành bad/bed cho khớp giọng máy.
3. Chưa có giáo viên duyệt. Phần "gần giống tiếng Việt" là gợi nhớ gần đúng.
