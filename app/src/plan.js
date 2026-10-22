// Kế hoạch đến ngày thi + dữ liệu biểu đồ thi thử. Hàm thuần, không đụng DOM (dễ test).
import { LEVEL_SCORE, scoreToLabel } from './util.js';

const DAY = 864e5;
export const dayStart = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
// examDate dạng 'YYYY-MM-DD' (giờ địa phương).
export function daysLeft(examDate, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate || '')) return null;
  const [y, m, d] = examDate.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - dayStart(now)) / DAY);
}

export function phaseOf(left) {
  if (left == null) return null;
  if (left < 0) return { id: 'after', vi: 'Đã qua ngày thi' };
  if (left === 0) return { id: 'day', vi: 'Hôm nay thi' };
  if (left <= 2) return { id: 'rest', vi: 'Nghỉ ngơi trước ngày thi' };
  if (left <= 7) return { id: 'sprint', vi: 'Nước rút' };
  if (left <= 21) return { id: 'build', vi: 'Tăng tốc' };
  return { id: 'base', vi: 'Xây nền' };
}

// Bao nhiêu ngày thì nên thi thử một lần, theo giai đoạn.
const MOCK_EVERY = { base: 14, build: 7, sprint: 2, rest: null, day: null, after: null };

/**
 * Gợi ý việc cần làm hôm nay.
 * input: { left, vocabDue, vocabNew, weakType, weakReason, todayPracticed, mocks:[{at}], scripts:[{lastPracticed}], now }
 * Mỗi việc: { id, icon, title, detail, done, action }
 */
export function dailyPlan(input) {
  const { left = null, vocabDue = 0, weakType = null, weakLabel = '', todayPracticed = 0, mocks = [], scripts = [], now = Date.now() } = input;
  const today = dayStart(now);
  const phase = phaseOf(left)?.id || 'base';
  const tasks = [];
  if (phase === 'day') {
    return [
      { id: 'calm', icon: '🧘', title: 'Hôm nay thi — giữ đầu óc thoải mái', detail: 'Chỉ nghe lại 1–2 kịch bản quen thuộc để khởi động giọng. Không học thêm.', done: false, action: 'scripts' },
    ];
  }
  if (phase === 'rest') {
    tasks.push({ id: 'review', icon: '📜', title: 'Ôn nhẹ kịch bản', detail: 'Đọc lại ý chính và cụm từ của 2–3 kịch bản. Không học nội dung mới, ngủ đủ giấc.', done: scripts.some((s) => (s.lastPracticed || 0) >= today), action: 'scripts' });
    tasks.push({ id: 'intro', icon: '👋', title: 'Nói thử phần giới thiệu bản thân', detail: 'Câu 1 luôn là giới thiệu bản thân. Nói 1 lần cho trôi chảy.', done: todayPracticed > 0, action: 'practice' });
    return tasks;
  }
  tasks.push({
    id: 'vocab',
    icon: '📒',
    title: vocabDue ? `Ôn ${vocabDue} thẻ từ vựng đến hạn` : 'Học 10–20 từ mới',
    detail: vocabDue ? 'Ôn hết thẻ đến hạn trước khi học từ mới.' : 'Không còn thẻ đến hạn. Bấm Học hôm nay để học từ mới.',
    done: vocabDue === 0 && input.vocabStudiedToday,
    action: 'vocab',
  });
  tasks.push({
    id: 'weak',
    icon: '🎯',
    title: weakType ? `Luyện điểm yếu: ${weakLabel}` : 'Luyện 1 câu bất kỳ',
    detail: phase === 'sprint' ? 'Luyện 2–3 câu, mỗi câu nói lại sau khi xem nhận xét.' : 'Luyện ít nhất 1 câu, xem nhận xét rồi nói lại.',
    done: todayPracticed >= (phase === 'sprint' ? 2 : 1),
    action: 'weak',
  });
  tasks.push({
    id: 'shadow',
    icon: '🗣️',
    title: scripts.length ? 'Nói theo hoặc học thuộc 1 kịch bản' : 'Lưu kịch bản đầu tiên',
    detail: scripts.length ? 'Chọn kịch bản lâu chưa luyện nhất.' : 'Mở bài mẫu ở tab Luyện → 🗣️ Nói theo.',
    done: scripts.some((s) => (s.lastPracticed || 0) >= today),
    action: 'scripts',
  });
  const every = MOCK_EVERY[phase] ?? 14;
  const last = mocks.length ? Math.max(...mocks.map((m) => m.at)) : 0;
  const since = last ? Math.floor((today - dayStart(last)) / DAY) : null;
  if (every && (since == null || since >= every || since === 0)) {
    tasks.push({
      id: 'mock',
      icon: '📝',
      title: since === 0 ? 'Đã thi thử hôm nay' : 'Làm 1 bài thi thử 40 phút',
      detail: since == null ? 'Chưa có bài thi thử nào — làm 1 bài để biết mình đang ở đâu.' : since === 0 ? 'Xem lại và chấm các câu nếu chưa chấm.' : `Lần gần nhất cách đây ${since} ngày.`,
      done: since === 0,
      action: 'mock',
    });
  }
  // Đề của tuần: hiện khi chưa làm (hoặc vừa làm hôm nay).
  const wk = input.week;
  if (wk && (!wk.done || wk.doneToday)) {
    tasks.push({
      id: 'week',
      icon: '🗓️',
      title: wk.done ? `Đã làm Đề của tuần ${wk.id}` : `Đề của tuần: ${wk.id}`,
      detail: wk.done ? 'Vào phần xem lại để chấm nếu chưa chấm.' : 'Cả nhóm cùng làm một đề mỗi tuần (+50 EXP). Làm ngày nào trong tuần cũng được.',
      done: !!wk.done,
      action: 'week',
    });
  }
  return tasks;
}

// ---------- Kết quả thi thử ----------
// Ghép bản ghi thi thử (từ v2.0.12) với các bài thi thử cũ suy ra từ lịch sử chấm.
export function mockSeries(records = [], attempts = []) {
  const byId = new Map(records.map((r) => [r.id, { ...r }]));
  const groups = new Map();
  for (const a of attempts) {
    if (a.mode !== 'mock' || !a.mock_id) continue;
    const g = groups.get(a.mock_id) || { at: Infinity, scores: [] };
    g.at = Math.min(g.at, new Date(a.created_at).getTime());
    const s = LEVEL_SCORE[a.coach_result?.practice_level_estimate?.label];
    if (s != null) g.scores.push(s);
    groups.set(a.mock_id, g);
  }
  for (const [id, g] of groups) {
    if (byId.has(id) || !g.scores.length) continue;
    const sorted = g.scores.sort((x, y) => x - y);
    byId.set(id, { id, at: g.at, graded: sorted.length, label: scoreToLabel(sorted[Math.floor((sorted.length - 1) / 2)]), legacy: true });
  }
  const all = [...byId.values()].sort((a, b) => a.at - b.at);
  return {
    all,
    graded: all.filter((m) => m.label && LEVEL_SCORE[m.label] != null).map((m) => ({ ...m, score: LEVEL_SCORE[m.label] })),
  };
}

export function compareLast(graded) {
  if (graded.length < 2) return null;
  const [a, b] = graded.slice(-2);
  return { from: a.label, to: b.label, delta: b.score - a.score };
}
