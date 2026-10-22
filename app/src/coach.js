// AI Coach: gửi bài nói tới Claude (transcript) hoặc Gemini (transcript và/hoặc ghi âm).
// Prompt và schema lấy từ knowledge base (07_AI_COACH_GRADING_PROMPT.md, 08_DATA_SCHEMA.json).
import PROMPT from './coach_prompt.txt';
import SCHEMA from './coach_schema.json';
import { countWords, blobToBase64 } from './util.js';

export const CLAUDE_MODELS = [
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 (khuyên dùng)' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 (rẻ, nhanh)' },
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 (kỹ nhất, đắt hơn)' },
];
export const GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (khuyên dùng)' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (rẻ hơn)' },
];

// ctx: { question, ptype, ptypeLabel, expected[], target, inputMode, seconds, transcript, retry? }
export function buildUserMessage(ctx) {
  const lines = [
    `QUESTION: ${ctx.question}`,
    `PROMPT TYPE: ${ctx.ptype} — ${ctx.ptypeLabel}`,
    `EXPECTED EVIDENCE (practice design, not official criteria): ${(ctx.expected || []).join('; ') || 'n/a'}`,
    `LEARNER TARGET LEVEL: ${ctx.target}`,
    `INPUT MODE: ${ctx.inputMode}`,
    `SPEAKING TIME: ${ctx.seconds} seconds`,
    `WORD COUNT (transcript): ${countWords(ctx.transcript)}`,
  ];
  if (ctx.retry) {
    lines.push(
      '',
      'THIS IS A RETRY. Previous main gap: ' + ctx.retry.gap,
      'Retry goal given to the learner: ' + ctx.retry.goal,
      'In task_response.comment_vi and main_gap, say clearly whether the retry goal was achieved.',
    );
  }
  lines.push(
    '',
    'TRANSCRIPT (automatic speech recognition, may contain errors):',
    '"""',
    ctx.transcript?.trim() || (ctx.inputMode === 'audio' ? '(none — use the audio recording)' : '(empty)'),
    '"""',
  );
  return lines.join('\n');
}

// Dùng khi không có API key: dán vào app Claude/ChatGPT, nhận phản hồi dạng Markdown.
export function buildCopyPrompt(ctx) {
  const override = `\n\nOUTPUT FORMAT OVERRIDE (this conversation only): do NOT output JSON. Write the same analysis as readable Markdown in Vietnamese with these headings: "🎯 Ước tính luyện tập (không phải điểm chính thức)", "📋 Đáp ứng câu hỏi", "🔎 Phân tích FACT", "🔊 Phát âm & độ trôi chảy", "✅ Điểm làm tốt", "🧩 Khoảng trống chính", "✏️ Sửa lỗi (tối đa 5)", "🚀 Bước tiếp theo", "📝 Bản phát triển (tiếng Anh)", "🔁 Bài nói lại", "⚠️ Giới hạn". Quote the learner's words exactly.`;
  return `${PROMPT.replace(/- Output ONLY the JSON object[^\n]*/, '')}${override}\n\n---\n\n${buildUserMessage(ctx)}`;
}

function parseJson(text) {
  let t = String(text || '').trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('AI không trả về JSON hợp lệ.');
  return JSON.parse(t.slice(a, b + 1));
}

const dim = (d) => ({
  status: d?.status || 'insufficient_evidence',
  observation_vi: d?.observation_vi || '',
  evidence_quotes: Array.isArray(d?.evidence_quotes) ? d.evidence_quotes.filter(Boolean) : [],
});
const del = (d, fallback) => ({ status: d?.status || 'not_assessed', observation_vi: d?.observation_vi || fallback });

// Đảm bảo đủ trường để hiển thị, kể cả khi model bỏ sót.
export function normalizeResult(r, inputMode) {
  const noAudio = inputMode === 'transcript_only';
  const out = {
    input_mode: r.input_mode || inputMode,
    transcript_used: r.transcript_used || '',
    task_response: { status: r.task_response?.status || 'insufficient_evidence', comment_vi: r.task_response?.comment_vi || '' },
    main_idea_summary_vi: r.main_idea_summary_vi || '',
    fact: {
      functions_tasks: dim(r.fact?.functions_tasks),
      accuracy: dim(r.fact?.accuracy),
      context_content: dim(r.fact?.context_content),
      text_type: dim(r.fact?.text_type),
    },
    delivery: {
      pronunciation: del(r.delivery?.pronunciation, noAudio ? 'Chỉ có transcript nên không đánh giá phát âm.' : ''),
      fluency: del(r.delivery?.fluency, noAudio ? 'Transcript không thể hiện ngập ngừng hay tốc độ nói.' : ''),
    },
    practice_level_estimate: {
      label: r.practice_level_estimate?.label || 'insufficient_evidence',
      confidence: r.practice_level_estimate?.confidence || 'low',
      rationale_vi: r.practice_level_estimate?.rationale_vi || '',
    },
    what_works: Array.isArray(r.what_works) ? r.what_works.slice(0, 3) : [],
    main_gap: { point_vi: r.main_gap?.point_vi || '', evidence_quote: r.main_gap?.evidence_quote || '', why_it_matters_vi: r.main_gap?.why_it_matters_vi || '' },
    language_fixes: Array.isArray(r.language_fixes) ? r.language_fixes.slice(0, 5) : [],
    next_level_move: { target_level: r.next_level_move?.target_level || '', action_vi: r.next_level_move?.action_vi || '' },
    expanded_example_en: r.expanded_example_en || '',
    retry_task: { goal_vi: r.retry_task?.goal_vi || '', instruction_vi: r.retry_task?.instruction_vi || '', success_check_vi: r.retry_task?.success_check_vi || '' },
    limitations_vi: Array.isArray(r.limitations_vi) ? r.limitations_vi : [],
  };
  // Không bao giờ hiển thị đánh giá phát âm khi chỉ có chữ.
  if (noAudio) {
    out.delivery.pronunciation.status = 'not_assessed';
    out.delivery.fluency.status = 'not_assessed';
  }
  if (out.practice_level_estimate.confidence === 'high') out.practice_level_estimate.confidence = 'medium';
  return out;
}

class CoachError extends Error {}

async function readError(res) {
  let msg = '';
  try {
    const j = await res.json();
    msg = j?.error?.message || j?.message || JSON.stringify(j);
  } catch {
    msg = res.statusText;
  }
  return msg;
}

// ---------------- Claude ----------------
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const claudeHeaders = (key) => ({
  'content-type': 'application/json',
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
});

function claudeFriendly(status, msg) {
  if (status === 401) return 'API key Claude không đúng hoặc đã bị thu hồi. Kiểm tra lại trong Cài đặt.';
  if (status === 403) return 'API key không có quyền dùng model này.';
  if (status === 404) return 'Không tìm thấy model. Chọn model khác trong Cài đặt.';
  if (status === 429) return 'Gửi quá nhiều yêu cầu hoặc đã hết hạn mức. Đợi một lát rồi thử lại.';
  if (status === 529 || status >= 500) return 'Máy chủ Claude đang bận. Thử lại sau ít phút.';
  if (/credit|balance|billing/i.test(msg)) return 'Tài khoản API đã hết tiền. Nạp thêm ở console.anthropic.com.';
  return `Lỗi từ Claude (${status}): ${msg}`;
}

export async function gradeClaude({ key, model, ctx, signal }) {
  const base = {
    model,
    max_tokens: 16000,
    system: PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(ctx) }],
  };
  const attempt = async (withEffort) => {
    const body = { ...base, output_config: { format: { type: 'json_schema', schema: SCHEMA }, ...(withEffort ? { effort: 'medium' } : {}) } };
    let res;
    try {
      res = await fetch(CLAUDE_URL, { method: 'POST', headers: claudeHeaders(key), body: JSON.stringify(body), signal });
    } catch (e) {
      if (signal?.aborted) throw new CoachError('Đã huỷ chấm bài.');
      throw new CoachError('Không kết nối được tới Claude. Kiểm tra mạng rồi thử lại.');
    }
    if (!res.ok) {
      const msg = await readError(res);
      if (res.status === 400 && withEffort && /effort/i.test(msg)) return attempt(false);
      throw new CoachError(claudeFriendly(res.status, msg));
    }
    return res.json();
  };
  const data = await attempt(true);
  if (data.stop_reason === 'refusal') throw new CoachError('Claude từ chối chấm bài này. Hãy thử lại với nội dung khác.');
  if (data.stop_reason === 'max_tokens') throw new CoachError('Phản hồi bị cắt vì quá dài. Thử lại hoặc chọn model khác.');
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  return normalizeResult(parseJson(text), ctx.inputMode);
}

export async function checkClaudeKey(key, model) {
  const res = await fetch(`https://api.anthropic.com/v1/models/${encodeURIComponent(model)}`, { headers: claudeHeaders(key) }).catch(() => null);
  if (!res) return { ok: false, error: 'Không kết nối được. Kiểm tra mạng.' };
  if (res.ok) return { ok: true };
  return { ok: false, error: claudeFriendly(res.status, await readError(res)) };
}

// ---------------- Gemini ----------------
const geminiUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

function geminiFriendly(status, msg) {
  if (/API_KEY_INVALID|API key not valid/i.test(msg)) return 'API key Gemini không đúng. Kiểm tra lại trong Cài đặt.';
  if (status === 403) return 'API key Gemini không có quyền dùng model này (hoặc chưa bật Gemini API).';
  if (status === 404) return 'Không tìm thấy model Gemini. Chọn model khác trong Cài đặt.';
  if (status === 429) return 'Đã hết hạn mức miễn phí / gửi quá nhanh. Đợi một lát hoặc dùng tài khoản trả phí.';
  if (status >= 500) return 'Máy chủ Gemini đang bận. Thử lại sau ít phút.';
  return `Lỗi từ Gemini (${status}): ${msg}`;
}

export async function gradeGemini({ key, model, ctx, audio, signal }) {
  const parts = [{ text: buildUserMessage(ctx) }];
  if (audio?.blob) {
    const data = await blobToBase64(audio.blob);
    parts.push({ inlineData: { mimeType: (audio.mimeType || 'audio/webm').split(';')[0], data } });
  }
  const attempt = async (withSchema) => {
    const body = {
      systemInstruction: { parts: [{ text: withSchema ? PROMPT : `${PROMPT}\n\nJSON SCHEMA TO FOLLOW EXACTLY:\n${JSON.stringify(SCHEMA)}` }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 16384,
        ...(withSchema ? { responseJsonSchema: SCHEMA } : {}),
      },
    };
    let res;
    try {
      res = await fetch(geminiUrl(model), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal,
      });
    } catch {
      if (signal?.aborted) throw new CoachError('Đã huỷ chấm bài.');
      throw new CoachError('Không kết nối được tới Gemini. Kiểm tra mạng rồi thử lại.');
    }
    if (!res.ok) {
      const msg = await readError(res);
      if (res.status === 400 && withSchema && /responseJsonSchema|response_json_schema|schema|Unknown name/i.test(msg)) return attempt(false);
      throw new CoachError(geminiFriendly(res.status, msg));
    }
    return res.json();
  };
  const data = await attempt(true);
  if (data.promptFeedback?.blockReason) throw new CoachError('Gemini chặn yêu cầu này. Thử lại với nội dung khác.');
  const cand = data.candidates?.[0];
  if (!cand) throw new CoachError('Gemini không trả về kết quả.');
  if (cand.finishReason === 'MAX_TOKENS') throw new CoachError('Phản hồi bị cắt vì quá dài. Thử lại.');
  const text = (cand.content?.parts || []).map((p) => p.text || '').join('');
  return normalizeResult(parseJson(text), ctx.inputMode);
}

export async function checkGeminiKey(key, model) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`, {
    headers: { 'x-goog-api-key': key },
  }).catch(() => null);
  if (!res) return { ok: false, error: 'Không kết nối được. Kiểm tra mạng.' };
  if (res.ok) return { ok: true };
  return { ok: false, error: geminiFriendly(res.status, await readError(res)) };
}

// ---------------- Điều phối ----------------
// settings: { provider, keys:{claude,gemini}, models:{claude,gemini} }
export function providerReady(settings, inputMode) {
  const p = settings.provider;
  if (p === 'claude') {
    if (!settings.keys?.claude) return { ok: false, reason: 'Chưa có API key Claude. Thêm ở tab Cài đặt hoặc dùng nút 📋 Copy.' };
    if (inputMode === 'audio') return { ok: false, reason: 'Claude không nghe được file ghi âm. Hãy gõ/sửa lời nói vào ô transcript, dùng chế độ 📝, hoặc chọn Gemini trong Cài đặt.' };
    return { ok: true };
  }
  if (p === 'gemini') {
    if (!settings.keys?.gemini) return { ok: false, reason: 'Chưa có API key Gemini. Thêm ở tab Cài đặt hoặc dùng nút 📋 Copy.' };
    return { ok: true };
  }
  return { ok: false, reason: 'Chưa chọn AI chấm bài. Vào Cài đặt để thêm API key, hoặc dùng nút 📋 Copy để dán vào app Claude.' };
}

export async function grade(settings, ctx, audio, signal) {
  try {
    if (settings.provider === 'claude') return { result: await gradeClaude({ key: settings.keys.claude, model: settings.models.claude, ctx, signal }) };
    if (settings.provider === 'gemini') return { result: await gradeGemini({ key: settings.keys.gemini, model: settings.models.gemini, ctx, audio, signal }) };
    return { error: 'Chưa chọn AI chấm bài.' };
  } catch (e) {
    return { error: e instanceof CoachError ? e.message : `Lỗi: ${e?.message || e}` };
  }
}

// ---------------- Tra từ bằng AI (dùng chung key đã nhập) ----------------
const WORD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['headword', 'ipa', 'pos_vi', 'meaning_vi', 'explanation_vi', 'example_en', 'example_vi'],
  properties: {
    headword: { type: 'string', description: 'dictionary form of the word or phrase' },
    ipa: { type: 'string', description: 'General American IPA between slashes, e.g. /ˈwɔːtər/' },
    pos_vi: { type: 'string', description: 'part of speech in Vietnamese, e.g. danh từ' },
    meaning_vi: { type: 'string', description: 'short Vietnamese meaning that fits the given sentence' },
    explanation_vi: { type: 'string', description: '1-2 short Vietnamese sentences on usage, register or common collocations' },
    example_en: { type: 'string' },
    example_vi: { type: 'string' },
  },
};
const WORD_SYSTEM =
  'You are a concise English–Vietnamese learner dictionary for Vietnamese adults preparing for the OPIc speaking test. ' +
  'Given an English word (and optionally the sentence it appeared in), return its dictionary form, General American IPA, ' +
  'part of speech and the Vietnamese meaning that fits that sentence. Keep Vietnamese natural and short. ' +
  'If the word is a proper noun or not English, say so in explanation_vi. Output JSON only.';

export async function lookupWordAI(settings, word, sentence = '') {
  const user = `WORD: ${word}\nSENTENCE: ${sentence || '(none)'}`;
  try {
    if (settings.provider === 'claude') {
      const key = settings.keys?.claude;
      if (!key) return { error: 'Chưa có API key Claude. Thêm ở tab Cài đặt.' };
      const body = { model: settings.models.claude, max_tokens: 1024, system: WORD_SYSTEM, messages: [{ role: 'user', content: user }], output_config: { format: { type: 'json_schema', schema: WORD_SCHEMA } } };
      const res = await fetch(CLAUDE_URL, { method: 'POST', headers: claudeHeaders(key), body: JSON.stringify(body) }).catch(() => null);
      if (!res) return { error: 'Không kết nối được tới Claude. Kiểm tra mạng.' };
      if (!res.ok) return { error: claudeFriendly(res.status, await readError(res)) };
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
      return { result: parseJson(text) };
    }
    if (settings.provider === 'gemini') {
      const key = settings.keys?.gemini;
      if (!key) return { error: 'Chưa có API key Gemini. Thêm ở tab Cài đặt.' };
      const body = {
        systemInstruction: { parts: [{ text: WORD_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 1024, responseJsonSchema: WORD_SCHEMA },
      };
      const res = await fetch(geminiUrl(settings.models.gemini), { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) }).catch(() => null);
      if (!res) return { error: 'Không kết nối được tới Gemini. Kiểm tra mạng.' };
      if (!res.ok) return { error: geminiFriendly(res.status, await readError(res)) };
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts || []).map((x) => x.text || '').join('');
      return { result: parseJson(text) };
    }
    return { error: 'Chưa chọn AI. Vào Cài đặt → AI Coach để nhập key Gemini hoặc Claude.' };
  } catch (e) {
    return { error: `Lỗi: ${e?.message || e}` };
  }
}

// ---------- Đọc kịch bản từ ảnh chụp ----------
const SCRIPT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['question', 'script', 'note_vi'],
  properties: {
    question: { type: 'string', description: 'The OPIc question shown in the image, if any; empty string if none.' },
    script: { type: 'string', description: 'The English answer script, transcribed exactly.' },
    note_vi: { type: 'string', description: 'Short note in Vietnamese about unreadable parts; empty if none.' },
  },
};
const SCRIPT_SYSTEM = `You transcribe photos of English speaking-test answer scripts (printed or handwritten).
Copy the English text exactly as written: keep the learner's own wording, do not correct grammar, do not add sentences.
Join lines broken by the page into normal paragraphs. Skip Vietnamese notes, page numbers and decorations.
If a question/prompt is visible, put it in "question" and the answer in "script". Write [?] for words you cannot read and mention them in note_vi (Vietnamese).`;

export async function readScriptImageAI(settings, base64, mimeType = 'image/jpeg') {
  const user = 'Transcribe the answer script in this photo.';
  try {
    if (settings.provider === 'claude') {
      const key = settings.keys?.claude;
      if (!key) return { error: 'Chưa có API key Claude. Thêm ở tab Cài đặt.' };
      const body = {
        model: settings.models.claude,
        max_tokens: 4096,
        system: SCRIPT_SYSTEM,
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } }, { type: 'text', text: user }] }],
        output_config: { format: { type: 'json_schema', schema: SCRIPT_SCHEMA } },
      };
      const res = await fetch(CLAUDE_URL, { method: 'POST', headers: claudeHeaders(key), body: JSON.stringify(body) }).catch(() => null);
      if (!res) return { error: 'Không kết nối được tới Claude. Kiểm tra mạng.' };
      if (!res.ok) return { error: claudeFriendly(res.status, await readError(res)) };
      const data = await res.json();
      return { result: parseJson((data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('')) };
    }
    if (settings.provider === 'gemini') {
      const key = settings.keys?.gemini;
      if (!key) return { error: 'Chưa có API key Gemini. Thêm ở tab Cài đặt.' };
      const body = {
        systemInstruction: { parts: [{ text: SCRIPT_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64 } }, { text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0, maxOutputTokens: 4096, responseJsonSchema: SCRIPT_SCHEMA },
      };
      const res = await fetch(geminiUrl(settings.models.gemini), { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) }).catch(() => null);
      if (!res) return { error: 'Không kết nối được tới Gemini. Kiểm tra mạng.' };
      if (!res.ok) return { error: geminiFriendly(res.status, await readError(res)) };
      const data = await res.json();
      return { result: parseJson((data.candidates?.[0]?.content?.parts || []).map((x) => x.text || '').join('')) };
    }
    return { error: 'Đọc ảnh cần AI. Vào Cài đặt → AI Coach để nhập key Gemini hoặc Claude.' };
  } catch (e) {
    return { error: `Lỗi: ${e?.message || e}` };
  }
}
