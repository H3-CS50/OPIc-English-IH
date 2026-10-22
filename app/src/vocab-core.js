// Logic của tab Từ vựng (không đụng DOM) — giữ đúng cách học của app OPIc AL Vocab:
// chấm Quên / Khó / Nhớ, hộp 0–6 với khoảng ôn 0/1/2/4/7/15/30 ngày, "đã thuộc" = hộp ≥ 3.
import data from './vocab.json';
import { store, shuffle } from './util.js';

export const DAY = 864e5;
export const INT = [0, 1, 2, 4, 7, 15, 30];
export const LEARNED_BOX = 3;

export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

export const TOPICS = data.topics.map((t, i) => ({ ...t, idx: i, items: [] }));
export const ALL = data.items.map((it, i) => {
  const item = { ...it, idx: i, topic: TOPICS[it.t], key: norm(`${it.en} ${it.vi} ${it.ex}`) };
  TOPICS[it.t].items.push(item);
  return item;
});
const BY_ID = new Map(ALL.map((it) => [it.id, it]));
export const getItem = (id) => BY_ID.get(id);
export const ORIGINAL_COUNT = ALL.filter((it) => !it.new).length;

// ---------- Trạng thái (lưu trên máy) ----------
const DEFAULT_SET = { dir: 'en', auto: true, rate: 0.9, newPer: 20 };
export const S = { p: {}, set: { ...DEFAULT_SET } };
export function loadState() {
  const saved = store.get('vocab', null);
  S.p = saved?.p || {};
  S.set = { ...DEFAULT_SET, ...(saved?.set || {}) };
}
export const saveState = () => store.set('vocab', S);
loadState();

const today0 = (now = Date.now()) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
export const st = (it) => S.p[it.id];
export const isNew = (it) => !st(it);
export const isDue = (it, now = Date.now()) => !!st(it) && st(it).due <= now;
export const isLearned = (it) => !!st(it) && st(it).box >= LEARNED_BOX;

// g: 0 = Quên, 1 = Khó, 2 = Nhớ
export function grade(it, g, now = Date.now()) {
  const p = st(it) || { box: 0, due: 0 };
  if (g === 0) p.box = 0;
  else if (g === 1) p.box = Math.max(1, p.box);
  else p.box = Math.min(INT.length - 1, p.box + 1);
  p.due = g === 0 ? now : today0(now) + INT[p.box] * DAY;
  S.p[it.id] = p;
  saveState();
  return p;
}

export function resetProgress() {
  S.p = {};
  saveState();
}

export function stats(items = ALL, now = Date.now()) {
  let learned = 0;
  let seen = 0;
  let due = 0;
  for (const it of items) {
    const p = S.p[it.id];
    if (!p) continue;
    seen++;
    if (p.box >= LEARNED_BOX) learned++;
    if (p.due <= now) due++;
  }
  return { total: items.length, learned, seen, due };
}

// Lượt học: thẻ đến hạn (cũ nhất trước) + N thẻ mới. Hết thì ôn ngẫu nhiên 20 thẻ.
export function studyQueue(items = ALL, newPer = S.set.newPer, now = Date.now()) {
  const due = items.filter((it) => isDue(it, now)).sort((a, b) => st(a).due - st(b).due);
  const fresh = items.filter(isNew).slice(0, newPer);
  const q = due.concat(fresh);
  if (q.length) return { q, free: false };
  return { q: shuffle(items.slice()).slice(0, 20), free: true };
}

// 10 câu trắc nghiệm; đáp án nhiễu lấy cùng chủ đề (thiếu thì lấy toàn bộ).
export function quiz(items = ALL, n = 10) {
  return shuffle(items.slice())
    .slice(0, n)
    .map((it) => {
      let pool = it.topic.items.filter((x) => x !== it && x.vi !== it.vi && x.en !== it.en);
      if (pool.length < 3) pool = ALL.filter((x) => x !== it && x.vi !== it.vi && x.en !== it.en);
      return { it, opts: shuffle([it, ...shuffle(pool.slice()).slice(0, 3)]) };
    });
}

export const search = (q, items = ALL) => {
  const k = norm(q).trim();
  return k ? items.filter((it) => it.key.includes(k)) : [];
};

// Chuẩn bị câu để đọc: "...ing" → "doing something", bỏ ngoặc, "/" thành dấu phẩy.
export const speakable = (t) =>
  String(t || '')
    .replace(/\.\.\.ing/g, 'doing something')
    .replace(/\.\.\./g, ', ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\(.*?\)/g, '');

// Gợi ý cụm từ cho một câu hỏi: nhóm chức năng theo dạng câu + nhóm chủ đề theo topic câu hỏi.
export function suggestFor(q, n = 6) {
  if (!q) return { items: [], topics: [] };
  const fn = TOPICS.filter((t) => Array.isArray(t.prompt_types) && t.prompt_types.includes(q.prompt_type));
  const tp = TOPICS.filter((t) => t.kb_topics.includes(q.topic));
  const pickFrom = (ts, k) => {
    const pool = ts.flatMap((t) => t.items);
    const notLearned = shuffle(pool.filter((it) => !isLearned(it)));
    const learned = shuffle(pool.filter(isLearned));
    return notLearned.concat(learned).slice(0, k);
  };
  const a = pickFrom(tp, tp.length ? Math.ceil(n / 2) : 0);
  const b = pickFrom(fn.length ? fn : TOPICS.filter((t) => t.id === 'discourse'), n - a.length);
  return { items: [...b, ...a], topics: [...fn, ...tp] };
}

// Chuyển "đã thuộc" của bộ flashcard cũ (tab Học) sang tab Từ vựng, chỉ làm 1 lần.
export function migrateOldFlashcards(now = Date.now()) {
  if (store.get('vocabMigrated', false)) return 0;
  const known = store.get('known', []);
  let n = 0;
  if (Array.isArray(known) && known.length) {
    const byEn = new Map(ALL.map((it) => [norm(it.en).replace(/[.…]+$/g, '').trim(), it]));
    for (const en of known) {
      const it = byEn.get(norm(en).replace(/…/g, '...').replace(/[.…]+$/g, '').trim());
      if (it && !S.p[it.id]) {
        S.p[it.id] = { box: LEARNED_BOX, due: today0(now) + INT[LEARNED_BOX] * DAY };
        n++;
      }
    }
    if (n) saveState();
  }
  store.set('vocabMigrated', true);
  return n;
}
