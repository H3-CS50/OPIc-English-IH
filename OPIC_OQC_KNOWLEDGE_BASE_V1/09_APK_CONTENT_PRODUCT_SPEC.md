# 09 — APK content & product spec (OPIc OQC)

Tài liệu này mô tả cách đưa knowledge base vào app Android **OPIc OQC**. Có hai giai đoạn:

- **v2.0 (MVP) — đã build.** App chạy độc lập trên máy, không cần server. AI Coach dùng API key của chính người dùng (bring-your-own-key).
- **Later.** Thêm backend **Python FastAPI + Microsoft SQL Server**. Mọi endpoint nằm dưới `/api/`, key AI nằm trên server, không nằm trong APK.

Ký hiệu ưu tiên: **P0** = bắt buộc cho MVP, **P1** = nên có, **P2** = sau.

## 1. Kiến trúc

### v2.0 — đã triển khai

```
APK (Capacitor 7 + WebView, JS thuần, esbuild)
├── src/kb.json            ← sinh từ 05/06 + taxonomy (tools/kb/build_kb.py)
├── src/coach_prompt.txt   ← trích từ 07_AI_COACH_GRADING_PROMPT.md
├── src/coach_schema.json  ← $defs.coach_result trong 08_DATA_SCHEMA.json
├── src/content.json       ← tài liệu Markdown (02, 03, thư viện v1) + flashcard
├── Native: SpeechRecognition (Android), TextToSpeech, MediaRecorder (WebView)
└── localStorage: settings, attempts (chỉ văn bản + kết quả), packs tự nhập
        │
        ├── Claude Messages API  (transcript → JSON theo schema, output_config.format)
        └── Gemini generateContent (transcript và/hoặc audio inline → JSON, responseJsonSchema)
```

- **Quy trình build:** GitHub Actions chạy `build_kb.py`; nếu có bất kỳ FAIL nào thì dừng build. Sau đó chạy `npm run build` → `cap sync` → `assembleRelease` → đăng APK lên Releases.
- **Bí mật:** không có secret nào bị hard-code. API key do người dùng nhập, chỉ lưu trên máy. Keystore ký app là khóa riêng cho app học tập này, đã có sẵn trong repo từ v1 để bản mới cài đè được bản cũ.
- **Âm thanh:** chỉ giữ trong bộ nhớ khi app đang mở, không ghi xuống máy. Âm thanh chỉ được gửi tới AI khi người dùng bấm chấm bằng Gemini.

### Later — backend chuẩn

```
APK ──HTTPS──► FastAPI (/api/...) ──► SQL Server
                  │
                  └──► Claude / Gemini (key trong biến môi trường hoặc vault, không bao giờ gửi về client)
```

| Endpoint | Mô tả | Dữ liệu |
|---|---|---|
| `GET /api/questions?topic=&prompt_type=&level=` | Lọc ngân hàng câu hỏi | bảng `questions` |
| `GET /api/questions/{question_id}` | Chi tiết + follow-up + hints | `questions` |
| `GET /api/answer-sets/{question_id}` | Bộ bài mẫu IM/IH/AL | `sample_answers` |
| `POST /api/coach/grade` | multipart: `audio` (tùy chọn) + JSON `context` → `coach_result` | gọi model, lưu `coach_results` |
| `POST /api/attempts` / `GET /api/attempts` | Lưu, liệt kê lần luyện | `attempts` |
| `GET /api/progress` | Thống kê theo dạng câu, phân bố ước tính | view trên `attempts` |
| `GET /api/sources` | Source register | `sources` |

**Bảng SQL Server (đề xuất):**

- `sources`
- `questions` (khóa `question_id`)
- `sample_answers` (khóa ngoại `question_id`)
- `users` (Later)
- `attempts` (khóa ngoại `user_id`, `question_id`)
- `coach_results`: lưu JSON nguyên văn trong cột `NVARCHAR(MAX)` có ràng buộc `ISJSON`, kèm `schema_version`
- `consents`: đồng ý lưu audio, thời hạn lưu

Cột tiếng Việt dùng kiểu `NVARCHAR`.

**Không** thay backend bằng Flask, Django hay Node/Express.

## 2. Module, ưu tiên, dữ liệu, rủi ro, kiểm thử

| Module | Ưu tiên | Trạng thái v2.0 | Nguồn dữ liệu | Input → Output | Rủi ro | Cách kiểm thử |
|---|---|---|---|---|---|---|
| **Topic Practice** (tab Luyện) | P0 | ✅ | `questions` (lọc theo nhóm/chủ đề/dạng/level, nhánh OQC) | Bộ lọc → 1 câu ngẫu nhiên; TTS đọc câu; ẩn/hiện chữ | Lọc quá hẹp → hết câu | Test UI với mọi tổ hợp bộ lọc; thông báo khi rỗng |
| **Answer Builder** (💡 Gợi ý + khung) | P0 | ✅ | `answer_framework`, `scaffolding_hints`, `expected_evidence` | Bấm Gợi ý → khung + ý tưởng + bằng chứng nên có; mặc định ẩn | Người học lệ thuộc khung | Mặc định ẩn; nhắc "nói một lần không gợi ý" |
| **Voice Recorder** | P0 | ✅ | — | 📝 STT trên máy → transcript sửa được; 🎙️ MediaRecorder → audio nghe lại | Android chỉ cho một bên dùng micro; STT nhầm từ | Hai chế độ tách riêng; transcript cho phép sửa; test trên máy thật |
| **AI Coach** | P0 | ✅ | `coach_prompt.txt`, `coach_schema.json`, câu hỏi + transcript/audio | → `coach_result` (FACT, delivery, ước tính, main gap, fixes, ví dụ mở rộng, retry) | Model trả JSON lỗi; tự nhận "rating"; chấm phát âm khi không có audio | Schema bắt buộc + `normalizeResult`; prompt cấm rating; app ép `not_assessed` khi transcript-only; test với phản hồi giả lập |
| **Retry loop** | P0 | ✅ | `retry_task` | Nói lại → AI kiểm tra đúng mục tiêu retry | — | Có `retry_of` trong attempt |
| **Sample answers 3 cấp** | P0 | ✅ | `answer_sets` (24 bộ) | IM/IH/AL + khác biệt + đừng học thuộc + cá nhân hóa | Người học học thuộc | Callout "Đừng học thuộc"; AI nhận xét nếu nghe như học thuộc |
| **Role Play** | P1 | ✅ (trong ngân hàng + thi thử) | `RP-*` combos (Q11–13), `RP-ava` | Như Topic Practice | — | — |
| **Mock Test** | P1 | ✅ | combos theo `mock_slot` | Chọn chủ đề survey + độ khó → 15 câu, 40 phút, nghe lại 1 lần → xem lại, chấm từng câu hoặc cả bài, ước tính tổng = trung vị | Cấu trúc chưa xác minh chính thức | Ghi rõ "thiết kế luyện tập"; unit test `buildMock` (đủ 15 câu, đúng slot) |
| **Daily Practice / điểm yếu** | P1 | ✅ (nút trong tab Tiến bộ) | `attempts` | Chọn dạng câu có ước tính thấp nhất hoặc chưa luyện | Ít dữ liệu → chọn ngẫu nhiên | Hiện lý do chọn |
| **Progress** | P1 | ✅ | `attempts` (localStorage, tối đa 400) | Tổng, 7 ngày, chuỗi ngày, phân bố, theo dạng câu, lịch sử | localStorage đầy; xóa app mất dữ liệu | Tự cắt bớt khi đầy; nút Copy JSON |
| **Import question pack** | P1 | ✅ | File JSON/CSV của người dùng | → câu `user_provided`, chỉ lưu trên máy | Tài liệu bản quyền chưa rõ | Không đóng gói vào APK; người dùng tự chịu trách nhiệm nội dung |
| **Self-check (không AI)** | P1 | ✅ | `expected_evidence` | Checklist → lưu tự đánh giá | — | — |
| **Shadowing / phát âm** | P2 | ⏳ | bài mẫu + TTS | Nghe bài mẫu (đã có nút 🔊), so sánh ghi âm | Đánh giá phát âm bằng AI chưa kiểm định | Thu thập mẫu có nhãn trước |
| **Backend FastAPI + SQL Server** | P2 | ⏳ | toàn bộ schema 08 | Đồng bộ đa thiết bị, giữ key trên server | Chi phí AI; bảo mật dữ liệu giọng nói | Pen-test, rate limit, chính sách consent |
| **Teacher review dashboard** | P2 | ⏳ | `review_status` | Giáo viên duyệt câu/bài mẫu → `human_reviewed` | — | — |

## 3. Quy tắc nội dung trong app

1. Mọi nhãn level là "mục tiêu luyện tập" hoặc "ước tính luyện tập", có disclaimer ngay tại chỗ hiển thị.
2. Thời lượng gợi ý (IM 1:00–1:30 · IH 1:30–2:00 · AL 1:45–2:30; role-play hỏi và tự giới thiệu ×0.6) là **thiết kế UX**, ghi rõ "gợi ý của app". Thời lượng không được dùng để tính level.
3. Nhánh OQC là tùy chọn, có công tắc bật/tắt trong cả luyện tập và thi thử. Câu hỏi OQC luôn nhắc không đưa thông tin nội bộ.
4. Không chép văn bản ACTFL. Tài liệu trong app chỉ tóm tắt và ghi nguồn.
5. Tài liệu v1 (do AI viết trước đó) được giữ làm thư viện, có ghi chú "chưa kiểm định"; các khẳng định chưa xác minh đã được sửa lại.

## 4. Chỉ số luyện tập (internal pedagogical score)

- App **không** hiển thị điểm 0–100. Ước tính được quy đổi nội bộ: `below_IM=0, IM=1, IM–IH=1.5, IH=2, IH–AL=2.5, AL=3`. Ước tính tổng là **trung vị** của tối đa 10 bài chấm gần nhất (hoặc của các câu trong một bài thi thử).
- Hạn chế:
  - Mỗi ước tính đến từ một model AI trên một câu trả lời.
  - Chưa được kiểm định với kết quả OPIc thật.
  - Độ tin cậy của từng câu bị giới hạn ở mức "trung bình".
- Trước khi dùng chỉ số này cho quyết định quan trọng: cần dữ liệu có rating chính thức để kiểm định (xem 10).

## 5. Quyền riêng tư

- Câu hỏi, transcript và audio chỉ được gửi tới nhà cung cấp AI người dùng chọn, và chỉ khi người dùng bấm chấm.
- Màn hình Cài đặt nhắc rằng gói miễn phí của Gemini có điều khoản dữ liệu khác với gói trả phí.
- Không thu thập dữ liệu về server của dự án (v2.0 không có server).
