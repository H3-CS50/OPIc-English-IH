// OPIc Drama (Luyện → 🎬 Drama): đọc truyện tranh, trả lời câu hỏi OPIc cuối tập để mở phần tiếp.
// Đạt/chưa đạt chấm trên máy (Phân tích bài nói, không tốn lượt AI). Cảnh thưởng mở khi AI Coach ước tính
// đạt mục tiêu luyện tập. Tiến độ lưu trên máy (localStorage).
import { $, escapeHtml, store, toast } from './util.js';
import { getQuestion } from './data.js';
import { settings } from './settings.js';
import { openQuestion, refreshDramaBanner } from './practice.js';
import * as DR from './drama-core.js';
import MINA from '../www/drama/mina/manifest.json';

const M = MINA;
const BASE = `drama/${M.route.id}`;
const KEY = `drama.${M.route.id}`;
const LEVEL_VI = { below_IM: 'dưới IM', IM: 'IM', IM_IH_borderline: 'giữa IM và IH', IH: 'IH', IH_AL_borderline: 'giữa IH và AL', AL: 'AL' };

let state = load();
const ui = { ep: null, focus: null };

function load() {
  const s = store.get(KEY, null);
  return s && typeof s === 'object' && s.eps && typeof s.hearts === 'number' ? s : DR.emptyState();
}
const save = () => store.set(KEY, state);
const epOf = (n) => M.episodes.find((e) => e.ep === Number(n));
const img = (e, k) => `${BASE}/${e.dir}/${k}.webp`;
const visible = () => !$('practice-drama').hidden && $('tab-practice').classList.contains('active');

// ---------- Danh sách tập ----------
function statusOf(e) {
  if (!DR.isUnlocked(state, M, e.ep)) return { cls: 'locked', text: `🔒 Qua Tập ${e.ep - 1} để mở` };
  if (DR.isCompleted(state, e)) return { cls: 'done', text: DR.bonusOpen(state, e) ? '✅ Hoàn thành · 🎁' : '✅ Hoàn thành' };
  const s = state.eps[e.ep];
  const passed = e.questions.filter((q) => s?.passed?.[q.id]).length;
  return { cls: 'open', text: e.questions.length > 1 && passed ? `▶ Đang đọc · ${passed}/${e.questions.length} câu` : '▶ Đọc' };
}

function listHTML() {
  const cards = DR.photocards(state, M);
  const owned = cards.filter((c) => c.owned).length;
  const bonus = DR.bonusCount(state, M);
  const eps = M.episodes
    .map((e) => {
      const st = statusOf(e);
      return `<button class="dr-ep ${st.cls}" data-dr-ep="${e.ep}" aria-label="Tập ${e.ep}: ${escapeHtml(e.title)}">
        <img src="${img(e, 'COVER')}" alt="" loading="lazy" width="${e.panels.COVER[0]}" height="${e.panels.COVER[1]}">
        <span class="dr-ep-st">${st.text}</span>
        <span class="dr-ep-t"><b>Tập ${e.ep}</b> · ${escapeHtml(e.title)}</span></button>`;
    })
    .join('');
  const pcs = cards
    .map((c) =>
      c.owned
        ? `<button class="dr-pc" data-dr-view="${c.dir}/${c.panel}" aria-label="Photocard ${escapeHtml(c.name)}"><img src="${BASE}/${c.dir}/${c.panel}.webp" alt="" loading="lazy"><span>${escapeHtml(c.name)}</span></button>`
        : `<div class="dr-pc lock"><div>🔒</div><span>Tập ${c.ep}</span></div>`,
    )
    .join('');
  return `<div class="card dr-hero">
      <div class="dr-hero-k">OPIc DRAMA · TUYẾN ${escapeHtml(M.route.name.toUpperCase())}</div>
      <p>${escapeHtml(M.route.blurb)}</p>
      <div class="dr-stats"><span><b>♥ ${state.hearts}</b> tim</span><span><b>${owned}/${cards.length}</b> photocard</span><span><b>${bonus}/${M.episodes.length}</b> cảnh thưởng</span></div>
      <p class="muted small">Truyện tạo bằng AI · nhân vật hư cấu. Ngưỡng "đạt" là ngưỡng luyện tập của app, không phải điểm OPIc chính thức.</p>
    </div>
    <div class="dr-grid">${eps}</div>
    <h3>🖼️ Bộ sưu tập photocard</h3>
    <div class="dr-pcs">${pcs}</div>
    <p class="muted small">Cảnh thưởng mở khi AI Coach ước tính đạt mục tiêu luyện tập (${escapeHtml(settings.target)}). Mở đủ ${M.route.epilogueNeedsBonus} cảnh thưởng để xem Epilogue ở Tập ${M.episodes.at(-1).ep}.</p>`;
}

// ---------- Đọc một tập ----------
function needsHTML(q, last) {
  const items = last?.items;
  const base = [`Nói từ ${q.rule.words} từ trở lên`, ...(q.rule.connectors ? [`Dùng từ ${q.rule.connectors} từ nối khác nhau trở lên`] : []), ...q.rule.checks.map((c) => c.label)];
  if (!items) return `<ul class="dr-checks">${base.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
  return `<ul class="dr-checks res">${items
    .map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? '✓' : '✗'} ${escapeHtml(x.label)} <span class="muted">(${x.got}/${x.need}${x.detail ? ` · ${escapeHtml(x.detail)}` : ''})</span></li>`)
    .join('')}</ul>`;
}

function askHTML(e, q) {
  const s = state.eps[e.ep] || {};
  const passed = !!s.passed?.[q.id];
  const last = s.last?.[q.id];
  const qq = getQuestion(q.qid);
  const n = e.questions.length;
  const head = n > 1 ? `Câu ${e.questions.indexOf(q) + 1}/${n}` : 'Câu hỏi cuối tập';
  return `<div class="dr-ask ${passed ? 'passed' : ''}" id="dr-q-${q.id}">
    <div class="dr-ask-k">🎤 ${head} · ${escapeHtml(q.qid)}${passed ? ' · <span class="dr-ok">✅ Đã đạt</span>' : ''}</div>
    ${qq ? `<p class="dr-ask-q">${escapeHtml(qq.question_text)}</p>` : ''}
    <div class="muted small">${passed ? (last?.pass ? 'Lần đạt gần nhất:' : 'Điều kiện đạt:') : last ? 'Lần trước:' : 'Cần để đạt:'}</div>
    ${needsHTML(q, passed && !last?.pass ? null : last)}
    <button class="btn ${passed ? '' : 'primary'} btn-block" data-dr-answer="${q.id}">${passed ? '🎤 Nói lại để luyện thêm' : last ? '🎤 Nói lại' : '🎤 Trả lời câu này'}</button>
    <div class="muted small">Nói xong app tự phân tích trên máy, không tốn lượt AI. Bấm 🤖 AI Coach để có nhận xét chi tiết${e.bonus ? ' và mở cảnh thưởng' : ''}.</div>
  </div>`;
}

function lockHTML(e, sec) {
  if (sec.need === 'bonus') {
    const s = state.eps[e.ep] || {};
    const est = s.coachLabel ? ` Lần chấm gần nhất: ${LEVEL_VI[s.coachLabel] || s.coachLabel}.` : '';
    return `<div class="dr-lock" id="dr-sec-${sec.id}">🎁 <b>Cảnh thưởng · “${escapeHtml(e.bonus?.name || '')}”</b>
      <p>Mở khi AI Coach ước tính bài trả lời đạt mục tiêu luyện tập <b>${escapeHtml(settings.target)}</b> (+${e.bonus?.hearts || 0} ♥).${escapeHtml(est)}</p>
      <button class="btn small-btn" data-dr-answer="${e.questions.at(-1).id}">🎤 Trả lời và chấm AI Coach</button>
      <p class="muted small">Đây là ước tính luyện tập, không phải điểm OPIc chính thức.</p></div>`;
  }
  if (sec.need === 'epilogue')
    return `<div class="dr-lock" id="dr-sec-${sec.id}">🌙 <b>Epilogue</b><p>Mở khi đã mở từ ${M.route.epilogueNeedsBonus} cảnh thưởng trong tuyến (đang có ${DR.bonusCount(state, M)}).</p></div>`;
  return `<div class="dr-lock" id="dr-sec-${sec.id}">🔒 Trả lời đạt câu hỏi phía trên để mở phần tiếp.</div>`;
}

function readerHTML(e) {
  const cards = new Map(e.questions.map((q) => [q.card, q]));
  const out = [];
  for (const sec of e.sections) {
    const vis = DR.sectionState(state, M, e, sec);
    if (vis === 'hidden') continue;
    if (vis === 'locked') {
      out.push(lockHTML(e, sec));
      if (!['bonus', 'epilogue'].includes(sec.need)) break; // chưa đạt câu hỏi: dừng ở đây
      continue;
    }
    out.push(`<div class="dr-sec" id="dr-sec-${sec.id}">`);
    for (const k of sec.panels) {
      const [w, h] = e.panels[k];
      out.push(`<img class="dr-panel" src="${img(e, k)}" width="${w}" height="${h}" loading="lazy" alt="">`);
      if (cards.has(k)) out.push(askHTML(e, cards.get(k)));
    }
    out.push('</div>');
  }
  const next = epOf(e.ep + 1);
  const done = DR.isCompleted(state, e);
  const foot = done
    ? next
      ? `<button class="btn primary btn-block" data-dr-ep="${next.ep}">▶ Tập ${next.ep} · ${escapeHtml(next.title)}</button>`
      : `<p class="dr-end">🎉 Hết tuyến ${escapeHtml(M.route.name)}. Cảm ơn anh đã đồng hành!</p>`
    : '';
  return `<div class="dr-top"><button class="btn small-btn" data-dr-list>◀ Các tập</button>
      <div class="dr-top-t"><b>Tập ${e.ep}</b> · ${escapeHtml(e.title)}</div><span class="dr-hearts">♥ ${state.hearts}</span></div>
    <div class="dr-strip">${out.join('')}</div>
    <div class="dr-foot">${foot}<button class="btn btn-block" data-dr-list>◀ Danh sách tập</button></div>`;
}

export function renderDrama() {
  const root = $('drama-root');
  if (!root) return;
  const e = ui.ep && epOf(ui.ep);
  root.innerHTML = e && DR.isUnlocked(state, M, e.ep) ? readerHTML(e) : listHTML();
  if (ui.focus) {
    const el = $(ui.focus);
    ui.focus = null;
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }
}

function openEp(n, focus = null) {
  const e = epOf(n);
  if (!e) return;
  if (!DR.isUnlocked(state, M, e.ep)) return toast(`🔒 Trả lời đạt câu hỏi cuối Tập ${e.ep - 1} để mở Tập ${e.ep}.`, 3500);
  ui.ep = e.ep;
  ui.focus = focus;
  renderDrama();
  if (!focus) window.scrollTo(0, 0);
}

// ---------- Trả lời câu hỏi (sang màn Luyện tự do) ----------
function bannerHTML(e, q) {
  const s = state.eps[e.ep] || {};
  const passed = !!s.passed?.[q.id];
  const last = s.last?.[q.id];
  const n = e.questions.length;
  const lead = passed
    ? `<div class="dr-ok"><b>✅ Đạt!</b> Đã mở phần tiếp của truyện.</div>`
    : last
      ? `<div><b>Chưa đạt</b>, xem mục ✗ rồi nói lại nhé.</div>`
      : `<div class="muted small">Trả lời đạt để mở phần tiếp. App chấm trên máy ngay khi anh dừng ghi.</div>`;
  return `<div class="dr-banner"><div><b>🎬 ${escapeHtml(M.route.name)} · Tập ${e.ep} · ${escapeHtml(e.title)}</b>${n > 1 ? ` <span class="muted small">câu ${e.questions.indexOf(q) + 1}/${n}</span>` : ''}</div>
    ${lead}
    ${needsHTML(q, passed && !last?.pass ? null : last)}
    <div class="row wrap"><button class="btn small-btn ${passed ? 'primary' : ''}" data-drama-nav="read">📖 ${passed ? 'Đọc tiếp' : 'Về truyện'}</button></div>
    ${e.bonus ? `<div class="muted small">🎁 Bấm 🤖 AI Coach: ước tính đạt mục tiêu ${escapeHtml(settings.target)} sẽ mở cảnh thưởng “${escapeHtml(e.bonus.name)}”.</div>` : ''}</div>`;
}

function answer(e, qkey) {
  const q = e.questions.find((x) => x.id === qkey);
  if (!q) return;
  openQuestion(q.qid, { drama: { ep: e.ep, q: q.id, qid: q.qid, bannerHTML: () => bannerHTML(e, q) } });
}

function onAnswer({ ep, q, text }) {
  const e = epOf(ep);
  const qq = e?.questions.find((x) => x.id === q);
  if (!qq || !String(text || '').trim()) return;
  const r = DR.evaluateRule(text, qq.rule);
  const g = DR.applyAnswer(state, e, q, r);
  save();
  refreshDramaBanner();
  if (g.newlyPassed) {
    const pc = g.completed && e.photocard ? ` · Photocard “${e.photocard.name}”` : '';
    const nx = g.completed && epOf(e.ep + 1) ? ` · Mở Tập ${e.ep + 1}` : '';
    toast(`✅ Đạt! +${g.hearts} ♥${nx}${pc}`, 4000);
  }
  if (visible()) renderDrama();
}

function onCoach({ ep, label }) {
  const e = epOf(ep);
  if (!e || !label) return;
  const g = DR.applyCoach(state, e, label, settings.target);
  save();
  refreshDramaBanner();
  if (g.bonusOpened) toast(`🎁 Mở cảnh thưởng “${e.bonus.name}” · +${g.hearts} ♥`, 4500);
  else if (!g.ok && e.bonus) toast(`AI Coach ước tính ${LEVEL_VI[label] || label}. Cảnh thưởng cần mục tiêu ${settings.target}.`, 4000);
  else if (g.ok && !DR.isCompleted(state, e)) toast('🎁 AI Coach đạt mục tiêu. Qua câu hỏi của tập là mở cảnh thưởng.', 4000);
}

// ---------- Xem photocard ----------
function viewImage(path) {
  const v = document.createElement('div');
  v.className = 'dr-viewer';
  v.innerHTML = `<img src="${BASE}/${path}.webp" alt=""><div class="dr-viewer-x">Chạm để đóng</div>`;
  v.addEventListener('click', () => v.remove());
  document.body.appendChild(v);
}

export function initDrama() {
  const root = $('drama-root');
  root.addEventListener('click', (ev) => {
    const t = ev.target.closest('button');
    if (!t) return;
    if (t.dataset.drEp) return openEp(t.dataset.drEp);
    if (t.hasAttribute('data-dr-list')) {
      ui.ep = null;
      renderDrama();
      return window.scrollTo(0, 0);
    }
    if (t.dataset.drAnswer) return answer(epOf(ui.ep), t.dataset.drAnswer);
    if (t.dataset.drView) return viewImage(t.dataset.drView);
  });
  window.addEventListener('opic:pview-changed', (ev) => ev.detail === 'drama' && renderDrama());
  window.addEventListener('opic:drama-answer', (ev) => onAnswer(ev.detail));
  window.addEventListener('opic:drama-coach', (ev) => onCoach(ev.detail));
  window.addEventListener('opic:drama-open', (ev) => {
    const { ep, q } = ev.detail || {};
    const e = epOf(ep);
    const secIdx = e ? e.sections.findIndex((s) => s.need === q) : -1;
    const focus = secIdx >= 0 && DR.sectionState(state, M, e, e.sections[secIdx]) === 'show' ? `dr-sec-${e.sections[secIdx].id}` : `dr-q-${q}`;
    window.dispatchEvent(new CustomEvent('opic:practice-view', { detail: 'drama' }));
    openEp(ep, focus);
  });
  if (!$('practice-drama').hidden) renderDrama();
}
