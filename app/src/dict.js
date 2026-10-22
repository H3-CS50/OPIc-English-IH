// Từ điển trong app: nghĩa tiếng Việt (gloss.json, AI soạn cho ~2.800 từ gốc có trong app)
// + phiên âm IPA Anh–Mỹ (www/dict/ipa-en.txt, ipa-dict/cmudict, MIT) tải khi cần.
import GLOSS from './gloss.json';
import { norm } from './vocab-core.js';

export const POS_VI = {
  n: 'danh từ', v: 'động từ', adj: 'tính từ', adv: 'trạng từ', prep: 'giới từ', conj: 'liên từ', pron: 'đại từ',
  det: 'từ hạn định', num: 'số từ', int: 'thán từ', aux: 'trợ động từ', phr: 'cụm từ', abbr: 'viết tắt',
};

// Dạng bất quy tắc thường gặp → từ gốc (động từ, danh từ số nhiều, so sánh).
const IRREG = Object.fromEntries(
  `am be|is be|are be|was be|were be|been be|being be|has have|had have|having have|does do|did do|done do|doing do
went go|gone go|goes go|came come|took take|taken take|made make|got get|gotten get|gave give|given give|saw see|seen see
knew know|known know|thought think|brought bring|bought buy|caught catch|taught teach|felt feel|left leave|kept keep
slept sleep|met meet|sent send|spent spend|built build|lent lend|lost lose|paid pay|said say|told tell|sold sell|heard hear
held hold|stood stand|understood understand|found find|ran run|sat sit|began begin|begun begin|drank drink|drunk drink
swam swim|sang sing|sung sing|rang ring|wrote write|written write|rode ride|ridden ride|drove drive|driven drive
ate eat|eaten eat|fell fall|fallen fall|forgot forget|forgotten forget|got get|grew grow|grown grow|threw throw|thrown throw
flew fly|flown fly|drew draw|drawn draw|wore wear|worn wear|broke break|broken break|chose choose|chosen choose|spoke speak
spoken speak|woke wake|woken wake|stole steal|stolen steal|froze freeze|frozen freeze|hid hide|hidden hide|bit bite
shook shake|shaken shake|led lead|fed feed|fled flee|won win|hung hang|dug dig|stuck stick|struck strike|swept sweep
wept weep|meant mean|dealt deal|dreamt dream|learnt learn|burnt burn|spelt spell|spilt spill|lit light|shot shoot
became become|forgave forgive|forgiven forgive|mistook mistake|mistaken mistake|overslept oversleep|withdrew withdraw
rose rise|risen rise|told tell|beat beat|cost cost|cut cut|hit hit|hurt hurt|let let|put put|quit quit|read read|set set|shut shut|split split|spread spread
children child|men man|women woman|people person|feet foot|teeth tooth|mice mouse|geese goose|knives knife|wives wife
lives life|leaves leaf|shelves shelf|halves half|loaves loaf|thieves thief|wolves wolf
better good|best good|worse bad|worst bad|more many|most many|less little|least little|further far|farther far
me i|my i|mine i|us we|our we|him he|his he|them they|their they|her she|an a
these this|those that|blew blow|blown blow|fought fight|shown show|laid lay|prepaid prepay|beaten beat|withdrawn withdraw|withdrew withdraw|bacteria bacterium|lay lie|lain lie`
    .split(/[|\n]/)
    .map((p) => p.trim().split(' '))
    .filter((p) => p.length === 2),
);

const CONTRACT = {
  "can't": 'can', "won't": 'will', "don't": 'do', "doesn't": 'do', "didn't": 'do', "isn't": 'be', "aren't": 'be',
  "wasn't": 'be', "weren't": 'be', "couldn't": 'could', "wouldn't": 'would', "shouldn't": 'should', "haven't": 'have',
  "hasn't": 'have', "hadn't": 'have', "i'm": 'i', "it's": 'it', "that's": 'that', "there's": 'there', "let's": 'let',
};

export const cleanWord = (w) =>
  String(w || '')
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/^[^a-z]+|[^a-z']+$/g, '')
    .replace(/'+$/, '');

// Các ứng viên từ gốc theo thứ tự ưu tiên.
export function lemmaCandidates(word) {
  const w = cleanWord(word);
  if (!w) return [];
  const out = [w];
  if (CONTRACT[w]) out.push(CONTRACT[w]);
  let base = w.replace(/'(s|re|ve|ll|d|m)$/, '');
  if (base !== w) out.push(base);
  if (IRREG[base]) out.push(IRREG[base]);
  const add = (x) => x && x.length >= 2 && out.push(x);
  const dbl = (s) => (/([b-df-hj-np-tv-z])\1$/.test(s) ? s.slice(0, -1) : null);
  if (base.endsWith('children')) add(base.slice(0, -8) + 'child');
  if (base.endsWith('men')) add(base.slice(0, -3) + 'man');
  if (base.endsWith('ies')) add(base.slice(0, -3) + 'y');
  if (base.endsWith('ves')) {
    add(base.slice(0, -3) + 'f');
    add(base.slice(0, -3) + 'fe');
  }
  if (base.endsWith('es')) add(base.slice(0, -2));
  if (base.endsWith('s') && !base.endsWith('ss')) add(base.slice(0, -1));
  if (base.endsWith('ied')) add(base.slice(0, -3) + 'y');
  if (base.endsWith('ed')) {
    const s = base.slice(0, -2);
    add(s);
    add(s + 'e');
    add(dbl(s));
    add(base.slice(0, -1));
  }
  if (base.endsWith('ing')) {
    const s = base.slice(0, -3);
    add(s);
    add(s + 'e');
    add(dbl(s));
    if (s.endsWith('y')) add(s.slice(0, -1) + 'ie');
  }
  for (const suf of ['est', 'er']) {
    if (base.endsWith(suf)) {
      const s = base.slice(0, -suf.length);
      add(s);
      add(s + 'e');
      add(dbl(s));
      if (s.endsWith('i')) add(s.slice(0, -1) + 'y');
    }
  }
  if (base.endsWith('ily')) add(base.slice(0, -3) + 'y');
  if (base.endsWith('ly')) add(base.slice(0, -2));
  return [...new Set(out)];
}

export const glossOf = (w) => GLOSS[w] || null;
export const GLOSS_SIZE = Object.keys(GLOSS).length;

// Tra một từ (không cần phiên âm). Trả về từ gốc tìm được trong bảng nghĩa (nếu có).
export function lookupWord(word) {
  const w = cleanWord(word);
  const cands = lemmaCandidates(w);
  const lemma = cands.find((c) => GLOSS[c]) || null;
  return { word: w, lemma, entry: lemma ? GLOSS[lemma] : null, candidates: cands };
}

// ---------- Phiên âm (tải khi cần) ----------
let ipaMap = null;
let ipaLoading = null;
export function setIpaText(text) {
  ipaMap = new Map();
  for (const line of text.split('\n')) {
    const i = line.indexOf('\t');
    if (i > 0) ipaMap.set(line.slice(0, i), line.slice(i + 1));
  }
  return ipaMap.size;
}
export function loadIpa() {
  if (ipaMap) return Promise.resolve(ipaMap);
  if (!ipaLoading) {
    ipaLoading = fetch('dict/ipa-en.txt')
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
      .then((t) => (setIpaText(t), ipaMap))
      .catch((e) => {
        ipaLoading = null;
        throw e;
      });
  }
  return ipaLoading;
}
export const ipaLoaded = () => !!ipaMap;
// Phiên âm của dạng đang gặp; nếu không có thì của từ gốc.
export function ipaOf(word, lemma) {
  if (!ipaMap) return '';
  const w = cleanWord(word);
  return ipaMap.get(w) || (lemma && ipaMap.get(lemma)) || ipaMap.get(w.replace(/'s$/, '')) || '';
}
export const hasIpa = (w) => !!ipaMap && ipaMap.has(cleanWord(w));

// ---------- Tìm trong từ điển (Anh → Việt và Việt → Anh) ----------
const GLOSS_ROWS = Object.entries(GLOSS).map(([w, [pos, vi]]) => ({ w, pos, vi, key: norm(vi) }));
export function searchDict(q, limit = 30) {
  const raw = String(q || '').trim();
  const k = norm(raw).trim();
  if (!k) return [];
  const viTyped = /[^\x00-\x7f]/.test(raw); // gõ có dấu → chắc chắn là tiếng Việt
  const en = viTyped ? '' : cleanWord(k);
  const lem = en ? lookupWord(en).lemma : null;
  const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const viRe = k.length >= 2 ? new RegExp(`(^|[^a-z])${esc}([^a-z]|$)`) : null;
  const viStart = k.length >= 2 ? new RegExp(`(^|[^a-z])${esc}`) : null;
  const hits = [];
  for (const r of GLOSS_ROWS) {
    let score = -1;
    if (en && (r.w === en || r.w === lem)) score = 0;
    else if (viRe && r.key.split(/;\s*/).some((m) => m.replace(/\s*\(.*?\)\s*/g, '').trim() === k)) score = 1;
    else if (en && en.length >= 2 && r.w.startsWith(en)) score = 2;
    else if (viRe && viRe.test(r.key)) score = 3;
    else if (viStart && viStart.test(r.key)) score = 4;
    if (score >= 0) hits.push([score, r]);
  }
  hits.sort((a, b) => a[0] - b[0] || a[1].w.length - b[1].w.length || a[1].w.localeCompare(b[1].w));
  return hits.slice(0, limit).map((h) => h[1]);
}
