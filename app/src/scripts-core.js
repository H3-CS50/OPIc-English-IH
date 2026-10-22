// Sổ kịch bản: lưu trên máy (localStorage), không cần mạng.
// Kèm các hàm thuần cho chế độ học thuộc (ẩn từ) và nói theo (so từng từ).
import { store, uid } from './util.js';

const KEY = 'scripts';
const MAX = 300;
let scripts = store.get(KEY, null);
if (!Array.isArray(scripts)) scripts = [];
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const persist = () => {
  if (scripts.length > MAX) scripts = scripts.slice(0, MAX);
  store.set(KEY, scripts);
  emit();
};

export const SOURCE_VI = { mine: 'Bài nói của tôi', ai: 'AI nâng cấp', sample: 'Bài mẫu', photo: 'Từ ảnh chụp', manual: 'Tự viết' };
export const onScriptsChange = (fn) => listeners.add(fn);
export const listScripts = () => [...scripts].sort((a, b) => b.updated - a.updated);
export const getScript = (id) => scripts.find((s) => s.id === id) || null;
const sameText = (a, b) => normText(a) === normText(b);

// Trả về { script, existed } — không tạo bản trùng nội dung.
export function addScript({ question_id = null, question_text = '', topic = '', text, source = 'manual', level = '' }) {
  text = String(text || '').trim();
  if (!text) return { script: null, existed: false };
  const dup = scripts.find((s) => sameText(s.text, text));
  if (dup) return { script: dup, existed: true };
  const now = Date.now();
  const s = { id: uid(), question_id, question_text: String(question_text || '').trim(), topic, text, source, level, created: now, updated: now, practiced: 0, best: null };
  scripts.unshift(s);
  persist();
  return { script: s, existed: false };
}

export function updateScript(id, patch) {
  const s = getScript(id);
  if (!s) return null;
  Object.assign(s, patch, { updated: Date.now() });
  persist();
  return s;
}

// Ghi nhận một lần luyện (học thuộc / nói theo) và điểm khớp tốt nhất.
export function markPracticed(id, score = null) {
  const s = getScript(id);
  if (!s) return;
  s.practiced = (s.practiced || 0) + 1;
  s.lastPracticed = Date.now();
  if (score != null) s.best = Math.max(s.best || 0, score);
  store.set(KEY, scripts);
  emit();
}

export function removeScript(id) {
  scripts = scripts.filter((s) => s.id !== id);
  persist();
}

// ---------- Từ ngữ ----------
export const normWord = (w) =>
  String(w || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '')
    .replace(/^'+|'+$/g, '');
export const normText = (t) =>
  String(t || '')
    .split(/\s+/)
    .map(normWord)
    .filter(Boolean)
    .join(' ');

// Tách câu (giữ nguyên dấu câu) để nói theo từng câu.
export function splitSentences(text) {
  return (
    String(text || '')
      .replace(/\s+/g, ' ')
      .match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) || []
  )
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

// Chữ số ↔ chữ cho các số nhỏ hay gặp, để "3" và "three" được tính là khớp.
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const canon = (w) => {
  const n = normWord(w);
  if (/^\d+$/.test(n) && +n <= 12) return NUM[+n];
  const exp = { "i'm": 'i am', "don't": 'do not', "it's": 'it is', "can't": 'cannot', "won't": 'will not', "didn't": 'did not', "isn't": 'is not', "i've": 'i have', "i'll": 'i will', "that's": 'that is', "there's": 'there is' };
  return exp[n] || n;
};
const tokens = (text) =>
  String(text || '')
    .split(/\s+/)
    .flatMap((w) => canon(w).split(' '))
    .filter(Boolean);

// So câu gốc với lời nói (đã nhận dạng). Căn chỉnh LCS theo từ.
// Trả về: words = [{ w, ok }] theo câu gốc (giữ chữ gốc để hiển thị), extra = từ nói thừa, score 0–100.
export function compareSpeech(ref, said) {
  const shown = String(ref || '').split(/\s+/).filter(Boolean);
  // Mỗi từ hiển thị có thể thành 1–2 token (I'm → i am); ghi lại token thuộc từ nào.
  const refTok = [];
  shown.forEach((w, i) => canon(w).split(' ').filter(Boolean).forEach((t) => refTok.push({ t, i })));
  const sayTok = tokens(said);
  const n = refTok.length;
  const m = sayTok.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) dp[i][j] = refTok[i].t === sayTok[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const okTok = new Array(n).fill(false);
  const extra = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (refTok[i].t === sayTok[j]) {
      okTok[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else extra.push(sayTok[j++]);
  }
  while (j < m) extra.push(sayTok[j++]);
  const words = shown.map((w, k) => {
    const mine = refTok.map((r, x) => [r, x]).filter(([r]) => r.i === k);
    const ok = mine.length === 0 || mine.every(([, x]) => okTok[x]);
    return { w, ok, skip: mine.length === 0 };
  });
  const counted = words.filter((x) => !x.skip);
  const score = counted.length ? Math.round((100 * counted.filter((x) => x.ok).length) / counted.length) : 0;
  return { words, extra, score };
}

// ---------- Học thuộc: ẩn dần từ ----------
// Từ chức năng ẩn sau cùng; từ nội dung (dài) ẩn trước. Thứ tự cố định theo seed để không nhảy lung tung.
const FUNCTION_WORDS = new Set('a an the and or but so to of in on at for with by from as is am are was were be been it i you he she we they my your his her our their me him us them this that these those there here not do does did have has had will would can could just very really'.split(' '));
function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
}
export function hideOrder(text, seed = 1) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const rnd = seeded(seed);
  return words
    .map((w, i) => {
      const n = normWord(w);
      const weight = !n ? -1 : FUNCTION_WORDS.has(n) ? 0 : Math.min(n.length, 10);
      return { i, key: weight + rnd() * 3 };
    })
    .filter((x) => x.key >= 0)
    .sort((a, b) => b.key - a.key)
    .map((x) => x.i);
}
// level 0..4 → ẩn 0, 25, 50, 75, 100% từ.
export function maskedWords(text, level, seed = 1) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const order = hideOrder(text, seed);
  const k = Math.round((order.length * Math.max(0, Math.min(4, level))) / 4);
  const hidden = new Set(order.slice(0, k));
  return words.map((w, i) => ({ w, hidden: hidden.has(i) }));
}
export const RECALL_LEVELS = ['Hiện hết', 'Ẩn 25%', 'Ẩn 50%', 'Ẩn 75%', 'Ẩn hết'];
