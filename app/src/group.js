// Nhóm học: kết nối "máy chủ nhóm" (Google Sheet + Apps Script) để
//  - đồng bộ EXP, phút nói, bài thi thử → bảng xếp hạng ngày / tuần / tháng,
//  - ghi kết quả thi thật và câu hỏi gặp khi thi,
//  - bảng theo dõi cho người quản lý chương trình,
//  - "AI của nhóm" (xem coach.js).
// Chỉ gửi số liệu. Không gửi bài nói, chữ hay ghi âm.
import { $, store, toast, escapeHtml, uid, copyText, LEVEL_LABEL } from './util.js';
import { settings, saveSettings, syncProviderUi } from './settings.js';
import { groupPost, isGroupUrl } from './group-net.js';
import { recentDays, onActivity, dayKey } from './activity.js';
import { listMocks, onMocksChange } from './mock-history.js';
import { stats } from './history.js';
import { importRealQuestions, looksEnglish } from './data.js';
import { speak } from './speech.js';

// Địa chỉ máy chủ của nhóm, gắn sẵn khi build để mọi người khỏi phải dán.
export const DEFAULT_GROUP_URL = '';

let VERSION = '';
const G = (settings.group = {
  url: DEFAULT_GROUP_URL,
  name: '',
  team: '',
  uid: '',
  registered: false,
  lastSync: 0,
  ai: null,
  pin: '',
  ...(settings.group && typeof settings.group === 'object' ? settings.group : {}),
});
if (!G.url && DEFAULT_GROUP_URL) G.url = DEFAULT_GROUP_URL;

export const groupConnected = () => !!(G.registered && G.url && G.uid);

// ---------- Kết quả thi thật (lưu trên máy, gửi lên nhóm nếu đã kết nối) ----------
export const OPIC_GRADES = ['NL', 'NM', 'NH', 'IL', 'IM1', 'IM2', 'IM3', 'IH', 'AL'];
const EXAM_KEY = 'exams';
let exams = store.get(EXAM_KEY, null);
if (!Array.isArray(exams)) exams = [];
export const listExams = () => [...exams].sort((a, b) => (a.date < b.date ? 1 : -1));
export function saveExam({ date, level, note = '' }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !OPIC_GRADES.includes(level)) return false;
  exams = exams.filter((x) => x.date !== date).concat({ date, level, note: String(note).slice(0, 120) });
  store.set(EXAM_KEY, exams);
  return true;
}
export function removeExam(date) {
  exams = exams.filter((x) => x.date !== date);
  store.set(EXAM_KEY, exams);
}

// ---------- Đồng bộ ----------
const SYNC_GAP = 5 * 60e3;
let syncing = null;
let debounce = null;

function syncPayload() {
  return {
    action: 'sync',
    uid: G.uid,
    name: G.name,
    team: G.team,
    target: settings.target,
    est_level: stats().overall || '',
    app_version: VERSION,
    days: recentDays(35),
    mocks: listMocks()
      .slice(-30)
      .map((m) => ({ id: m.id, at: m.at, testId: m.testId, answered: m.answered, total: m.total, label: m.label ? LEVEL_LABEL[m.label] || m.label : '' })),
    exams,
  };
}

export function syncGroup({ force = false } = {}) {
  if (!groupConnected()) return Promise.resolve({ skipped: true });
  if (!force && Date.now() - (G.lastSync || 0) < SYNC_GAP) return Promise.resolve({ skipped: true });
  if (syncing) return syncing;
  syncing = groupPost(G.url, syncPayload())
    .then((r) => {
      G.lastSync = Date.now();
      if (r.ai) G.ai = r.ai;
      saveSettings();
      return r;
    })
    .finally(() => (syncing = null));
  return syncing;
}
const quietSync = (opts) => syncGroup(opts).catch(() => null);

function scheduleSync(ms = 90e3) {
  if (!groupConnected()) return;
  clearTimeout(debounce);
  // Học liên tục thì vẫn gửi ít nhất 10 phút một lần.
  if (Date.now() - (G.lastSync || 0) > 10 * 60e3) ms = 3000;
  debounce = setTimeout(() => quietSync({ force: true }), ms);
}

// ---------- Kết nối (thẻ trong Cài đặt) ----------
const newUid = () => (uid() + Math.random().toString(36).slice(2, 8)).replace(/[^a-z0-9]/gi, '');

function setStatus(html) {
  const el = $('g-status');
  if (el) el.innerHTML = html;
}

function aiLine() {
  if (!groupConnected()) return 'Kết nối Nhóm học (thẻ 👥 ở trên) trước khi dùng AI của nhóm.';
  if (!G.ai) return 'Chưa rõ nhóm có bật AI không. Bấm 🔄 Đồng bộ ngay ở thẻ Nhóm học.';
  return G.ai.enabled ? `✅ Nhóm đã bật AI dùng chung · tối đa ${G.ai.limit} lượt mỗi người mỗi ngày.` : '⚠️ Người quản trị nhóm chưa bật AI dùng chung. Tạm thời dùng key riêng hoặc 📋 Copy.';
}

function renderGroupSettings() {
  if (!$('group-card')) return;
  $('g-name').value = G.name || '';
  $('g-team').value = G.team || '';
  $('g-url').value = G.url || '';
  $('g-url-box').open = !G.url;
  $('g-pin').value = G.pin || '';
  $('g-leave').hidden = !G.registered;
  $('g-sync').disabled = !groupConnected();
  if (groupConnected())
    setStatus(`✅ Đã vào nhóm với tên <b>${escapeHtml(G.name)}</b>${G.team ? ` · ${escapeHtml(G.team)}` : ''}.${G.lastSync ? ` Đồng bộ lúc ${new Date(G.lastSync).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.` : ''}`);
  else setStatus('<span class="muted">Chưa kết nối.</span>');
  const ai = $('group-ai-status');
  if (ai) ai.textContent = aiLine();
}

async function connect() {
  const name = $('g-name').value.trim();
  const team = $('g-team').value.trim();
  const url = $('g-url').value.trim() || DEFAULT_GROUP_URL;
  if (!name) return setStatus('⚠️ Hãy nhập tên hiển thị (tên mọi người trong nhóm nhận ra).');
  if (!isGroupUrl(url)) {
    $('g-url-box').open = true;
    return setStatus('⚠️ Hãy dán địa chỉ máy chủ nhóm (người quản trị gửi, bắt đầu bằng https://script.google.com/…).');
  }
  G.uid ||= newUid();
  setStatus('<span class="spinner"></span> Đang kết nối…');
  try {
    const r = await groupPost(url, { action: 'register', uid: G.uid, name, team, target: settings.target, est_level: stats().overall || '', app_version: VERSION });
    Object.assign(G, { url, name, team, registered: true, ai: r.ai || null });
    if (r.uid && r.uid !== G.uid) G.uid = r.uid; // cài lại app: dùng lại tài khoản cũ cùng tên + phòng ban
    let msg = '';
    if (r.ai?.enabled && (!settings.provider || settings.provider === 'none')) {
      settings.provider = 'group';
      msg = ' AI chấm bài đã chuyển sang <b>AI của nhóm</b>.';
    }
    saveSettings();
    syncProviderUi();
    await syncGroup({ force: true }).catch(() => null);
    renderGroupSettings();
    setStatus(`✅ Đã vào nhóm. Tên của bạn sẽ hiện trên bảng xếp hạng ở tab Tiến bộ → 🏆 Nhóm.${msg}`);
    renderGroup();
  } catch (e) {
    setStatus(`⚠️ ${escapeHtml(e.message || String(e))}`);
  }
}

function leave() {
  if (!confirm('Rời nhóm học? App sẽ ngừng gửi tiến độ. Dữ liệu trên máy bạn vẫn giữ nguyên.')) return;
  G.registered = false;
  if (settings.provider === 'group') settings.provider = 'none';
  saveSettings();
  syncProviderUi();
  renderGroupSettings();
  renderGroup();
}

// ---------- Màn hình Nhóm (tab Tiến bộ) ----------
const view = { period: 'week', team: '', board: {}, loading: false, error: '', questions: null, qLoading: false, admin: null, adminLoading: false, adminError: '' };
const MEDAL = ['🥇', '🥈', '🥉'];
const PERIOD_VI = { day: 'Hôm nay', week: 'Tuần này', month: 'Tháng này' };
const SECTIONS = ['Giới thiệu', 'Survey (chủ đề đã chọn)', 'Đột xuất', 'Role-play', 'Câu 14–15 (nâng cao)'];
const fmtD = (s) => (s ? s.split('-').reverse().slice(0, 2).join('/') : '');
const boardKey = () => `${view.period}|${view.team}|${dayKey()}`;

async function loadBoard(force = false) {
  if (!groupConnected()) return;
  const key = boardKey();
  const cached = view.board[key];
  if (!force && cached && Date.now() - cached.t < 120e3) return;
  view.loading = true;
  view.error = '';
  paint();
  try {
    await quietSync();
    const r = await groupPost(G.url, { action: 'board', uid: G.uid, period: view.period, date: dayKey(), team: view.team === '__mine' ? G.team : view.team });
    view.board[key] = { t: Date.now(), r };
  } catch (e) {
    view.error = e.message || String(e);
  }
  view.loading = false;
  paint();
}

function boardCard() {
  const c = view.board[boardKey()];
  const r = c?.r;
  const teams = r?.teams || [];
  const rows = r?.rows || [];
  return `<div class="card">
    <div class="row between"><h3>🏆 Bảng xếp hạng</h3><button class="btn small-btn" data-g="refresh" ${view.loading ? 'disabled' : ''}>${view.loading ? '<span class="spinner"></span>' : '🔄'}</button></div>
    <div class="segmented">${Object.entries(PERIOD_VI).map(([k, v]) => `<button class="seg ${view.period === k ? 'active' : ''}" data-period="${k}">${v}</button>`).join('')}</div>
    <label class="field"><span>Xem</span><select id="g-team-filter">
      <option value="">Toàn bộ nhóm học</option>
      ${G.team ? `<option value="__mine" ${view.team === '__mine' ? 'selected' : ''}>Chỉ ${escapeHtml(G.team)}</option>` : ''}
      ${teams.filter((t) => t !== G.team).map((t) => `<option value="${escapeHtml(t)}" ${view.team === t ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}
    </select></label>
    ${view.error ? `<p class="small">⚠️ ${escapeHtml(view.error)}</p>` : ''}
    ${
      !r
        ? `<p class="muted small">${view.loading ? 'Đang tải…' : 'Chưa tải được bảng xếp hạng.'}</p>`
        : rows.length
          ? `<div class="lb">${rows
              .map(
                (x) => `<div class="lb-row ${x.me ? 'me' : ''}"><span class="lb-rank">${MEDAL[x.rank - 1] || x.rank}</span>
              <span class="lb-name"><b>${escapeHtml(x.name)}</b>${x.team ? `<span class="muted small">${escapeHtml(x.team)}</span>` : ''}</span>
              <span class="lb-exp"><b>${x.exp.toLocaleString('vi-VN')}</b><span class="muted small">${x.minutes}′ nói${x.mocks ? ` · ${x.mocks} thi thử` : ''}</span></span></div>`,
              )
              .join('')}</div>
            ${r.me ? (rows.some((x) => x.me) ? '' : `<p class="small">Bạn đang hạng <b>${r.me.rank}</b>/${r.total} với ${r.me.exp} EXP.</p>`) : '<p class="small">Bạn chưa có EXP trong khoảng này. Nói xong 1 câu là có 10 EXP.</p>'}`
          : `<p class="muted small">${PERIOD_VI[view.period]} chưa ai có EXP. Hãy là người đầu tiên!</p>`
    }
    <p class="muted small">${r ? `${fmtD(r.from)}${r.to !== r.from ? ` – ${fmtD(r.to)}` : ''} · ` : ''}EXP tính trên máy từng người và gửi lên khi mở app hoặc sau khi học. Mỗi người tối đa 800 EXP/ngày. Cách tính ở tab Tiến bộ → 📊 Của tôi.</p>
  </div>`;
}

function examCard() {
  const list = listExams();
  const today = dayKey();
  return `<div class="card">
    <h3>🎓 Kết quả thi thật</h3>
    <p class="muted small">Ghi lại cấp độ trên phiếu điểm OPIc để theo dõi tiến độ đạt chứng chỉ của cả nhóm.</p>
    <div class="g-form">
      <label class="field"><span>Ngày thi</span><input type="date" id="g-exam-date" value="${today}"></label>
      <label class="field"><span>Cấp đạt được</span><select id="g-exam-level">${OPIC_GRADES.map((l) => `<option ${l === 'IH' ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <label class="field"><span>Ghi chú (không bắt buộc)</span><input type="text" id="g-exam-note" maxlength="120" placeholder="vd. thi lần 2, đề khó phần role-play"></label>
    <button class="btn primary btn-block" data-g="exam-save">💾 Lưu kết quả</button>
    ${list.length ? `<div class="g-exams">${list.map((x) => `<div class="row between"><span><b>${escapeHtml(x.level)}</b> · ${fmtD(x.date)}/${x.date.slice(0, 4)}${x.note ? ` <span class="muted small">${escapeHtml(x.note)}</span>` : ''}</span><button class="link-btn" data-exam-del="${x.date}">Xoá</button></div>`).join('')}</div>` : ''}
  </div>`;
}

function questionCard() {
  const q = view.questions;
  return `<div class="card">
    <h3>📝 Câu hỏi vừa gặp khi thi</h3>
    <p class="muted small">Vừa thi xong? Ghi lại các câu bạn nhớ (tiếng Anh, gần đúng cũng được). Cả nhóm sẽ luyện đúng những câu đang ra.</p>
    <div class="g-form">
      <label class="field"><span>Ngày thi</span><input type="date" id="g-q-date" value="${dayKey()}"></label>
      <label class="field"><span>Phần</span><select id="g-q-section">${SECTIONS.map((s) => `<option>${s}</option>`).join('')}</select></label>
    </div>
    <label class="field"><span>Câu hỏi</span><textarea id="g-q-text" rows="3" maxlength="600" placeholder="vd. Tell me about the bank you usually go to. What does it look like?"></textarea></label>
    <button class="btn primary btn-block" data-g="q-send" ${groupConnected() ? '' : 'disabled'}>📤 Gửi cho nhóm</button>
    <div class="row wrap"><button class="btn" data-g="q-load" ${groupConnected() ? '' : 'disabled'}>${view.qLoading ? '<span class="spinner"></span>' : '👀'} Xem câu cả nhóm đã gửi</button></div>
    ${
      q
        ? q.rows.length
          ? `<p class="small">${q.total} câu · mới nhất trước</p>
            <div class="g-qs">${q.rows
              .map(
                (x, i) => `<div class="g-q"><div class="muted small">${escapeHtml([x.section, x.level, x.exam_date ? fmtD(x.exam_date) : '', x.name].filter(Boolean).join(' · '))}</div>
                <div class="row between"><span class="en-text">${escapeHtml(x.question)}</span>${looksEnglish(x.question) ? `<button class="btn small-btn" data-q-say="${i}">🔊</button>` : ''}</div></div>`,
              )
              .join('')}</div>
            <button class="btn btn-block" data-g="q-import">📥 Đưa các câu này vào bộ luyện tập</button>
            <p class="muted small">Câu sẽ nằm ở tab Luyện → Bộ câu hỏi → Câu hỏi tự nhập ("Đề thật nhóm vừa gặp"). Câu viết bằng tiếng Việt được bỏ qua.</p>`
          : '<p class="muted small">Chưa ai gửi câu hỏi.</p>'
        : ''
    }
  </div>`;
}

function adminCard() {
  if (!G.pin) return '';
  const a = view.admin;
  const ago = (iso) => {
    if (!iso) return '—';
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
    return d <= 0 ? 'hôm nay' : `${d} ngày trước`;
  };
  return `<div class="card">
    <div class="row between"><h3>👑 Bảng theo dõi (quản trị)</h3><button class="btn small-btn" data-g="admin">${view.adminLoading ? '<span class="spinner"></span>' : a ? '🔄' : 'Mở'}</button></div>
    ${view.adminError ? `<p class="small">⚠️ ${escapeHtml(view.adminError)}</p>` : ''}
    ${
      a
        ? `<div class="stat-row g-stats">
        <div class="stat"><b>${a.totals.users}</b><span>người tham gia</span></div>
        <div class="stat"><b>${a.totals.active7}</b><span>học trong 7 ngày</span></div>
        <div class="stat"><b>${Math.round(a.totals.minutes7 / 60)}h</b><span>nói trong 7 ngày</span></div>
        <div class="stat"><b>${a.totals.examTaken}</b><span>đã có kết quả thi</span></div>
        <div class="stat"><b>${a.totals.questions}</b><span>câu đề thật</span></div>
        <div class="stat"><b>${a.totals.ai_enabled ? 'Bật' : 'Tắt'}</b><span>AI của nhóm</span></div>
      </div>
      ${(() => {
        const idle = a.users.filter((u) => !u.days7);
        return idle.length ? `<p class="small"><b>Chưa học 7 ngày qua (${idle.length}):</b> ${idle.map((u) => escapeHtml(u.name)).join(', ')}</p>` : '<p class="small">🎉 Ai cũng học trong 7 ngày qua.</p>';
      })()}
      <div class="g-table-wrap"><table class="g-table"><thead><tr><th>Tên</th><th>Mục tiêu</th><th>EXP 7 ngày</th><th>Phút nói</th><th>Ngày học</th><th>Thi thử</th><th>Ước tính</th><th>Thi thật</th><th>Mở app</th></tr></thead><tbody>
      ${a.users
        .map(
          (u) => `<tr><td><b>${escapeHtml(u.name)}</b><div class="muted">${escapeHtml(u.team)}</div></td><td>${escapeHtml(u.target || '—')}</td><td>${u.exp7}</td><td>${u.min7}</td><td>${u.days7}/7</td><td>${u.mocks}${u.lastMockLabel ? ` <span class="muted">(${escapeHtml(u.lastMockLabel)})</span>` : ''}</td><td>${escapeHtml(LEVEL_LABEL[u.est] || u.est || '—')}</td><td>${u.exams.length ? u.exams.map((x) => escapeHtml(x.level)).join(', ') : '—'}</td><td>${ago(u.last_seen)}</td></tr>`,
        )
        .join('')}</tbody></table></div>
      <button class="btn btn-block" data-g="admin-copy">📋 Copy bảng (dán vào Excel)</button>
      <p class="muted small">Ước tính là chỉ số luyện tập do AI chấm, không phải điểm OPIc. Số liệu đầy đủ nằm trong Google Sheet của nhóm.</p>`
        : '<p class="muted small">Xem ai đang học đều, ai cần nhắc, tổng giờ nói và kết quả thi của cả nhóm.</p>'
    }
  </div>`;
}

function paint() {
  const root = $('group-root');
  if (!root) return;
  if (!groupConnected()) {
    root.innerHTML = `<div class="card">
      <h3>👥 Bạn chưa vào nhóm học</h3>
      <p class="small">Vào nhóm để có <b>bảng xếp hạng</b> ngày / tuần / tháng, dùng <b>AI của nhóm</b> không cần key, và chia sẻ câu hỏi thi thật.</p>
      <button class="btn primary btn-block" data-g="goto-settings">Kết nối ngay</button>
    </div>${examCard()}${adminCard()}`;
    return;
  }
  root.innerHTML = boardCard() + questionCard() + examCard() + adminCard();
}

export function renderGroup() {
  paint();
  if (groupConnected()) loadBoard();
}

async function onGroupClick(e) {
  const t = e.target;
  const per = t.closest('[data-period]')?.dataset.period;
  if (per) {
    view.period = per;
    return loadBoard();
  }
  const act = t.closest('[data-g]')?.dataset.g;
  if (act === 'refresh') return loadBoard(true);
  if (act === 'goto-settings') {
    window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'settings' }));
    setTimeout(() => $('group-card')?.scrollIntoView({ behavior: 'smooth' }), 50);
    return;
  }
  if (act === 'exam-save') {
    const ok = saveExam({ date: $('g-exam-date').value, level: $('g-exam-level').value, note: $('g-exam-note').value.trim() });
    if (!ok) return toast('Hãy chọn ngày thi và cấp đạt được.');
    toast('✅ Đã lưu kết quả thi.');
    paint();
    if (groupConnected()) quietSync({ force: true });
    return;
  }
  const del = t.closest('[data-exam-del]')?.dataset.examDel;
  if (del) {
    if (!confirm('Xoá kết quả thi này trên máy?')) return;
    removeExam(del);
    return paint();
  }
  if (act === 'q-send') {
    const text = $('g-q-text').value.trim();
    if (text.length < 10) return toast('Hãy ghi câu hỏi (ít nhất 10 ký tự).');
    t.disabled = true;
    try {
      await groupPost(G.url, { action: 'question', uid: G.uid, exam_date: $('g-q-date').value, section: $('g-q-section').value, question: text });
      $('g-q-text').value = '';
      toast('✅ Đã gửi. Cảm ơn bạn!');
      view.questions = null;
    } catch (err) {
      toast(`⚠️ ${err.message}`, 4500);
    }
    t.disabled = false;
    return;
  }
  if (act === 'q-load') {
    view.qLoading = true;
    paint();
    try {
      view.questions = await groupPost(G.url, { action: 'questions', uid: G.uid });
    } catch (err) {
      toast(`⚠️ ${err.message}`, 4500);
    }
    view.qLoading = false;
    return paint();
  }
  const say = t.closest('[data-q-say]')?.dataset.qSay;
  if (say != null) return speak(view.questions.rows[+say].question, settings.ttsRate);
  if (act === 'q-import') {
    try {
      const n = importRealQuestions(view.questions.rows);
      saveSettings();
      toast(`✅ Đã đưa ${n} câu vào bộ luyện tập (Câu hỏi tự nhập).`, 4000);
    } catch (err) {
      toast(`⚠️ ${err.message}`, 4500);
    }
    return;
  }
  if (act === 'admin') {
    view.adminLoading = true;
    view.adminError = '';
    paint();
    try {
      view.admin = await groupPost(G.url, { action: 'admin', pin: G.pin, date: dayKey() }, { timeout: 30000 });
    } catch (err) {
      view.adminError = err.message || String(err);
    }
    view.adminLoading = false;
    return paint();
  }
  if (act === 'admin-copy') {
    const a = view.admin;
    const head = ['Tên', 'Nhóm', 'Mục tiêu', 'EXP 7 ngày', 'Phút nói 7 ngày', 'Số ngày học 7 ngày', 'Tổng EXP', 'Bài thi thử', 'Thi thử gần nhất', 'Ước tính luyện tập', 'Kết quả thi thật', 'Mở app lần cuối'];
    const rows = a.users.map((u) => [u.name, u.team, u.target, u.exp7, u.min7, u.days7, u.expAll, u.mocks, u.lastMockLabel, LEVEL_LABEL[u.est] || u.est, u.exams.map((x) => `${x.level} (${x.date})`).join('; '), u.last_seen ? u.last_seen.slice(0, 10) : '']);
    const tsv = [head, ...rows].map((r) => r.map((v) => String(v ?? '').replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
    toast((await copyText(tsv)) ? '✅ Đã copy. Mở Excel / Google Sheet và dán vào ô A1.' : '⚠️ Không copy được.', 4000);
  }
}

export function initGroup({ version }) {
  VERSION = version;
  if ($('group-card')) {
    renderGroupSettings();
    $('g-save').addEventListener('click', connect);
    $('g-sync').addEventListener('click', async () => {
      setStatus('<span class="spinner"></span> Đang đồng bộ…');
      try {
        const r = await syncGroup({ force: true });
        renderGroupSettings();
        setStatus(`✅ Đã gửi ${r.saved?.days ?? 0} ngày học, ${r.saved?.mocks ?? 0} bài thi thử.`);
      } catch (e) {
        setStatus(`⚠️ ${escapeHtml(e.message || String(e))}`);
      }
    });
    $('g-leave').addEventListener('click', leave);
    $('g-pin').addEventListener('change', () => {
      G.pin = $('g-pin').value.trim();
      saveSettings();
      view.admin = null;
      toast(G.pin ? 'Đã lưu mã. Xem bảng theo dõi ở tab Tiến bộ → 🏆 Nhóm.' : 'Đã xoá mã quản trị.');
    });
  }
  $('group-root')?.addEventListener('click', onGroupClick);
  $('group-root')?.addEventListener('change', (e) => {
    if (e.target.id !== 'g-team-filter') return;
    view.team = e.target.value;
    loadBoard();
  });
  onActivity(() => scheduleSync());
  onMocksChange(() => scheduleSync(4000));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') quietSync();
    else if (debounce) {
      clearTimeout(debounce);
      debounce = null;
      quietSync({ force: true });
    }
  });
  setTimeout(() => quietSync(), 4000);
}

export const groupAiLine = aiLine;
