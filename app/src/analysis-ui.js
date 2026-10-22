// Hiển thị "📊 Phân tích bài nói" và lưu nhật ký chỉ số để xem xu hướng ở tab Tiến bộ.
import { analyzeSpeech, LEVEL_VI } from './analysis.js';
import { ALL as VOCAB } from './vocab-core.js';
import { escapeHtml, store } from './util.js';

export const analyze = (p) => analyzeSpeech({ ...p, vocab: VOCAB });

const AREA = [
  ['fluency', '🌊', 'Độ trôi chảy'],
  ['complexity', '🎨', 'Độ phong phú'],
  ['accuracy', '🎯', 'Độ chính xác'],
  ['pronunciation', '🗣️', 'Phát âm'],
];
const WIDTH = { good: 100, ok: 66, work: 33, na: 0 };
const num = (x, d = 0) => (x == null ? '–' : Number(x).toLocaleString('vi-VN', { maximumFractionDigits: d, minimumFractionDigits: d }));
const TENSE_VI = { past: 'quá khứ', present: 'hiện tại', future: 'tương lai', perfect: 'hoàn thành' };

function fluencyLine(f) {
  const parts = [];
  if (f.wpm != null) parts.push(`<b>${f.wpm}</b> từ/phút`);
  else if (f.wpmUnreliable) parts.push('tốc độ: không tính (số từ quá nhiều so với thời gian ghi — có thể do gõ thêm chữ)');
  if (f.longPauses != null)
    parts.push(f.pauseScored ? `<b>${f.longPauses}</b> lần ngừng ≥${f.longThr} giây` : `≈${f.longPauses} lần ngừng ≥${f.longThr} giây <span class="muted">(ước tính, không tính điểm)</span>`);
  if (f.speakingRatio != null) parts.push(`nói <b>${Math.round(f.speakingRatio * 100)}%</b> thời gian`);
  parts.push(`<b>${f.fillers}</b> tiếng ngập ngừng${f.fillers ? ` (${Object.entries(f.fillerList).map(([k, v]) => `${escapeHtml(k)}×${v}`).join(', ')})` : ''}`);
  parts.push(`lặp <b>${f.repeats.length}</b>${f.repeats.length ? ` (${f.repeats.slice(0, 3).map(escapeHtml).join(', ')})` : ''}`);
  if (f.firstWordDelay != null && f.firstWordDelay >= 4) parts.push(`bắt đầu nói sau <b>${num(f.firstWordDelay, 1)}</b> giây`);
  return parts.join(' · ');
}

function complexityLine(c) {
  const t = c.tenses;
  const tenses = ['past', 'present', 'future', 'perfect'].map((k) => `${TENSE_VI[k]} ${t[k] ? '✓' : '–'}`).join(' · ');
  return `<b>${c.words}</b>${c.targetWords ? `/${c.targetWords}` : ''} từ · đa dạng từ <b>${num(c.diversity, 2)}</b> · <b>${c.connectors.length}</b> từ nối${c.connectors.length ? ` (${c.connectors.slice(0, 5).map(escapeHtml).join(', ')}${c.connectors.length > 5 ? '…' : ''})` : ''}
    <div class="muted">Dấu hiệu thì: ${tenses}</div>
    ${c.missingTenses.length ? `<div>⚠️ Máy thấy ít động từ ${c.missingTenses.map((x) => TENSE_VI[x]).join(' và ')}. Câu này cần kể ${c.missingTenses.includes('past') ? 'trải nghiệm đã qua' : 'cả trước đây lẫn bây giờ'} — kiểm tra lại.</div>` : ''}`;
}

function accuracyLine(a) {
  const easy = a.easy.length
    ? `<ul class="an-errs">${a.easy
        .slice(0, 5)
        .map((e) => `<li><s>${escapeHtml(e.from)}</s> → <b>${escapeHtml(e.to)}</b> <span class="muted">${escapeHtml(e.vi)}</span></li>`)
        .join('')}</ul>`
    : '';
  if (a.source === 'ai') return `AI sửa <b>${a.aiFixes}</b> chỗ${a.aiMajor ? ` (${a.aiMajor} chỗ ảnh hưởng nghĩa)` : ''}. Xem mục ✏️ Sửa lỗi trong nhận xét.${easy}`;
  if (a.easy.length) return `Máy nghi có <b>${a.easy.length}</b> lỗi hay gặp (máy có thể nhầm, hãy kiểm tra):${easy}<div class="muted">Bấm 🤖 AI Coach để chấm kỹ ngữ pháp.</div>`;
  return 'Máy chưa thấy lỗi dễ thấy (máy chỉ dò vài lỗi hay gặp). Bấm 🤖 AI Coach để chấm kỹ ngữ pháp.';
}

function pronLine(p, { pronButton }) {
  if (p.source === 'pron') return `${escapeHtml(p.note)}${p.words ? ` · ${p.words} từ cần sửa` : ''}`;
  if (p.source === 'ai') return escapeHtml(p.note);
  return `Cần AI nghe giọng bạn.${pronButton ? ' <button class="link-btn" data-pron-open>🔍 Soi phát âm</button>' : ''}`;
}

export function renderAnalysis(a, { pronButton = true, title = '📊 Phân tích bài nói' } = {}) {
  if (!a) return '';
  if (a.words < 15 && a.fluency.speakingRatio == null)
    return `<div class="an-card"><b>${title}</b><p class="muted small">Bài nói dưới 15 từ — nói dài hơn (khoảng 20 giây trở lên) để app phân tích.</p></div>`;
  const lines = {
    fluency: fluencyLine(a.fluency),
    complexity: a.words >= 15 ? complexityLine(a.complexity) : a.words ? 'Bài nói dưới 15 từ, chưa đủ để phân tích.' : 'Chưa có chữ để phân tích. Gõ lại lời nói vào ô, hoặc dùng chế độ 📝.',
    accuracy: a.words >= 15 ? accuracyLine(a.accuracy) : '',
    pronunciation: pronLine(a.pronunciation, { pronButton }),
  };
  return `<div class="an-card">
    <div class="row between"><b>${title}</b><span class="muted small">tự động · không tốn lượt AI</span></div>
    ${AREA.map(([k, icon, vi]) => {
      const lv = a[k].level || 'na';
      return `<div class="an-row an-${lv}">
        <div class="an-h"><span>${icon} <b>${vi}</b></span><span class="an-lv">${LEVEL_VI[lv]}</span></div>
        <span class="an-bar"><span style="width:${WIDTH[lv]}%"></span></span>
        <div class="an-stats small">${lines[k]}</div>
      </div>`;
    }).join('')}
    ${a.complexity.phrases.length ? `<div class="small an-phr"><b>✨ Cụm hay bạn đã dùng:</b> ${a.complexity.phrases.map((p) => `<span class="chip" title="${escapeHtml(p.vi)}">${escapeHtml(p.en)}</span>`).join(' ')}</div>` : ''}
    <div class="an-tip small">💡 ${escapeHtml(a.tip)}</div>
    <p class="muted small">Chỉ số luyện tập do app tự tính theo quy tắc, không phải điểm OPIc. Khi chuyển giọng nói thành chữ, máy có thể bỏ sót chữ và "um/uh" nên tốc độ và số tiếng ngập ngừng có thể thấp hơn thực tế. Muốn đo khoảng ngừng chính xác hơn, dùng chế độ 🎙️ Ghi âm.</p>
  </div>`;
}

// Dòng tóm tắt ngắn (dùng trong danh sách thi thử).
export function analysisChips(a) {
  if (!a || a.words < 15) return '';
  const f = a.fluency;
  const parts = [];
  if (f.wpm != null) parts.push(`${f.wpm} từ/phút`);
  if (f.longPauses != null && f.pauseScored) parts.push(`${f.longPauses} lần ngừng dài`);
  parts.push(`${a.complexity.connectors.length} từ nối`);
  if (a.accuracy.easy.length) parts.push(`${a.accuracy.easy.length} lỗi nghi ngờ`);
  return `<span class="an-chips small">${parts.join(' · ')}</span>`;
}

// ---------- Nhật ký chỉ số ----------
const KEY = 'analysis-log';
let log = store.get(KEY, null);
if (!Array.isArray(log)) log = [];
export function logAnalysis(a, { qid = null, ptype = null, target = '', now = Date.now() } = {}) {
  if (!a || a.words < 15) return;
  const entry = {
    at: now,
    qid,
    ptype,
    target,
    words: a.words,
    seconds: a.seconds,
    wpm: a.fluency.wpm,
    // Chỉ lưu khoảng ngừng đo từ ghi âm (cùng ngưỡng 2 giây) để xu hướng không bị trộn.
    pausesPerMin: a.fluency.pauseScored && a.fluency.longPauses != null && a.seconds ? Math.round((a.fluency.longPauses / (a.seconds / 60)) * 10) / 10 : null,
    fillers: a.fluency.fillers,
    diversity: a.complexity.diversity,
    connectors: a.complexity.connectors.length,
    errors: a.accuracy.easy.length,
  };
  // Cùng câu hỏi trong vòng 2 phút (sửa chữ, chấm lại) thì ghi đè.
  const last = log[log.length - 1];
  if (last && last.qid === qid && now - last.at < 120e3) log[log.length - 1] = entry;
  else log.push(entry);
  if (log.length > 300) log = log.slice(-300);
  store.set(KEY, log);
}
export const analysisLog = () => log.slice();
export function clearAnalysisLog() {
  log = [];
  store.remove(KEY);
}

// So 10 bài gần nhất với 10 bài trước đó.
export function analysisTrend(entries = log, n = 10) {
  if (entries.length < 3) return null;
  const recent = entries.slice(-n);
  const before = entries.slice(-2 * n, -n);
  const avg = (arr, k) => {
    const v = arr.map((e) => e[k]).filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const keys = ['wpm', 'pausesPerMin', 'diversity', 'connectors', 'words'];
  return { count: entries.length, recent: Object.fromEntries(keys.map((k) => [k, avg(recent, k)])), before: before.length >= 3 ? Object.fromEntries(keys.map((k) => [k, avg(before, k)])) : null };
}
