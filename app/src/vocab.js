// Tab 📒 Từ vựng — tích hợp app OPIc AL Vocab (618 mục gốc) + phần mở rộng có nguồn.
import { $, escapeHtml as esc, toast } from './util.js';
import { kb } from './data.js';
import { speak } from './speech.js';
import {
  TOPICS, ALL, S, saveState, isNew, isLearned, isDue, st, grade, resetProgress, stats, studyQueue, quiz, search, speakable,
  ORIGINAL_COUNT, migrateOldFlashcards,
} from './vocab-core.js';

const SRC = new Map(kb.sources.map((s) => [s.source_id, s]));
const srcLabel = (id) => (id === 'SRC-U16' ? 'bộ OPIc AL Vocab của bạn' : id === 'SRC-AI-0002' ? 'flashcard v1 của app' : SRC.get(id)?.publisher_or_author || id);

let stack = [];
let cur = { v: 'home', q: '' };
let armed = false;

const say = (t) => speak(speakable(t), S.set.rate).catch((e) => toast(e.message));
const go = (v) => {
  stack.push(cur);
  cur = v;
  render();
  window.scrollTo(0, 0);
};
const back = () => {
  if (!stack.length) return;
  cur = stack.pop();
  render();
  window.scrollTo(0, 0);
};

const topbar = (title, right = '') =>
  `<div class="v-top"><button class="btn small-btn" data-v="back" aria-label="Quay lại">←</button><b>${esc(title)}</b><span class="muted small">${right}</span></div>`;

// ---------- Trang chủ ----------
function homeHTML() {
  const s = stats();
  const extra = ALL.length - ORIGINAL_COUNT;
  return `
  <div class="v-head"><h2>📒 Từ vựng OPIc</h2>
    <p class="muted small">${ALL.length} từ &amp; cụm từ · ${TOPICS.length} chủ đề · gồm ${ORIGINAL_COUNT} mục từ app OPIc AL Vocab và ${extra} mục bổ sung</p></div>
  <div class="stat-row"><div class="stat"><b>${s.learned}</b><span>Đã thuộc</span></div><div class="stat"><b>${s.seen}</b><span>Đã học</span></div><div class="stat"><b>${s.due}</b><span>Cần ôn</span></div></div>
  <div class="row"><button class="btn primary" data-v="study" data-k="all">▶ Học hôm nay</button><button class="btn" data-v="quiz" data-k="all">🎯 Kiểm tra 10 câu</button></div>
  <div class="banner small">💡 Mỗi ngày: ôn hết thẻ đến hạn + ${S.set.newPer} từ mới. Khi lật thẻ, đọc to câu ví dụ 2–3 lần rồi tự đặt 1 câu về bản thân. Không cụm từ nào tự làm bạn lên điểm — dùng đúng lúc, đúng chức năng mới có tác dụng.</div>
  <input type="search" id="v-search" placeholder="🔍 Tìm từ (Anh hoặc Việt)…" value="${esc(cur.q || '')}">
  <div id="v-results"></div>
  <div class="list-section">Chủ đề</div>
  ${TOPICS.map(deckRow).join('')}
  <div class="list-section">Cài đặt</div>
  ${settingsHTML()}`;
}

function deckRow(t) {
  const s = stats(t.items);
  const extra = t.items.filter((it) => it.new).length;
  const isNewTopic = extra === t.items.length;
  return `<div class="card v-deck">
    <div class="v-deck-top"><span class="v-ic">${t.icon}</span><div class="v-dn"><b>${esc(t.vi)}</b>${isNewTopic ? ' <span class="chip chip-new">chủ đề mới</span>' : ''}
      <div class="muted small">${s.learned}/${s.total} đã thuộc${s.due ? ` · <span class="v-due">${s.due} cần ôn</span>` : ''}${extra && !isNewTopic ? ` · +${extra} mục mới` : ''}</div></div></div>
    <div class="bar"><span class="bar-fill v-fill" style="width:${Math.round((s.learned / s.total) * 100)}%"></span></div>
    <div class="v-acts"><button class="btn" data-v="study" data-k="${t.idx}">Học</button><button class="btn" data-v="quiz" data-k="${t.idx}">Kiểm tra</button><button class="btn" data-v="list" data-k="${t.idx}">Xem</button></div>
  </div>`;
}

function settingsHTML() {
  const s = S.set;
  const chip = (key, val, label) => `<button class="v-chip ${s[key] === val ? 'on' : ''}" data-v="set" data-key="${key}" data-val='${JSON.stringify(val)}'>${label}</button>`;
  return `<div class="card v-set">
    <div class="v-set-row"><span>Mặt trước thẻ</span><div>${chip('dir', 'en', 'Tiếng Anh')}${chip('dir', 'vi', 'Tiếng Việt')}</div></div>
    <div class="v-set-row"><span>Tự động đọc</span><div>${chip('auto', true, 'Bật')}${chip('auto', false, 'Tắt')}</div></div>
    <div class="v-set-row"><span>Tốc độ đọc</span><div>${chip('rate', 0.7, 'Chậm')}${chip('rate', 0.9, 'Vừa')}${chip('rate', 1, 'Thường')}</div></div>
    <div class="v-set-row"><span>Từ mới mỗi lượt</span><div>${chip('newPer', 10, '10')}${chip('newPer', 20, '20')}${chip('newPer', 30, '30')}</div></div>
    <div class="v-set-row"><span>Tiến độ học</span><button class="v-chip" data-v="reset">Xóa toàn bộ</button></div>
  </div>`;
}

function fillResults() {
  const el = $('v-results');
  if (!el) return;
  const r = search(cur.q || '');
  el.innerHTML = (cur.q || '').trim() ? `<p class="muted small">${r.length} kết quả</p>` + r.slice(0, 50).map(itemRow).join('') : '';
}

// ---------- Học ----------
function startStudy(k) {
  const items = k === 'all' ? ALL : TOPICS[k].items;
  const { q, free } = studyQueue(items);
  go({ v: 'study', k, title: k === 'all' ? 'Học hôm nay' : TOPICS[k].vi, q, i: 0, flip: false, good: 0, bad: 0, free });
  autoFront();
}

function studyHTML() {
  const c = cur;
  if (c.i >= c.q.length) return doneHTML();
  const it = c.q[c.i];
  const en = S.set.dir === 'en';
  return `${topbar(c.title, `${c.i + 1}/${c.q.length}`)}
  ${c.free && c.i === 0 ? '<p class="muted small">Không còn thẻ đến hạn, đang ôn ngẫu nhiên 20 thẻ.</p>' : ''}
  <div class="flashcard v-flash" data-v="flip">
    <div class="muted small">${esc(it.topic.vi)}${isNew(it) ? ' · <b>Mới học</b>' : ''}</div>
    <div class="v-front">${esc(en ? it.en : it.vi)}</div>
    ${c.flip
      ? `<div class="v-sep"></div><div class="v-back">${esc(en ? it.vi : it.en)}</div>${it.ex ? `<div class="v-ex">${esc(it.ex)}</div>` : ''}${it.n ? `<div class="v-note">💡 ${esc(it.n)}</div>` : ''}`
      : '<div class="muted small">Chạm để lật thẻ</div>'}
  </div>
  <div class="row"><button class="btn" data-v="say" data-id="${it.idx}" data-f="en">🔊 Từ</button>${it.ex ? `<button class="btn" data-v="say" data-id="${it.idx}" data-f="ex">🔊 Ví dụ</button>` : ''}</div>
  ${c.flip
    ? '<div class="v-grade"><button class="btn v-g0" data-v="rate" data-g="0">Quên</button><button class="btn v-g1" data-v="rate" data-g="1">Khó</button><button class="btn v-g2" data-v="rate" data-g="2">Nhớ</button></div>'
    : '<button class="btn primary btn-block" data-v="flip">Lật thẻ</button>'}`;
}

function flip() {
  if (cur.flip) return;
  cur.flip = true;
  render();
  const it = cur.q[cur.i];
  if (S.set.auto) say(S.set.dir === 'vi' ? it.en : it.ex || it.en);
}

function rate(g) {
  const it = cur.q[cur.i];
  grade(it, g);
  if (g === 0) {
    cur.bad++;
    cur.q.splice(Math.min(cur.i + 4, cur.q.length), 0, it);
  } else cur.good++;
  cur.i++;
  cur.flip = false;
  render();
  autoFront();
}

function autoFront() {
  if (!S.set.auto || S.set.dir !== 'en') return;
  if (cur.v === 'study' && cur.i < cur.q.length && !cur.flip) say(cur.q[cur.i].en);
  if (cur.v === 'quiz' && cur.i < cur.qs.length && cur.pick < 0) say(cur.qs[cur.i].it.en);
}

function doneHTML() {
  return `${topbar(cur.title)}<div class="v-done"><div class="v-big">🎉</div><h2>Xong lượt học!</h2><p class="muted">Nhớ: <b>${cur.good}</b> · Quên: <b>${cur.bad}</b></p></div>
  <button class="btn primary btn-block" data-v="again">Học tiếp</button><button class="btn btn-block" data-v="back">Về trang Từ vựng</button>`;
}

// ---------- Kiểm tra ----------
function startQuiz(k) {
  const items = k === 'all' ? ALL : TOPICS[k].items;
  go({ v: 'quiz', k, title: k === 'all' ? 'Kiểm tra tổng hợp' : TOPICS[k].vi, qs: quiz(items), i: 0, pick: -1, score: 0, wrong: [] });
  autoFront();
}

function quizHTML() {
  const c = cur;
  if (c.i >= c.qs.length) return quizDone();
  const { it, opts } = c.qs[c.i];
  const en = S.set.dir === 'en';
  return `${topbar(c.title, `${c.i + 1}/${c.qs.length}`)}
  <div class="card v-qcard"><div class="muted small">${en ? 'Nghĩa của:' : 'Tiếng Anh là:'}</div><div class="v-front">${esc(en ? it.en : it.vi)}</div>
    ${en ? `<button class="btn small-btn" data-v="say" data-id="${it.idx}" data-f="en">🔊</button>` : ''}</div>
  <div class="v-opts">${opts
    .map((o, j) => {
      let cls = '';
      if (c.pick >= 0) cls = o === it ? 'ok' : j === c.pick ? 'no' : '';
      return `<button class="v-opt ${cls}" ${c.pick >= 0 ? 'disabled' : ''} data-v="pick" data-j="${j}">${esc(en ? o.vi : o.en)}</button>`;
    })
    .join('')}</div>
  ${c.pick >= 0
    ? `${it.ex ? `<div class="card v-ex-box" data-v="say" data-id="${it.idx}" data-f="ex">🔊 ${esc(it.ex)}</div>` : ''}<button class="btn primary btn-block" data-v="next">${c.i + 1 < c.qs.length ? 'Câu tiếp →' : 'Xem kết quả'}</button>`
    : ''}`;
}

function pickOpt(j) {
  const c = cur;
  if (c.pick >= 0) return;
  c.pick = j;
  const { it, opts } = c.qs[c.i];
  if (opts[j] === it) c.score++;
  else {
    c.wrong.push(it);
    grade(it, 0);
  }
  render();
  if (S.set.auto) say(it.ex || it.en);
}

function quizDone() {
  const c = cur;
  const pct = c.score / c.qs.length;
  const msg = pct >= 0.9 ? 'Xuất sắc!' : pct >= 0.7 ? 'Tốt lắm!' : pct >= 0.5 ? 'Khá ổn, ôn thêm nhé.' : 'Cần ôn lại thêm.';
  return `${topbar(c.title)}<div class="v-done"><div class="v-big">${pct >= 0.7 ? '🏆' : '💪'}</div><h2>${c.score}/${c.qs.length} câu đúng</h2><p class="muted">${msg}</p></div>
  ${c.wrong.length ? `<div class="list-section">Câu sai (đã đưa vào danh sách ôn)</div>${c.wrong.map(itemRow).join('')}` : ''}
  <button class="btn primary btn-block" data-v="again">Làm bài khác</button><button class="btn btn-block" data-v="back">Về trang Từ vựng</button>`;
}

// ---------- Xem danh sách ----------
function listHTML() {
  const t = TOPICS[cur.k];
  const srcs = [...new Set(t.items.flatMap((it) => it.s))].map(srcLabel);
  return `${topbar(`${t.icon} ${t.vi}`, `${t.items.length} mục`)}
  <p class="muted small">Nguồn: ${esc(srcs.join(' · '))}. Câu ví dụ do AI viết, chưa có giáo viên duyệt.</p>
  <input type="search" id="v-filter" placeholder="🔍 Lọc trong chủ đề…" value="${esc(cur.q || '')}">
  <div id="v-list"></div>`;
}
function fillList() {
  const t = TOPICS[cur.k];
  const r = (cur.q || '').trim() ? search(cur.q, t.items) : t.items;
  $('v-list').innerHTML = r.map(itemRow).join('') || '<p class="muted">Không tìm thấy.</p>';
}

function itemRow(it) {
  const p = st(it);
  const dot = !p ? '' : p.box >= 3 ? 'ok' : 'mid';
  return `<div class="v-item"><div class="v-it-main">
    <div class="v-it-en"><i class="v-dot ${dot}"></i>${esc(it.en)}${it.new ? ' <span class="chip chip-new">mới</span>' : ''}</div>
    <div class="v-it-vi">${esc(it.vi)}</div>
    ${it.ex ? `<div class="v-it-ex" data-v="say" data-id="${it.idx}" data-f="ex">${esc(it.ex)}</div>` : ''}
    ${it.n ? `<div class="v-it-note">💡 ${esc(it.n)}</div>` : ''}
  </div><button class="btn small-btn" data-v="say" data-id="${it.idx}" data-f="en" aria-label="Nghe">🔊</button></div>`;
}

// ---------- Render & sự kiện ----------
function render() {
  const root = $('vocab-root');
  if (!root) return;
  if (cur.v === 'home') {
    root.innerHTML = homeHTML();
    fillResults();
    $('v-search').addEventListener('input', (e) => {
      cur.q = e.target.value;
      fillResults();
    });
  } else if (cur.v === 'study') root.innerHTML = studyHTML();
  else if (cur.v === 'quiz') root.innerHTML = quizHTML();
  else if (cur.v === 'list') {
    root.innerHTML = listHTML();
    fillList();
    $('v-filter').addEventListener('input', (e) => {
      cur.q = e.target.value;
      fillList();
    });
  }
}

function onClick(e) {
  const b = e.target.closest('[data-v]');
  if (!b || !$('vocab-root').contains(b)) return;
  const v = b.dataset.v;
  const k = b.dataset.k === 'all' ? 'all' : Number(b.dataset.k);
  if (v === 'back') back();
  else if (v === 'study') startStudy(k);
  else if (v === 'quiz') startQuiz(k);
  else if (v === 'list') go({ v: 'list', k, q: '' });
  else if (v === 'flip') flip();
  else if (v === 'rate') rate(Number(b.dataset.g));
  else if (v === 'pick') pickOpt(Number(b.dataset.j));
  else if (v === 'next') {
    cur.i++;
    cur.pick = -1;
    render();
    window.scrollTo(0, 0);
    autoFront();
  } else if (v === 'again') {
    const c = cur;
    back();
    (c.v === 'quiz' ? startQuiz : startStudy)(c.k);
  } else if (v === 'say') {
    const it = ALL[Number(b.dataset.id)];
    say(b.dataset.f === 'ex' ? it.ex : it.en);
  } else if (v === 'set') {
    S.set[b.dataset.key] = JSON.parse(b.dataset.val);
    saveState();
    render();
  } else if (v === 'reset') {
    if (!armed) {
      armed = true;
      b.textContent = 'Bấm lần nữa để xóa';
      b.classList.add('danger-text');
      setTimeout(() => (armed = false), 4000);
      return;
    }
    armed = false;
    resetProgress();
    toast('Đã xóa tiến độ học từ vựng.');
    render();
  }
}

// Mở thẳng danh sách một chủ đề (dùng từ tab Luyện).
export function openVocabTopic(idx) {
  stack = [{ v: 'home', q: '' }];
  cur = { v: 'list', k: idx, q: '' };
  window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'vocab' }));
  render();
}

// Gọi khi chuyển vào tab: làm mới số liệu ở trang chủ.
export function refreshVocab() {
  if (cur.v === 'home') render();
}

export function initVocab() {
  const moved = migrateOldFlashcards();
  $('vocab-root').addEventListener('click', onClick);
  render();
  if (moved) toast(`Đã chuyển ${moved} thẻ "đã thuộc" từ Flashcard cũ sang tab Từ vựng.`, 4000);
}

export { isDue, isLearned };
