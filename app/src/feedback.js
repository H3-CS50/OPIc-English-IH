// Hiển thị kết quả AI Coach (JSON) thành giao diện dễ đọc.
import { escapeHtml, LEVEL_LABEL, CONF_LABEL, levelClass } from './util.js';

const FACT_LABEL = {
  functions_tasks: 'F · Chức năng & nhiệm vụ',
  accuracy: 'A · Độ chính xác',
  context_content: 'C · Bối cảnh & nội dung',
  text_type: 'T · Dạng diễn ngôn',
};
const STATUS = {
  assessed: '',
  not_assessed: '<span class="tag tag-muted">không đánh giá</span>',
  insufficient_evidence: '<span class="tag tag-muted">chưa đủ dữ liệu</span>',
};
const TASK = {
  fully_addressed: ['ok', 'Trả lời đúng & đủ'],
  partially_addressed: ['warn', 'Trả lời một phần'],
  off_task: ['bad', 'Lạc đề'],
  insufficient_evidence: ['muted', 'Chưa đủ dữ liệu'],
};

const q = (s) => (s ? `<q>${escapeHtml(s)}</q>` : '');
const p = (s) => (s ? `<p>${escapeHtml(s)}</p>` : '');

export function levelBadge(label, extra = '') {
  return `<span class="badge ${levelClass(label)} ${extra}">${escapeHtml(LEVEL_LABEL[label] || label || '—')}</span>`;
}

export function renderCompact(r) {
  if (!r) return '';
  const est = r.practice_level_estimate;
  return `<div class="fb-compact">${levelBadge(est.label)} <span class="muted small">${CONF_LABEL[est.confidence] || ''}</span>
    ${r.main_gap?.point_vi ? `<div class="small"><b>Cần cải thiện:</b> ${escapeHtml(r.main_gap.point_vi)}</div>` : ''}</div>`;
}

export function renderFeedback(r, { showRetry = true } = {}) {
  const est = r.practice_level_estimate;
  const [taskCls, taskText] = TASK[r.task_response.status] || TASK.insufficient_evidence;
  const factRows = Object.entries(FACT_LABEL)
    .map(([k, label]) => {
      const d = r.fact[k];
      return `<div class="fact-row"><div class="fact-head">${label} ${STATUS[d.status] || ''}</div>
        ${p(d.observation_vi)}${d.evidence_quotes.map(q).join(' ')}</div>`;
    })
    .join('');
  const delivery = ['pronunciation', 'fluency']
    .map((k) => {
      const d = r.delivery[k];
      return `<div class="fact-row"><div class="fact-head">${k === 'pronunciation' ? 'Phát âm' : 'Độ trôi chảy'} ${STATUS[d.status] || ''}</div>${p(d.observation_vi)}</div>`;
    })
    .join('');
  const fixes = r.language_fixes.length
    ? `<div class="fix-list">${r.language_fixes
        .map(
          (f) => `<div class="fix ${f.impact === 'affects_meaning' ? 'fix-major' : ''}">
          <div><s>${escapeHtml(f.original)}</s> → <b>${escapeHtml(f.suggested)}</b></div>
          <div class="muted small">${escapeHtml(f.explanation_vi)}${f.impact === 'affects_meaning' ? ' · <b>ảnh hưởng nghĩa</b>' : ''}</div></div>`,
        )
        .join('')}</div>`
    : '<p class="muted small">Không có lỗi đáng kể cần sửa.</p>';

  return `
  <div class="fb">
    <div class="fb-top">
      <div>${levelBadge(est.label, 'badge-lg')}</div>
      <div class="fb-top-text">
        <div class="small muted">Ước tính luyện tập · ${CONF_LABEL[est.confidence] || ''}</div>
        <div class="small">${escapeHtml(est.rationale_vi)}</div>
      </div>
    </div>
    <p class="disclaimer">Đây là phản hồi luyện tập của AI, không phải điểm OPIc chính thức. Một câu trả lời chưa đủ để kết luận trình độ.</p>

    <div class="fb-sec"><h4>📋 Đáp ứng câu hỏi <span class="tag tag-${taskCls}">${taskText}</span></h4>
      ${p(r.task_response.comment_vi)}${r.main_idea_summary_vi ? `<p class="muted small">Ý chính bạn nói: ${escapeHtml(r.main_idea_summary_vi)}</p>` : ''}</div>

    ${r.what_works.length ? `<div class="fb-sec"><h4>✅ Điểm làm tốt</h4><ul>${r.what_works.map((w) => `<li>${escapeHtml(w.point_vi)} ${q(w.evidence_quote)}</li>`).join('')}</ul></div>` : ''}

    <div class="fb-sec fb-gap"><h4>🧩 Khoảng trống chính</h4>${p(r.main_gap.point_vi)}${q(r.main_gap.evidence_quote)}${r.main_gap.why_it_matters_vi ? `<p class="muted small">${escapeHtml(r.main_gap.why_it_matters_vi)}</p>` : ''}</div>

    ${r.next_level_move.action_vi ? `<div class="fb-sec"><h4>🚀 Bước tiếp theo${r.next_level_move.target_level ? ` → ${escapeHtml(r.next_level_move.target_level.replace('_maintain', ' (giữ vững)'))}` : ''}</h4>${p(r.next_level_move.action_vi)}</div>` : ''}

    <details class="fb-sec"><summary><b>✏️ Sửa lỗi ngôn ngữ (${r.language_fixes.length})</b></summary>${fixes}</details>

    <details class="fb-sec"><summary><b>🔎 Phân tích theo FACT</b></summary>${factRows}${delivery}</details>

    ${r.expanded_example_en ? `<details class="fb-sec"><summary><b>📝 Bản phát triển từ bài của bạn</b></summary><p class="en-text">${escapeHtml(r.expanded_example_en)}</p><p class="muted small">Đây là minh họa để tham khảo cách phát triển ý. Đừng học thuộc.</p></details>` : ''}

    ${r.transcript_used ? `<details class="fb-sec"><summary><b>🗒️ AI nghe được</b></summary><p class="en-text">${escapeHtml(r.transcript_used)}</p></details>` : ''}

    ${r.retry_task.goal_vi ? `<div class="fb-sec fb-retry"><h4>🔁 Nói lại một lần nữa</h4><p><b>${escapeHtml(r.retry_task.goal_vi)}</b></p>${p(r.retry_task.instruction_vi)}${r.retry_task.success_check_vi ? `<p class="muted small">Tự kiểm tra: ${escapeHtml(r.retry_task.success_check_vi)}</p>` : ''}
      ${showRetry ? '<button class="btn primary" data-action="retry">🔁 Nói lại với mục tiêu này</button>' : ''}</div>` : ''}

    ${r.limitations_vi.length ? `<div class="fb-sec"><h4>⚠️ Giới hạn của nhận xét</h4><ul class="small muted">${r.limitations_vi.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul></div>` : ''}
  </div>`;
}
