// Lịch sử luyện tập (chỉ văn bản + kết quả; không lưu file ghi âm) và thống kê tiến bộ.
import { store, uid, LEVEL_SCORE, scoreToLabel } from './util.js';
import { logActivity } from './activity.js';

const KEY = 'attempts';
const MAX = 400;

function migrateV1() {
  const old = store.get('history', null);
  if (!Array.isArray(old) || !old.length || store.get('migrated_v1', false)) return [];
  const converted = old.map((h) => ({
    attempt_id: uid(),
    created_at: h.date || new Date().toISOString(),
    mode: 'practice',
    question_id: null,
    question_text: h.question,
    prompt_type: null,
    topic: h.topic || '',
    target_level: 'IH',
    input_mode: 'transcript_only',
    seconds: h.seconds || 0,
    transcript: h.transcript || '',
    coach_result: null,
    legacy_feedback_md: h.feedback || '',
    provider: h.feedback ? 'claude' : 'copy',
    retry_of: null,
  }));
  store.set('migrated_v1', true);
  return converted;
}

let attempts = store.get(KEY, null);
if (!Array.isArray(attempts)) attempts = [];
const migrated = migrateV1();
if (migrated.length) {
  attempts = [...attempts, ...migrated];
  store.set(KEY, attempts);
}

const save = () => {
  if (attempts.length > MAX) attempts = attempts.slice(0, MAX);
  if (!store.set(KEY, attempts)) {
    // Bộ nhớ đầy: bỏ bớt bản cũ.
    attempts = attempts.slice(0, Math.floor(attempts.length / 2));
    store.set(KEY, attempts);
  }
};

export function addAttempt(a) {
  const rec = { attempt_id: uid(), created_at: new Date().toISOString(), retry_of: null, coach_result: null, ...a };
  attempts.unshift(rec);
  save();
  if (rec.coach_result) logActivity('graded', { key: rec.attempt_id });
  return rec;
}
export function updateAttempt(id, patch) {
  const a = attempts.find((x) => x.attempt_id === id);
  if (a) {
    Object.assign(a, patch);
    save();
  }
  return a;
}
export const listAttempts = () => attempts;
export function deleteAttempt(id) {
  attempts = attempts.filter((a) => a.attempt_id !== id);
  save();
}
export function clearAttempts() {
  attempts = [];
  save();
}

const dayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function stats() {
  const graded = attempts.filter((a) => a.coach_result?.practice_level_estimate);
  const scored = graded
    .map((a) => ({ a, s: LEVEL_SCORE[a.coach_result.practice_level_estimate.label] }))
    .filter((x) => x.s != null);
  const now = Date.now();
  const last7 = attempts.filter((a) => now - new Date(a.created_at).getTime() < 7 * 864e5).length;

  // Chuỗi ngày luyện liên tiếp (tính tới hôm nay hoặc hôm qua).
  const days = new Set(attempts.map((a) => dayKey(a.created_at)));
  let streak = 0;
  const d = new Date();
  if (!days.has(dayKey(d.toISOString()))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d.toISOString()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  const dist = {};
  for (const g of graded) {
    const l = g.coach_result.practice_level_estimate.label;
    dist[l] = (dist[l] || 0) + 1;
  }

  const byType = {};
  for (const a of attempts) {
    if (!a.prompt_type) continue;
    const t = (byType[a.prompt_type] ||= { count: 0, scores: [] });
    t.count++;
    const s = LEVEL_SCORE[a.coach_result?.practice_level_estimate?.label];
    if (s != null) t.scores.push(s);
  }
  for (const t of Object.values(byType)) {
    t.avg = t.scores.length ? t.scores.reduce((x, y) => x + y, 0) / t.scores.length : null;
    t.label = t.avg == null ? null : scoreToLabel(t.avg);
  }

  // Ước tính tổng: trung vị 10 bài chấm gần nhất (chỉ là chỉ số luyện tập).
  const recent = scored.slice(0, 10).map((x) => x.s).sort((x, y) => x - y);
  const median = recent.length ? recent[Math.floor((recent.length - 1) / 2)] : null;

  return {
    total: attempts.length,
    graded: graded.length,
    last7,
    streak,
    dist,
    byType,
    recentCount: recent.length,
    overall: median == null ? null : scoreToLabel(median),
  };
}

// Chọn dạng câu nên luyện: điểm trung bình thấp nhất, hoặc dạng ít luyện nhất.
export function weakestPromptType(candidates) {
  const s = stats().byType;
  const withScore = candidates.filter((t) => s[t]?.avg != null).sort((a, b) => s[a].avg - s[b].avg);
  const unpracticed = candidates.filter((t) => !s[t]);
  if (withScore.length && (s[withScore[0]].avg < 2 || !unpracticed.length)) return { type: withScore[0], reason: 'score' };
  if (unpracticed.length) return { type: unpracticed[Math.floor(Math.random() * unpracticed.length)], reason: 'new' };
  const least = [...candidates].sort((a, b) => (s[a]?.count || 0) - (s[b]?.count || 0));
  return { type: least[0], reason: 'least' };
}
