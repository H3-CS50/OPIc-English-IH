// Chấm bài nói bằng Claude, dùng API key của chính người dùng (lưu trên máy).
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-opus-5-5';

const SYSTEM = `Bạn là giám khảo OPIc tiếng Anh giàu kinh nghiệm. Người học là người Việt, đang nhắm mức IH (Intermediate High).

Lưu ý về bài làm:
- Bài nói đã được máy chuyển từ giọng nói thành chữ, nên có thể thiếu dấu câu hoặc sai chữ do máy nghe nhầm. Không trừ điểm dấu câu hay chính tả. Nếu một từ nghe có vẻ do máy nhận nhầm, hãy ghi chú thay vì tính là lỗi.
- Bạn không nghe được giọng nên không chấm phát âm.
- Đánh giá theo tiêu chí OPIc của ACTFL: hoàn thành nhiệm vụ của câu hỏi, độ dài và mức độ triển khai ý (câu → đoạn), độ chính xác ngữ pháp (đặc biệt là thì), từ vựng, liên kết và độ trôi chảy.

Trả lời bằng tiếng Việt (câu tiếng Anh sửa và bài nâng cấp giữ nguyên tiếng Anh), định dạng Markdown, theo đúng cấu trúc sau:

## 🎯 Cấp độ ước tính: <một trong NL, NM, NH, IL, IM1, IM2, IM3, IH, AL>
1–2 câu giải thích vì sao.

## 📊 Đánh giá nhanh
Bảng 3 cột: Tiêu chí | Nhận xét ngắn | Điểm (/5), gồm 5 dòng: Đúng trọng tâm câu hỏi; Độ dài & triển khai ý; Ngữ pháp & thì; Từ vựng & cụm từ tự nhiên; Liên kết & mạch lạc.

## ✅ Điểm làm tốt
2–3 gạch đầu dòng, cụ thể.

## ❌ Lỗi cần sửa
Bảng 3 cột: Bạn nói | Nên nói | Vì sao. Tối đa 8 lỗi quan trọng nhất. Nếu không có lỗi đáng kể thì ghi rõ.

## 🚀 Để lên mức tiếp theo
3 gợi ý cụ thể cho chính câu trả lời này (thêm ý gì, dùng cấu trúc gì, kéo dài thế nào).

## ✍️ Bài nâng cấp (mức IH)
Viết lại câu trả lời của người học ở mức IH: giữ nguyên nội dung và các ý của họ, bổ sung chi tiết hợp lý, 150–220 từ, văn nói tự nhiên (có filler và từ nối).

Nếu bài nói trống hoặc quá ngắn (dưới 30 từ), vẫn ước tính cấp độ, nhưng tập trung hướng dẫn cách triển khai câu trả lời.`;

const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function userMessage({ question, heading, transcript, seconds }) {
  return `Câu hỏi: ${question}
Dạng câu: ${heading || 'không rõ'}
Thời lượng nói: ${seconds} giây
Số từ: ${countWords(transcript)}

Bài nói (máy chuyển từ giọng nói):
"""
${transcript.trim() || '(trống)'}
"""`;
}

// Nội dung để người dùng tự dán vào app Claude (cách miễn phí, không cần API key).
export const buildCopyPrompt = (attempt) => `${SYSTEM}\n\n---\n\n${userMessage(attempt)}`;

function friendlyError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'API key không đúng hoặc đã bị thu hồi. Kiểm tra lại trong tab Cài đặt.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'API key không có quyền dùng model này.';
  if (err instanceof Anthropic.RateLimitError) return 'Gửi quá nhiều yêu cầu hoặc hết hạn mức. Đợi một lát rồi thử lại.';
  if (err instanceof Anthropic.APIConnectionError) return 'Không kết nối được. Kiểm tra mạng rồi thử lại.';
  if (err instanceof Anthropic.APIError) {
    if (err.status === 400 && /credit|balance|billing/i.test(err.message)) return 'Tài khoản API đã hết tiền. Nạp thêm ở console.anthropic.com.';
    return `Lỗi từ máy chủ (${err.status ?? '?'}): ${err.message}`;
  }
  return err?.message || String(err);
}

const makeClient = (apiKey) => new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });

export async function checkKey(apiKey) {
  try {
    await makeClient(apiKey).models.retrieve(MODEL);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Trả về { text } hoặc { error }. onText nhận toàn bộ văn bản đã nhận tới lúc đó.
export async function grade(apiKey, attempt, onText, signal) {
  let text = '';
  try {
    const stream = makeClient(apiKey).beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium' },
        system: SYSTEM,
        messages: [{ role: 'user', content: userMessage(attempt) }],
      },
      { signal },
    );
    stream.on('text', (delta) => {
      text += delta;
      onText(text);
    });
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') return { error: 'Claude từ chối chấm bài này. Hãy thử lại với nội dung khác.' };
    if (final.stop_reason === 'max_tokens') text += '\n\n_(Phần nhận xét bị cắt vì quá dài.)_';
    return { text };
  } catch (err) {
    if (signal?.aborted) return { error: 'Đã huỷ chấm bài.' };
    return { error: friendlyError(err) };
  }
}

export { countWords };
