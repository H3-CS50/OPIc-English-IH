// 🔍 Soi phát âm: đọc 1–3 câu → AI (Gemini / AI của nhóm) nghe → tô màu từ sai → chạm từ để xem cách sửa.
import { $, escapeHtml, toast, fmtTime } from './util.js';
import { settings } from './settings.js';
import { createRecorder, speak, stopSpeaking } from './speech.js';
import { checkPronunciationAI, refWordsOf, usesGemini } from './coach.js';
import { ipaOf } from './dict.js';
import { soundOf } from './ipa-core.js';
import { logActivity } from './activity.js';
import { splitSentences } from './scripts-core.js';

const P = { starting: false, text: '', choices: [], rec: null, recording: false, audio: null, ownAudio: false, result: null, loading: false, abort: null, sel: null, seconds: 0, timer: null, onResult: null, error: '', refUsed: '' };
const CLARITY = { clear: ['🟢', 'Rõ ràng'], mostly_clear: ['🟡', 'Khá rõ, vài chỗ cần sửa'], hard_to_understand: ['🔴', 'Khó nghe, cần luyện thêm'] };
const normW = (w) => String(w || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z']/g, '');

/**
 * text: câu cần đọc (có thể trống nếu đã có ghi âm nói tự do)
 * audio: ghi âm có sẵn {blob,url,mimeType} (vd. từ tab Luyện, chế độ Ghi âm) — tuỳ chọn
 * choices: các câu gợi ý để chọn nhanh · onResult(result): gọi khi AI trả kết quả
 */
export function openPron({ text = '', audio = null, choices = [], onResult = null } = {}) {
  stopAll();
  P.abort?.abort();
  Object.assign(P, { text, choices: choices.slice(0, 8), audio, ownAudio: false, result: null, loading: false, sel: null, seconds: 0, onResult, error: '', refUsed: '' });
  $('pron').hidden = false;
  render();
  $('pron-scroll').scrollTop = 0;
}

function close() {
  stopAll();
  P.abort?.abort();
  if (P.ownAudio && P.audio?.url) URL.revokeObjectURL(P.audio.url);
  $('pron').hidden = true;
}

async function stopAll() {
  await stopSpeaking();
  if (P.recording) await stopRec();
}

function wordsHTML() {
  const r = P.result;
  const ref = refWordsOf(P.refUsed);
  const list = ref.length ? ref : refWordsOf(r.heard_text);
  const flagged = new Map();
  for (const [i, w] of r.words.entries()) {
    let pos = w.position;
    if (pos < 0 || pos >= list.length || normW(list[pos]) !== normW(w.word)) {
      pos = list.findIndex((x, k) => normW(x) === normW(w.word) && !flagged.has(k));
    }
    if (pos >= 0 && !flagged.has(pos)) flagged.set(pos, i);
  }
  return list
    .map((w, k) => {
      const i = flagged.get(k);
      if (i == null) return `<span class="pw-ok">${escapeHtml(w)}</span>`;
      return `<button class="pw-${r.words[i].severity} ${P.sel === i ? 'sel' : ''}" data-pw="${i}">${escapeHtml(w)}</button>`;
    })
    .join(' ');
}

function detailHTML(i) {
  const w = P.result.words[i];
  if (!w) return '';
  const dictIpa = ipaOf(normW(w.word));
  const snd = soundOf(w.sound);
  return `<div class="pron-detail">
    <div class="row between"><b class="pron-w">${escapeHtml(w.word)}</b><span class="badge">${w.severity === 'major' ? 'Cần sửa' : 'Nên sửa'}</span></div>
    <div class="small">Chuẩn: <span class="ipa">${escapeHtml(dictIpa || w.expected_ipa)}</span>${w.heard_ipa ? ` · AI nghe giống (ước đoán): <span class="ipa">${escapeHtml(w.heard_ipa)}</span>` : ''}</div>
    <p class="small">${escapeHtml(w.issue_vi)}</p>
    <p class="small">👉 ${escapeHtml(w.tip_vi)}</p>
    <div class="row wrap">
      <button class="btn small-btn" data-pr="say-word">🔊 Nghe từ</button>
      <button class="btn small-btn" data-pr="slow-word">🐢 Chậm</button>
      ${snd ? `<button class="btn small-btn" data-pr="sound" data-sym="${escapeHtml(snd.sym)}">📖 Học âm /${escapeHtml(snd.sym)}/</button>` : ''}
      <button class="btn small-btn" data-pr="ipa-word">🔤 Tách âm</button>
    </div>
  </div>`;
}

function resultHTML() {
  const r = P.result;
  const [dot, label] = CLARITY[r.overall.clarity];
  return `<div class="card">
    <div class="pron-clarity">${dot} <b>${label}</b></div>
    ${r.overall.summary_vi ? `<p class="small">${escapeHtml(r.overall.summary_vi)}</p>` : ''}
    <div class="pron-sent">${wordsHTML()}</div>
    <p class="muted small">${r.words.length ? 'Chạm vào từ <span class="pw-major">đỏ</span> / <span class="pw-minor">vàng</span> để xem cách sửa.' : 'AI không thấy từ nào cần sửa. 👏'}</p>
    ${P.sel != null ? detailHTML(P.sel) : ''}
    ${r.overall.rhythm_vi ? `<p class="small">🎵 ${escapeHtml(r.overall.rhythm_vi)}</p>` : ''}
    ${r.top_tips_vi.length ? `<h4>Mẹo ưu tiên</h4><ul class="small">${r.top_tips_vi.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    <details class="small"><summary>AI nghe được</summary><p class="muted">${escapeHtml(r.heard_text || '(trống)')}</p></details>
    ${r.limitations_vi.length ? `<p class="muted small">⚠️ ${r.limitations_vi.map(escapeHtml).join(' ')}</p>` : ''}
    <div class="row"><button class="btn primary" data-pr="again">🎙️ Đọc lại</button><button class="btn" data-pr="new">✏️ Câu khác</button></div>
    <p class="muted small">AI nghe gần đúng, không chấm từng âm chính xác như máy đo chuyên dụng. Dùng để biết nên tập từ nào trước.</p>
  </div>`;
}

function render() {
  const body = $('pron-body');
  if (!body) return;
  if (!usesGemini(settings)) {
    body.innerHTML = `<div class="card"><p>Soi phát âm cần AI nghe được ghi âm.</p><p class="small">Vào <b>Cài đặt → 🤖 AI Coach</b>, chọn <b>👥 AI của nhóm</b> hoặc <b>Gemini</b>.</p><button class="btn primary" data-pr="settings">⚙️ Mở Cài đặt</button></div>`;
    return;
  }
  if (P.result) {
    body.innerHTML = resultHTML();
    return;
  }
  const hasAudio = !!P.audio;
  body.innerHTML = `<div class="card">
    <label class="field"><span>Câu cần đọc ${P.ownAudio || !hasAudio ? '(1–3 câu, dưới 30 giây là tốt nhất)' : '(lời bạn vừa nói — sửa nếu máy nghe nhầm)'}</span>
      <textarea id="pron-text" rows="3" placeholder="vd. I usually go jogging in the park three times a week.">${escapeHtml(P.text)}</textarea></label>
    ${P.choices.length ? `<div class="pron-choices">${P.choices.map((c, i) => `<button class="chip-btn" data-pick="${i}">${escapeHtml(c.length > 60 ? `${c.slice(0, 58)}…` : c)}</button>`).join('')}</div>` : ''}
    <div class="row"><button class="btn" data-pr="say">🔊 Nghe mẫu</button><button class="btn" data-pr="slow">🐢 Chậm</button></div>
  </div>
  <div class="card center">
    <button class="rec-btn ${P.recording ? 'recording' : ''}" data-pr="rec" aria-label="${P.recording ? 'Dừng' : 'Ghi âm'}"><span class="rec-dot"></span></button>
    <div class="timer">${fmtTime(P.seconds)}</div>
    <p class="muted small">${P.recording ? 'Đang ghi… đọc rõ, tốc độ bình thường. Bấm lần nữa để dừng.' : hasAudio ? 'Đã có ghi âm. Nghe lại rồi gửi AI soi, hoặc ghi lại.' : 'Nghe mẫu nếu cần, rồi bấm nút đỏ và đọc câu trên.'}</p>
    ${hasAudio && !P.recording ? `<audio controls src="${P.audio.url}"></audio>` : ''}
    ${P.loading ? `<p><span class="spinner"></span> AI đang nghe… thường 10–30 giây.</p><button class="btn" data-pr="cancel">Huỷ</button>` : hasAudio && !P.recording ? '<button class="btn primary btn-block" data-pr="send">🔍 Gửi AI soi phát âm</button>' : ''}
    ${P.error ? `<p class="small">⚠️ ${escapeHtml(P.error)}</p>` : ''}
  </div>`;
}

async function startRec() {
  if (P.starting || P.recording) return;
  P.starting = true;
  await stopSpeaking();
  P.text = $('pron-text')?.value ?? P.text;
  const rec = createRecorder();
  try {
    await rec.start();
  } catch (e) {
    P.starting = false;
    render();
    return toast(e.message, 4500);
  }
  P.starting = false;
  clearInterval(P.timer);
  if (P.ownAudio && P.audio?.url) URL.revokeObjectURL(P.audio.url);
  P.audio = null;
  P.rec = rec;
  P.recording = true;
  P.seconds = 0;
  P.error = '';
  P.timer = setInterval(() => {
    P.seconds++;
    const t = document.querySelector('#pron-body .timer');
    if (t) t.textContent = fmtTime(P.seconds);
    if (P.seconds >= 90) stopRec().then(render);
  }, 1000);
  render();
}

async function stopRec() {
  if (!P.recording) return;
  P.recording = false;
  clearInterval(P.timer);
  P.audio = await P.rec.stop();
  P.ownAudio = true;
  P.rec = null;
}

async function send() {
  P.text = $('pron-text')?.value ?? P.text;
  if (!P.audio) return;
  P.loading = true;
  P.error = '';
  P.abort = new AbortController();
  render();
  const reference = P.text.trim();
  const { result, error } = await checkPronunciationAI(settings, { audio: P.audio, reference, signal: P.abort.signal });
  P.loading = false;
  P.abort = null;
  if (error) {
    P.error = error;
    return render();
  }
  P.refUsed = reference;
  P.result = result;
  P.sel = result.words.length ? 0 : null;
  logActivity('graded', { key: `pron-${Date.now()}` });
  P.onResult?.(result);
  render();
}

async function onClick(e) {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.pick != null) {
    // Đổi câu thì ghi âm cũ (kể cả đoạn nói từ tab Luyện) không còn khớp: ghi lại.
    P.text = P.choices[+t.dataset.pick];
    if (P.ownAudio && P.audio?.url) URL.revokeObjectURL(P.audio.url);
    P.audio = null;
    P.ownAudio = false;
    return render();
  }
  if (t.dataset.pw != null) {
    if (!P.result) return;
    P.sel = +t.dataset.pw;
    render();
    document.querySelector('.pron-detail')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return speak(P.result.words[P.sel].word, 0.75).catch(() => {});
  }
  const text = () => ($('pron-text')?.value ?? P.text).trim();
  const w = P.sel != null ? P.result?.words[P.sel]?.word : '';
  switch (t.dataset.pr) {
    case 'say':
      if (!text()) return toast('Hãy nhập câu cần đọc.');
      return speak(text(), settings.ttsRate).catch((er) => toast(er.message));
    case 'slow':
      if (!text()) return toast('Hãy nhập câu cần đọc.');
      return speak(text(), Math.max(0.5, settings.ttsRate - 0.3)).catch((er) => toast(er.message));
    case 'rec':
      if (P.recording) {
        await stopRec();
        return render();
      }
      if (!text() && !P.audio) return toast('Hãy nhập hoặc chọn câu cần đọc trước.');
      return startRec();
    case 'send':
      if (P.loading) return;
      return send();
    case 'cancel':
      return P.abort?.abort();
    case 'again':
      P.text = P.refUsed;
      P.result = null;
      P.sel = null;
      return startRec();
    case 'new':
      P.result = null;
      P.sel = null;
      P.text = '';
      if (P.ownAudio && P.audio?.url) URL.revokeObjectURL(P.audio.url);
      P.audio = null;
      return render();
    case 'say-word':
      return speak(w, 0.8).catch(() => {});
    case 'slow-word':
      return speak(w, 0.5).catch(() => {});
    case 'sound':
      close();
      return window.dispatchEvent(new CustomEvent('opic:ipa-sound', { detail: t.dataset.sym }));
    case 'ipa-word':
      close();
      return window.dispatchEvent(new CustomEvent('opic:ipa-word', { detail: normW(w) }));
    case 'settings':
      close();
      window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'settings' }));
  }
}

export function initPron() {
  $('pron-close').addEventListener('click', close);
  $('pron-body').addEventListener('click', onClick);
  $('pron-body').addEventListener('input', (e) => {
    if (e.target.id === 'pron-text') P.text = e.target.value;
  });
  // Mở từ bất kỳ đâu: window.dispatchEvent(new CustomEvent('opic:pron', { detail: { text, choices } }))
  window.addEventListener('opic:pron', (e) => openPron(e.detail || {}));
}

export const pronChoicesFrom = (text) => splitSentences(text).filter((s) => s.split(/\s+/).length >= 4);
export const pronBusy = () => P.recording || P.loading;
