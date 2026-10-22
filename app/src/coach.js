// AI Coach: gửi bài nói tới Claude (transcript) hoặc Gemini (transcript và/hoặc ghi âm).
// Prompt và schema lấy từ knowledge base (07_AI_COACH_GRADING_PROMPT.md, 08_DATA_SCHEMA.json).
import PROMPT from './coach_prompt.txt';
import SCHEMA from './coach_schema.json';
import { countWords, blobToBase64 } from './util.js';
import { groupPost } from './group-net.js';

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

// Gọi Gemini generateContent: bằng key riêng, hoặc qua "AI của nhóm" (máy chủ nhóm giữ key chung).
// Trả về { status, data } như API Gemini.
async function geminiFetch(settings, body, signal) {
  if (settings.provider === 'group') {
    const g = settings.group || {};
    if (!g.url || !g.uid) throw new CoachError('Chưa kết nối Nhóm học. Vào Cài đặt → 👥 Nhóm học.');
    try {
      const r = await groupPost(g.url, { action: 'ai', uid: g.uid, body }, { signal, timeout: 80000 });
      return { status: r.status, data: r.data };
    } catch (e) {
      if (signal?.aborted) throw new CoachError('Đã huỷ.');
      const m = e?.message || String(e);
      if (/^AI_TIMEOUT/.test(m)) throw new CoachError('AI của nhóm trả lời quá 60 giây (giới hạn của máy chủ nhóm). Bấm chấm lại sau ít giây.');
      throw new CoachError(m);
    }
  }
  const key = settings.keys?.gemini;
  if (!key) throw new CoachError('Chưa có API key Gemini. Thêm ở tab Cài đặt hoặc dùng nút 📋 Copy.');
  let res;
  try {
    res = await fetch(geminiUrl(settings.models.gemini), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    if (signal?.aborted) throw new CoachError('Đã huỷ.');
    throw new CoachError('Không kết nối được tới Gemini. Kiểm tra mạng rồi thử lại.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = { error: { message: res.statusText } };
  }
  return { status: res.status, data };
}
const geminiError = (data) => data?.error?.message || data?.message || JSON.stringify(data || {});
const geminiText = (data) => (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');

export async function gradeGemini({ settings, ctx, audio, signal }) {
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
    const { status, data } = await geminiFetch(settings, body, signal);
    if (status !== 200) {
      const msg = geminiError(data);
      if (status === 400 && withSchema && /responseJsonSchema|response_json_schema|schema|Unknown name/i.test(msg)) return attempt(false);
      throw new CoachError(geminiFriendly(status, msg));
    }
    return data;
  };
  const data = await attempt(true);
  if (data.promptFeedback?.blockReason) throw new CoachError('Gemini chặn yêu cầu này. Thử lại với nội dung khác.');
  const cand = data.candidates?.[0];
  if (!cand) throw new CoachError('Gemini không trả về kết quả.');
  if (cand.finishReason === 'MAX_TOKENS') throw new CoachError('Phản hồi bị cắt vì quá dài. Thử lại.');
  return normalizeResult(parseJson(geminiText(data)), ctx.inputMode);
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
// settings: { provider: claude|gemini|group|none, keys:{claude,gemini}, models:{claude,gemini}, group:{url,uid,registered} }
export const usesGemini = (settings) => settings.provider === 'gemini' || settings.provider === 'group';
export const aiConfigured = (settings) => settings.provider === 'claude' || usesGemini(settings);
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
  if (p === 'group') {
    if (!settings.group?.url || !settings.group?.uid || !settings.group?.registered)
      return { ok: false, reason: 'Chưa kết nối Nhóm học. Vào Cài đặt → 👥 Nhóm học, nhập tên rồi bấm Lưu & kết nối.' };
    return { ok: true };
  }
  return { ok: false, reason: 'Chưa chọn AI chấm bài. Vào Cài đặt để thêm API key, hoặc dùng nút 📋 Copy để dán vào app Claude.' };
}

export async function grade(settings, ctx, audio, signal) {
  try {
    if (settings.provider === 'claude') return { result: await gradeClaude({ key: settings.keys.claude, model: settings.models.claude, ctx, signal }) };
    if (usesGemini(settings)) return { result: await gradeGemini({ settings, ctx, audio, signal }) };
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
    if (usesGemini(settings)) {
      const body = {
        systemInstruction: { parts: [{ text: WORD_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 1024, responseJsonSchema: WORD_SCHEMA },
      };
      const { status, data } = await geminiFetch(settings, body);
      if (status !== 200) return { error: geminiFriendly(status, geminiError(data)) };
      return { result: parseJson(geminiText(data)) };
    }
    return { error: 'Chưa chọn AI. Vào Cài đặt → AI Coach (dùng AI của nhóm hoặc nhập key Gemini/Claude).' };
  } catch (e) {
    return { error: e instanceof CoachError ? e.message : `Lỗi: ${e?.message || e}` };
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
    if (usesGemini(settings)) {
      const body = {
        systemInstruction: { parts: [{ text: SCRIPT_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64 } }, { text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0, maxOutputTokens: 4096, responseJsonSchema: SCRIPT_SCHEMA },
      };
      const { status, data } = await geminiFetch(settings, body);
      if (status !== 200) return { error: geminiFriendly(status, geminiError(data)) };
      return { result: parseJson(geminiText(data)) };
    }
    return { error: 'Đọc ảnh cần AI. Vào Cài đặt → AI Coach (dùng AI của nhóm hoặc nhập key Gemini/Claude).' };
  } catch (e) {
    return { error: e instanceof CoachError ? e.message : `Lỗi: ${e?.message || e}` };
  }
}

// ---------- Gọi AI trả JSON (dùng chung Claude / Gemini / AI của nhóm) ----------
async function aiJson(settings, { system, user, schema, maxTokens = 2048, temperature = 0.5, signal }) {
  if (settings.provider === 'claude') {
    const key = settings.keys?.claude;
    if (!key) throw new CoachError('Chưa có API key Claude. Thêm ở tab Cài đặt.');
    const body = { model: settings.models.claude, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }], output_config: { format: { type: 'json_schema', schema } } };
    let res;
    try {
      res = await fetch(CLAUDE_URL, { method: 'POST', headers: claudeHeaders(key), body: JSON.stringify(body), signal });
    } catch {
      if (signal?.aborted) throw new CoachError('Đã huỷ.');
      throw new CoachError('Không kết nối được tới Claude. Kiểm tra mạng.');
    }
    if (!res.ok) throw new CoachError(claudeFriendly(res.status, await readError(res)));
    const data = await res.json();
    if (data.stop_reason === 'refusal') throw new CoachError('Claude từ chối yêu cầu này.');
    if (data.stop_reason === 'max_tokens') throw new CoachError('Phản hồi bị cắt vì quá dài. Thử lại.');
    return safeJson((data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''));
  }
  if (usesGemini(settings)) {
    const attempt = async (withSchema) => {
      const body = {
        systemInstruction: { parts: [{ text: withSchema ? system : `${system}\n\nJSON SCHEMA TO FOLLOW EXACTLY:\n${JSON.stringify(schema)}` }] },
        contents: [{ role: 'user', parts: Array.isArray(user) ? user : [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature, maxOutputTokens: maxTokens, ...(withSchema ? { responseJsonSchema: schema } : {}) },
      };
      const { status, data } = await geminiFetch(settings, body, signal);
      if (status !== 200) {
        const msg = geminiError(data);
        if (status === 400 && withSchema && /responseJsonSchema|response_json_schema|schema|Unknown name/i.test(msg)) return attempt(false);
        throw new CoachError(geminiFriendly(status, msg));
      }
      if (data.promptFeedback?.blockReason) throw new CoachError('Gemini chặn yêu cầu này.');
      if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new CoachError('Phản hồi bị cắt vì quá dài. Thử lại.');
      return safeJson(geminiText(data));
    };
    return attempt(true);
  }
  throw new CoachError('Chưa chọn AI. Vào Cài đặt → AI Coach (AI của nhóm, hoặc key Gemini/Claude).');
}
function safeJson(text) {
  try {
    return parseJson(text);
  } catch {
    throw new CoachError('AI trả về dữ liệu không đọc được. Bấm thử lại.');
  }
}
const wrap = async (fn) => {
  try {
    return { result: await fn() };
  } catch (e) {
    return { error: e instanceof CoachError ? e.message : `Lỗi: ${e?.message || e}` };
  }
};

// ---------- Soi phát âm (cần AI nghe được ghi âm: Gemini / AI của nhóm) ----------
export const APP_IPA = 'i ɪ ɛ æ ɑ ɔ ʊ u ʌ ə ɝ eɪ aɪ ɔɪ aʊ oʊ p b t d k ɡ f v s z h m n ŋ l w j θ ð ʃ ʒ tʃ dʒ r';
const PRON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['heard_text', 'overall', 'words', 'top_tips_vi', 'limitations_vi'],
  properties: {
    heard_text: { type: 'string', description: 'What you actually heard, in English words.' },
    overall: {
      type: 'object',
      additionalProperties: false,
      required: ['clarity', 'summary_vi', 'rhythm_vi'],
      properties: {
        clarity: { type: 'string', enum: ['clear', 'mostly_clear', 'hard_to_understand'] },
        summary_vi: { type: 'string' },
        rhythm_vi: { type: 'string', description: 'One sentence on word stress, intonation or linking; empty if nothing notable.' },
      },
    },
    words: {
      type: 'array',
      description: 'At most 8 mispronounced words, most important first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['position', 'word', 'expected_ipa', 'heard_ipa', 'sound', 'severity', 'issue_vi', 'tip_vi'],
        properties: {
          position: { type: 'integer', description: '0-based index in the numbered reference words (or in heard_text words when there is no reference); -1 if unknown.' },
          word: { type: 'string' },
          expected_ipa: { type: 'string', description: 'General American IPA between slashes, using only the allowed symbols.' },
          heard_ipa: { type: 'string', description: 'Approximate IPA of what was heard, between slashes.' },
          sound: { type: 'string', description: 'The main problem sound as one allowed IPA symbol, or "stress" or "ending".' },
          severity: { type: 'string', enum: ['minor', 'major'] },
          issue_vi: { type: 'string' },
          tip_vi: { type: 'string' },
        },
      },
    },
    top_tips_vi: { type: 'array', items: { type: 'string' }, description: 'Up to 3 short tips.' },
    limitations_vi: { type: 'array', items: { type: 'string' } },
  },
};
const PRON_SYSTEM = `You are an English pronunciation coach for Vietnamese adults preparing for the OPIc speaking test.
Target: clear General American, but accept any accent that is easy to understand. You receive a recording and, when available, the REFERENCE TEXT the learner intended to say.
1. Write what you actually heard in heard_text — do not copy the reference text if the learner said something different.
2. Flag at most 8 words whose pronunciation is clearly non-standard or could confuse a listener. Be conservative: do not flag accent features that do not hurt understanding, and do not flag words you could not hear clearly (mention them in limitations_vi instead). If the reading is good, return an empty words list.
3. Listen especially for these typical problems of Vietnamese speakers, but flag one ONLY when you clearly hear it: dropped final consonants (t d k s z), missing -s / -ed endings, θ ð said as t d or s z, ʃ vs s, r vs l, v said as b or j, z said as s, short vs long vowels (ɪ vs i, æ vs ɛ, ʊ vs u), wrong word stress, consonant clusters (str-, -sts), extra vowels between consonants, flat intonation. Unreleased final stops are normal in American English — do not flag them.
   If the learner skipped a word or said a different word, do not flag it as pronunciation; mention it in limitations_vi instead.
4. For each flagged word: position = 0-based index of that word in the numbered reference (or in heard_text words if there is no reference); expected_ipa and heard_ipa between slashes; sound = the main problem sound written with ONE of these symbols: ${APP_IPA} (write r not ɹ, i not iː, u not uː), or "stress" for word stress, or "ending" for a missing -s/-ed/final consonant; severity major if a listener would likely misunderstand.
5. issue_vi says what went wrong; tip_vi gives one concrete mouth/tongue instruction. Both in short, natural Vietnamese.
6. overall.clarity: clear | mostly_clear | hard_to_understand. summary_vi: 1–2 sentences. top_tips_vi: up to 3 short Vietnamese tips.
Output JSON only.`;

export function normalizePron(r, refCount = 0) {
  const words = Array.isArray(r?.words) ? r.words : [];
  return {
    heard_text: String(r?.heard_text || ''),
    overall: {
      clarity: ['clear', 'mostly_clear', 'hard_to_understand'].includes(r?.overall?.clarity) ? r.overall.clarity : 'mostly_clear',
      summary_vi: String(r?.overall?.summary_vi || ''),
      rhythm_vi: String(r?.overall?.rhythm_vi || ''),
    },
    words: words
      .slice(0, 8)
      .map((w) => ({
        position: Number.isInteger(w.position) && w.position >= 0 && (!refCount || w.position < refCount) ? w.position : -1,
        word: String(w.word || ''),
        expected_ipa: String(w.expected_ipa || ''),
        heard_ipa: String(w.heard_ipa || ''),
        sound: String(w.sound || '').replace(/[\/\[\]]/g, '').replace('ɹ', 'r').replace('iː', 'i').replace('uː', 'u'),
        severity: w.severity === 'major' ? 'major' : 'minor',
        issue_vi: String(w.issue_vi || ''),
        tip_vi: String(w.tip_vi || ''),
      }))
      .filter((w) => w.word),
    top_tips_vi: (Array.isArray(r?.top_tips_vi) ? r.top_tips_vi : []).slice(0, 3).map(String),
    limitations_vi: (Array.isArray(r?.limitations_vi) ? r.limitations_vi : []).map(String),
  };
}

export const refWordsOf = (text) => String(text || '').trim().split(/\s+/).filter(Boolean);

export async function checkPronunciationAI(settings, { audio, reference = '', signal } = {}) {
  if (!usesGemini(settings)) return { error: 'Soi phát âm cần AI nghe được ghi âm: chọn 👥 AI của nhóm hoặc Gemini ở Cài đặt → AI Coach.' };
  if (!audio?.blob) return { error: 'Chưa có ghi âm.' };
  const ref = refWordsOf(reference);
  return wrap(async () => {
    const data = await blobToBase64(audio.blob);
    const text = ref.length
      ? `REFERENCE TEXT (numbered words):\n${ref.map((w, i) => `${i}:${w}`).join(' ')}`
      : 'NO REFERENCE TEXT. Transcribe what you hear into heard_text; position = 0-based index in heard_text split by spaces.';
    const r = await aiJson(settings, {
      system: PRON_SYSTEM,
      user: [{ text }, { inlineData: { mimeType: (audio.mimeType || 'audio/webm').split(';')[0], data } }],
      schema: PRON_SCHEMA,
      maxTokens: 8192,
      temperature: 0.2,
      signal,
    });
    return normalizePron(r, ref.length);
  });
}

// ---------- Giám khảo AI (hội thoại) ----------
const TURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply_en', 'say_en', 'say_vi'],
  properties: {
    reply_en: { type: 'string', description: 'In-character reply in role-play; empty string otherwise.' },
    say_en: { type: 'string', description: 'What the examiner says next (the next question or prompt).' },
    say_vi: { type: 'string', description: 'Natural Vietnamese translation of reply_en + say_en, for reference.' },
  },
};
const EXAMINER_SYSTEM = (level) => `You are Ava, the friendly examiner avatar of the OPIc computer-based English speaking test. You are practising with a Vietnamese adult whose target level is ${level}.
Rules:
- Speak natural, clear spoken American English. Keep each turn short (1–3 sentences, at most about 45 words) unless the task says otherwise.
- Never correct, praise at length, or evaluate the learner during the conversation. Never answer your own questions. Never mention scores.
- Questions are open-ended and personal, in OPIc style ("Tell me about…", "Describe…", "What do you usually…", "Tell me about a time when… What happened and how did you feel?"). Ask ONE question per turn (it may have 2–3 short parts like real OPIc prompts).
- Match the target: IM = simple description, routine, simple past; IH = detailed past experiences and comparisons; AL = also issues, opinions, hypothetical or news-related questions.
- Follow-up questions must build on a specific detail the learner just said.
- If the learner's last answer is off-topic, briefly steer back to the topic in the next question.
- say_vi is a natural Vietnamese translation of everything you said (reply_en + say_en), for the learner's reference only.
Output JSON only.`;

const FEEDBACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['level', 'confidence', 'overall_vi', 'strengths_vi', 'improve_vi', 'better_versions', 'next_step_vi'],
  properties: {
    level: { type: 'string', enum: ['below_IM', 'IM', 'IM_IH_borderline', 'IH', 'IH_AL_borderline', 'AL', 'insufficient_evidence'] },
    confidence: { type: 'string', enum: ['low', 'medium'] },
    overall_vi: { type: 'string' },
    strengths_vi: { type: 'array', items: { type: 'string' } },
    improve_vi: { type: 'array', items: { type: 'string' } },
    better_versions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['yours', 'better_en', 'why_vi'],
        properties: { yours: { type: 'string' }, better_en: { type: 'string' }, why_vi: { type: 'string' } },
      },
    },
    next_step_vi: { type: 'string' },
  },
};
const FEEDBACK_SYSTEM = `You are an OPIc speaking coach for Vietnamese adults. You receive a practice conversation between the examiner (Ava) and a learner (speech-recognition transcripts, which may contain recognition errors — do not punish obvious recognition mistakes).
You only have text transcripts: do not judge pronunciation, accent or speaking speed.
Give a practice estimate (NOT an official OPIc rating) of the level the learner actually showed, based on: task completion, paragraph-length connected discourse, time frames (past/present/future), accuracy, vocabulary, and how well they handled follow-ups. Base it only on the evidence; do not let the target level influence the estimate. Use insufficient_evidence if the learner said too little. Confidence is at most medium.
Write in short, natural Vietnamese: overall_vi (2–3 sentences), strengths_vi (max 3), improve_vi (max 3, concrete), better_versions (max 3: quote the learner's own sentence in yours, give a more natural English version in better_en one level above your estimate (IM → IH → AL; AL stays AL), why_vi short), next_step_vi (one concrete exercise).
Output JSON only.`;

const transcriptOf = (history) =>
  history
    .map((h) => (h.role === 'learner' ? `Learner: ${h.text || '(silence)'}` : `${h.role === 'character' ? 'Character' : 'Examiner'}: ${h.text}`))
    .join('\n');

// task: chỉ dẫn cho lượt này (do app soạn theo kịch bản OPIc).
export function examinerTurn(settings, { level = 'IH', history = [], task, signal }) {
  return wrap(async () => {
    const r = await aiJson(settings, {
      system: EXAMINER_SYSTEM(level),
      user: `CONVERSATION SO FAR:\n${transcriptOf(history) || '(nothing yet)'}\n\nYOUR TASK THIS TURN:\n${task}`,
      schema: TURN_SCHEMA,
      maxTokens: 2048,
      temperature: 0.7,
      signal,
    });
    return { reply_en: String(r.reply_en || '').trim(), say_en: String(r.say_en || '').trim(), say_vi: String(r.say_vi || '').trim() };
  });
}

export function examinerFeedback(settings, { level = 'IH', history = [], context = '', signal }) {
  return wrap(async () => {
    const r = await aiJson(settings, {
      system: FEEDBACK_SYSTEM,
      user: `LEARNER TARGET LEVEL: ${level}\nPRACTICE: ${context}\n\nCONVERSATION:\n${transcriptOf(history)}`,
      schema: FEEDBACK_SCHEMA,
      maxTokens: 8192,
      temperature: 0.3,
      signal,
    });
    const LEVELS = ['below_IM', 'IM', 'IM_IH_borderline', 'IH', 'IH_AL_borderline', 'AL', 'insufficient_evidence'];
    return {
      level: LEVELS.includes(r.level) ? r.level : 'insufficient_evidence',
      confidence: r.confidence === 'medium' ? 'medium' : 'low',
      overall_vi: String(r.overall_vi || ''),
      strengths_vi: (r.strengths_vi || []).slice(0, 3).map(String),
      improve_vi: (r.improve_vi || []).slice(0, 3).map(String),
      better_versions: (r.better_versions || []).slice(0, 3).map((b) => ({ yours: String(b.yours || ''), better_en: String(b.better_en || ''), why_vi: String(b.why_vi || '') })),
      next_step_vi: String(r.next_step_vi || ''),
    };
  });
}
