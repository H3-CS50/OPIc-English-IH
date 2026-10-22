// Nhật ký hoạt động theo ngày → EXP, chuỗi ngày, huy hiệu. Lưu trên máy; gửi lên máy chủ nhóm nếu người học bật.
// Quy tắc EXP là thiết kế của app (khuyến khích NÓI nhiều nhất), có trần mỗi ngày để hạn chế "cày điểm".
import { store } from './util.js';

const KEY = 'activity';
let A = store.get(KEY, null);
if (!A || typeof A !== 'object') A = {};
A.days ||= {};
A.seen ||= {};
const listeners = new Set();
export const onActivity = (fn) => listeners.add(fn);

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const parseDay = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Điểm cho từng loại hoạt động.
export const EXP_RULES = [
  { kind: 'spoken', vi: 'Nói xong một câu (từ 15 từ hoặc 20 giây)', exp: 10, cap: null },
  { kind: 'graded', vi: 'Được AI chấm một bài', exp: 5, cap: null },
  { kind: 'mocks', vi: 'Hoàn thành một bài thi thử (từ 12 câu)', exp: 100, cap: null },
  { kind: 'week', vi: 'Làm Đề của tuần', exp: 50, cap: null },
  { kind: 'scripts', vi: 'Luyện một kịch bản (học thuộc / nói theo)', exp: 5, cap: 10 },
  { kind: 'vocab', vi: 'Ôn một thẻ từ vựng', exp: 1, cap: 100 },
  { kind: 'ipa', vi: 'Trả lời đúng một câu luyện IPA', exp: 2, cap: 25 },
];
export const MAX_DAY_EXP = 800;
const EMPTY = () => ({ spoken: 0, seconds: 0, graded: 0, mocks: 0, week: 0, scripts: 0, vocab: 0, ipa: 0, exp: 0 });

export function computeExp(d) {
  let e = 0;
  for (const r of EXP_RULES) e += Math.min(d[r.kind] || 0, r.cap ?? Infinity) * r.exp;
  return Math.min(MAX_DAY_EXP, e);
}

// key: chống tính trùng trong cùng ngày (vd. cùng một câu hỏi nói nhiều lần chỉ tính 1 lần/ngày).
export function logActivity(kind, { key = null, seconds = 0, n = 1, now = Date.now() } = {}) {
  const day = dayKey(now);
  const d = (A.days[day] ||= EMPTY());
  if (key != null) {
    const k = `${day}|${kind}|${key}`;
    if (A.seen[k]) return 0;
    A.seen[k] = 1;
  }
  const before = d.exp;
  d[kind] = (d[kind] || 0) + n;
  if (seconds) d.seconds += Math.round(seconds);
  d.exp = computeExp(d);
  prune(now);
  store.set(KEY, A);
  listeners.forEach((fn) => fn());
  return d.exp - before;
}

function prune(now) {
  const cutoff = dayKey(now - 45 * 864e5);
  for (const k of Object.keys(A.seen)) if (k.slice(0, 10) < cutoff) delete A.seen[k];
}

export const dayStats = (day = dayKey()) => ({ ...EMPTY(), ...(A.days[day] || {}) });
export const allDays = () => A.days;

// Thứ Hai đầu tuần (giờ địa phương).
export function weekStart(t = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function summary(now = Date.now()) {
  const days = Object.keys(A.days).sort();
  const sum = (filter) => days.filter(filter).reduce((a, k) => a + (A.days[k].exp || 0), 0);
  const today = dayKey(now);
  const wk = dayKey(weekStart(now).getTime());
  const month = today.slice(0, 7);
  const total = sum(() => true);
  // Chuỗi ngày: tính tới hôm nay (hoặc hôm qua nếu hôm nay chưa học).
  const active = new Set(days.filter((k) => A.days[k].exp > 0));
  let streak = 0;
  const d = new Date(now);
  if (!active.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  while (active.has(dayKey(d.getTime()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of [...active].sort()) {
    run = prev && (parseDay(k) - parseDay(prev)) / 864e5 === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  const tot = (kind) => days.reduce((a, k) => a + (A.days[k][kind] || 0), 0);
  return {
    today: A.days[today]?.exp || 0,
    week: sum((k) => k >= wk && k <= today),
    month: sum((k) => k.startsWith(month)),
    total,
    streak,
    best,
    level: levelOf(total),
    counts: { spoken: tot('spoken'), seconds: tot('seconds'), mocks: tot('mocks'), vocab: tot('vocab'), week: tot('week'), graded: tot('graded') },
  };
}

// Bậc theo tổng EXP (chỉ để tạo động lực, không liên quan cấp OPIc).
const STEPS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000];
export function levelOf(total) {
  let i = 0;
  while (i + 1 < STEPS.length && total >= STEPS[i + 1]) i++;
  const next = STEPS[i + 1];
  return { n: i + 1, from: STEPS[i], next: next ?? null, pct: next ? Math.round((100 * (total - STEPS[i])) / (next - STEPS[i])) : 100 };
}

export function badges(s = summary()) {
  const c = s.counts;
  return [
    { id: 'streak3', icon: '🔥', vi: 'Chuỗi 3 ngày', ok: s.best >= 3 },
    { id: 'streak7', icon: '🔥', vi: 'Chuỗi 7 ngày', ok: s.best >= 7 },
    { id: 'streak30', icon: '🏅', vi: 'Chuỗi 30 ngày', ok: s.best >= 30 },
    { id: 'talk100', icon: '🎤', vi: '100 câu đã nói', ok: c.spoken >= 100 },
    { id: 'talk500', icon: '🎙️', vi: '500 câu đã nói', ok: c.spoken >= 500 },
    { id: 'hour10', icon: '⏱️', vi: '10 giờ nói', ok: c.seconds >= 36000 },
    { id: 'mock1', icon: '📝', vi: 'Bài thi thử đầu tiên', ok: c.mocks >= 1 },
    { id: 'mock10', icon: '🏆', vi: '10 bài thi thử', ok: c.mocks >= 10 },
    { id: 'week4', icon: '🗓️', vi: '4 Đề của tuần', ok: c.week >= 4 },
    { id: 'vocab1000', icon: '📒', vi: '1.000 lượt ôn từ', ok: c.vocab >= 1000 },
  ];
}

// Dữ liệu gửi lên máy chủ nhóm: các ngày gần đây.
export function recentDays(n = 35, now = Date.now()) {
  const from = dayKey(now - n * 864e5);
  return Object.entries(A.days)
    .filter(([k]) => k >= from)
    .map(([date, d]) => ({ date, ...EMPTY(), ...d }));
}

export function resetActivity() {
  A = { days: {}, seen: {} };
  store.set(KEY, A);
  listeners.forEach((fn) => fn());
}
