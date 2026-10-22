// Chạm vào một từ tiếng Anh bất kỳ → bảng tra: phiên âm, nghĩa tiếng Việt, cụm từ liên quan,
// lưu vào Sổ từ, hỏi AI nghĩa trong câu. Cũng cung cấp kết quả "Từ điển" cho ô tìm ở tab Từ vựng.
import { $, escapeHtml as esc, toast, store } from './util.js';
import { lookupWord, loadIpa, ipaOf, ipaLoaded, POS_VI, searchDict, cleanWord, dictLinks, machineTranslate } from './dict.js';
import { ALL, isMine, addMyWord, removeMyWord, speakable, norm } from './vocab-core.js';
import { lookupWordAI } from './coach.js';
import { settings } from './settings.js';
import { speak } from './speech.js';

export const LOOKUP_SELECTOR = '.q-text, .en-text, .sample-text, .v-ex, .v-it-ex, .v-it-en, .v-ex-box, .lookup';
const NO_LOOKUP = 'button, a, input, textarea, select, summary, label, .lk';

let cur = null; // { word, sentence, r, ai, aiLoading, aiError }
let onChange = () => {};
export const onMyWordsChange = (fn) => (onChange = fn);

// ---------- Tìm từ ở vị trí chạm ----------
function wordAtPoint(x, y) {
  let node = null;
  let offset = 0;
  if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    if (r) {
      node = r.startContainer;
      offset = r.startOffset;
    }
  } else if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (p) {
      node = p.offsetNode;
      offset = p.offset;
    }
  }
  if (!node || node.nodeType !== 3) return null;
  const text = node.textContent;
  const isW = (c) => !!c && /[A-Za-z'’-]/.test(c);
  let s = offset;
  let e = offset;
  while (s > 0 && isW(text[s - 1])) s--;
  while (e < text.length && isW(text[e])) e++;
  const word = text.slice(s, e).replace(/^[-'’]+|[-'’]+$/g, '');
  if (!/[A-Za-z]{1,}/.test(word)) return null;
  const host = node.parentElement?.closest(LOOKUP_SELECTOR);
  return { word, sentence: sentenceAround(host?.textContent || text, word) };
}

export function sentenceAround(text, word) {
  const parts = String(text).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/);
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  const s = parts.find((p) => re.test(p)) || '';
  return s.length > 220 ? `${s.slice(0, 217)}…` : s;
}

// ---------- Cụm từ trong bộ Từ vựng có chứa từ này ----------
function relatedPhrases(word, lemma, n = 4) {
  const keys = [...new Set([word, lemma].filter(Boolean))].map((k) => new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`));
  const out = [];
  for (const it of ALL) {
    if (it.mine) continue;
    const en = it.en.toLowerCase();
    if (en === word || en === lemma) {
      out.unshift(it);
      continue;
    }
    if (keys.some((re) => re.test(en)) && /\s/.test(en)) out.push(it);
    if (out.length >= 12) break;
  }
  return out.slice(0, n);
}

// ---------- Bảng tra ----------
function aiCacheKey(w, s) {
  return `${w}|${(s || '').slice(0, 80)}`;
}
function sheetHTML() {
  const { word, sentence, r, ai, aiLoading, aiError, mt, mtLoading, mtError } = cur;
  const head = r.lemma || word;
  const ipa = ipaOf(word, r.lemma) || (ai?.ipa ?? '');
  const meanings = r.entry ? r.entry[1].split(/;\s*/) : [];
  const phrases = relatedPhrases(word, r.lemma);
  const saved = isMine(head);
  const canSave = !!(r.entry || ai || mt);
  const aiReady = settings.provider === 'claude' || settings.provider === 'gemini';
  return `
  <div class="lk-head">
    <div><div class="lk-word">${esc(word)}</div>
      <div class="lk-ipa">${ipa ? esc(ipa) : ipaLoaded() ? '<span class="muted">(chưa có phiên âm)</span>' : '<span class="muted">đang tải phiên âm…</span>'}</div></div>
    <div class="lk-acts"><button class="btn small-btn" data-lk="say" aria-label="Nghe">🔊</button><button class="btn small-btn" data-lk="close" aria-label="Đóng">✕</button></div>
  </div>
  ${r.lemma && r.lemma !== word ? `<p class="small muted">Dạng gốc: <b>${esc(r.lemma)}</b></p>` : ''}
  ${r.entry
    ? `<div class="lk-mean"><span class="chip">${esc(POS_VI[r.entry[0]] || r.entry[0])}</span><ul>${meanings.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>`
    : `<p class="small">Chưa có nghĩa sẵn cho từ này trong app.${aiReady ? ' Bấm <b>🔎 Hỏi AI</b> để AI giải thích theo câu.' : ''}</p>
       ${mtLoading ? '<p class="small muted"><span class="spinner"></span> Đang tra trên mạng…</p>' : ''}
       ${mt ? `<div class="lk-mt"><div class="small muted">🌐 Nghĩa tham khảo (dịch máy MyMemory):</div><div class="lk-mt-text">${esc(mt)}</div><div class="muted small">Dịch máy có thể chưa đúng ngữ cảnh — mở từ điển bên dưới để xem đầy đủ.</div></div>` : ''}
       ${mtError ? `<p class="small muted">${esc(mtError)}</p>` : ''}`}
  ${sentence ? `<p class="lk-sent">“${esc(sentence)}”</p>` : ''}
  ${phrases.length ? `<div class="small"><b>📒 Trong bộ Từ vựng:</b><ul class="lk-phr">${phrases.map((it) => `<li><b>${esc(it.en)}</b> — ${esc(it.vi)}</li>`).join('')}</ul></div>` : ''}
  ${aiLoading ? '<p class="small muted"><span class="spinner"></span> AI đang tra…</p>' : ''}
  ${aiError ? `<p class="small">⚠️ ${esc(aiError)}</p>` : ''}
  ${ai ? `<div class="lk-ai"><div class="small muted">🔎 AI giải thích${sentence ? ' theo câu này' : ''}:</div>
      <div><b>${esc(ai.headword || head)}</b> ${ai.ipa ? `<span class="lk-ipa-inline">${esc(ai.ipa)}</span>` : ''} <span class="chip">${esc(ai.pos_vi || '')}</span></div>
      <div>${esc(ai.meaning_vi || '')}</div>
      ${ai.explanation_vi ? `<div class="small muted">${esc(ai.explanation_vi)}</div>` : ''}
      ${ai.example_en ? `<div class="small"><i>${esc(ai.example_en)}</i>${ai.example_vi ? `<br>${esc(ai.example_vi)}` : ''}</div>` : ''}
      <div class="muted small">Do AI trả lời, có thể chưa chính xác.</div></div>` : ''}
  <div class="lk-links"><span class="small muted">🌐 Tra trên mạng:</span> ${dictLinks(head).map((l) => `<a class="lk-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>
  <div class="row">
    ${saved
      ? `<button class="btn" data-lk="unsave">✓ Đã lưu · Bỏ lưu</button>`
      : `<button class="btn primary" data-lk="save" ${canSave ? '' : 'disabled'}>⭐ Lưu vào Sổ từ</button>`}
    <button class="btn" data-lk="ai" ${aiLoading ? 'disabled' : ''}>🔎 Hỏi AI</button>
  </div>`;
}
const render = () => cur && ($('lk-body').innerHTML = sheetHTML());

export function openLookup(word, sentence = '') {
  const w = cleanWord(word);
  if (!w) return;
  const r = lookupWord(w);
  const cached = store.get('aiLookup', {})[aiCacheKey(w, sentence)];
  cur = { word: w, sentence, r, ai: cached || null, aiLoading: false, aiError: '', mt: '', mtLoading: false, mtError: '' };
  render();
  $('lk').hidden = false;
  if (!ipaLoaded()) loadIpa().then(render, () => render());
  if (!r.entry && !cached) fetchMT(cur);
}

// Từ chưa có nghĩa sẵn: khi có mạng, lấy nghĩa tham khảo bằng dịch máy (có lưu tạm trên máy).
async function fetchMT(ref) {
  const cache = store.get('mtCache', {});
  if (cache[ref.word]) {
    ref.mt = cache[ref.word];
    return render();
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    ref.mtError = 'Máy đang không có mạng — chưa tra trên mạng được.';
    return render();
  }
  ref.mtLoading = true;
  render();
  try {
    ref.mt = await machineTranslate(ref.word);
    if (ref.mt) {
      const keys = Object.keys(cache);
      if (keys.length > 300) delete cache[keys[0]];
      cache[ref.word] = ref.mt;
      store.set('mtCache', cache);
    } else ref.mtError = 'Không tìm thấy nghĩa dịch máy — thử các từ điển bên dưới.';
  } catch {
    ref.mtError = 'Không kết nối được dịch vụ tra trên mạng — thử mở từ điển bên dưới.';
  }
  ref.mtLoading = false;
  if (cur === ref) render();
}

function close() {
  $('lk').hidden = true;
  cur = null;
}

async function askAI() {
  if (!cur || cur.aiLoading) return;
  if (settings.provider !== 'claude' && settings.provider !== 'gemini') {
    cur.aiError = 'Chưa chọn AI. Vào Cài đặt → AI Coach để nhập key Gemini (có gói miễn phí) hoặc Claude.';
    return render();
  }
  cur.aiLoading = true;
  cur.aiError = '';
  render();
  const ref = cur;
  const { result, error } = await lookupWordAI(settings, ref.word, ref.sentence);
  ref.aiLoading = false;
  if (result) {
    ref.ai = result;
    const cache = store.get('aiLookup', {});
    const keys = Object.keys(cache);
    if (keys.length > 150) delete cache[keys[0]];
    cache[aiCacheKey(ref.word, ref.sentence)] = result;
    store.set('aiLookup', cache);
  } else ref.aiError = error;
  if (cur === ref) render();
}

function save() {
  const { word, sentence, r, ai } = cur;
  const en = r.lemma || ai?.headword?.toLowerCase() || word;
  const vi = r.entry ? r.entry[1] : ai?.meaning_vi || (cur.mt ? `${cur.mt} (dịch máy)` : '');
  if (!vi) return;
  addMyWord({ en, vi, ex: sentence || ai?.example_en || '', ipa: ipaOf(word, r.lemma) || ai?.ipa || '' });
  toast(`⭐ Đã lưu "${en}" vào Sổ từ (tab Từ vựng).`);
  onChange();
  render();
}

function onTap(e) {
  if (e.defaultPrevented || e.button > 0) return;
  const t = e.target;
  if (!(t instanceof Element) || t.closest(NO_LOOKUP)) return;
  if (!t.closest(LOOKUP_SELECTOR)) return;
  const sel = window.getSelection?.();
  if (sel && !sel.isCollapsed) return;
  const hit = wordAtPoint(e.clientX, e.clientY);
  if (!hit) return;
  e.stopPropagation();
  e.preventDefault();
  openLookup(hit.word, hit.sentence);
}

export function initLookup() {
  document.addEventListener('click', onTap, true);
  $('lk').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lk]');
    if (!b || !cur) return;
    const a = b.dataset.lk;
    if (a === 'close') close();
    else if (a === 'say') speak(speakable(cur.word), settings.ttsRate).catch((er) => toast(er.message));
    else if (a === 'ai') askAI();
    else if (a === 'save') save();
    else if (a === 'unsave') {
      removeMyWord(cur.r.lemma || cur.word) || removeMyWord(cur.word);
      onChange();
      render();
    }
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && !$('lk').hidden && close());
}

// ---------- Kết quả "Từ điển" cho ô tìm ----------
export function dictResultsHTML(q) {
  const rows = searchDict(q, 25);
  const en = cleanWord(q);
  const isWord = /^[a-z][a-z'-]*$/.test(en);
  let html = '';
  if (rows.length) {
    html += `<div class="list-section">📖 Từ điển (${rows.length})</div>` +
      rows.map((r) => `<button class="lk-row" data-lkword="${esc(r.w)}"><span class="lk-row-w">${esc(r.w)}</span> <span class="lk-row-ipa">${esc(ipaOf(r.w) || '')}</span><span class="lk-row-m"><span class="muted">${esc(POS_VI[r.pos] || r.pos)}</span> · ${esc(r.vi)}</span></button>`).join('');
  }
  if (isWord && !rows.some((r) => r.w === en || r.w === lookupWord(en).lemma)) {
    const ipa = ipaOf(en);
    html += `<button class="lk-row lk-row-miss" data-lkword="${esc(en)}"><span class="lk-row-w">${esc(en)}</span> <span class="lk-row-ipa">${esc(ipa)}</span><span class="lk-row-m muted">Chưa có nghĩa sẵn — bấm để tra trên mạng (dịch máy, Glosbe, Google Dịch…) hoặc hỏi AI</span></button>`;
  }
  return html;
}
export function bindDictResults(root) {
  root.querySelectorAll('[data-lkword]').forEach((b) => b.addEventListener('click', () => openLookup(b.dataset.lkword, '')));
  if (!ipaLoaded()) loadIpa().then(() => root.isConnected && root.dispatchEvent(new CustomEvent('ipa-ready')), () => {});
}

export { norm };
