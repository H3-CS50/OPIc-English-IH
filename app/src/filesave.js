// Lưu file vào thư mục Download hoặc gửi qua app khác (Zalo, Gmail, Drive…).
// Trên Android dùng plugin FileSaver viết riêng cho app (android/.../FileSaverPlugin.java).
import { Capacitor, registerPlugin } from '@capacitor/core';

const FileSaver = registerPlugin('FileSaver');
const isNative = Capacitor.isNativePlatform();

const asBytes = (content) => (typeof content === 'string' ? new TextEncoder().encode(content) : content);
function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// Trả về câu mô tả nơi đã lưu.
export async function saveFile(filename, content, mimeType) {
  const bytes = asBytes(content);
  if (isNative) {
    const r = await FileSaver.save({ filename, base64: toBase64(bytes), mimeType });
    return r.folder === 'Download' ? `thư mục Download (Tải xuống), tên file ${r.filename}` : `${r.folder}/${r.filename}`;
  }
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return `thư mục tải xuống, tên file ${filename}`;
}

// Mở bảng chia sẻ của điện thoại. Trả về false nếu thiết bị không hỗ trợ.
export async function shareFile(filename, content, mimeType, title) {
  const bytes = asBytes(content);
  if (isNative) {
    await FileSaver.share({ filename, base64: toBase64(bytes), mimeType, title });
    return true;
  }
  const file = new File([bytes], filename, { type: mimeType });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title });
    return true;
  }
  return false;
}
