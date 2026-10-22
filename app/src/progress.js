// Tab Tiến bộ: thống kê, luyện điểm yếu, lịch sử.
import { $, escapeHtml, md, fmtTime, countWords, LEVEL_LABEL, CONF_LABEL, LEVEL_SCORE } from './util.js';
import { filterQuestions, ptypeLabel } from './data.js';
import { stats, listAttempts, deleteAttempt, weakestPromptType } from './history.js';
import { renderFeedback, levelBadge } from './feedback.js';
import { openQuestion } from './practice.js';
import { settings, saveSettings } from './settings.js';
import { stats as vocabStats, reviewedToday } from './vocab-core.js';
import { listMocks, onMocksChange } from './mock-history.js';
import { listScripts, onScriptsChange } from './scripts-core.js';
import { daysLeft, phaseOf, dailyPlan, mockSeries, compareLast, dayStart } from './plan.js';
import { openScript } from './scripts.js';
import { summary, badges, EXP_RULES, MAX_DAY_EXP, onActivity } from './activity.js';
import { weekTest, weekDone, weekLevelFor } from './week.js';
import { renderGroup } from './group.js';

const CORE_TYPES = [
  'description', 'routine', 'past_recent', 'memorable_experience', 'problem_experience', 'comparison_change',
  'roleplay_ask', 'roleplay_problem', 'roleplay_experience', 'issue_concern', 'news_report',
];
const ORDER = ['below_IM', 'IM', 'IM_IH_borderline', 'IH', 'IH_AL_borderline', 'AL', 'insufficient_evidence'];
const MODE_LABEL = { practice: 'Luyện', mock: 'Thi thử', daily: 'Điểm yếu', retry: 'Nói lại' };

function vocabCard() {
  const v = vocabStats();
  return `<div class="card"><h3>📒 Từ vựng</h3>
    <div class="bar-row"><span class="bar-label">Đã thuộc</span><span class="bar"><span class="bar-fill v-fill" style="width:${Math.round((v.learned / v.total) * 100)}%"></span></span><span class="bar-n">${v.learned}</span></div>
    <p class="muted small">${v.seen}/${v.total} mục đã học · ${v.due} mục cần ôn hôm nay. <button class="link-btn" data-goto-vocab>Mở tab Từ vựng →</button></p></div>`;
}

// ---------- EXP, chuỗi ngày, huy hiệu ----------
function expCard() {
  const s = summary();
  const lv = s.level;
  const bs = badges(s);
  const got = bs.filter((b) => b.ok).length;
  const n = (x) => x.toLocaleString('vi-VN');
  return `<div class="card exp-card">
    <div class="row between"><h3>⭐ Bậc ${lv.n} · ${n(s.total)} EXP</h3><span class="chip">🔥 ${s.streak} ngày</span></div>
    <span class="rm-bar"><span style="width:${lv.pct}%"></span></span>
    <p class="muted small">${lv.next ? `Còn ${n(lv.next - s.total)} EXP lên bậc ${lv.n + 1}` : 'Bậc cao nhất 🎉'} · chuỗi dài nhất ${s.best} ngày</p>
    <div class="stat-row"><div class="stat"><b>${n(s.today)}</b><span>EXP hôm nay</span></div><div class="stat"><b>${n(s.week)}</b><span>EXP tuần này</span></div><div class="stat"><b>${n(s.month)}</b><span>EXP tháng này</span></div></div>
    <div class="row between"><b class="small">Huy hiệu ${got}/${bs.length}</b><button class="link-btn" data-goto-group>🏆 Xem bảng xếp hạng →</button></div>
    <div class="badge-grid">${bs.map((b) => `<div class="bdg ${b.ok ? 'ok' : ''}"><span>${b.icon}</span><small>${escapeHtml(b.vi)}</small></div>`).join('')}</div>
    <details><summary class="small">Cách tính EXP</summary><ul class="small">
      ${EXP_RULES.map((r) => `<li>${escapeHtml(r.vi)}: <b>+${r.exp}</b>${r.cap ? ` (tính tối đa ${r.cap} lần/ngày)` : ''}</li>`).join('')}
      <li>Nói lại cùng một câu trong ngày chỉ tính 1 lần — hãy luyện nhiều câu khác nhau.</li>
      <li>Tối đa ${MAX_DAY_EXP} EXP mỗi ngày. Chuỗi ngày tính khi hôm đó có ít nhất 1 EXP.</li>
    </ul></details>
  </div>`;
}

// ---------- Kế hoạch đến ngày thi ----------
function planCard() {
  const left = daysLeft(settings.examDate);
  const phase = phaseOf(left);
  const today = dayStart(Date.now());
  const v = vocabStats();
  const w = weakToday();
  const scripts = listScripts();
  const tasks = dailyPlan({
    left,
    vocabDue: v.due,
    vocabStudiedToday: reviewedToday() > 0,
    weakType: w.type,
    weakLabel: ptypeLabel(w.type),
    todayPracticed: listAttempts().filter((a) => new Date(a.created_at).getTime() >= today).length,
    mocks: mockSeries(listMocks(), listAttempts()).all,
    scripts,
    week: (() => {
      const wt = weekTest(weekLevelFor(settings.target));
      const done = weekDone(wt, listMocks());
      const doneToday = done && listMocks().some((m) => m.testId === wt.test.id && m.at >= today);
      return { id: wt.test.id, done, doneToday };
    })(),
  });
  const done = tasks.filter((t) => t.done).length;
  return `<div class="card plan-card">
    <div class="row between"><h3>🗓️ Hôm nay luyện gì?</h3><span class="muted small">${done}/${tasks.length} xong</span></div>
    <label class="field plan-date"><span>Ngày thi của bạn</span><input type="date" id="exam-date" value="${settings.examDate || ''}"></label>
    ${
      left == null
        ? '<p class="muted small">Nhập ngày thi để app chia giai đoạn (xây nền → tăng tốc → nước rút) và nhắc lịch thi thử.</p>'
        : `<div class="plan-count"><b>${left > 0 ? `Còn ${left} ngày` : left === 0 ? 'Hôm nay thi 🍀' : `Đã thi cách đây ${-left} ngày`}</b><span class="chip">${escapeHtml(phase.vi)}</span></div>`
    }
    ${left != null && left < 0 ? '<p class="small">Cập nhật ngày thi mới nếu bạn thi tiếp. Bên dưới là gợi ý luyện duy trì.</p>' : ''}
    <div class="plan-list">${tasks
      .map(
        (t) => `<button class="plan-item ${t.done ? 'done' : ''}" data-plan="${t.action}">
          <span class="plan-check">${t.done ? '✅' : t.icon}</span>
          <span><b>${escapeHtml(t.title)}</b><span class="muted small">${escapeHtml(t.detail)}</span></span><span class="plan-go">›</span></button>`,
      )
      .join('')}</div>
    <p class="muted small">Việc tự đánh dấu ✅ khi app thấy bạn đã làm hôm nay. Lịch thi thử: 2 tuần/lần khi còn xa, 1 tuần/lần trong 3 tuần cuối, 2 ngày/lần trong tuần cuối.</p>
  </div>`;
}

// ---------- Biểu đồ thi thử ----------
const Y_LABEL = { 0: '&lt;IM', 1: 'IM', 2: 'IH', 3: 'AL' };
function mockChart(graded) {
  const W = 340, H = 170, L = 34, R = 12, T = 12, B = 26, P = 12;
  const x = (i) => (graded.length === 1 ? L + (W - L - R) / 2 : L + P + (i * (W - L - R - 2 * P)) / (graded.length - 1));
  const y = (v) => T + ((3 - v) * (H - T - B)) / 3;
  const tgt = LEVEL_SCORE[settings.target];
  const fmt = (t) => new Date(t).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const pts = graded.map((m, i) => `${x(i).toFixed(1)},${y(m.score).toFixed(1)}`).join(' ');
  return `<svg class="mock-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ước tính các bài thi thử theo thời gian">
    ${[0, 1, 2, 3].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="mc-grid"/><text x="${L - 6}" y="${y(v) + 4}" class="mc-axis" text-anchor="end">${Y_LABEL[v]}</text>`).join('')}
    ${tgt != null ? `<line x1="${L}" x2="${W - R}" y1="${y(tgt)}" y2="${y(tgt)}" class="mc-target"/><text x="${W - R}" y="${y(tgt) - 5}" class="mc-axis" text-anchor="end">mục tiêu ${settings.target}</text>` : ''}
    ${graded.length > 1 ? `<polyline points="${pts}" class="mc-line"/>` : ''}
    ${graded.map((m, i) => `<g class="mc-pt" data-mi="${i}"><circle cx="${x(i)}" cy="${y(m.score)}" r="14" class="mc-hit"/><circle cx="${x(i)}" cy="${y(m.score)}" r="5" class="mc-dot"/></g>`).join('')}
    <text x="${x(0)}" y="${H - 6}" class="mc-axis" text-anchor="${graded.length === 1 ? 'middle' : 'start'}">${fmt(graded[0].at)}</text>
    ${graded.length > 1 ? `<text x="${x(graded.length - 1)}" y="${H - 6}" class="mc-axis" text-anchor="end">${fmt(graded.at(-1).at)}</text>` : ''}
  </svg>`;
}

function mockDetail(m) {
  const d = new Date(m.at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  return `<div class="row">${levelBadge(m.label)}<span class="small">${d} · ${m.graded} câu đã chấm${m.self ? ` · tự đánh giá cấp ${m.self}${m.selfEnd && m.selfEnd !== m.self ? ` → ${m.selfEnd}` : ''}` : ''}</span></div>
    ${m.gaps?.length ? `<ul class="small">${m.gaps.map((g) => `<li>${escapeHtml(g)}</li>`).join('')}</ul>` : ''}`;
}

function mockCard() {
  const { all, graded } = mockSeries(listMocks(), listAttempts());
  if (!all.length) return `<div class="card"><h3>📈 Kết quả thi thử</h3><p class="muted small">Chưa có bài thi thử. Làm bài ở tab Thi thử rồi chấm để thấy biểu đồ tiến bộ ở đây.</p></div>`;
  const ungraded = all.length - graded.length;
  const cmp = compareLast(graded);
  const last = graded.at(-1);
  return `<div class="card">
    <h3>📈 Kết quả thi thử</h3>
    ${
      graded.length
        ? `${mockChart(graded)}
      <div id="mock-chart-detail">${mockDetail(last)}</div>
      ${cmp ? `<p class="small"><b>So với lần trước:</b> ${cmp.delta > 0 ? `⬆️ tăng từ ${LEVEL_LABEL[cmp.from]} lên ${LEVEL_LABEL[cmp.to]}` : cmp.delta < 0 ? `⬇️ giảm từ ${LEVEL_LABEL[cmp.from]} xuống ${LEVEL_LABEL[cmp.to]}` : `➡️ giữ ở ${LEVEL_LABEL[cmp.to]}`}</p>` : ''}
      <p class="muted small">Mỗi điểm là trung vị các câu AI đã chấm trong một bài thi thử. Chạm vào điểm để xem chi tiết. Chỉ là chỉ số luyện tập, không phải điểm OPIc.</p>`
        : '<p class="muted small">Các bài thi thử chưa được chấm. Vào phần xem lại và bấm 🤖 Chấm tất cả để có điểm.</p>'
    }
    ${ungraded ? `<p class="muted small">${ungraded} bài thi thử chưa chấm câu nào.</p>` : ''}
  </div>`;
}

function renderStats() {
  const s = stats();
  const maxDist = Math.max(1, ...Object.values(s.dist));
  const act = summary();
  $('progress-stats').innerHTML = `
    ${expCard()}
    ${planCard()}
    ${mockCard()}
    <div class="stat-row">
      <div class="stat"><b>${s.total}</b><span>lần luyện</span></div>
      <div class="stat"><b>${s.last7}</b><span>7 ngày qua</span></div>
      <div class="stat"><b>${Math.max(s.streak, act.streak)}🔥</b><span>ngày liên tiếp</span></div>
    </div>
    ${vocabCard()}
    <div class="card">
      <h3>Ước tính luyện tập gần đây</h3>
      ${s.overall ? `<div class="readiness">${levelBadge(s.overall, 'badge-lg')}<div class="small">Trung vị của ${s.recentCount} bài được AI chấm gần nhất. Mục tiêu của bạn: <b>${settings.target}</b>.<br><span class="muted">Chỉ là chỉ số luyện tập, không dự đoán điểm thi chính thức.</span></div></div>` : '<p class="muted small">Chưa có bài nào được AI chấm. Luyện và bấm 🤖 AI Coach để có ước tính.</p>'}
      ${ORDER.filter((k) => s.dist[k])
        .map((k) => `<div class="bar-row"><span class="bar-label">${LEVEL_LABEL[k]}</span><span class="bar"><span class="bar-fill ${'lv-' + k.split('_')[0]}" style="width:${(s.dist[k] / maxDist) * 100}%"></span></span><span class="bar-n">${s.dist[k]}</span></div>`)
        .join('')}
    </div>
    <div class="card">
      <h3>Theo dạng câu</h3>
      <p class="muted small">Dạng nào còn trống hoặc ước tính thấp là chỗ nên luyện thêm.</p>
      ${CORE_TYPES.map((t) => {
        const x = s.byType[t];
        return `<div class="type-row"><span>${escapeHtml(ptypeLabel(t))}</span><span class="muted small">${x ? `${x.count} lần` : 'chưa luyện'}</span>${x?.label ? levelBadge(x.label) : '<span></span>'}</div>`;
      }).join('')}
    </div>`;
}

// Điểm yếu hôm nay: chọn một lần mỗi ngày để kế hoạch và nút luyện khớp nhau.
let weakCache = null;
function weakToday() {
  const day = new Date().toDateString();
  if (!weakCache || weakCache.day !== day || weakCache.n !== listAttempts().length) weakCache = { day, n: listAttempts().length, w: weakestPromptType(CORE_TYPES) };
  return weakCache.w;
}

function dailyPractice() {
  const w = weakToday();
  const list = filterQuestions({ ptype: w.type, level: settings.target, oqc: settings.includeOqc });
  if (!list.length) return;
  const q = list[Math.floor(Math.random() * list.length)];
  const why = w.reason === 'score' ? 'ước tính thấp nhất của bạn' : w.reason === 'new' ? 'bạn chưa luyện dạng này' : 'bạn luyện dạng này ít nhất';
  openQuestion(q.question_id, { banner: `<b>🎯 Luyện điểm yếu:</b> ${escapeHtml(ptypeLabel(w.type))} <span class="small muted">(${why})</span>` });
}

function renderHistory() {
  const items = listAttempts();
  const list = $('history-list');
  if (!items.length) {
    list.innerHTML = '<p class="muted center">Chưa có lần luyện nào. Luyện xong bấm 🤖 AI Coach, 📋 Copy hoặc ✅ Tự kiểm tra, bài sẽ được lưu ở đây.</p>';
    return;
  }
  list.innerHTML = items
    .slice(0, 150)
    .map((h) => {
      const est = h.coach_result?.practice_level_estimate;
      const date = new Date(h.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
      return `<details class="card hist" data-id="${h.attempt_id}">
        <summary>${est ? levelBadge(est.label) : h.self_check ? `<span class="badge">✅ ${h.self_check.checked.length}/${h.self_check.total}</span>` : '<span class="badge">—</span>'}
          <b class="hist-q">${escapeHtml(h.question_text)}</b>
          <div class="muted small">${date} · ${MODE_LABEL[h.mode] || ''}${h.prompt_type ? ' · ' + escapeHtml(ptypeLabel(h.prompt_type)) : ''} · ${fmtTime(h.seconds || 0)} · ${countWords(h.transcript)} từ${est ? ' · ' + CONF_LABEL[est.confidence] : ''}</div>
        </summary>
        <div class="hist-body"></div>
      </details>`;
    })
    .join('');
  list.querySelectorAll('details.hist').forEach((d) =>
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      const h = items.find((x) => x.attempt_id === d.dataset.id);
      const body = d.querySelector('.hist-body');
      if (body.dataset.done) return;
      body.dataset.done = '1';
      body.innerHTML = `<h4>Bài nói</h4><p class="en-text">${escapeHtml(h.transcript || '(không có chữ — ghi âm)')}</p>
        ${h.coach_result ? renderFeedback(h.coach_result, { showRetry: false }) : h.legacy_feedback_md ? `<div class="md">${md(h.legacy_feedback_md)}</div>` : h.self_check ? `<p class="small">Tự kiểm tra: ${h.self_check.checked.map(escapeHtml).join('; ') || 'chưa đánh dấu mục nào'}</p>` : '<p class="muted small">Chưa có nhận xét (đã copy sang app khác).</p>'}
        <div class="row">${h.question_id ? `<button class="btn" data-again="${h.question_id}">🎤 Luyện lại câu này</button>` : ''}<button class="btn" data-del="${h.attempt_id}">Xoá</button></div>`;
      body.querySelector('[data-again]')?.addEventListener('click', () => openQuestion(h.question_id));
      body.querySelector('[data-del]').addEventListener('click', () => {
        deleteAttempt(h.attempt_id);
        renderProgress();
      });
    }),
  );
}

let pview = 'me';
function showView(v) {
  pview = v;
  document.querySelectorAll('#progress-view .seg').forEach((b) => b.classList.toggle('active', b.dataset.progview === v));
  $('pv-me').hidden = v !== 'me';
  $('pv-group').hidden = v !== 'group';
  if (v === 'group') renderGroup();
  else renderProgressMe();
}
function renderProgressMe() {
  renderStats();
  renderHistory();
}
export function renderProgress() {
  showView(pview);
}

export function initProgress() {
  $('btn-daily').addEventListener('click', dailyPractice);
  $('progress-stats').addEventListener('click', (e) => {
    if (e.target.closest('[data-goto-vocab]')) window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'vocab' }));
    if (e.target.closest('[data-goto-group]')) return showView('group');
    const pt = e.target.closest('[data-mi]');
    if (pt) {
      const { graded } = mockSeries(listMocks(), listAttempts());
      $('mock-chart-detail').innerHTML = mockDetail(graded[+pt.dataset.mi]);
      document.querySelectorAll('.mc-pt').forEach((g) => g.classList.toggle('sel', g === pt));
    }
    const plan = e.target.closest('[data-plan]')?.dataset.plan;
    if (plan === 'vocab') window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'vocab' }));
    if (plan === 'mock') window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'mock' }));
    if (plan === 'weak') dailyPractice();
    if (plan === 'practice') window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'practice' }));
    if (plan === 'week') {
      window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'mock' }));
      window.dispatchEvent(new CustomEvent('opic:goto-week'));
    }
    if (plan === 'scripts') {
      const list = listScripts().sort((a, b) => (a.lastPracticed || 0) - (b.lastPracticed || 0));
      if (list.length) openScript(list[0].id, 'shadow');
      else {
        window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'learn' }));
        window.dispatchEvent(new CustomEvent('opic:learn-sub', { detail: 'scripts' }));
      }
    }
  });
  $('progress-stats').addEventListener('change', (e) => {
    if (e.target.id !== 'exam-date') return;
    settings.examDate = e.target.value;
    saveSettings();
    renderStats();
  });
  document.querySelectorAll('#progress-view .seg').forEach((b) => b.addEventListener('click', () => showView(b.dataset.progview)));
  window.addEventListener('opic:progress-view', (e) => showView(e.detail));
  onMocksChange(() => $('tab-progress').classList.contains('active') && pview === 'me' && renderStats());
  onActivity(() => $('tab-progress').classList.contains('active') && pview === 'me' && renderStats());
  onScriptsChange(() => $('tab-progress').classList.contains('active') && renderStats());
  renderProgressMe();
}
