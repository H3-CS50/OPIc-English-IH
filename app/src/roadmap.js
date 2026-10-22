// Tab Luyện → 🗺️ Lộ trình: chinh phục từng chặng, từng chủ đề, từng combo.
import { $, escapeHtml, toast, store } from './util.js';
import { topicLabel, ptypeLabel, SOURCE_LABEL } from './data.js';
import { comboInfo } from './mock.js';
import { surveyTopics } from './mock-survey.js';
import { settings, saveSettings, onSettingsChange } from './settings.js';
import { listAttempts } from './history.js';
import { listMocks, onMocksChange } from './mock-history.js';
import { openQuestion } from './practice.js';
import { buildRoadmap, roadmapStatus, nextStep, spokenMap, onRoadmapChange, comboStars, indexAttempts } from './roadmap-core.js';

const ui = { view: store.get('pview', 'road'), stage: null, node: null, lastCombo: null };
let stages = null;
let status = null;

function compute() {
  if (!stages || stages.src !== `${settings.roadSource || 'both'}|${settings.includeOqc}|${JSON.stringify(settings.survey || null)}`) {
    const mine = surveyTopics(settings.survey, { oqc: settings.includeOqc }).topics;
    stages = buildRoadmap(comboInfo(), { source: settings.roadSource || 'both', oqc: settings.includeOqc, mine, topicLabel });
    stages.src = `${settings.roadSource || 'both'}|${settings.includeOqc}|${JSON.stringify(settings.survey || null)}`;
  }
  status = roadmapStatus(stages, { attempts: listAttempts(), spoken: spokenMap(), target: settings.target, mocks: listMocks() });
  return status;
}

const starHTML = (n) => `<span class="rm-stars" aria-label="${n} sao">${[1, 2, 3].map((i) => `<span class="${i <= n ? 'on' : ''}">★</span>`).join('')}</span>`;

function headerHTML(st) {
  const nodes = st.flatMap((s) => s.nodes);
  const done = nodes.filter((n) => n.done).length;
  const stars = nodes.reduce((a, n) => a + n.stars, 0);
  const nx = nextStep(st);
  const cleared = st.filter((s) => s.cleared).length;
  return `<div class="card rm-head">
      <div class="row between"><h3>🗺️ Lộ trình chinh phục</h3><span class="chip">Mục tiêu ${escapeHtml(settings.target)}</span></div>
      <div class="rm-sum"><div><b>${cleared}/${st.length}</b><span>chặng</span></div><div><b>${done}/${nodes.length}</b><span>chủ đề</span></div><div><b>${stars}★</b><span>/${nodes.length * 3}</span></div></div>
      ${nx ? `<button class="btn primary btn-block" data-rm-next>▶ Làm tiếp: ${escapeHtml(nx.stage.title)}${nx.node ? ' · ' + escapeHtml(nx.node.label) : ''}</button>` : '<p class="small">🎉 Bạn đã đạt 3★ mọi chủ đề đang mở!</p>'}
      <label class="field"><span>Bộ câu hỏi</span><select id="rm-source">${['both', 'class', 'app'].map((k) => `<option value="${k}" ${(settings.roadSource || 'both') === k ? 'selected' : ''}>${k === 'both' ? 'Cả hai bộ' : SOURCE_LABEL[k]}</option>`).join('')}</select></label>
      <details class="small rm-rules"><summary>Cách tính sao & mở chặng</summary>
        <ul>
          <li><b>★</b> nói hết các câu trong combo (mỗi câu từ 15 từ hoặc 20 giây trở lên, ở tab Luyện hoặc Thi thử).</li>
          <li><b>★★</b> thêm: mỗi câu được AI chấm gần mục tiêu (cách tối đa nửa bậc), hoặc tự kiểm tra đạt từ 70%.</li>
          <li><b>★★★</b> mọi câu được AI chấm đạt mục tiêu ${escapeHtml(settings.target)}.</li>
          <li>Chủ đề được tính là xong khi có ít nhất một combo đạt ★. Xong đủ số chủ đề yêu cầu thì mở chặng sau.</li>
          <li>Đổi mục tiêu IM/IH/AL thì sao ★★/★★★ được tính lại theo mục tiêu mới.</li>
        </ul></details>
    </div>`;
}

function nodePanelHTML(stage, node) {
  const idx = indexAttempts(listAttempts());
  return `<div class="rm-panel" data-panel="${escapeHtml(node.key)}">
    <div class="row between"><b>${escapeHtml(node.label)}</b>${starHTML(node.stars)}</div>
    ${node.mine ? '<p class="muted small">⭐ Chủ đề bạn chọn trong Background Survey (tab Thi thử).</p>' : ''}
    ${node.combos
      .map((c, i) => {
        const st = comboStars(c, { idx, spoken: spokenMap(), target: settings.target });
        return `<div class="rm-combo">
          <div class="row between"><span class="small"><b>${stage.id === 'intro' ? 'Câu' : 'Combo'} ${i + 1}</b> · ${escapeHtml(SOURCE_LABEL[c.source] || c.source)}</span>${starHTML(st.stars)}</div>
          <ol class="rm-qs">${c.qs.map((q) => `<li class="${spokenMap()[q.question_id] || idx.get(q.question_id)?.spoken ? 'ok' : ''}"><span class="muted small">${escapeHtml(ptypeLabel(q.prompt_type))}</span><div class="small en-text">${escapeHtml(q.question_text.length > 110 ? q.question_text.slice(0, 107) + '…' : q.question_text)}</div></li>`).join('')}</ol>
          <button class="btn ${st.stars ? '' : 'primary'} small-btn" data-rm-start="${escapeHtml(c.id)}">${st.done === 0 ? '▶ Bắt đầu' : st.done < st.total ? `▶ Làm tiếp (${st.done}/${st.total})` : '↺ Luyện lại'}</button>
        </div>`;
      })
      .join('')}
  </div>`;
}

function stageHTML(s, i) {
  const expanded = ui.stage === s.id;
  const lockMsg = i > 0 ? `Xong ${status[i - 1].need} chủ đề ở chặng "${status[i - 1].title}" để mở` : '';
  const pct = s.isBoss ? (s.cleared ? 100 : 0) : Math.round((100 * s.doneNodes) / Math.max(1, s.nodes.length));
  let body = '';
  if (expanded && s.open) {
    if (s.isBoss) {
      body = `<div class="rm-boss"><p class="small">${s.boss.attempts ? `Bạn đã làm ${s.boss.attempts} bài thi thử, ${s.boss.full} bài trả lời từ 12 câu trở lên.` : 'Chưa có bài thi thử nào.'}</p>
        <button class="btn primary" data-rm-mock>📝 Vào thi thử</button></div>`;
    } else {
      body = `<div class="rm-path">${s.nodes
        .map(
          (n, k) => `<button class="rm-node ${n.done ? 'done' : n.started ? 'started' : ''} ${ui.node === n.key ? 'sel' : ''}" data-rm-node="${escapeHtml(n.key)}" style="--off:${[0, 1, 2, 1][k % 4]}">
            <span class="rm-bubble">${n.done ? (n.stars === 3 ? '👑' : '✓') : s.icon}${n.mine ? '<i>⭐</i>' : ''}</span>
            <span class="rm-label">${escapeHtml(n.label)}</span>${starHTML(n.stars)}</button>
            ${ui.node === n.key ? nodePanelHTML(s, n) : ''}`,
        )
        .join('')}</div>`;
    }
  }
  return `<div class="card rm-stage ${s.open ? '' : 'locked'} ${s.cleared ? 'cleared' : ''}">
    <button class="rm-stage-head" data-rm-stage="${s.id}">
      <span class="rm-stage-icon">${s.open ? s.icon : '🔒'}</span>
      <span class="rm-stage-t"><b>Chặng ${i + 1}: ${escapeHtml(s.title)}</b>
        <span class="muted small">${s.open ? (s.isBoss ? (s.cleared ? '✅ Đã hoàn thành' : 'Trận cuối') : `${s.doneNodes}/${s.nodes.length} chủ đề${s.cleared ? ' · ✅ đã vượt chặng' : ` · cần ${s.need} để qua chặng`}`) : escapeHtml(lockMsg)}</span>
        <span class="rm-bar"><span style="width:${pct}%"></span></span></span>
      <span class="rm-caret">${expanded ? '▾' : '▸'}</span>
    </button>
    ${expanded ? `<p class="small muted rm-desc">${escapeHtml(s.desc)}</p>` : ''}
    ${body}
  </div>`;
}

export function renderRoadmap() {
  const el = $('roadmap-root');
  if (!el || ui.view !== 'road') return;
  const st = compute();
  if (!ui.stage) ui.stage = (st.find((s) => s.open && !s.cleared) || st[0]).id;
  el.innerHTML = headerHTML(st) + st.map(stageHTML).join('');
}

function startCombo(comboId) {
  for (const s of status) {
    for (const n of s.nodes) {
      const c = n.combos.find((x) => x.id === comboId);
      if (!c) continue;
      const qids = c.qs.map((q) => q.question_id);
      const isDone = (id) => !!spokenMap()[id] || !!indexAttempts(listAttempts()).get(id)?.spoken;
      const first = Math.max(0, qids.findIndex((id) => !isDone(id)));
      ui.lastCombo = { comboId, before: c.stars };
      openQuestion(qids[first], { combo: { qids, idx: first, title: `${s.title} · ${n.label}`, isDone } });
      return;
    }
  }
}

function setView(v) {
  ui.view = v;
  store.set('pview', v);
  document.querySelectorAll('.practice-views .seg').forEach((b) => b.classList.toggle('active', b.dataset.pview === v));
  $('practice-road').hidden = v !== 'road';
  $('practice-free').hidden = v !== 'free';
  if (v === 'road') renderRoadmap();
}

function onClick(e) {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.rmStage) {
    const s = status.find((x) => x.id === t.dataset.rmStage);
    if (!s.open) {
      const prev = status[status.indexOf(s) - 1];
      return toast(`🔒 Vượt chặng "${prev.title}" (xong ${prev.need} chủ đề) để mở chặng này.`, 3500);
    }
    ui.stage = ui.stage === s.id ? null : s.id;
    ui.node = null;
    return renderRoadmap();
  }
  if (t.dataset.rmNode) {
    ui.node = ui.node === t.dataset.rmNode ? null : t.dataset.rmNode;
    renderRoadmap();
    document.querySelector(`[data-panel="${CSS.escape(t.dataset.rmNode)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  if (t.dataset.rmStart) return startCombo(t.dataset.rmStart);
  if (t.hasAttribute('data-rm-mock')) return window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'mock' }));
  if (t.hasAttribute('data-rm-next')) {
    const nx = nextStep(status);
    if (!nx) return;
    ui.stage = nx.stage.id;
    ui.node = nx.node?.key || null;
    renderRoadmap();
    document.querySelector(ui.node ? `[data-panel="${CSS.escape(ui.node)}"]` : '.rm-boss')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

export function initRoadmap() {
  document.querySelectorAll('.practice-views .seg').forEach((b) => b.addEventListener('click', () => setView(b.dataset.pview)));
  $('roadmap-root').addEventListener('click', onClick);
  $('roadmap-root').addEventListener('change', (e) => {
    if (e.target.id !== 'rm-source') return;
    settings.roadSource = e.target.value;
    saveSettings();
  });
  window.addEventListener('opic:practice-view', (e) => setView(e.detail));
  window.addEventListener('opic:roadmap', (e) => {
    setView('road');
    window.scrollTo(0, 0);
    const lc = ui.lastCombo;
    if (e.detail?.done && lc) {
      const c = status.flatMap((s) => s.nodes.flatMap((n) => n.combos)).find((x) => x.id === lc.comboId);
      if (c) toast(c.stars > lc.before ? `🎉 Combo đạt ${'★'.repeat(c.stars)}${'☆'.repeat(3 - c.stars)}!` : c.stars ? `Combo đang ở ${'★'.repeat(c.stars)}. Chấm AI hoặc tự kiểm tra để lên sao.` : `Còn ${c.total - c.done} câu chưa nói đủ dài trong combo này.`, 3500);
    }
  });
  const refresh = () => ui.view === 'road' && renderRoadmap();
  onRoadmapChange(refresh);
  onMocksChange(refresh);
  onSettingsChange(refresh);
  setView(ui.view === 'free' ? 'free' : 'road');
}
