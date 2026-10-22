# Cài máy chủ nhóm cho OPIc OQC (15 phút, miễn phí)

Máy chủ nhóm là **một Google Sheet kèm đoạn mã Apps Script**. Nó cho app 4 tính năng:

1. **Bảng xếp hạng** ngày / tuần / tháng cho cả nhóm.
2. **Bảng theo dõi** cho người quản trị: ai học đều, ai cần nhắc, tổng giờ nói, kết quả thi.
3. **AI của nhóm**: mọi người chấm bài bằng một API key Gemini chung, không ai phải tự tạo key.
4. **Câu hỏi thi thật** mọi người gửi về sau khi đi thi.

Chỉ người quản trị làm các bước dưới đây, một lần. Mọi dữ liệu nằm trong Google Sheet của bạn.

> Nên dùng **tài khoản Gmail cá nhân**. Tài khoản Google công ty có thể bị quản trị IT chặn quyền "Bất kỳ ai" ở bước 4.

## Bước 1. Tạo Google Sheet và dán mã

1. Mở [sheets.new](https://sheets.new) để tạo bảng tính mới. Đặt tên, ví dụ **OPIc OQC – Máy chủ nhóm**.
2. Trên thanh menu: **Tiện ích mở rộng** → **Apps Script**. Một tab mới mở ra.
3. Xoá hết nội dung có sẵn trong ô soạn mã (`function myFunction() {}`).
4. Mở file `tools/group-server/Code.gs`, copy **toàn bộ** nội dung, dán vào ô soạn mã.
5. Bấm biểu tượng **💾 Lưu dự án** (hoặc Ctrl + S).

## Bước 2. Chạy "setup" một lần

1. Trên thanh công cụ, ở ô chọn hàm, chọn **setup**. Bấm **▶ Chạy**.
2. Google hỏi quyền: bấm **Xem xét quyền** → chọn tài khoản của bạn.
3. Nếu thấy "Google chưa xác minh ứng dụng này": bấm **Nâng cao** → **Đi tới … (không an toàn)**. Đây là mã của chính bạn nên an toàn.
4. Bấm **Cho phép**.
5. Quay lại Google Sheet: có thêm 8 trang tính **Users, Daily, Mocks, Exams, Questions, Flags, AIUsage, Config**.

## Bước 3. Đặt mã quản trị

1. Mở trang tính **Config**.
2. Ở dòng `admin_pin`, cột **value**: nhập một mã từ 6 ký tự trở lên, ví dụ `opic2027`.
3. Mã này dùng để mở **👑 Bảng theo dõi** trong app. Chỉ đưa cho người cần xem báo cáo.

## Bước 4. Triển khai thành ứng dụng web

1. Trong tab Apps Script, bấm **Triển khai** (góc trên bên phải) → **Tùy chọn triển khai mới**.
2. Bấm biểu tượng ⚙️ cạnh **Chọn loại** → chọn **Ứng dụng web**.
3. Điền:
   - **Mô tả:** `OPIc OQC v1`
   - **Thực thi với tư cách:** **Tôi** (email của bạn)
   - **Người có quyền truy cập:** **Bất kỳ ai**
4. Bấm **Triển khai**.
5. Copy **URL ứng dụng web**. URL có dạng `https://script.google.com/macros/s/AKfy…/exec`.
6. Kiểm tra: dán URL vào trình duyệt. Thấy dòng `{"ok":true,"app":"opic-oqc-group",…}` là được.

**Gửi URL này cho người làm app** để gắn sẵn vào app: mọi người cài app chỉ cần nhập tên và phòng ban. Nếu chưa gắn, mọi người dán URL ở **Cài đặt → 👥 Nhóm học → Địa chỉ máy chủ nhóm**.

## Bước 5 (không bắt buộc). Bật AI của nhóm

1. Tạo API key Gemini: mở [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → **Create API key** → copy key.
2. Trong tab Apps Script: bấm biểu tượng ⚙️ **Cài đặt dự án** (thanh bên trái) → kéo xuống **Thuộc tính tập lệnh** → **Thêm thuộc tính tập lệnh**.
   - **Thuộc tính:** `GEMINI_KEY`
   - **Giá trị:** dán key
   - Bấm **Lưu thuộc tính tập lệnh**.
3. Mở trang tính **Config**, sửa `ai_enabled` thành `yes`.
4. Trong app, người dùng chọn **👥 AI của nhóm** ở Cài đặt → AI Coach. App tự chọn sẵn cho ai chưa có key khi vào nhóm.

Key nằm trong Thuộc tính tập lệnh, **không nằm trong Sheet** và không gửi về điện thoại của ai.

**Chi phí và hạn mức**
- `ai_daily_limit` (mặc định 40): số lượt AI mỗi người mỗi ngày. Giảm số này để kiểm soát chi phí.
- Gói miễn phí của Gemini có hạn mức thấp, 50 người dùng chung dễ bị báo "hết hạn mức". Nên bật thanh toán cho key trong Google AI Studio.
- Google có thể dùng dữ liệu của gói miễn phí để cải thiện sản phẩm. Nhắc mọi người không nói thông tin nội bộ công ty trong bài nói.
- `ai_model` (mặc định `gemini-3.8-flash`): đổi model dùng chung.
- Máy chủ chờ Gemini tối đa 60 giây (giới hạn của Apps Script). Nếu quá giờ, lượt đó được trả lại và người dùng bấm chấm lại.

## Các cài đặt trong trang Config

| key | Mặc định | Ý nghĩa |
|---|---|---|
| `admin_pin` | (trống) | Mã mở Bảng theo dõi trong app. Trống = tắt. |
| `ai_enabled` | `no` | `yes` = bật AI của nhóm (cần `GEMINI_KEY`). |
| `ai_model` | `gemini-3.8-flash` | Model Gemini dùng chung. |
| `ai_daily_limit` | `40` | Lượt AI tối đa mỗi người mỗi ngày. |
| `max_daily_exp` | `800` | Trần EXP mỗi người mỗi ngày. |

Sửa Config có hiệu lực ngay, không cần triển khai lại.

## Xem dữ liệu trong Sheet

| Trang tính | Mỗi dòng là |
|---|---|
| **Users** | Một người: tên, phòng ban, mục tiêu, ước tính gần nhất, ngày vào, lần cuối mở app, phiên bản app |
| **Daily** | Một người × một ngày: EXP, số câu đã nói, số giây nói, số bài được chấm, thi thử, từ vựng, IPA |
| **Mocks** | Một bài thi thử: đề, số câu đã trả lời, ước tính |
| **Exams** | Một kết quả thi thật do người dùng tự ghi |
| **Questions** | Một câu hỏi thi thật do người dùng gửi |
| **AIUsage** | Số lượt AI của một người trong một ngày |

Muốn làm báo cáo: dùng **Chèn → Bảng tổng hợp** trên trang **Daily** (hàng: uid, giá trị: tổng exp, tổng seconds), hoặc bấm **📋 Copy bảng** trong Bảng theo dõi của app rồi dán vào Excel.

## Sửa mã sau này (giữ nguyên URL)

1. Dán mã mới vào Apps Script, bấm **💾 Lưu**.
2. **Triển khai** → **Quản lý các bản triển khai** → chọn bản đang dùng → biểu tượng ✏️.
3. Ở **Phiên bản**, chọn **Phiên bản mới** → **Triển khai**.

Không dùng **Tùy chọn triển khai mới** lần nữa, vì sẽ tạo URL khác và app của mọi người không kết nối được.

## Gỡ lỗi nhanh

| App báo | Cách sửa |
|---|---|
| "Máy chủ nhóm trả về dữ liệu lạ…" | Sai URL (phải là URL kết thúc `/exec`), hoặc **Người có quyền truy cập** chưa đặt **Bất kỳ ai**. |
| "Chưa đăng ký…" | Người dùng bấm lại **💾 Lưu & kết nối** trong Cài đặt → 👥 Nhóm học. |
| "Mã quản trị không đúng" | Kiểm tra `admin_pin` trong trang Config (từ 6 ký tự). |
| "Quản trị chưa bật AI của nhóm" | Đặt `ai_enabled` = `yes`. |
| "Máy chủ nhóm chưa có GEMINI_KEY" | Làm lại Bước 5, mục 2. |

## Giới hạn

- Apps Script miễn phí đủ cho nhóm vài chục người. Mỗi lần ghi, máy chủ khoá bảng vài giây để 2 người gửi cùng lúc không ghi đè nhau.
- EXP do app trên điện thoại tính rồi gửi lên. Máy chủ chặn ngày không hợp lệ và giới hạn tối đa 800 EXP/ngày, nhưng không kiểm tra từng bài nói.
- Mỗi người nên dùng một điện thoại. Cài lại app: nhập đúng tên và phòng ban như cũ để giữ tài khoản cũ.
