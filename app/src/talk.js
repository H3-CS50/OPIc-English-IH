// 💬 Giám khảo AI: hội thoại kiểu OPIc.
//  - Phỏng vấn theo chủ đề: câu 1 lấy nguyên từ combo, các câu sau AI hỏi nối tiếp dựa trên chi tiết bạn vừa nói
//    (IM 3 câu · IH 4 câu · AL 5 câu).
//  - Role-play: đọc đề câu 11 → bạn hỏi → AI đóng vai trả lời + đưa tình huống câu 12 → bạn xử lý → AI phản hồi + câu 13.
// Mỗi buổi tốn khoảng 3–5 lượt AI. Chỉ gửi chữ (máy chuyển giọng nói thành chữ), không gửi ghi âm.
import { $, escapeHtml, toast, fmtTime, countWords, pick } from './util.js';
import { settings } from './settings.js';
import { kb, allQuestions, topicLabel } from './data.js';
import { createTranscriber, speak, stopSpeaking, canTranscribe } from './speech.js';
import { examinerTurn, examinerFeedback, aiConfigured } from './coach.js';
import { levelBadge } from './feedback.js';
import { logActivity } from './activity.js';
import { analyze, analysisChips, logAnalysis } from './analysis-ui.js';
import { createTimingTracker } from './analysis.js';
import { quickSave } from './scripts.js';

const TOTAL = { IM: 3, IH: 4, AL: 5 };
const T = {
  phase: 'setup',
  mode: 'interview',
  topic: '',
  qs: [],
  level: 'IH',
  history: [],
  asked: 0,
  total: 3,
  waiting: false,
  error: '',
  retry: null,
  listening: false,
  tr: null,
  tracker: null,
  draft: '',
  seconds: 0,
  timer: null,
  feedback: null,
  sid: '',
  showVi: new Set(),
  hideText: false,
  abort: null,
};
const root = () => $('talk-root');

// ---------- Danh sách chủ đề ----------
function combos() {
  const map = new Map();
  for (const q of allQuestions()) {
    if (q.origin_set === 'imported') continue;
    if (!settings.includeOqc && q.oqc_branch) continue;
    if (!map.has(q.combo_id)) map.set(q.combo_id, []);
    map.get(q.combo_id).push(q);
  }
  const out = { interview: new Map(), roleplay: new Map() };
  for (const list of map.values()) {
    list.sort((a, b) => a.combo_order - b.combo_order);
    const cat = list[0].topic_category;
    if (list.length === 3 && (cat === 'survey' || cat === 'unexpected')) {
      if (!out.interview.has(list[0].topic)) out.interview.set(list[0].topic, []);
      out.interview.get(list[0].topic).push(list);
    }
    if (cat === 'role_play' && list.length === 3 && list.map((q) => q.mock_slot).join() === 'rp_ask,rp_problem,rp_experience') {
      if (!out.roleplay.has(list[0].topic)) out.roleplay.set(list[0].topic, []);
      out.roleplay.get(list[0].topic).push(list);
    }
  }
  return out;
}

function topicOptions(mode) {
  const c = combos()[mode];
  const keys = [...c.keys()];
  if (mode === 'roleplay') return keys.map((k) => [k, topicLabel(k).replace(/^Role-play: /, '')]).sort((a, b) => a[1].localeCompare(b[1], 'vi'));
  const groups = { survey: [], unexpected: [] };
  for (const k of keys) groups[kb.topics[k]?.category === 'survey' ? 'survey' : 'unexpected'].push([k, topicLabel(k)]);
  for (const g of Object.values(groups)) g.sort((a, b) => a[1].localeCompare(b[1], 'vi'));
  return groups;
}

// ---------- Màn chọn ----------
function setupHTML() {
  const ok = aiConfigured(settings);
  const opts = topicOptions(T.mode);
  const optHTML =
    T.mode === 'roleplay'
      ? opts.map(([k, v]) => `<option value="${k}" ${k === T.topic ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')
      : Object.entries(opts)
          .map(([g, list]) => `<optgroup label="${g === 'survey' ? 'Chủ đề Survey' : 'Chủ đề đột xuất'}">${list.map(([k, v]) => `<option value="${k}" ${k === T.topic ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</optgroup>`)
          .join('');
  return `<div class="card">
    <h2>💬 Giám khảo AI</h2>
    <p class="small">Nói chuyện với giám khảo AI như phần thi thật. AI <b>hỏi nối tiếp dựa trên chính câu bạn vừa trả lời</b>, hoặc <b>đóng vai</b> trong tình huống role-play. Cuối buổi có nhận xét và câu mẫu tốt hơn.</p>
    <div class="segmented">
      <button class="seg ${T.mode === 'interview' ? 'active' : ''}" data-tk-mode="interview">🎤 Phỏng vấn</button>
      <button class="seg ${T.mode === 'roleplay' ? 'active' : ''}" data-tk-mode="roleplay">🎭 Role-play</button>
    </div>
    <p class="muted small">${T.mode === 'interview' ? `Mục tiêu <b>${settings.target}</b>: ${TOTAL[settings.target]} câu (mô tả → thói quen → trải nghiệm${settings.target !== 'IM' ? ' → so sánh xưa – nay' : ''}${settings.target === 'AL' ? ' → vấn đề / giả định' : ''}).` : 'Câu 11 (hỏi 3–4 câu) → câu 12 (xử lý tình huống, đưa 2–3 phương án) → câu 13 (kể trải nghiệm tương tự).'}</p>
    <label class="field"><span>Chủ đề</span><select id="tk-topic"><option value="">🎲 Ngẫu nhiên</option>${optHTML}</select></label>
    <button class="btn primary btn-block" data-tk="start" ${ok ? '' : 'disabled'}>▶ Bắt đầu</button>
    ${ok ? `<p class="muted small">Mỗi buổi dùng khoảng ${T.mode === 'roleplay' ? 3 : TOTAL[settings.target]} lượt AI. ${canTranscribe() ? 'Bạn nói, máy chuyển thành chữ rồi gửi cho AI (không gửi ghi âm).' : 'Máy này không chuyển giọng nói thành chữ được — bạn gõ câu trả lời.'}</p>` : '<p class="small">⚠️ Cần AI: vào <b>Cài đặt → 🤖 AI Coach</b>, chọn <b>👥 AI của nhóm</b>, Gemini hoặc Claude.</p>'}
  </div>`;
}

// ---------- Màn hội thoại ----------
const WHO = { examiner: ['👩‍💼', 'Ava'], character: ['🧑‍💼', 'Nhân vật'], learner: ['🙋', 'Bạn'] };
function bubbleHTML(h, i) {
  const [icon, name] = WHO[h.role];
  if (h.role === 'learner') {
    return `<div class="tk-msg me"><div class="tk-who">${icon} ${name}${h.seconds ? ` · ${fmtTime(h.seconds)}` : ''} · ${h.words} từ</div>
      <div class="tk-text en-text">${escapeHtml(h.text || '(không nói gì)')}</div>
      ${h.chips || ''}
      ${h.text ? `<button class="link-btn small" data-tk-save="${i}">📜 Lưu kịch bản</button>` : ''}</div>`;
  }
  const hidden = T.hideText && h.role === 'examiner' && i === lastExaminerIdx();
  return `<div class="tk-msg ${h.role}"><div class="tk-who">${icon} ${name}</div>
    ${hidden ? '<div class="tk-text muted">Chữ đang ẩn như thi thật. Bấm 🔊 để nghe lại.</div>' : `<div class="tk-text en-text">${escapeHtml(h.text)}</div>`}
    <div class="row"><button class="btn small-btn" data-tk-say="${i}">🔊</button>${h.vi ? `<button class="btn small-btn" data-tk-vi="${i}">VI</button>` : ''}</div>
    ${T.showVi.has(i) && h.vi ? `<div class="tk-vi small">${escapeHtml(h.vi)}</div>` : ''}</div>`;
}
const lastExaminerIdx = () => T.history.map((h) => h.role).lastIndexOf('examiner');

function chatHTML() {
  const label = T.mode === 'roleplay' ? `🎭 ${topicLabel(T.topic).replace(/^Role-play: /, '')}` : `🎤 ${topicLabel(T.topic)}`;
  const answered = T.history.filter((h) => h.role === 'learner').length;
  const done = T.phase === 'feedback';
  return `<div class="tk-head card">
      <div class="row between"><b>${escapeHtml(label)}</b><span class="muted small">Câu ${Math.min(T.asked, T.total)}/${T.total} · mục tiêu ${T.level}</span></div>
      <div class="row">
        <button class="btn small-btn" data-tk="hide">${T.hideText ? '👁️ Hiện chữ' : '🙈 Ẩn chữ'}</button>
        ${done ? '' : `<button class="btn small-btn" data-tk="end">${answered ? '⏹ Kết thúc & nhận xét' : '✕ Thoát'}</button>`}
      </div>
    </div>
    <div class="tk-log">${T.history.map(bubbleHTML).join('')}</div>
    ${T.waiting ? `<p class="muted"><span class="spinner"></span> ${T.phase === 'feedback' ? 'AI đang nhận xét cả buổi…' : 'Ava đang nghe và nghĩ câu tiếp theo…'}</p>` : ''}
    ${T.error ? `<div class="card"><p class="small">⚠️ ${escapeHtml(T.error)}</p><button class="btn primary" data-tk="retry">↻ Thử lại</button></div>` : ''}
    ${!done && !T.waiting && !T.error && T.history.at(-1)?.role !== 'learner' ? composeHTML() : ''}
    ${done && T.feedback ? feedbackHTML(T.feedback) : ''}`;
}

function composeHTML() {
  const can = canTranscribe();
  return `<div class="card tk-compose">
    <textarea id="tk-draft" rows="4" placeholder="${can ? 'Bấm 🎙️ rồi trả lời bằng giọng nói. Có thể sửa chữ trước khi gửi.' : 'Gõ câu trả lời của bạn.'}">${escapeHtml(T.draft)}</textarea>
    <div class="row">
      ${can ? `<button class="btn ${T.listening ? 'danger' : ''}" data-tk="rec">${T.listening ? '⏹ Dừng' : '🎙️ Nói'}</button>` : ''}
      <span class="timer small tk-timer">${fmtTime(T.seconds)}</span>
      <button class="btn primary" data-tk="send">Gửi ➤</button>
    </div>
  </div>`;
}

function feedbackHTML(f) {
  return `<div class="card tk-fb">
    <h3>📋 Nhận xét cả buổi</h3>
    <div class="readiness">${levelBadge(f.level, 'badge-lg')}<div class="small">Ước tính luyện tập (${f.confidence === 'medium' ? 'độ tin cậy trung bình' : 'độ tin cậy thấp'}), không phải điểm OPIc.</div></div>
    <p>${escapeHtml(f.overall_vi)}</p>
    ${f.strengths_vi.length ? `<h4>✅ Làm tốt</h4><ul class="small">${f.strengths_vi.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${f.improve_vi.length ? `<h4>🧩 Cần cải thiện</h4><ul class="small">${f.improve_vi.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${
      f.better_versions.length
        ? `<h4>✏️ Nói hay hơn</h4>${f.better_versions
            .map(
              (b, i) => `<div class="tk-better"><div class="small muted">Bạn nói: <s>${escapeHtml(b.yours)}</s></div>
              <div class="en-text">${escapeHtml(b.better_en)}</div><div class="small muted">${escapeHtml(b.why_vi)}</div>
              <div class="row"><button class="btn small-btn" data-tk-bsay="${i}">🔊</button><button class="btn small-btn" data-tk-bsave="${i}">📜 Lưu</button></div></div>`,
            )
            .join('')}`
        : ''
    }
    ${f.next_step_vi ? `<p class="small"><b>🚀 Bước tiếp theo:</b> ${escapeHtml(f.next_step_vi)}</p>` : ''}
    <div class="row"><button class="btn primary" data-tk="again">↻ Làm lại</button><button class="btn" data-tk="new">Chủ đề khác</button></div>
  </div>`;
}

export function renderTalk() {
  const el = root();
  if (!el) return;
  el.innerHTML = T.phase === 'setup' ? setupHTML() : chatHTML();
}

// ---------- Luồng hội thoại ----------
function interviewTask(k) {
  const q = T.qs[k - 1];
  const en = kb.topics[T.topic]?.en || topicLabel(T.topic);
  if (q)
    return `Ask question ${k} of ${T.total}. Base it on this OPIc question, keeping its meaning and question type, but adapt it naturally so it refers to one specific detail the learner just mentioned: "${q.question_text}". You may start with a very short natural reaction (2–5 words). reply_en must be "".`;
  if (k === 4) return `Ask question 4 of ${T.total}: a follow-up that asks the learner to compare the past and the present about "${en}" (how it has changed over the years, and why), building on what the learner said. reply_en must be "".`;
  return `Ask question 5 of ${T.total}: an advanced OPIc-style question about a social issue, a concern or a future trend related to "${en}", or a hypothetical situation, connected to the conversation. reply_en must be "".`;
}
function roleplayTask(k) {
  const [ask, problem, exp] = T.qs;
  if (k === 2)
    return `Two parts.
reply_en: you are now the person the learner is talking to in this situation: "${ask.question_text}". Answer the learner's questions naturally and briefly (at most 4 short sentences; invent realistic details). If they asked nothing useful, greet them and say briefly what you can help with.
say_en: as the examiner, read this next OPIc prompt (you may shorten it slightly but keep its meaning): "${problem.question_text}"`;
  return `Two parts.
reply_en: as the same person in the situation, respond briefly (at most 2 sentences) to the learner's last message and accept one of the solutions they offered.
say_en: as the examiner, end the role-play and read this OPIc prompt (you may shorten it slightly): "${exp.question_text}"`;
}

async function sayAll(texts) {
  for (const t of texts) {
    if (!t || T.phase === 'setup') return;
    await speak(t, settings.ttsRate).catch(() => {});
  }
}

function pushExaminer(say, vi, reply = '') {
  if (reply) T.history.push({ role: 'character', text: reply });
  T.history.push({ role: 'examiner', text: say, vi });
  T.asked++;
  renderTalk();
  scrollEnd();
  sayAll([reply, say]);
}

function start(again = false) {
  const c = combos()[T.mode];
  if (!again) {
    T.topic = $('tk-topic')?.value || pick([...c.keys()]);
  }
  const list = c.get(T.topic);
  if (!list?.length) return toast('Chủ đề này chưa có câu hỏi phù hợp.');
  Object.assign(T, {
    phase: 'chat',
    qs: pick(list),
    level: settings.target,
    history: [],
    asked: 0,
    total: T.mode === 'roleplay' ? 3 : TOTAL[settings.target] || 4,
    waiting: false,
    error: '',
    retry: null,
    draft: '',
    seconds: 0,
    feedback: null,
    sid: Date.now().toString(36),
    showVi: new Set(),
  });
  pushExaminer(T.qs[0].question_text, '');
}

async function aiStep(fn) {
  T.waiting = true;
  T.error = '';
  T.retry = () => aiStep(fn);
  T.abort = new AbortController();
  renderTalk();
  scrollEnd();
  const { result, error } = await fn(T.abort.signal);
  T.waiting = false;
  T.abort = null;
  if (T.phase === 'setup') return;
  if (error) {
    T.error = error;
    return renderTalk();
  }
  T.retry = null;
  return result;
}

async function nextQuestion() {
  const k = T.asked + 1;
  const task = T.mode === 'roleplay' ? roleplayTask(k) : interviewTask(k);
  const r = await aiStep((signal) => examinerTurn(settings, { level: T.level, history: T.history, task, signal }));
  if (!r) return;
  pushExaminer(r.say_en || T.qs[k - 1]?.question_text || 'Could you tell me more about that?', r.say_vi, T.mode === 'roleplay' ? r.reply_en : '');
}

async function finishTalk() {
  T.phase = 'feedback';
  const context = T.mode === 'roleplay' ? `Role-play (OPIc questions 11–13): ${topicLabel(T.topic)}` : `Interview on the topic "${kb.topics[T.topic]?.en || T.topic}" with follow-up questions`;
  const r = await aiStep((signal) => examinerFeedback(settings, { level: T.level, history: T.history, context, signal }));
  if (!r) return;
  T.feedback = r;
  logActivity('graded', { key: `talk-${T.sid}` });
  renderTalk();
  document.querySelector('.tk-fb')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function send() {
  await stopListening();
  const text = ($('tk-draft')?.value ?? T.draft).trim();
  if (!text && !confirm('Chưa có câu trả lời. Vẫn gửi (bỏ qua câu này)?')) return;
  await stopSpeaking();
  const words = countWords(text);
  const a = analyze({ text, seconds: T.seconds, target: T.level, timing: T.tracker?.stop() || null });
  T.history.push({ role: 'learner', text, words, seconds: T.seconds, chips: analysisChips(a) });
  logAnalysis(a, { qid: `talk-${T.sid}-${T.asked}`, target: T.level });
  if (words >= 15) logActivity('spoken', { key: `talk-${T.sid}-${T.asked}`, seconds: T.seconds });
  T.draft = '';
  T.seconds = 0;
  T.tracker = null;
  if (T.asked >= T.total) return finishTalk();
  return nextQuestion();
}

async function startListening() {
  await stopSpeaking();
  T.draft = $('tk-draft')?.value || '';
  const base = T.draft ? `${T.draft} ` : '';
  T.tracker = createTimingTracker();
  T.tracker.start();
  T.tr = createTranscriber((text) => {
    T.tracker?.update(text);
    T.draft = base + text;
    const el = $('tk-draft');
    if (el) el.value = T.draft;
  });
  try {
    await T.tr.start();
  } catch (e) {
    T.tr = null;
    return toast(e.message || 'Không mở được micro.', 4500);
  }
  T.listening = true;
  T.timer = setInterval(() => {
    T.seconds++;
    const el = document.querySelector('.tk-timer');
    if (el) el.textContent = fmtTime(T.seconds);
    if (T.seconds >= 240) stopListening().then(renderTalk);
  }, 1000);
  renderTalk();
  $('tk-draft')?.scrollIntoView({ block: 'center' });
}

async function stopListening() {
  if (!T.listening) return;
  T.listening = false;
  clearInterval(T.timer);
  await T.tr?.stop().catch(() => {});
  T.tr = null;
}

const scrollEnd = () => setTimeout(() => root()?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30);

async function onClick(e) {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tkMode) {
    T.mode = t.dataset.tkMode;
    T.topic = '';
    return renderTalk();
  }
  if (t.dataset.tkSay != null) return speak(T.history[+t.dataset.tkSay].text, settings.ttsRate).catch(() => {});
  if (t.dataset.tkVi != null) {
    const i = +t.dataset.tkVi;
    T.showVi.has(i) ? T.showVi.delete(i) : T.showVi.add(i);
    return renderTalk();
  }
  if (t.dataset.tkSave != null) {
    const h = T.history[+t.dataset.tkSave];
    const q = [...T.history.slice(0, +t.dataset.tkSave)].reverse().find((x) => x.role === 'examiner');
    return quickSave({ question_text: q?.text || '', topic: T.topic, text: h.text, source: 'mine', level: T.level });
  }
  if (t.dataset.tkBsay != null) return speak(T.feedback.better_versions[+t.dataset.tkBsay].better_en, settings.ttsRate).catch(() => {});
  if (t.dataset.tkBsave != null) {
    const b = T.feedback.better_versions[+t.dataset.tkBsave];
    return quickSave({ question_text: '', topic: T.topic, text: b.better_en, source: 'ai', level: T.level });
  }
  switch (t.dataset.tk) {
    case 'start':
      return start();
    case 'rec':
      if (T.listening) {
        await stopListening();
        return renderTalk();
      }
      return startListening();
    case 'send':
      return send();
    case 'retry':
      return T.retry?.();
    case 'hide':
      T.hideText = !T.hideText;
      return renderTalk();
    case 'end': {
      await stopListening();
      await stopSpeaking();
      const answered = T.history.some((h) => h.role === 'learner' && h.words);
      if (!answered) return reset();
      if (!confirm('Kết thúc buổi nói và nhờ AI nhận xét?')) return;
      return finishTalk();
    }
    case 'again':
      return start(true);
    case 'new':
      return reset();
  }
}

function reset() {
  stopTalk();
  T.phase = 'setup';
  T.history = [];
  T.feedback = null;
  T.error = '';
  renderTalk();
}

export async function stopTalk() {
  T.abort?.abort();
  await stopListening();
  await stopSpeaking();
}
export const talkBusy = () => T.listening;

export function initTalk() {
  const el = root();
  if (!el) return;
  el.addEventListener('click', onClick);
  el.addEventListener('input', (e) => {
    if (e.target.id === 'tk-draft') T.draft = e.target.value;
  });
  el.addEventListener('change', (e) => {
    if (e.target.id === 'tk-topic') T.topic = e.target.value;
  });
  window.addEventListener('opic:pview-changed', (e) => {
    if (e.detail === 'talk') renderTalk();
    else stopTalk();
  });
  renderTalk();
}
