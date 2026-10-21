// Tab Tiến bộ: thống kê, luyện điểm yếu, lịch sử.
import { $, escapeHtml, md, fmtTime, countWords, LEVEL_LABEL, CONF_LABEL } from './util.js';
import { filterQuestions, ptypeLabel } from './data.js';
import { stats, listAttempts, deleteAttempt, weakestPromptType } from './history.js';
import { renderFeedback, levelBadge } from './feedback.js';
import { openQuestion } from './practice.js';
import { settings } from './settings.js';

const CORE_TYPES = [
  'description', 'routine', 'past_recent', 'memorable_experience', 'problem_experience', 'comparison_change',
  'roleplay_ask', 'roleplay_problem', 'roleplay_experience', 'issue_concern', 'news_report',
];
const ORDER = ['below_IM', 'IM', 'IM_IH_borderline', 'IH', 'IH_AL_borderline', 'AL', 'insufficient_evidence'];
const MODE_LABEL = { practice: 'Luyện', mock: 'Thi thử', daily: 'Điểm yếu', retry: 'Nói lại' };

function renderStats() {
  const s = stats();
  const maxDist = Math.max(1, ...Object.values(s.dist));
  $('progress-stats').innerHTML = `
    <div class="stat-row">
      <div class="stat"><b>${s.total}</b><span>lần luyện</span></div>
      <div class="stat"><b>${s.last7}</b><span>7 ngày qua</span></div>
      <div class="stat"><b>${s.streak}🔥</b><span>ngày liên tiếp</span></div>
    </div>
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

function dailyPractice() {
  const w = weakestPromptType(CORE_TYPES);
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

export function renderProgress() {
  renderStats();
  renderHistory();
}

export function initProgress() {
  $('btn-daily').addEventListener('click', dailyPractice);
  renderProgress();
}
