// OPIc Drama · logic thuần (không giao diện): chấm điều kiện mở khoá trên máy và tiến độ truyện.
// Điều kiện đạt lấy từ app/www/drama/<tuyến>/manifest.json (sinh bởi tools/drama/build.py --app).
// Đây là ngưỡng luyện tập do app đặt ra, không phải tiêu chí chấm OPIc.
import { words, connectorsUsed, tenseMarkers } from './analysis.js';
import { LEVEL_SCORE } from './util.js';

// ---------- Đếm cụm từ (khớp dài nhất trước, không đếm chồng) ----------
const toks = (list) => list.map((p) => words(p)).filter((x) => x.length).sort((a, b) => b.length - a.length);
export function countMarkers(w, list) {
  const L = toks(list);
  const found = [];
  for (let i = 0; i < w.length; ) {
    const m = L.find((p) => p.every((x, k) => w[i + k] === x));
    if (m) {
      found.push(m.join(' '));
      i += m.length;
    } else i++;
  }
  return { n: found.length, found: [...new Set(found)] };
}

export const SEQUENCE = ['first', 'firstly', 'first of all', 'second', 'secondly', 'third', 'thirdly', 'then', 'and then', 'after that', 'next', 'finally', 'lastly', 'afterwards', 'before that', 'after this', 'once', 'at last'];
export const CONCLUSION = ['in the end', 'finally', 'eventually', 'at the end of the day', 'in conclusion', 'all in all', 'at last', 'in short', 'overall', 'to sum up'];
export const PRESENT_MARK = ['now', 'right now', 'these days', 'nowadays', 'today', 'currently', 'at the moment', 'at present', 'these years', 'this year', 'recently'];
export const PAST_MARK = ['used to', 'in the past', 'back then', 'before', 'at that time', 'years ago', 'when i started', 'when i first', 'in the old days', 'previously'];
export const SOLUTION = ['should', 'need to', 'needs to', 'have to', 'has to', 'must', 'important to', 'we can', 'they can', 'companies can', 'the best way', 'solution', 'solve', 'fix', 'prevent', 'improve', 'make sure', 'it would be better'];
export const EXAMPLE = ['for example', 'for instance', 'such as', 'like when', 'one time', 'take for example', 'to give you an example', 'last year', 'last month'];
export const ALTERNATIVES = ['we could', 'i could', 'you could', 'we can also', 'another option', 'other option', 'alternatively', 'or maybe', 'or we can', 'or we could', 'or i can', 'or i could', 'instead', 'how about', 'what about', 'if not', 'otherwise', 'plan b', 'second option', 'one option', 'option one', 'option two', 'another way', 'another idea'];
const PEOPLE_ROLES = ['coworker', 'co worker', 'colleague', 'leader', 'team leader', 'group leader', 'part leader', 'manager', 'boss', 'supervisor', 'senior', 'junior', 'partner', 'engineer', 'director', 'customer', 'client', 'team', 'teammate', 'operator', 'inspector', 'technician', 'mentor', 'friend', 'staff', 'member', 'worker', 'buyer', 'supplier', 'vendor'];
const NAME_STOP = new Set('I OK Okay So And But Then When Well Also First Second Third Next Finally After Before Because Yes No Um Uh My The This That These Those There We They He She It You Our Their In On At For With Actually Anyway Honestly Basically Mr Mrs Ms Dr Vietnam Vietnamese Korea Korean English Samsung OQC OPIc AI Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Bac Ninh Hanoi Seoul God Oh Hi Hello Thanks Thank Sorry Could Can Would Will What Who Where Why How Which Is Are Do Does Did'.split(' '));

// Người cụ thể: vai trò (coworker, leader…) + tên riêng (chữ hoa giữa câu). Đếm số người khác nhau.
export function peopleMentions(text) {
  const w = words(text).map((x) => (x.length > 3 && x.endsWith('s') && !x.endsWith('ss') ? x.slice(0, -1) : x));
  const roles = countMarkers(w, PEOPLE_ROLES).found;
  const names = new Set();
  const re = /[^.!?\s]\s+([A-Z][a-z]{1,15})\b/g; // bỏ chữ hoa đầu câu
  let m;
  const s = String(text || '');
  while ((m = re.exec(s))) {
    if (!NAME_STOP.has(m[1])) names.add(m[1]);
    re.lastIndex = m.index + m[0].length - m[1].length; // cho phép hai tên liền nhau
  }
  return { n: roles.length + names.size, found: [...roles, ...names] };
}

// Câu hỏi: dấu "?" hoặc mẫu đảo trợ động từ (could you, is there…) / từ hỏi + trợ động từ (what time, when does…).
const AUX_Q = /^(could|can|would|will|do|does|did|is|are|may|should|shall|have)$/;
const SUBJ = /^(you|i|we|it|there|they|he|she|the|this|that|my|our|your|anyone|someone)$/;
const WH = /^(what|when|where|who|which|why|how|whom|whose)$/;
const WH_NEXT = /^(is|are|was|were|will|would|do|does|did|can|could|should|time|kind|type|long|much|many|about|exactly|day|date|happens|if)$/;
export function questionCount(text) {
  const w = words(text);
  let n = 0;
  let last = -9;
  for (let i = 0; i < w.length - 1; i++) {
    const hit = (AUX_Q.test(w[i]) && SUBJ.test(w[i + 1]) && !(w[i] === 'is' && w[i + 1] === 'the') && !(i > 0 && WH.test(w[i - 1]))) || (WH.test(w[i]) && WH_NEXT.test(w[i + 1]));
    if (hit && i - last > 5) { // câu hỏi lồng (could you tell me what time…) tính một
      n++;
      last = i;
    }
  }
  const marks = (String(text || '').match(/\?/g) || []).length;
  return Math.max(n, marks);
}

function ideas(text, groups) {
  const w = words(text);
  const hit = [];
  const miss = [];
  for (const [name, list] of Object.entries(groups || {})) (countMarkers(w, list).n ? hit : miss).push(name);
  return { n: hit.length, hit, miss };
}

// Một điều kiện → { got, detail }
function measure(c, text, w) {
  switch (c.type) {
    case 'ideas': {
      const r = ideas(text, c.groups);
      return { got: r.n, detail: r.miss.length ? `thiếu: ${r.miss.join(', ')}` : `đủ: ${r.hit.join(', ')}` };
    }
    case 'sequence': {
      const r = countMarkers(w, SEQUENCE);
      return { got: r.n, detail: r.found.join(', ') };
    }
    case 'pastVerbs':
      return { got: tenseMarkers(w).pastVerbs, detail: '' };
    case 'people': {
      const r = peopleMentions(text);
      return { got: r.n, detail: r.found.slice(0, 5).join(', ') };
    }
    case 'conclusion': {
      const r = countMarkers(w, CONCLUSION);
      return { got: r.n, detail: r.found.join(', ') };
    }
    case 'pastPresent': {
      const past = countMarkers(w, PAST_MARK).n + tenseMarkers(w).pastVerbs;
      const now = countMarkers(w, PRESENT_MARK).n;
      return { got: Math.min(past, now), detail: `quá khứ ${past} · hiện tại ${now}` };
    }
    case 'solution': {
      const r = countMarkers(w, SOLUTION);
      return { got: r.n, detail: r.found.join(', ') };
    }
    case 'example': {
      const r = countMarkers(w, EXAMPLE);
      return { got: r.n, detail: r.found.join(', ') };
    }
    case 'questions':
      return { got: questionCount(text), detail: '' };
    case 'alternatives': {
      const r = countMarkers(w, ALTERNATIVES);
      return { got: r.n, detail: r.found.join(', ') };
    }
    default:
      return { got: 0, detail: `không rõ điều kiện ${c.type}` };
  }
}

// Chấm một câu trả lời theo rule {words, connectors, checks[]} → { pass, items[] }
export function evaluateRule(text, rule) {
  const w = words(text);
  const items = [];
  const nW = w.length;
  items.push({ key: 'words', label: `Nói từ ${rule.words} từ trở lên`, need: rule.words, got: nW, ok: nW >= rule.words, detail: '' });
  if (rule.connectors) {
    const c = connectorsUsed(w);
    items.push({ key: 'connectors', label: `Dùng từ ${rule.connectors} từ nối khác nhau trở lên`, need: rule.connectors, got: c.length, ok: c.length >= rule.connectors, detail: c.slice(0, 8).join(', ') });
  }
  for (const c of rule.checks || []) {
    const r = measure(c, text, w);
    items.push({ key: c.type, label: c.label || c.type, need: c.min, got: r.got, ok: r.got >= c.min, detail: r.detail });
  }
  return { pass: items.every((x) => x.ok), items };
}

// ---------- Tiến độ ----------
// state = { hearts, eps: { [ep]: { passed:{q1:ts}, failed:{q1:true}, last:{q1:{pass,items,at}}, coachOk, coachLabel, bonusGiven, read } } }
export const emptyState = () => ({ v: 1, hearts: 0, eps: {} });
const epState = (state, ep) => (state.eps[ep] ||= { passed: {}, failed: {}, last: {}, coachOk: false, bonusGiven: false });

export const isCompleted = (state, e) => e.questions.every((q) => state.eps[e.ep]?.passed?.[q.id]);
export function isUnlocked(state, manifest, ep) {
  if (ep === manifest.episodes[0].ep) return true;
  const prev = manifest.episodes.find((x) => x.ep === ep - 1);
  return !!prev && isCompleted(state, prev);
}
export const bonusOpen = (state, e) => isCompleted(state, e) && !!state.eps[e.ep]?.coachOk;
export const bonusCount = (state, manifest) => manifest.episodes.filter((e) => bonusOpen(state, e)).length;
export const epilogueOpen = (state, manifest) => bonusCount(state, manifest) >= (manifest.route.epilogueNeedsBonus || 5);

// Nhận phần thưởng cảnh thưởng khi đủ điều kiện (gọi sau mỗi lần thay đổi).
function settle(state, e) {
  const s = epState(state, e.ep);
  let gained = 0;
  if (bonusOpen(state, e) && !s.bonusGiven) {
    s.bonusGiven = true;
    gained = e.bonus?.hearts || 0;
    state.hearts += gained;
  }
  return gained;
}

// Ghi kết quả một lần trả lời câu hỏi qkey ('q1'…) của tập e. Trả về những gì vừa mở được.
export function applyAnswer(state, e, qkey, result, now = Date.now()) {
  const q = e.questions.find((x) => x.id === qkey);
  const s = epState(state, e.ep);
  const wasDone = isCompleted(state, e);
  s.last[qkey] = { pass: result.pass, items: result.items, at: now };
  let gained = 0;
  let newlyPassed = false;
  if (result.pass) {
    if (!s.passed[qkey]) {
      s.passed[qkey] = now;
      newlyPassed = true;
      gained += q?.hearts || 0;
      state.hearts += q?.hearts || 0;
    }
    delete s.failed[qkey];
  } else if (!s.passed[qkey]) s.failed[qkey] = true;
  const completed = !wasDone && isCompleted(state, e);
  const bonus = settle(state, e);
  return { newlyPassed, completed, hearts: gained + bonus, bonusOpened: bonus > 0 };
}

// Kết quả AI Coach cho câu hỏi của tập: đạt mục tiêu luyện tập → mở cảnh thưởng.
export function applyCoach(state, e, label, target) {
  const s = epState(state, e.ep);
  const ok = label in LEVEL_SCORE && target in LEVEL_SCORE && LEVEL_SCORE[label] >= LEVEL_SCORE[target];
  s.coachLabel = label;
  if (ok) s.coachOk = true;
  const bonus = settle(state, e);
  return { ok, hearts: bonus, bonusOpened: bonus > 0 };
}

// Phần nào của tập đang hiện: 'show' | 'locked' | 'hidden'. Phần câu hỏi chưa đạt → 'locked' và dừng đọc ở đó.
export function sectionState(state, manifest, e, sec) {
  const s = state.eps[e.ep] || {};
  const need = sec.need;
  if (!need) return 'show';
  if (need.startsWith('fail:')) {
    const q = need.slice(5);
    return s.failed?.[q] && !s.passed?.[q] ? 'show' : 'hidden';
  }
  if (need === 'bonus') return bonusOpen(state, e) ? 'show' : 'locked';
  if (need === 'epilogue') return epilogueOpen(state, manifest) ? 'show' : 'locked';
  return s.passed?.[need] ? 'show' : 'locked';
}

// Bộ sưu tập: photocard của các tập đã hoàn thành.
export const photocards = (state, manifest) =>
  manifest.episodes.filter((e) => e.photocard).map((e) => ({ ep: e.ep, name: e.photocard.name, panel: e.photocard.panel, dir: e.dir, owned: isCompleted(state, e) }));
