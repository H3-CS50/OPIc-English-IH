// Sổ kịch bản (tab Học → 📜 Kịch bản): lưu, sửa, nghe, học thuộc (ẩn từ), nói theo từng câu, chụp ảnh kịch bản.
import { $, escapeHtml, toast } from './util.js';
import { getQuestion, topicLabel } from './data.js';
import { speak, stopSpeaking, createTranscriber, canTranscribe } from './speech.js';
import { settings } from './settings.js';
import { readScriptImageAI, aiConfigured } from './coach.js';
import {
  listScripts, getScript, addScript, updateScript, removeScript, markPracticed, onScriptsChange,
  SOURCE_VI, splitSentences, compareSpeech, maskedWords, RECALL_LEVELS,
} from './scripts-core.js';

const ui = { view: 'list', id: null, mode: 'read', level: 1, seed: 1, revealed: new Set(), sIdx: 0, results: {}, listening: false, tr: null, filter: '', draft: null };
const root = () => $('scripts-root');
const wc = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;

// ---------- Mở từ nơi khác ----------
export function openScript(id, mode = 'read') {
  Object.assign(ui, { view: 'view', id, mode, sIdx: 0, results: {}, revealed: new Set(), seed: 1 });
  window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'learn' }));
  window.dispatchEvent(new CustomEvent('opic:learn-sub', { detail: 'scripts' }));
  render();
}

// Lưu nhanh từ màn Luyện / bài mẫu / thi thử. Trả về script.
export function quickSave(payload, { open = false, mode = 'read' } = {}) {
  const { script, existed } = addScript(payload);
  if (!script) {
    toast('Chưa có nội dung để lưu.');
    return null;
  }
  if (open) openScript(script.id, mode);
  else toast(existed ? '📜 Đã có trong Sổ kịch bản.' : '📜 Đã lưu vào Sổ kịch bản (tab Học → Kịch bản).', 3000);
  return script;
}

// ---------- Danh sách ----------
function listHTML() {
  const all = listScripts();
  const q = ui.filter.trim().toLowerCase();
  const items = q ? all.filter((s) => `${s.question_text} ${s.text} ${topicLabel(s.topic)}`.toLowerCase().includes(q)) : all;
  return `<div class="card">
      <h3>📜 Sổ kịch bản của tôi</h3>
      <p class="small muted">Lưu bài nói hay nhất, bài AI nâng cấp hoặc bài mẫu để nghe, học thuộc ý và nói theo. Lưu trên máy, không cần mạng.</p>
      <div class="row wrap">
        <button class="btn primary" data-sc="new">✍️ Viết mới</button>
        <label class="btn">📷 Chụp ảnh kịch bản<input type="file" accept="image/*" data-sc="photo" hidden></label>
      </div>
      <p class="muted small">Chụp ảnh cần AI (key Gemini hoặc Claude). Ảnh chỉ gửi tới AI bạn chọn để đọc chữ, app không lưu ảnh.</p>
    </div>
    ${all.length > 4 ? `<input type="search" class="sc-filter" placeholder="🔎 Tìm trong kịch bản…" value="${escapeHtml(ui.filter)}" data-sc="filter">` : ''}
    ${
      items.length
        ? items
            .map(
              (s) => `<button class="list-item q-item" data-open="${s.id}">
          <div class="q-item-meta"><span class="chip">${escapeHtml(SOURCE_VI[s.source] || s.source)}</span>${s.topic ? `<span class="chip chip-type">${escapeHtml(topicLabel(s.topic))}</span>` : ''}${s.level ? `<span class="chip">${escapeHtml(s.level)}</span>` : ''}</div>
          <div class="q-item-text">${escapeHtml(s.question_text || s.text.slice(0, 90) + '…')}</div>
          <div class="muted small">${wc(s.text)} từ · luyện ${s.practiced || 0} lần${s.best != null ? ` · nói theo tốt nhất ${s.best}%` : ''}</div></button>`,
            )
            .join('')
        : `<p class="muted small" style="margin:12px 4px">${all.length ? 'Không có kịch bản khớp.' : 'Chưa có kịch bản. Ở tab Luyện, bấm <b>📜 Lưu kịch bản</b> dưới ô lời nói, hoặc <b>📜 Lưu</b> trong bài mẫu.'}</p>`
    }`;
}

// ---------- Xem / luyện ----------
function headHTML(s) {
  return `<div class="row"><button class="btn" data-sc="back">← Sổ kịch bản</button></div>
    <div class="card">
      <div class="q-item-meta"><span class="chip">${escapeHtml(SOURCE_VI[s.source] || s.source)}</span>${s.topic ? `<span class="chip chip-type">${escapeHtml(topicLabel(s.topic))}</span>` : ''}${s.level ? `<span class="chip">${escapeHtml(s.level)}</span>` : ''}</div>
      ${s.question_text ? `<p class="q-text">${escapeHtml(s.question_text)}</p>` : ''}
      <div class="segmented">
        <button class="seg ${ui.mode === 'read' ? 'active' : ''}" data-mode-sc="read">📖 Đọc</button>
        <button class="seg ${ui.mode === 'recall' ? 'active' : ''}" data-mode-sc="recall">🙈 Học thuộc</button>
        <button class="seg ${ui.mode === 'shadow' ? 'active' : ''}" data-mode-sc="shadow">🗣️ Nói theo</button>
      </div>
    </div>`;
}

function readHTML(s) {
  return `<div class="card">
      <div class="en-text sc-text">${escapeHtml(s.text)}</div>
      <p class="muted small">${wc(s.text)} từ · chạm vào từ để tra nghĩa</p>
      <div class="row wrap">
        <button class="btn" data-sc="listen">🔊 Nghe cả bài</button>
        <button class="btn" data-sc="stop">⏹ Dừng</button>
        ${s.question_id && getQuestion(s.question_id) ? '<button class="btn" data-sc="practice">🎤 Luyện câu này</button>' : ''}
      </div>
      <div class="row wrap">
        <button class="btn" data-sc="edit">✏️ Sửa</button>
        <button class="btn" data-sc="delete">🗑️ Xoá</button>
      </div>
    </div>
    <div class="callout"><b>Mẹo:</b> học thuộc <b>ý và cụm từ</b>, không thuộc nguyên văn. Khi thi, kể bằng lời của bạn theo các ý đó.</div>`;
}

function recallHTML(s) {
  const words = maskedWords(s.text, ui.level, ui.seed);
  return `<div class="card">
      <div class="row between"><b>${RECALL_LEVELS[ui.level]}</b><span class="muted small">Chạm vào ô trống để xem từ</span></div>
      <div class="segmented sc-levels">${RECALL_LEVELS.map((l, i) => `<button class="seg ${i === ui.level ? 'active' : ''}" data-level-sc="${i}">${i === 0 ? '0' : i === 4 ? '100%' : `${i * 25}%`}</button>`).join('')}</div>
      <div class="sc-recall">${words
        .map((x, i) =>
          x.hidden && !ui.revealed.has(i)
            ? `<button class="sc-blank" data-reveal="${i}" style="min-width:${Math.min(9, Math.max(2, x.w.length)) * 0.62}em">${escapeHtml(x.w.replace(/[^A-Za-z']/g, '')[0] || '•')}…</button>`
            : `<span class="${x.hidden ? 'sc-shown' : ''}">${escapeHtml(x.w)}</span>`,
        )
        .join(' ')}</div>
      <div class="row wrap">
        <button class="btn" data-sc="reseed">🔀 Đổi từ ẩn</button>
        <button class="btn" data-sc="hideall">🙈 Ẩn lại</button>
        <button class="btn primary" data-sc="harder">Ẩn thêm ▶</button>
      </div>
      <p class="muted small">Nói to cả bài, nhìn ô trống để nhớ ý. Thuộc rồi thì tăng mức ẩn. Từ nội dung (dài) được ẩn trước, từ nhỏ như "the, and" ẩn sau.</p>
    </div>`;
}

function shadowHTML(s) {
  const sents = splitSentences(s.text);
  if (!sents.length) return '<div class="card"><p class="muted">Kịch bản không có câu tiếng Anh nào.</p></div>';
  ui.sIdx = Math.min(ui.sIdx, sents.length - 1);
  const cur = sents[ui.sIdx];
  const r = ui.results[ui.sIdx];
  const done = Object.values(ui.results);
  const avg = done.length ? Math.round(done.reduce((a, x) => a + x.score, 0) / done.length) : null;
  const can = canTranscribe();
  return `<div class="card">
      <div class="row between"><b>Câu ${ui.sIdx + 1}/${sents.length}</b><span class="muted small">${avg != null ? `Trung bình ${avg}% · ${done.length} câu đã nói` : 'Nghe → nói theo → xem từ nào bị thiếu'}</span></div>
      <div class="sc-sentence en-text">${
        r ? r.words.map((x) => `<span class="${x.skip ? '' : x.ok ? 'sw-ok' : 'sw-miss'}">${escapeHtml(x.w)}</span>`).join(' ') : escapeHtml(cur)
      }</div>
      ${
        r
          ? `<div class="sc-score ${r.score >= 85 ? 'good' : r.score >= 60 ? 'mid' : 'low'}">${r.score}% khớp</div>
             <p class="small">Máy nghe được: <i>${escapeHtml(r.said || '(không nghe được gì)')}</i></p>
             ${r.extra.length ? `<p class="muted small">Từ thừa/khác: ${escapeHtml(r.extra.slice(0, 12).join(', '))}</p>` : ''}`
          : ''
      }
      <div class="row wrap">
        <button class="btn" data-sc="say">🔊 Nghe câu</button>
        <button class="btn" data-sc="slow">🐢 Nghe chậm</button>
        <button class="btn ${ui.listening ? 'danger' : 'primary'}" data-sc="shadow-rec" ${can ? '' : 'disabled'}>${ui.listening ? '⏹ Dừng & chấm' : '🎙️ Nói theo'}</button>
      </div>
      ${can ? '' : '<p class="small">⚠️ Máy này không hỗ trợ nhận dạng giọng nói nên không chấm được. Bạn vẫn nghe và nói theo được.</p>'}
      <div class="row between">
        <button class="btn" data-sc="prev" ${ui.sIdx === 0 ? 'disabled' : ''}>◀ Câu trước</button>
        <button class="btn" data-sc="next" ${ui.sIdx >= sents.length - 1 ? 'disabled' : ''}>Câu sau ▶</button>
      </div>
      <p class="muted small"><span class="sw-ok">Xanh</span>: máy nghe đúng. <span class="sw-miss">Đỏ</span>: thiếu hoặc máy nghe thành từ khác — thường do phát âm chưa rõ, nuốt âm cuối, hoặc nói quá nhanh. Đây là so khớp theo chữ máy nhận dạng, không chấm ngữ điệu hay trọng âm.</p>
    </div>`;
}

// ---------- Sửa / viết mới ----------
function editHTML() {
  const d = ui.draft;
  return `<div class="row"><button class="btn" data-sc="cancel">← Huỷ</button></div>
    <div class="card">
      <h3>${d.id ? '✏️ Sửa kịch bản' : '✍️ Kịch bản mới'}</h3>
      ${d.note ? `<div class="callout">${escapeHtml(d.note)}</div>` : ''}
      <label class="field"><span>Câu hỏi (không bắt buộc)</span><textarea rows="2" data-f="question_text">${escapeHtml(d.question_text || '')}</textarea></label>
      <label class="field"><span>Kịch bản (tiếng Anh)</span><textarea rows="12" data-f="text">${escapeHtml(d.text || '')}</textarea></label>
      <button class="btn primary btn-block" data-sc="save">💾 Lưu</button>
    </div>`;
}

function render() {
  const el = root();
  if (!el) return;
  if (ui.view === 'edit' && ui.draft) el.innerHTML = editHTML();
  else {
    const s = ui.view === 'view' ? getScript(ui.id) : null;
    if (!s) {
      ui.view = 'list';
      el.innerHTML = listHTML();
    } else el.innerHTML = headHTML(s) + (ui.mode === 'recall' ? recallHTML(s) : ui.mode === 'shadow' ? shadowHTML(s) : readHTML(s));
  }
}

// ---------- Ảnh chụp ----------
async function shrinkImage(file, max = 1600) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Không mở được ảnh.'));
      i.src = url;
    });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85).split(',')[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function onPhoto(file) {
  if (!file) return;
  if (!aiConfigured(settings)) return toast('Đọc ảnh cần AI. Vào Cài đặt → AI Coach (AI của nhóm, hoặc key Gemini/Claude).', 5000);
  root().insertAdjacentHTML('afterbegin', '<div class="card" id="sc-busy"><span class="spinner"></span> AI đang đọc chữ trong ảnh…</div>');
  try {
    const b64 = await shrinkImage(file);
    const { result, error } = await readScriptImageAI(settings, b64, 'image/jpeg');
    if (error) throw new Error(error);
    if (!result?.script?.trim()) throw new Error('AI không tìm thấy chữ tiếng Anh trong ảnh.');
    ui.draft = { question_text: result.question || '', text: result.script, source: 'photo', note: `Kiểm tra lại chữ AI đọc từ ảnh trước khi lưu.${result.note_vi ? ' ' + result.note_vi : ''}` };
    ui.view = 'edit';
    render();
  } catch (e) {
    $('sc-busy')?.remove();
    toast(e.message || String(e), 5000);
  }
}

// ---------- Nói theo ----------
async function shadowRec() {
  const s = getScript(ui.id);
  const sents = splitSentences(s.text);
  if (ui.listening) {
    ui.listening = false;
    const said = (await ui.tr?.stop()) || '';
    ui.tr = null;
    const r = compareSpeech(sents[ui.sIdx], said);
    ui.results[ui.sIdx] = { ...r, said };
    const done = Object.values(ui.results);
    if (done.length === sents.length) markPracticed(s.id, Math.round(done.reduce((a, x) => a + x.score, 0) / done.length));
    render();
    return;
  }
  await stopSpeaking();
  try {
    ui.tr = createTranscriber(() => {});
    await ui.tr.start();
    ui.listening = true;
    render();
  } catch (e) {
    ui.tr = null;
    toast(e.message || 'Không mở được micro.', 4500);
  }
}

async function stopAll() {
  await stopSpeaking();
  if (ui.listening) {
    ui.listening = false;
    await ui.tr?.stop().catch(() => {});
    ui.tr = null;
  }
}

// ---------- Sự kiện ----------
function onClick(e) {
  const t = e.target.closest('button, [data-open]');
  if (!t || !root().contains(t)) return;
  if (t.dataset.open) {
    Object.assign(ui, { view: 'view', id: t.dataset.open, mode: 'read', sIdx: 0, results: {}, revealed: new Set() });
    window.scrollTo(0, 0);
    return render();
  }
  if (t.dataset.modeSc) {
    stopAll();
    ui.mode = t.dataset.modeSc;
    if (ui.mode === 'recall') markPracticed(ui.id);
    return render();
  }
  if (t.dataset.levelSc) {
    ui.level = +t.dataset.levelSc;
    ui.revealed = new Set();
    return render();
  }
  if (t.dataset.reveal) {
    ui.revealed.add(+t.dataset.reveal);
    return render();
  }
  const s = getScript(ui.id);
  const sents = s ? splitSentences(s.text) : [];
  switch (t.dataset.sc) {
    case 'back':
      stopAll();
      ui.view = 'list';
      return render();
    case 'new':
      ui.draft = { question_text: '', text: '', source: 'manual' };
      ui.view = 'edit';
      return render();
    case 'edit':
      ui.draft = { id: s.id, question_text: s.question_text, text: s.text };
      ui.view = 'edit';
      return render();
    case 'cancel':
      ui.view = ui.draft?.id ? 'view' : 'list';
      ui.draft = null;
      return render();
    case 'save': {
      const text = root().querySelector('[data-f=text]').value.trim();
      const question_text = root().querySelector('[data-f=question_text]').value.trim();
      if (!text) return toast('Kịch bản đang trống.');
      if (ui.draft.id) updateScript(ui.draft.id, { text, question_text });
      else {
        const { script, existed } = addScript({ text, question_text, source: ui.draft.source || 'manual' });
        if (existed) toast('Kịch bản này đã có trong sổ.');
        ui.id = script.id;
      }
      ui.draft = null;
      Object.assign(ui, { view: 'view', mode: 'read', results: {}, sIdx: 0 });
      toast('💾 Đã lưu.');
      return render();
    }
    case 'delete':
      if (!confirm('Xoá kịch bản này?')) return;
      removeScript(s.id);
      ui.view = 'list';
      return render();
    case 'listen':
      return speak(s.text, settings.ttsRate).catch((er) => toast(er.message));
    case 'stop':
      return stopSpeaking();
    case 'practice':
      return window.dispatchEvent(new CustomEvent('opic:open-question', { detail: s.question_id }));
    case 'reseed':
      ui.seed = (ui.seed % 97) + 1;
      ui.revealed = new Set();
      return render();
    case 'hideall':
      ui.revealed = new Set();
      return render();
    case 'harder':
      ui.level = Math.min(4, ui.level + 1);
      ui.revealed = new Set();
      return render();
    case 'say':
      return speak(sents[ui.sIdx], settings.ttsRate).catch((er) => toast(er.message));
    case 'slow':
      return speak(sents[ui.sIdx], Math.max(0.5, settings.ttsRate - 0.3)).catch((er) => toast(er.message));
    case 'shadow-rec':
      return shadowRec();
    case 'prev':
    case 'next':
      stopAll();
      ui.sIdx += t.dataset.sc === 'next' ? 1 : -1;
      return render();
  }
}

export function initScripts() {
  const el = root();
  el.addEventListener('click', onClick);
  el.addEventListener('change', (e) => {
    if (e.target.dataset.sc === 'photo') {
      onPhoto(e.target.files?.[0]);
      e.target.value = '';
    }
  });
  el.addEventListener('input', (e) => {
    if (e.target.dataset.sc !== 'filter') return;
    ui.filter = e.target.value;
    const pos = e.target.selectionStart;
    render();
    const inp = root().querySelector('[data-sc=filter]');
    inp?.focus();
    inp?.setSelectionRange(pos, pos);
  });
  onScriptsChange(() => ui.view === 'list' && render());
  render();
}

export const refreshScripts = () => render();
export const stopScripts = () => stopAll();
