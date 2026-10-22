// Gọi "máy chủ nhóm" (ứng dụng web Google Apps Script, xem tools/group-server).
// Gửi JSON dưới dạng text/plain để trình duyệt không phải hỏi CORS trước (preflight) — Apps Script không trả lời được preflight.
export class GroupError extends Error {}

export const isGroupUrl = (url) => /^https:\/\/\S+$/.test(String(url || '').trim());

export async function groupPost(url, payload, { signal, timeout = 20000 } = {}) {
  url = String(url || '').trim();
  if (!isGroupUrl(url)) throw new GroupError('Địa chỉ máy chủ nhóm chưa đúng (phải bắt đầu bằng https://).');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  const onAbort = () => ctl.abort();
  signal?.addEventListener('abort', onAbort);
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ctl.signal,
      redirect: 'follow',
    });
  } catch {
    if (signal?.aborted) throw new GroupError('Đã huỷ.');
    if (ctl.signal.aborted) throw new GroupError('Máy chủ nhóm phản hồi quá lâu. Thử lại sau.');
    throw new GroupError('Không kết nối được máy chủ nhóm. Kiểm tra mạng.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new GroupError(
      res.ok
        ? 'Máy chủ nhóm trả về dữ liệu lạ. Kiểm tra địa chỉ (URL ứng dụng web, kết thúc bằng /exec) và quyền truy cập "Bất kỳ ai".'
        : `Máy chủ nhóm lỗi (${res.status}).`,
    );
  }
  if (!data || data.ok !== true) throw new GroupError(data?.error || 'Máy chủ nhóm báo lỗi.');
  return data;
}
