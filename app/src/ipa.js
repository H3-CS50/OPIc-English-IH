// Tab Học → 🔤 IPA: bài học, bảng âm, luyện tập, tra cách đọc một từ.
import { $, escapeHtml, toast, store } from './util.js';
import { loadIpa, ipaOf, ipaLoaded, cleanWord, lookupWord } from './dict.js';
import { speak, stopSpeaking, createTranscriber, canTranscribe } from './speech.js';
import { settings } from './settings.js';
import { SOUNDS, LESSONS, KIND_VI } from './ipa-data.js';
import {
  tokenizeIpa, soundOf, ipaProgress, isSeen, markSeen, lessonDone, markLesson, recordQuiz,
  pairQuestion, readQuestion, saidWord,
} from './ipa-core.js';

const ui = { view: 'home', lesson: null, sound: null, back: [], mode: store.get('ipaMode', 'listen'), q: null, answered: null, score: { n: 0, ok: 0 }, word: '', listening: false, tr: null, heard: null };
const root = () => $('ipa-root');
const say = (w, slow = false) => speak(w, slow ? Math.max(0.5, settings.ttsRate - 0.35) : settings.ttsRate).catch((e) => toast(e.message));

// Phiên âm có tô âm cần học; mỗi âm bấm được.
function ipaHTML(ipa, focus = null, clickable = true) {
  if (!ipa) return '<span class="muted">(chưa có phiên âm)</span>';
  const toks = tokenizeIpa(ipa);
  return `<span class="ipa">/${toks
    .map((t) => {
      if (t.space) return ' ';
      const st = t.stress === 'primary' ? 'ˈ' : t.stress === 'secondary' ? 'ˌ' : '';
      const cls = `ipa-t${t.sym === focus ? ' hit' : ''}${t.stress === 'primary' ? ' str' : ''}`;
      return clickable && t.known ? `${st}<button class="${cls}" data-sym="${escapeHtml(t.sym)}">${escapeHtml(t.sym)}</button>` : `${st}<span class="${cls}">${escapeHtml(t.sym)}</span>`;
    })
    .join('')}/</span>`;
}

// Câu mẫu để soi phát âm (nhiều âm khó với người Việt: th, s/ʃ, r/l, âm cuối, -ed/-s).
const PRON_SAMPLES = [
  'I think this is the third time I have visited this beautiful place.',
  'She usually washes her clothes on Sunday mornings.',
  'We walked around the lake and talked about our plans.',
  'The weather was really nice, so we decided to go hiking.',
  'I would like to ask a few questions about the hotel rooms.',
];

// ---------- Trang chính ----------
function homeHTML() {
  const p = ipaProgress();
  return `<div class="card ipa-hero">
      <h3>🔤 Học phiên âm IPA</h3>
      <p class="small">Nhìn phiên âm là đọc được mọi từ, kể cả từ mới. Học theo 8 bài ngắn, mỗi âm có cách đặt miệng, âm gần giống tiếng Việt và từ ví dụ để nghe.</p>
      <div class="rm-sum"><div><b>${p.lessons}/${p.lessonTotal}</b><span>bài đã học</span></div><div><b>${p.seen}/${p.total}</b><span>âm đã xem</span></div><div><b>${p.quiz.n ? Math.round((100 * p.quiz.ok) / p.quiz.n) + '%' : '–'}</b><span>đúng khi luyện</span></div></div>
      <div class="ipa-actions">
        <button class="btn" data-go="chart">🔣 Bảng âm</button>
        <button class="btn" data-go="practice">🎯 Luyện tập</button>
        <button class="btn" data-go="lookup">🔎 Tra cách đọc</button>
        <button class="btn" data-ipa-pron>🔍 Soi phát âm</button>
      </div>
    </div>
    <h3 class="section-h">📖 8 bài học</h3>
    ${LESSONS.map(
      (l, i) => `<button class="list-item ipa-lesson ${lessonDone(l.id) ? 'done' : ''}" data-lesson="${l.id}">
        <span class="ipa-lesson-i">${lessonDone(l.id) ? '✅' : l.icon}</span>
        <span><b>Bài ${i + 1}. ${escapeHtml(l.title)}</b>${l.sounds.length ? `<span class="muted small">${l.sounds.length} âm: ${l.sounds.map((s) => `/${s}/`).join(' ')}</span>` : ''}</span></button>`,
    ).join('')}`;
}

// ---------- Bài học ----------
function soundTiles(syms) {
  return `<div class="ipa-grid">${syms
    .map((sym) => {
      const s = soundOf(sym);
      return `<button class="ipa-tile ${isSeen(sym) ? 'seen' : ''}" data-sym="${escapeHtml(sym)}"><span class="ipa-sym">${escapeHtml(sym)}</span><span class="small">${escapeHtml(s.words[0][0])}</span></button>`;
    })
    .join('')}</div>`;
}

function lessonHTML(l) {
  const i = LESSONS.indexOf(l);
  const next = LESSONS[i + 1];
  return `<div class="row"><button class="btn" data-back>← IPA</button></div>
    <div class="card ipa-lesson-body">
      <h3>${l.icon} Bài ${i + 1}. ${escapeHtml(l.title)}</h3>
      ${l.body}
      ${l.sounds.length ? `<h4>Bấm vào từng âm để học chi tiết</h4>${soundTiles(l.sounds)}` : ''}
    </div>
    <div class="row wrap">
      <button class="btn ${lessonDone(l.id) ? '' : 'primary'}" data-done="${l.id}">${lessonDone(l.id) ? '✅ Đã học' : '✓ Đánh dấu đã học'}</button>
      ${next ? `<button class="btn" data-lesson="${next.id}">Bài ${i + 2} ▶</button>` : '<button class="btn" data-go="practice">🎯 Luyện tập ▶</button>'}
    </div>`;
}

// ---------- Một âm ----------
function soundHTML(s) {
  const ipaReady = ipaLoaded();
  return `<div class="row"><button class="btn" data-back>← Quay lại</button></div>
    <div class="card ipa-sound">
      <div class="ipa-sound-head"><span class="ipa-big">/${escapeHtml(s.sym)}/</span>
        <div><b>${escapeHtml(s.name)}</b><div class="muted small">${KIND_VI[s.kind]}${s.uk !== s.sym ? ` · Anh–Anh: /${escapeHtml(s.uk)}/` : ''}</div></div></div>
      <div class="ipa-how"><b>👄 Cách đọc:</b> ${escapeHtml(s.how)}</div>
      <div class="ipa-how"><b>🇻🇳 Gần với tiếng Việt:</b> ${escapeHtml(s.vn)}</div>
      <div class="callout"><b>💡</b> ${escapeHtml(s.tip)}</div>
      <p class="small"><b>Thường viết là:</b> ${escapeHtml(s.spell)}</p>
      <h4>Từ ví dụ</h4>
      <div class="ipa-words">${s.words
        .map(
          ([w, vi]) => `<div class="ipa-word"><button class="btn small-btn" data-say="${escapeHtml(w)}" aria-label="Nghe">🔊</button>
          <div><b class="en-text">${escapeHtml(w)}</b> ${ipaReady ? ipaHTML(ipaOf(w), s.sym) : '<span class="muted small">đang tải…</span>'}<div class="muted small">${escapeHtml(vi)}</div></div></div>`,
        )
        .join('')}</div>
      <div class="row wrap"><button class="btn" data-say-all="${escapeHtml(s.words.map((x) => x[0]).join(', '))}">🔊 Nghe cả lượt</button><button class="btn" data-slow-all="${escapeHtml(s.words.map((x) => x[0]).join(', '))}">🐢 Nghe chậm</button></div>
      ${
        s.pair
          ? `<h4>Cặp dễ nhầm</h4><div class="ipa-pair">${s.pair
              .map((w) => `<button class="btn" data-say="${escapeHtml(w)}">🔊 ${escapeHtml(w)} ${ipaReady ? `<span class="ipa">${escapeHtml(ipaOf(w))}</span>` : ''}</button>`)
              .join('<span class="muted">vs</span>')}</div>`
          : ''
      }
      <p class="muted small">Giọng đọc là giọng máy của điện thoại (tiếng Anh–Mỹ). Nghe từng từ, nói theo 3 lần, rồi thử nói mà không nghe.</p>
    </div>`;
}

// ---------- Bảng âm ----------
function chartHTML() {
  const groups = [
    ['Nguyên âm đơn', SOUNDS.filter((s) => s.kind === 'vowel')],
    ['Nguyên âm đôi', SOUNDS.filter((s) => s.kind === 'diphthong')],
    ['Phụ âm gần tiếng Việt', SOUNDS.filter((s) => s.kind === 'consonant' && s.group === 'easy')],
    ['Phụ âm khó với người Việt', SOUNDS.filter((s) => s.kind === 'consonant' && s.group === 'hard')],
  ];
  return `<div class="row"><button class="btn" data-back>← IPA</button></div>
    <div class="card"><h3>🔣 Bảng âm (${SOUNDS.length} âm)</h3><p class="muted small">Ô có viền xanh là âm bạn đã xem. Bấm vào âm để xem cách đọc và nghe từ ví dụ.</p>
    ${groups.map(([t, list]) => `<h4>${t}</h4>${soundTiles(list.map((s) => s.sym))}`).join('')}</div>`;
}

// ---------- Luyện tập ----------
function practiceHTML() {
  const m = ui.mode;
  const tabs = `<div class="segmented ipa-modes">
    <button class="seg ${m === 'listen' ? 'active' : ''}" data-mode-ipa="listen">👂 Nghe chọn</button>
    <button class="seg ${m === 'read' ? 'active' : ''}" data-mode-ipa="read">🔣 Đọc phiên âm</button>
    <button class="seg ${m === 'speak' ? 'active' : ''}" data-mode-ipa="speak">🎙️ Nói thử</button></div>`;
  const q = ui.q;
  let body = '';
  if (!q) body = '<p class="muted">Đang chuẩn bị…</p>';
  else if (m === 'listen') {
    body = `<p class="small">Bấm 🔊 để nghe, rồi chọn từ bạn nghe được. Hai từ chỉ khác nhau một âm: <b>${escapeHtml(q.pair.focus)}</b>.</p>
      <div class="row"><button class="btn primary" data-replay>🔊 Nghe</button><button class="btn" data-replay-slow>🐢 Nghe chậm</button></div>
      <div class="ipa-options">${q.options
        .map((k) => {
          const w = q.pair[k];
          const cls = ui.answered ? (w === q.word ? 'right' : ui.answered === w ? 'wrong' : '') : '';
          return `<button class="ipa-opt ${cls}" data-pick="${escapeHtml(w)}" ${ui.answered ? 'disabled' : ''}><b>${escapeHtml(w)}</b><span class="ipa">${escapeHtml(k === 'a' ? q.pair.ia : q.pair.ib)}</span></button>`;
        })
        .join('')}</div>`;
  } else if (m === 'read') {
    body = `<p class="small">Đọc phiên âm và chọn từ đúng.</p>
      <div class="ipa-prompt">${ipaHTML(q.ipa, null, false)}</div>
      <div class="ipa-options four">${q.options
        .map((w) => {
          const cls = ui.answered ? (w === q.word ? 'right' : ui.answered === w ? 'wrong' : '') : '';
          return `<button class="ipa-opt ${cls}" data-pick="${escapeHtml(w)}" ${ui.answered ? 'disabled' : ''}><b>${escapeHtml(w)}</b></button>`;
        })
        .join('')}</div>`;
  } else {
    const can = canTranscribe();
    body = `<p class="small">Nói từ bên dưới. Máy nghe và cho biết đã nhận ra đúng từ chưa.</p>
      <div class="ipa-prompt"><b class="ipa-say-w">${escapeHtml(q.word)}</b> <span class="ipa">${escapeHtml(q.ipa)}</span><div class="muted small">Dễ nhầm với: ${escapeHtml(q.other)} <span class="ipa">${escapeHtml(q.otherIpa)}</span></div></div>
      <div class="row wrap"><button class="btn" data-replay>🔊 Nghe mẫu</button>
      <button class="btn ${ui.listening ? 'danger' : 'primary'}" data-rec ${can ? '' : 'disabled'}>${ui.listening ? '⏹ Dừng & kiểm tra' : '🎙️ Nói'}</button></div>
      ${ui.heard ? `<div class="ipa-heard ${ui.heard.ok ? 'right' : 'wrong'}">${ui.heard.ok ? '✅ Máy nghe đúng' : '❌ Máy chưa nghe ra'} "<b>${escapeHtml(q.word)}</b>". Máy nghe được: <i>${escapeHtml(ui.heard.words.join(' ') || '(không nghe được gì)')}</i></div>` : ''}
      ${can ? '' : '<p class="small">⚠️ Máy này không hỗ trợ nhận dạng giọng nói. Hãy dùng 2 cách luyện còn lại.</p>'}
      <p class="muted small">Máy nhận dạng giọng nói có thể tự đoán từ theo ngữ cảnh, nên đây chỉ là kiểm tra gần đúng, không chấm chất lượng phát âm.</p>`;
  }
  const fb = ui.answered && m !== 'speak' ? `<div class="ipa-heard ${ui.answered === q.word ? 'right' : 'wrong'}">${ui.answered === q.word ? '✅ Đúng!' : `❌ Đáp án: <b>${escapeHtml(q.word)}</b> ${escapeHtml(q.ipa)}`}</div>` : '';
  return `<div class="row"><button class="btn" data-back>← IPA</button></div>
    <div class="card">${tabs}${body}${fb}
      <div class="row between"><span class="muted small">Lượt này: ${ui.score.ok}/${ui.score.n} đúng</span><button class="btn" data-next-q>Câu khác ▶</button></div>
    </div>`;
}

function newQuestion() {
  ui.answered = null;
  ui.heard = null;
  if (ui.mode === 'read') ui.q = ipaLoaded() ? readQuestion(ipaOf) : null;
  else {
    const q = pairQuestion();
    if (ui.mode === 'speak') {
      const k = q.word === q.pair.a ? 'b' : 'a';
      q.other = q.pair[k];
      q.otherIpa = k === 'a' ? q.pair.ia : q.pair.ib;
    }
    ui.q = q;
  }
}

// ---------- Tra cách đọc ----------
function lookupHTML() {
  const w = cleanWord(ui.word);
  const ipa = w ? ipaOf(w, lookupWord(w).lemma) : '';
  const toks = ipa ? tokenizeIpa(ipa).filter((t) => !t.space) : [];
  return `<div class="row"><button class="btn" data-back>← IPA</button></div>
    <div class="card"><h3>🔎 Tra cách đọc một từ</h3>
      <input type="search" id="ipa-q" placeholder="Gõ một từ tiếng Anh, ví dụ: comfortable" value="${escapeHtml(ui.word)}" autocapitalize="off" autocomplete="off">
      ${
        !w
          ? '<p class="muted small">App tách phiên âm thành từng âm. Bấm vào âm để xem cách đọc.</p>'
          : !ipaLoaded()
            ? '<p class="muted small">Đang tải phiên âm…</p>'
            : !ipa
              ? '<p class="small">Chưa có phiên âm cho từ này. Kiểm tra lại chính tả.</p>'
              : `<div class="ipa-prompt"><b class="ipa-say-w">${escapeHtml(w)}</b> ${ipaHTML(ipa)}</div>
                <div class="row wrap"><button class="btn" data-say="${escapeHtml(w)}">🔊 Nghe</button><button class="btn" data-slow="${escapeHtml(w)}">🐢 Nghe chậm</button></div>
                <h4>Từng âm</h4><div class="ipa-steps">${toks
                  .map((t, i) => {
                    const s = soundOf(t.sym);
                    return `<button class="ipa-step" data-sym="${escapeHtml(t.sym)}" ${s ? '' : 'disabled'}><span class="ipa-sym">${escapeHtml(t.sym)}</span><span class="small">${i + 1}. ${s ? escapeHtml(s.name) : ''}${t.stress === 'primary' ? ' · <b>nhấn</b>' : ''}</span></button>`;
                  })
                  .join('')}</div>
                <p class="muted small">Âm có chữ "nhấn" là đầu âm tiết được nhấn mạnh (dấu ˈ). Đọc to hơn, dài hơn ở âm tiết đó.</p>`
      }
    </div>`;
}

// ---------- Vẽ & điều hướng ----------
function render() {
  const el = root();
  if (!el) return;
  const v = ui.view;
  el.innerHTML =
    v === 'lesson' ? lessonHTML(ui.lesson) : v === 'sound' ? soundHTML(ui.sound) : v === 'chart' ? chartHTML() : v === 'practice' ? practiceHTML() : v === 'lookup' ? lookupHTML() : homeHTML();
  if (!ipaLoaded() && (v === 'sound' || v === 'lookup' || (v === 'practice' && ui.mode === 'read')))
    loadIpa().then(() => {
      if (v === 'practice' && !ui.q) newQuestion();
      render();
    }, () => {});
}
function go(view, patch = {}) {
  ui.back.push({ view: ui.view, lesson: ui.lesson, sound: ui.sound });
  if (ui.back.length > 20) ui.back.shift();
  Object.assign(ui, { view }, patch);
  if (view === 'practice' && !ui.q) newQuestion();
  render();
  window.scrollTo(0, 0);
}
function back() {
  stopAll();
  const prev = ui.back.pop() || { view: 'home' };
  Object.assign(ui, prev);
  render();
  window.scrollTo(0, 0);
}
function openSound(sym) {
  const s = soundOf(sym);
  if (!s) return;
  markSeen(sym);
  go('sound', { sound: s });
}
async function stopAll() {
  await stopSpeaking();
  if (ui.listening) {
    ui.listening = false;
    await ui.tr?.stop().catch(() => {});
    ui.tr = null;
  }
}

async function toggleRec() {
  if (ui.listening) {
    ui.listening = false;
    const heard = (await ui.tr?.stop()) || '';
    ui.tr = null;
    ui.heard = saidWord(heard, ui.q.word);
    ui.score.n++;
    if (ui.heard.ok) ui.score.ok++;
    recordQuiz(ui.heard.ok);
    return render();
  }
  await stopSpeaking();
  try {
    ui.tr = createTranscriber(() => {});
    await ui.tr.start();
    ui.listening = true;
    ui.heard = null;
    render();
  } catch (e) {
    ui.tr = null;
    toast(e.message || 'Không mở được micro.', 4500);
  }
}

function onClick(e) {
  const t = e.target.closest('button');
  if (!t || !root().contains(t)) return;
  const d = t.dataset;
  if (d.sym) return openSound(d.sym);
  if (d.lesson) return go('lesson', { lesson: LESSONS.find((l) => l.id === d.lesson) });
  if (d.go) return go(d.go);
  if ('ipaPron' in d) return window.dispatchEvent(new CustomEvent('opic:pron', { detail: { text: '', choices: PRON_SAMPLES } }));
  if ('back' in d) return back();
  if (d.done) {
    markLesson(d.done);
    (LESSONS.find((l) => l.id === d.done)?.sounds || []).forEach(markSeen);
    toast('✅ Đã đánh dấu bài học.');
    return render();
  }
  if (d.say) return say(d.say);
  if (d.slow) return say(d.slow, true);
  if (d.sayAll) return say(d.sayAll);
  if (d.slowAll) return say(d.slowAll, true);
  if (d.modeIpa) {
    stopAll();
    ui.mode = d.modeIpa;
    store.set('ipaMode', ui.mode);
    newQuestion();
    return render();
  }
  if ('replay' in d && ui.q) return say(ui.q.word);
  if ('replaySlow' in d && ui.q) return say(ui.q.word, true);
  if (d.pick && ui.q && !ui.answered) {
    ui.answered = d.pick;
    const ok = d.pick === ui.q.word;
    ui.score.n++;
    if (ok) ui.score.ok++;
    recordQuiz(ok);
    return render();
  }
  if ('nextQ' in d) {
    stopAll();
    newQuestion();
    render();
    if (ui.mode === 'listen') say(ui.q.word);
    return;
  }
  if ('rec' in d) return toggleRec();
}

// Mở từ chỗ khác (bảng tra từ): tách phiên âm của một từ.
export function openIpaWord(word) {
  window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'learn' }));
  window.dispatchEvent(new CustomEvent('opic:learn-sub', { detail: 'ipa' }));
  ui.back = [{ view: 'home' }];
  ui.view = 'lookup';
  ui.word = word;
  render();
  window.scrollTo(0, 0);
}

// Mở bài của một âm (từ Soi phát âm).
export function openIpaSound(sym) {
  if (!soundOf(sym)) return;
  window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'learn' }));
  window.dispatchEvent(new CustomEvent('opic:learn-sub', { detail: 'ipa' }));
  ui.back = [];
  ui.view = 'home';
  openSound(sym);
  window.scrollTo(0, 0);
}

export function initIpa() {
  const el = root();
  el.addEventListener('click', onClick);
  let tmr;
  el.addEventListener('input', (e) => {
    if (e.target.id !== 'ipa-q') return;
    clearTimeout(tmr);
    tmr = setTimeout(() => {
      ui.word = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const inp = $('ipa-q');
      inp?.focus();
      inp?.setSelectionRange(pos, pos);
    }, 250);
  });
  window.addEventListener('opic:ipa-word', (e) => openIpaWord(e.detail));
  window.addEventListener('opic:ipa-sound', (e) => openIpaSound(e.detail));
  render();
}
export const refreshIpa = () => render();
export const stopIpa = () => stopAll();
