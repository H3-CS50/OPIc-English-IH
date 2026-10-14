import { marked } from 'marked';
import content from './content.json';
import { createTranscriber, createRecorder, speak, stopSpeaking } from './speech.js';
import { grade, checkKey, buildCopyPrompt, countWords } from './grader.js';

const APP_VERSION = '1.0.0';
const TARGET_SECONDS = 120;
const ENOUGH_SECONDS = 90;

// ---------- Tiện ích ----------
const $ = (id) => document.getElementById(id);
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Không cho HTML thô trong Markdown chạy (phản hồi AI hiển thị ngay trong app).
marked.use({ gfm: true, breaks: false, renderer: { html: ({ text }) => escapeHtml(text) } });
const md = (s) => marked.parse(s);

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`opic.${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`opic.${key}`, JSON.stringify(value));
    } catch {}
  },
};

const settings = Object.assign({ mode: 'transcribe', ttsRate: 0.9, autoListen: false, hideText: false }, store.get('settings', {}));
const saveSettings = () => store.set('settings', settings);

let toastTimer;
function toast(msg, ms = 2600) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

// ---------- Điều hướng tab ----------
const TAB_TITLES = { practice: 'Luyện nói', docs: 'Tài liệu', cards: 'Flashcard', history: 'Lịch sử', settings: 'Cài đặt' };

function showTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${name}`));
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  $('screen-title').textContent = TAB_TITLES[name];
  if (name === 'history') renderHistory();
  window.scrollTo(0, 0);
}
document.querySelectorAll('.tabbar button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

// ---------- Luyện nói ----------
const allQuestions = content.topics.flatMap((t) => t.questions.map((q) => ({ ...q, topic: t.title })));
let current = null;
let seconds = 0;
let timerId = null;
let recording = false;
let transcriber = null;
let recorder = null;
let gradeAbort = null;

function fillTopicSelect() {
  const sel = $('topic-select');
  sel.innerHTML = `<option value="">🎲 Ngẫu nhiên (tất cả chủ đề)</option>`;
  for (const t of content.topics) {
    if (!t.questions.length) continue;
    sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)} (${t.questions.length})</option>`);
  }
  sel.value = store.get('topic', '');
  sel.addEventListener('change', () => {
    store.set('topic', sel.value);
    nextQuestion();
  });
}

function pickQuestion() {
  const topicId = $('topic-select').value;
  const topic = content.topics.find((t) => t.id === topicId);
  const pool = topic ? topic.questions.map((q) => ({ ...q, topic: topic.title })) : allQuestions;
  if (pool.length === 1) return pool[0];
  let q;
  do q = pool[Math.floor(Math.random() * pool.length)];
  while (current && q.q === current.q && pool.length > 1);
  return q;
}

function resetAttempt() {
  seconds = 0;
  $('timer').textContent = '0:00';
  updateProgress();
  $('transcript').value = '';
  updateWordCount();
  $('audio-box').hidden = true;
  $('sample-box').hidden = true;
  $('feedback-box').hidden = true;
  gradeAbort?.abort();
}

function renderQuestion() {
  $('q-heading').textContent = current.heading;
  $('q-text').textContent = current.q;
  $('q-text').hidden = settings.hideText;
  $('q-hidden').hidden = !settings.hideText;
  $('btn-toggle-text').textContent = settings.hideText ? '👁️ Hiện chữ' : '👁️ Ẩn chữ';
}

function nextQuestion() {
  if (recording) return toast('Hãy dừng ghi trước khi đổi câu.');
  current = pickQuestion();
  resetAttempt();
  renderQuestion();
  if (settings.autoListen) listen();
}

async function listen() {
  try {
    await speak(current.q, settings.ttsRate);
  } catch (e) {
    toast(e.message);
  }
}

function updateProgress() {
  const bar = $('progress-bar');
  bar.style.width = `${Math.min(100, (seconds / TARGET_SECONDS) * 100)}%`;
  bar.classList.toggle('enough', seconds >= ENOUGH_SECONDS && seconds <= TARGET_SECONDS + 15);
  bar.classList.toggle('over', seconds > TARGET_SECONDS + 15);
}

function updateWordCount() {
  $('word-count').textContent = `${countWords($('transcript').value)} từ`;
}

function setMode(mode) {
  settings.mode = mode;
  saveSettings();
  document.querySelectorAll('.seg').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $('mode-hint').textContent =
    mode === 'transcribe'
      ? 'Máy chuyển lời bạn nói thành chữ để AI chấm. Android chỉ cho dùng micro một việc, nên chế độ này không ghi âm lại được.'
      : 'Ghi âm giọng bạn để tự nghe lại phát âm. Chế độ này không chuyển thành chữ; muốn AI chấm thì gõ lại vào ô bên dưới hoặc dùng chế độ 📝.';
}

async function startRecording() {
  await stopSpeaking();
  resetAttempt();
  try {
    if (settings.mode === 'transcribe') {
      transcriber = createTranscriber((text) => {
        $('transcript').value = text;
        updateWordCount();
      });
      await transcriber.start();
    } else {
      recorder = createRecorder();
      await recorder.start();
    }
  } catch (e) {
    transcriber = recorder = null;
    toast(e.message || 'Không mở được micro.', 4000);
    return;
  }
  recording = true;
  $('btn-rec').classList.add('recording');
  $('btn-rec').setAttribute('aria-label', 'Dừng');
  $('rec-status').textContent = 'Đang nghe… bấm lần nữa để dừng';
  timerId = setInterval(() => {
    seconds++;
    $('timer').textContent = fmtTime(seconds);
    updateProgress();
    if (seconds === ENOUGH_SECONDS) toast('👍 Đã đủ 1:30, có thể kết bài được rồi');
    if (seconds === TARGET_SECONDS) toast('⏰ Đã 2 phút, kết bài thôi!');
    if (seconds >= 240) stopRecording();
  }, 1000);
}

async function stopRecording() {
  if (!recording) return;
  recording = false;
  clearInterval(timerId);
  $('btn-rec').classList.remove('recording');
  $('btn-rec').setAttribute('aria-label', 'Bắt đầu nói');
  $('rec-status').textContent = 'Đang xử lý…';
  if (transcriber) {
    await transcriber.stop();
    transcriber = null;
  }
  if (recorder) {
    const url = await recorder.stop();
    recorder = null;
    if (url) {
      $('audio').src = url;
      $('audio-box').hidden = false;
    }
  }
  const words = countWords($('transcript').value);
  $('rec-status').textContent =
    seconds < 60 ? 'Hơi ngắn đó. Mục tiêu IH là 1:30 đến 2:00 mỗi câu.' : `Xong! ${fmtTime(seconds)}${words ? `, ${words} từ` : ''}. Giờ nhờ AI chấm nhé.`;
}

function currentAttempt() {
  return { question: current.q, heading: current.heading, transcript: $('transcript').value, seconds };
}

function saveHistory(attempt, feedback) {
  const history = store.get('history', []);
  history.unshift({ ...attempt, topic: current.topic, feedback, date: new Date().toISOString() });
  store.set('history', history.slice(0, 60));
}

async function onGrade() {
  if (recording) return toast('Hãy dừng ghi trước đã.');
  const attempt = currentAttempt();
  if (!attempt.transcript.trim()) return toast('Chưa có bài nói. Hãy nói hoặc gõ câu trả lời vào ô.');
  const apiKey = store.get('apiKey', '');
  if (!apiKey) {
    toast('Chưa có API key. Dùng nút 📋 Copy, hoặc thêm key ở tab Cài đặt.', 4000);
    return;
  }
  const box = $('feedback-box');
  box.hidden = false;
  box.innerHTML = '<p class="muted"><span class="spinner"></span> Đang chấm bài… thường mất 20–40 giây.</p>';
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('btn-grade').disabled = true;
  gradeAbort = new AbortController();
  const result = await grade(apiKey, attempt, (text) => (box.innerHTML = md(text)), gradeAbort.signal);
  $('btn-grade').disabled = false;
  gradeAbort = null;
  if (result.error) {
    box.innerHTML = `<p>⚠️ ${escapeHtml(result.error)}</p>`;
    return;
  }
  box.innerHTML = md(result.text);
  saveHistory(attempt, result.text);
}

async function onCopy() {
  if (recording) return toast('Hãy dừng ghi trước đã.');
  const attempt = currentAttempt();
  if (!attempt.transcript.trim()) return toast('Chưa có bài nói để copy.');
  const ok = await copyText(buildCopyPrompt(attempt));
  saveHistory(attempt, '');
  const box = $('feedback-box');
  box.hidden = false;
  box.innerHTML = ok
    ? `<p>✅ Đã copy yêu cầu chấm bài.</p><p>Mở app Claude, tạo cuộc trò chuyện mới, <b>dán</b> vào rồi gửi.</p>
       <p><a class="btn primary" href="https://claude.ai/new" target="_blank" rel="noopener">Mở Claude →</a></p>`
    : '<p>⚠️ Không copy được. Hãy thử lại.</p>';
}

function onSample() {
  const box = $('sample-box');
  if (!box.hidden) return (box.hidden = true);
  box.innerHTML = current.sample
    ? `<h3>📖 Bài mẫu IH</h3>${md(current.sample)}<p class="muted small">Đừng học thuộc nguyên văn. Hãy lấy khung và cụm từ, rồi thay bằng câu chuyện của bạn.</p>`
    : md(current.note || 'Câu này chưa có bài mẫu.');
  box.hidden = false;
}

function initPractice() {
  fillTopicSelect();
  setMode(settings.mode);
  document.querySelectorAll('.seg').forEach((b) =>
    b.addEventListener('click', () => (recording ? toast('Hãy dừng ghi trước khi đổi chế độ.') : setMode(b.dataset.mode))),
  );
  $('btn-rec').addEventListener('click', () => (recording ? stopRecording() : startRecording()));
  $('btn-listen').addEventListener('click', listen);
  $('btn-next').addEventListener('click', nextQuestion);
  $('btn-toggle-text').addEventListener('click', () => {
    settings.hideText = !settings.hideText;
    saveSettings();
    renderQuestion();
  });
  $('transcript').addEventListener('input', updateWordCount);
  $('btn-grade').addEventListener('click', onGrade);
  $('btn-copy').addEventListener('click', onCopy);
  $('btn-sample').addEventListener('click', onSample);
  current = pickQuestion();
  renderQuestion();
}

// ---------- Tài liệu ----------
const docs = [
  ...content.topics.map((d) => ({ ...d, section: 'Câu hỏi & bài mẫu' })),
  ...content.templates.map((d) => ({ ...d, section: 'Khung trả lời & mẹo' })),
];

function renderDocList() {
  let html = '';
  let section = '';
  for (const d of docs) {
    if (d.section !== section) {
      section = d.section;
      html += `<div class="list-section">${escapeHtml(section)}</div>`;
    }
    html += `<button class="list-item" data-doc="${escapeHtml(d.id)}">${escapeHtml(d.title)}</button>`;
  }
  $('doc-list').innerHTML = html;
  $('doc-list').querySelectorAll('[data-doc]').forEach((b) => b.addEventListener('click', () => openDoc(b.dataset.doc)));
}

function openDoc(id) {
  const doc = docs.find((d) => d.id === id);
  if (!doc) return;
  $('doc-content').innerHTML = md(doc.md);
  $('doc-list').hidden = true;
  $('doc-view').hidden = false;
  window.scrollTo(0, 0);
}

function initDocs() {
  renderDocList();
  $('btn-doc-back').addEventListener('click', () => {
    $('doc-view').hidden = true;
    $('doc-list').hidden = false;
  });
  // Link giữa các tài liệu (vd. 06-du-lich-trong-nuoc.md) mở ngay trong app.
  $('doc-content').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/^https?:/.test(href)) return;
    e.preventDefault();
    const file = href.split('#')[0].split('/').pop();
    const doc = docs.find((d) => d.id.endsWith(`/${file}`));
    if (doc) openDoc(doc.id);
  });
}

// ---------- Flashcard ----------
let cardDeck = [];
let cardIndex = 0;
const known = new Set(store.get('known', []));

function buildDeck(shuffle = false) {
  const tag = $('card-tag').value;
  const onlyUnknown = $('card-unknown').checked;
  cardDeck = content.flashcards.filter((c) => (!tag || c.tag === tag) && (!onlyUnknown || !known.has(c.en)));
  if (shuffle) {
    for (let i = cardDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
    }
  }
  cardIndex = 0;
  renderCard();
}

function renderCard() {
  const front = $('fc-front');
  const back = $('fc-back');
  back.hidden = true;
  $('fc-hint').hidden = false;
  const card = cardDeck[cardIndex];
  if (!card) {
    front.textContent = $('card-unknown').checked ? '🎉 Bạn đã thuộc hết thẻ trong nhóm này!' : 'Không có thẻ nào.';
    $('card-counter').textContent = '';
    return;
  }
  front.innerHTML = `${known.has(card.en) ? '<span class="fc-known">✓ đã thuộc</span>' : ''}${escapeHtml(card.vi)}`;
  back.innerHTML = `<div class="en">${escapeHtml(card.en)}</div><div class="ex">${escapeHtml(card.ex)}</div>`;
  $('card-counter').textContent = `${cardIndex + 1} / ${cardDeck.length} · đã thuộc ${known.size}/${content.flashcards.length}`;
}

function moveCard(step) {
  if (!cardDeck.length) return;
  cardIndex = (cardIndex + step + cardDeck.length) % cardDeck.length;
  renderCard();
}

function markCard(isKnown) {
  const card = cardDeck[cardIndex];
  if (!card) return;
  if (isKnown) known.add(card.en);
  else known.delete(card.en);
  store.set('known', [...known]);
  if ($('card-unknown').checked && isKnown) {
    cardDeck.splice(cardIndex, 1);
    if (cardIndex >= cardDeck.length) cardIndex = 0;
    renderCard();
  } else moveCard(1);
}

function initCards() {
  const tags = [...new Set(content.flashcards.map((c) => c.tag))];
  $('card-tag').innerHTML = `<option value="">Tất cả nhóm (${content.flashcards.length})</option>` + tags.map((t) => `<option value="${t}">${t}</option>`).join('');
  $('card-tag').addEventListener('change', () => buildDeck());
  $('card-unknown').addEventListener('change', () => buildDeck());
  $('flashcard').addEventListener('click', () => {
    if (!cardDeck[cardIndex]) return;
    $('fc-back').hidden = !$('fc-back').hidden;
    $('fc-hint').hidden = !$('fc-back').hidden;
  });
  $('card-prev').addEventListener('click', () => moveCard(-1));
  $('card-next').addEventListener('click', () => moveCard(1));
  $('card-shuffle').addEventListener('click', () => buildDeck(true));
  $('card-speak').addEventListener('click', () => {
    const card = cardDeck[cardIndex];
    if (card) speak(`${card.en}. ${card.ex}`, settings.ttsRate).catch((e) => toast(e.message));
  });
  $('card-known').addEventListener('click', () => markCard(true));
  $('card-again').addEventListener('click', () => markCard(false));
  buildDeck();
}

// ---------- Lịch sử ----------
function renderHistory() {
  const history = store.get('history', []);
  const list = $('history-list');
  $('btn-clear-history').hidden = !history.length;
  if (!history.length) {
    list.innerHTML = '<p class="muted center">Chưa có bài nào. Luyện nói xong rồi bấm 🤖 AI chấm hoặc 📋 Copy, bài sẽ được lưu ở đây.</p>';
    return;
  }
  list.innerHTML = history
    .map((h, i) => {
      const level = (h.feedback.match(/Cấp độ ước tính:\s*\**\s*([A-Z]{2}\d?)/) || [])[1];
      const date = new Date(h.date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
      return `<details class="card"><summary>
          ${level ? `<span class="badge">${level}</span> ` : ''}<b>${escapeHtml(h.question)}</b>
          <div class="muted small">${date} · ${fmtTime(h.seconds)} · ${countWords(h.transcript)} từ</div>
        </summary>
        <h3>Bài nói</h3><p>${escapeHtml(h.transcript)}</p>
        ${h.feedback ? `<div class="md">${md(h.feedback)}</div>` : '<p class="muted small">Chưa có nhận xét (đã copy sang Claude).</p>'}
        <button class="btn" data-del="${i}">Xoá bài này</button>
      </details>`;
    })
    .join('');
  list.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', () => {
      const h = store.get('history', []);
      h.splice(Number(b.dataset.del), 1);
      store.set('history', h);
      renderHistory();
    }),
  );
}

function initHistory() {
  $('btn-clear-history').addEventListener('click', () => {
    if (confirm('Xoá toàn bộ lịch sử luyện nói?')) {
      store.set('history', []);
      renderHistory();
    }
  });
}

// ---------- Cài đặt ----------
function initSettings() {
  const keyInput = $('api-key');
  keyInput.value = store.get('apiKey', '');
  $('btn-save-key').addEventListener('click', () => {
    store.set('apiKey', keyInput.value.trim());
    $('key-status').textContent = keyInput.value.trim() ? '✅ Đã lưu key trên máy này.' : 'Đã xoá key.';
  });
  $('btn-show-key').addEventListener('click', () => (keyInput.type = keyInput.type === 'password' ? 'text' : 'password'));
  $('btn-check-key').addEventListener('click', async () => {
    const key = keyInput.value.trim();
    if (!key) return ($('key-status').textContent = 'Hãy nhập key trước.');
    $('key-status').innerHTML = '<span class="spinner"></span> Đang kiểm tra…';
    const r = await checkKey(key);
    $('key-status').textContent = r.ok ? '✅ Key hợp lệ. Nhớ bấm Lưu nhé.' : `⚠️ ${r.error}`;
  });

  const rate = $('tts-rate');
  rate.value = settings.ttsRate;
  const showRate = () => ($('rate-label').textContent = `${Number(settings.ttsRate).toFixed(2)}x`);
  showRate();
  rate.addEventListener('input', () => {
    settings.ttsRate = Number(rate.value);
    saveSettings();
    showRate();
  });
  $('auto-listen').checked = settings.autoListen;
  $('auto-listen').addEventListener('change', (e) => {
    settings.autoListen = e.target.checked;
    saveSettings();
  });
  $('app-version').textContent = `OPIc IH · phiên bản ${APP_VERSION} · ${allQuestions.length} câu hỏi · ${content.flashcards.length} flashcard`;
}

initPractice();
initDocs();
initCards();
initHistory();
initSettings();
