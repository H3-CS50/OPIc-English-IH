// Tab Học: ngân hàng câu hỏi, bài mẫu 3 cấp, cấp độ IM/IH/AL, khung trả lời, tài liệu, flashcard.
import { $, escapeHtml, md, store, toast } from './util.js';
import { kb, docs, flashcards, filterQuestions, getQuestion, sampleSetFor, topicLabel, ptypeLabel, CATEGORY_LABEL, SOURCE_LABEL, originOf, allQuestions } from './data.js';
import { openQuestion, bindSampleSet } from './practice.js';
import { speak } from './speech.js';
import { settings } from './settings.js';

let sub = store.get('learnSub', 'bank');

function showSub(name) {
  sub = name;
  store.set('learnSub', name);
  document.querySelectorAll('#tab-learn .subnav button').forEach((b) => b.classList.toggle('active', b.dataset.sub === name));
  document.querySelectorAll('#tab-learn .learn-pane').forEach((p) => (p.hidden = p.id !== `learn-${name}`));
  if (name === 'bank') renderBank();
  if (name === 'samples') renderSampleList();
  window.scrollTo(0, 0);
}

// ---------- Ngân hàng câu hỏi ----------
const bf = { source: '', category: '', ptype: '', level: '', search: '' };
function fillBankFilters() {
  const sources = Object.keys(SOURCE_LABEL).filter((k) => allQuestions().some((q) => originOf(q) === k));
  $('b-source').innerHTML =
    `<option value="">Mọi bộ câu hỏi</option>` + sources.map((k) => `<option value="${k}">${SOURCE_LABEL[k]}</option>`).join('');
  $('b-source').value = bf.source;
  const cats = Object.keys(CATEGORY_LABEL).filter((c) => allQuestions().some((q) => q.topic_category === c));
  $('b-category').innerHTML = `<option value="">Tất cả nhóm</option>` + cats.map((c) => `<option value="${c}">${CATEGORY_LABEL[c]}</option>`).join('');
  $('b-ptype').innerHTML = `<option value="">Mọi dạng câu</option>` + Object.entries(kb.prompt_types).map(([k, v]) => `<option value="${k}">${escapeHtml(v.vi)}</option>`).join('');
}
function renderBank() {
  const list = filterQuestions({ ...bf, oqc: true });
  $('bank-count').textContent = `${list.length} câu`;
  $('bank-list').innerHTML = list
    .map(
      (q) => `<button class="list-item q-item" data-q="${q.question_id}">
        <div class="q-item-meta"><span class="chip">${escapeHtml(q.topic === 'imported' ? q.topic_text || 'Tự nhập' : topicLabel(q.topic))}</span><span class="chip chip-type">${escapeHtml(ptypeLabel(q.prompt_type))}</span>${q.oqc_branch ? '<span class="chip chip-oqc">OQC</span>' : ''}${sampleSetFor(q.question_id) ? '<span class="chip chip-sample">bài mẫu 3 cấp</span>' : ''}${q.sample_ih ? '<span class="chip chip-sample">bài mẫu IH</span>' : ''}${originOf(q) === 'class' ? '<span class="chip chip-class">lớp</span>' : ''}</div>
        <div class="q-item-text">${escapeHtml(q.question_text)}</div>
        <div class="muted small">${q.question_id} · luyện cho ${q.target_practice_levels.join(', ')}</div></button>`,
    )
    .join('');
  $('bank-list')
    .querySelectorAll('[data-q]')
    .forEach((b) => b.addEventListener('click', () => openQuestion(b.dataset.q)));
}

// ---------- Bài mẫu ----------
function renderSampleList() {
  $('sample-view').hidden = true;
  $('samples-list').hidden = false;
  $('samples-list').innerHTML =
    `<p class="small muted">${kb.answer_sets.length} câu hỏi, mỗi câu có 3 bài mẫu IM – IH – AL cùng một nhân vật để so sánh. Tất cả do AI viết làm mục tiêu luyện tập.</p>` +
    kb.answer_sets
      .map((s) => {
        const q = getQuestion(s.question_id);
        return `<button class="list-item q-item" data-set="${s.set_id}">
          <div class="q-item-meta"><span class="chip">${escapeHtml(topicLabel(q.topic))}</span><span class="chip chip-type">${escapeHtml(ptypeLabel(q.prompt_type))}</span></div>
          <div class="q-item-text">${escapeHtml(q.question_text)}</div></button>`;
      })
      .join('');
  $('samples-list')
    .querySelectorAll('[data-set]')
    .forEach((b) => b.addEventListener('click', () => openSet(b.dataset.set)));
}
function openSet(setId) {
  const set = kb.answer_sets.find((s) => s.set_id === setId);
  const q = getQuestion(set.question_id);
  $('samples-list').hidden = true;
  $('sample-view').hidden = false;
  $('sample-view').innerHTML = `<button class="btn" id="btn-set-back">← Danh sách</button>
    <div class="card"><div class="q-item-meta"><span class="chip">${escapeHtml(topicLabel(q.topic))}</span><span class="chip chip-type">${escapeHtml(ptypeLabel(q.prompt_type))}</span></div>
    <p class="q-text">${escapeHtml(q.question_text)}</p>
    <div class="row"><button class="btn" id="btn-set-listen">🔊 Nghe câu hỏi</button><button class="btn primary" id="btn-set-practice">🎤 Luyện câu này</button></div></div>
    <div class="card" id="set-inner"></div>`;
  bindSampleSet($('set-inner'), set, settings.target);
  $('btn-set-back').addEventListener('click', renderSampleList);
  $('btn-set-listen').addEventListener('click', () => speak(q.question_text, settings.ttsRate).catch((e) => toast(e.message)));
  $('btn-set-practice').addEventListener('click', () => openQuestion(q.question_id));
  window.scrollTo(0, 0);
}

// ---------- Cấp độ & khung ----------
function renderDocInto(id, docId) {
  const d = docs.find((x) => x.id === docId);
  $(id).innerHTML = d ? md(d.md) : '<p class="muted">Không tìm thấy tài liệu.</p>';
}

function renderFrameworks() {
  const order = Object.keys(kb.prompt_types);
  $('frameworks-list').innerHTML =
    `<p class="small muted">Khung phát triển ý cho từng dạng câu. Đây là giàn giáo để luyện, không phải công thức bắt buộc. Hãy đổ nội dung thật của bạn vào, đừng học thuộc câu chữ.</p>` +
    order
      .map((k) => {
        const n = allQuestions().filter((q) => q.prompt_type === k).length;
        return `<div class="card"><h3>${escapeHtml(kb.prompt_types[k].vi)}</h3>
          <p class="en-text">${escapeHtml(kb.frameworks[k])}</p>
          <div class="muted small">Khung thời gian: ${kb.prompt_types[k].time_frames.join(', ')} · ${n} câu trong ngân hàng</div>
          <button class="btn small-btn" data-fw="${k}">🎤 Luyện ngẫu nhiên dạng này</button></div>`;
      })
      .join('');
  $('frameworks-list')
    .querySelectorAll('[data-fw]')
    .forEach((b) =>
      b.addEventListener('click', () => {
        const list = filterQuestions({ ptype: b.dataset.fw, oqc: settings.includeOqc });
        if (list.length) openQuestion(list[Math.floor(Math.random() * list.length)].question_id);
      }),
    );
}

// ---------- Tài liệu ----------
function renderDocList() {
  let html = '';
  let section = '';
  for (const d of docs.filter((x) => x.section !== 'hidden')) {
    if (d.section !== section) {
      section = d.section;
      html += `<div class="list-section">${escapeHtml(section)}</div>`;
    }
    html += `<button class="list-item" data-doc="${escapeHtml(d.id)}">${escapeHtml(d.title)}</button>`;
  }
  html += `<div class="list-section">Nguồn tham khảo đã kiểm tra</div><div class="card small">${kb.sources
    .filter((s) => s.tier <= 2 && /^https?:/.test(s.url))
    .map((s) => `<p><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a><br><span class="muted">${escapeHtml(s.publisher_or_author)} · Tier ${s.tier}</span></p>`)
    .join('')}</div>`;
  $('doc-list').innerHTML = html;
  $('doc-list')
    .querySelectorAll('[data-doc]')
    .forEach((b) => b.addEventListener('click', () => openDoc(b.dataset.doc)));
}
function openDoc(id) {
  const d = docs.find((x) => x.id === id);
  if (!d) return;
  $('doc-content').innerHTML = md(d.md);
  $('doc-list').hidden = true;
  $('doc-view').hidden = false;
  window.scrollTo(0, 0);
}

// ---------- Flashcard ----------
let deck = [];
let idx = 0;
const known = new Set(store.get('known', []));
function buildDeck(shuffle = false) {
  const tag = $('card-tag').value;
  const onlyUnknown = $('card-unknown').checked;
  deck = flashcards.filter((c) => (!tag || c.tag === tag) && (!onlyUnknown || !known.has(c.en)));
  if (shuffle) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  idx = 0;
  renderCard();
}
function renderCard() {
  const card = deck[idx];
  $('fc-back').hidden = true;
  $('fc-hint').hidden = false;
  if (!card) {
    $('fc-front').textContent = $('card-unknown').checked ? '🎉 Bạn đã thuộc hết thẻ trong nhóm này!' : 'Không có thẻ nào.';
    $('card-counter').textContent = '';
    return;
  }
  $('fc-front').innerHTML = `${known.has(card.en) ? '<span class="fc-known">✓ đã thuộc</span>' : ''}${escapeHtml(card.vi)}`;
  $('fc-back').innerHTML = `<div class="en">${escapeHtml(card.en)}</div><div class="ex">${escapeHtml(card.ex)}</div>`;
  $('card-counter').textContent = `${idx + 1} / ${deck.length} · đã thuộc ${known.size}/${flashcards.length}`;
}
const moveCard = (step) => {
  if (!deck.length) return;
  idx = (idx + step + deck.length) % deck.length;
  renderCard();
};
function markCard(isKnown) {
  const card = deck[idx];
  if (!card) return;
  if (isKnown) known.add(card.en);
  else known.delete(card.en);
  store.set('known', [...known]);
  if ($('card-unknown').checked && isKnown) {
    deck.splice(idx, 1);
    if (idx >= deck.length) idx = 0;
    renderCard();
  } else moveCard(1);
}
function initCards() {
  const tags = [...new Set(flashcards.map((c) => c.tag))];
  $('card-tag').innerHTML = `<option value="">Tất cả nhóm (${flashcards.length})</option>` + tags.map((t) => `<option value="${t}">${t}</option>`).join('');
  $('card-tag').addEventListener('change', () => buildDeck());
  $('card-unknown').addEventListener('change', () => buildDeck());
  $('flashcard').addEventListener('click', () => {
    if (!deck[idx]) return;
    $('fc-back').hidden = !$('fc-back').hidden;
    $('fc-hint').hidden = !$('fc-back').hidden;
  });
  $('card-prev').addEventListener('click', () => moveCard(-1));
  $('card-next').addEventListener('click', () => moveCard(1));
  $('card-shuffle').addEventListener('click', () => buildDeck(true));
  $('card-speak').addEventListener('click', () => {
    const c = deck[idx];
    if (c) speak(`${c.en}. ${c.ex}`, settings.ttsRate).catch((e) => toast(e.message));
  });
  $('card-known').addEventListener('click', () => markCard(true));
  $('card-again').addEventListener('click', () => markCard(false));
  buildDeck();
}

export function initLearn() {
  document.querySelectorAll('#tab-learn .subnav button').forEach((b) => b.addEventListener('click', () => showSub(b.dataset.sub)));
  fillBankFilters();
  for (const [id, key] of [
    ['b-source', 'source'],
    ['b-category', 'category'],
    ['b-ptype', 'ptype'],
    ['b-level', 'level'],
  ])
    $(id).addEventListener('change', (e) => {
      bf[key] = e.target.value;
      renderBank();
    });
  let t;
  $('b-search').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      bf.search = e.target.value;
      renderBank();
    }, 200);
  });
  renderDocInto('levels-content', 'kb/03');
  renderDocInto('official-content', 'kb/02');
  renderFrameworks();
  renderDocList();
  $('btn-doc-back').addEventListener('click', () => {
    $('doc-view').hidden = true;
    $('doc-list').hidden = false;
  });
  $('doc-content').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/^https?:/.test(href)) return;
    e.preventDefault();
    const file = href.split('#')[0].split('/').pop();
    const d = docs.find((x) => x.file === file);
    if (d) openDoc(d.id);
  });
  initCards();
  showSub(sub);
}

export const refreshLearn = () => {
  fillBankFilters();
  if (sub === 'bank') renderBank();
};
