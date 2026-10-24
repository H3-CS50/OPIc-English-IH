# OPIc Drama · công cụ dựng truyện tranh

Gộp 10 script `build_t1…t10.py` cũ thành **1 engine + 10 file cấu hình**. Dựng lại cho ra ảnh giống hệt bản cũ (đã so từng điểm ảnh, 249/249 khung).

```
tools/drama/
  build.py            lệnh duy nhất: dựng khung, xuất PDF, xuất vào app
  comic_engine.py     phần chung: bóng thoại, suy nghĩ, chú thích, SFX, dán màn hình (matrix3d), CSS, chụp bằng Chromium
  mina/
    ep01.py … ep10.py bóng thoại, toạ độ, CSS riêng từng tập
    story.py          câu hỏi mở khoá, điều kiện đạt, phần thưởng, thứ tự các phần (cho app)
    art/epXX/*.webp   ảnh gốc từng khung (đã cắt an toàn)
```

## Lệnh hay dùng

```bash
pip install pillow numpy playwright pypdf     # một lần
python3 tools/drama/build.py                  # dựng lại cả 10 tập → tools/drama/out/epXX/panels_png/
python3 tools/drama/build.py --ep 10 --only K15,K17   # sửa vài khung rồi chụp lại
python3 tools/drama/build.py --ep 1-10 --pdf  # PDF từng tập + PDF trọn bộ (có mục lục)
python3 tools/drama/build.py --app            # WebP 900 px + manifest.json → app/www/drama/mina/
```

## Sửa một khung

1. Mở `tools/drama/mina/epXX.py`, tìm `P.append(("K07", …`.
2. Sửa lời thoại trong `bub(x, y, rộng, "English", "Tiếng Việt", (đuôi_x, đuôi_y))`. Toạ độ tính trên ảnh rộng 1080; y âm là khoảng trống phía trên ảnh.
3. Chạy `python3 tools/drama/build.py --ep XX --app` rồi commit `app/www/drama/`.

## Thay ảnh một khung

Ghi đè `tools/drama/mina/art/epXX/<KHOÁ>.webp` (giữ đúng tỉ lệ cũ 2:3, 1:1 hoặc 3:2 để bóng thoại không lệch), rồi dựng lại tập đó với `--app`.

## Quy tắc hình ảnh

Xem `claude/OPIc_Drama_quy_tac_hinh_anh.md` trong Project: phong cách 2.5D, nhân vật từ 27 tuổi, không lộ nội y, không vải xuyên thấu ở ngực hoặc hông.
