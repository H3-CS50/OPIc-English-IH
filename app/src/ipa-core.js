// Hàm thuần cho mục học IPA: tách phiên âm thành từng âm, tra ký hiệu, tiến độ, tạo câu luyện.
import { store } from './util.js';
import { logActivity } from './activity.js';
import { SOUNDS, PAIRS, LESSONS } from './ipa-data.js';

const MULTI = ['tʃ', 'dʒ', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ'];
export const SOUND_BY_SYM = new Map(SOUNDS.map((s) => [s.sym, s]));
export const soundOf = (sym) => SOUND_BY_SYM.get(sym) || null;

// "/ˈtitʃɝ/" → [{sym:'t', stress:'primary'}, {sym:'i'}, {sym:'tʃ'}, {sym:'ɝ'}]
// Dấu trọng âm gắn vào âm đầu tiên sau nó (là phụ âm hoặc nguyên âm đầu âm tiết).
export function tokenizeIpa(ipa) {
  const p = String(ipa || '').replace(/^\/|\/$/g, '').trim();
  const out = [];
  let stress = null;
  let i = 0;
  while (i < p.length) {
    const ch = p[i];
    if (ch === 'ˈ' || ch === 'ˌ') {
      stress = ch === 'ˈ' ? 'primary' : 'secondary';
      i++;
      continue;
    }
    if (/\s/.test(ch)) {
      out.push({ sym: ' ', space: true });
      i++;
      continue;
    }
    const m = MULTI.find((x) => p.startsWith(x, i));
    const sym = m || ch;
    out.push({ sym, stress, known: SOUND_BY_SYM.has(sym) });
    stress = null;
    i += sym.length;
  }
  return out;
}
export const hasSound = (ipa, sym) => tokenizeIpa(ipa).some((t) => t.sym === sym);

// ---------- Tiến độ ----------
const KEY = 'ipa';
let prog = store.get(KEY, null);
if (!prog || typeof prog !== 'object') prog = {};
prog.seen ||= {};
prog.lessons ||= {};
prog.quiz ||= { n: 0, ok: 0 };
const save = () => store.set(KEY, prog);
export const ipaProgress = () => ({
  seen: Object.keys(prog.seen).length,
  total: SOUNDS.length,
  lessons: Object.keys(prog.lessons).length,
  lessonTotal: LESSONS.length,
  quiz: { ...prog.quiz },
});
export const isSeen = (sym) => !!prog.seen[sym];
export function markSeen(sym) {
  if (!SOUND_BY_SYM.has(sym) || prog.seen[sym]) return;
  prog.seen[sym] = Date.now();
  save();
}
export const lessonDone = (id) => !!prog.lessons[id];
export function markLesson(id) {
  prog.lessons[id] = Date.now();
  save();
}
export function recordQuiz(ok) {
  prog.quiz.n++;
  if (ok) {
    prog.quiz.ok++;
    logActivity('ipa');
  }
  save();
}
export function resetIpa() {
  prog = { seen: {}, lessons: {}, quiz: { n: 0, ok: 0 } };
  save();
}

// ---------- Câu luyện ----------
const pickOne = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Nghe chọn từ: một cặp âm, máy đọc một từ.
export function pairQuestion(rnd = Math.random, focus = null) {
  const pool = focus ? PAIRS.filter((p) => p.focus.includes(focus)) : PAIRS;
  const p = pickOne(pool.length ? pool : PAIRS, rnd);
  const answer = rnd() < 0.5 ? 'a' : 'b';
  return { pair: p, word: p[answer], ipa: answer === 'a' ? p.ia : p.ib, options: rnd() < 0.5 ? ['a', 'b'] : ['b', 'a'] };
}

// Đọc phiên âm: cho phiên âm, chọn đúng từ trong 4 từ. ipaOf: hàm tra phiên âm của từ.
export function readQuestion(ipaOf, rnd = Math.random) {
  const all = SOUNDS.flatMap((s) => s.words.map(([w]) => w));
  const uniq = [...new Set(all)].filter((w) => ipaOf(w));
  const word = pickOne(uniq, rnd);
  const ipa = ipaOf(word);
  // Ưu tiên từ gây nhiễu là cặp dễ nhầm, sau đó là từ có độ dài gần bằng.
  const pairWords = PAIRS.filter((p) => p.a === word || p.b === word).map((p) => (p.a === word ? p.b : p.a));
  const others = shuffled(uniq.filter((w) => w !== word && !pairWords.includes(w) && ipaOf(w) !== ipa), rnd).sort(
    (x, y) => Math.abs(x.length - word.length) - Math.abs(y.length - word.length),
  );
  const distract = [...new Set([...pairWords, ...others.slice(0, 6)])].slice(0, 3);
  return { word, ipa, options: shuffled([word, ...distract], rnd) };
}

// So lời nói với từ cần nói (máy nhận dạng giọng nói có thể tự sửa từ — chỉ là kiểm tra gần đúng).
export function saidWord(heard, target) {
  const words = String(heard || '').toLowerCase().replace(/[^a-z'\s]/g, ' ').split(/\s+/).filter(Boolean);
  return { ok: words.includes(String(target).toLowerCase()), words };
}
