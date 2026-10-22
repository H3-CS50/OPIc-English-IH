// Màn hình Luyện nói: chọn câu → nghe → nói/ghi âm → AI Coach → nói lại.
import { suggestFor, speakable } from './vocab-core.js';
import { openVocabTopic } from './vocab.js';
import { $, escapeHtml, toast, fmtTime, countWords, copyText, pick, md } from './util.js';
import { kb, allQuestions, filterQuestions, getQuestion, sampleSetFor, topicLabel, ptypeLabel, CATEGORY_LABEL, SOURCE_LABEL, originOf } from './data.js';
import { createTranscriber, createRecorder, speak, stopSpeaking, canTranscribe } from './speech.js';
import { grade, buildCopyPrompt, providerReady, usesGemini } from './coach.js';
import { renderFeedback } from './feedback.js';
import { addAttempt } from './history.js';
import { settings, saveSettings } from './settings.js';
import { quickSave } from './scripts.js';
import { recordSpoken } from './roadmap-core.js';
import { createTimingTracker, pausesFromBlob } from './analysis.js';
import { analyze, renderAnalysis, logAnalysis } from './analysis-ui.js';
import { openPron, pronChoicesFrom } from './pron.js';

import { targetDuration } from './durations.js';
export { targetDuration };

const st = {
  q: null,
  seconds: 0,
  timerId: null,
  recording: false,
  transcriber: null,
  recorder: null,
  audio: null,
  plays: 0,
  retry: null,
  banner: '',
  abort: null,
  lastResult: null,
  lastAttemptId: null,
  timing: null,
  tracker: null,
  pron: null,
};

const filters = { source: '', category: '', topic: '', ptype: '' };

// ---------- Bộ lọc ----------
function fillFilters() {
  const sources = Object.keys(SOURCE_LABEL).filter((k) => allQuestions().some((q) => originOf(q) === k));
  $('f-source').innerHTML =
    `<option value="">Mọi bộ câu hỏi (${allQuestions().length})</option>` +
    sources.map((k) => `<option value="${k}">${SOURCE_LABEL[k]} (${allQuestions().filter((q) => originOf(q) === k).length})</option>`).join('');
  $('f-source').value = filters.source;
  const cats = Object.keys(CATEGORY_LABEL).filter((c) => allQuestions().some((q) => q.topic_category === c));
  $('f-category').innerHTML = `<option value="">Tất cả nhóm</option>` + cats.map((c) => `<option value="${c}">${CATEGORY_LABEL[c]}</option>`).join('');
  $('f-category').value = filters.category;
  fillTopics();
  $('f-ptype').innerHTML =
    `<option value="">Mọi dạng câu</option>` +
    Object.entries(kb.prompt_types)
      .map(([k, v]) => `<option value="${k}">${escapeHtml(v.vi)}</option>`)
      .join('');
  $('f-ptype').value = filters.ptype;
}
function fillTopics() {
  const topics = [
    ...new Set(
      allQuestions()
        .filter((q) => (!filters.source || originOf(q) === filters.source) && (!filters.category || q.topic_category === filters.category))
        .map((q) => q.topic),
    ),
  ];
  $('f-topic').innerHTML = `<option value="">Mọi chủ đề</option>` + topics.map((t) => `<option value="${t}">${escapeHtml(topicLabel(t))}</option>`).join('');
  if (!topics.includes(filters.topic)) filters.topic = '';
  $('f-topic').value = filters.topic;
}

function pool() {
  return filterQuestions({ ...filters, level: settings.target, oqc: settings.includeOqc });
}

// ---------- Hiển thị câu hỏi ----------
function renderLevel() {
  document.querySelectorAll('[data-level]').forEach((b) => b.classList.toggle('active', b.dataset.level === settings.target));
  if (st.q) renderTimerTarget();
}

function renderTimerTarget() {
  const [lo, hi] = targetDuration(st.q, settings.target);
  $('timer-target').textContent = ` / gợi ý ${fmtTime(lo)}–${fmtTime(hi)}`;
}

function renderBanner() {
  const el = $('practice-banner');
  if (st.retry) {
    el.className = 'banner banner-retry';
    el.innerHTML = `<b>🔁 Nói lại:</b> ${escapeHtml(st.retry.goal)}${st.retry.instruction ? `<div class="small">${escapeHtml(st.retry.instruction)}</div>` : ''}
      <button class="link-btn" id="btn-cancel-retry">Bỏ chế độ nói lại</button>`;
    el.hidden = false;
    $('btn-cancel-retry').addEventListener('click', () => {
      st.retry = null;
      renderBanner();
    });
  } else if (st.banner) {
    el.className = 'banner';
    el.innerHTML = st.banner;
    el.hidden = false;
  } else el.hidden = true;
}

function renderQuestion() {
  const q = st.q;
  if (!q) {
    $('q-text').textContent = 'Không có câu hỏi phù hợp với bộ lọc. Hãy đổi chủ đề hoặc dạng câu.';
    $('q-meta').innerHTML = '';
    return;
  }
  const set = sampleSetFor(q.question_id);
  $('q-meta').innerHTML = `
    <span class="chip">${escapeHtml(q.topic === 'imported' ? q.topic_text || topicLabel('imported') : topicLabel(q.topic))}</span>
    <span class="chip chip-type">${escapeHtml(ptypeLabel(q.prompt_type))}</span>
    ${q.oqc_branch ? '<span class="chip chip-oqc">OQC</span>' : ''}
    ${set ? '<span class="chip chip-sample">có bài mẫu 3 cấp</span>' : ''}
    ${q.sample_ih ? '<span class="chip chip-sample">có bài mẫu IH</span>' : ''}
    ${originOf(q) === 'class' ? '<span class="chip chip-class">câu hỏi của lớp</span>' : ''}
    ${originOf(q) === 'imported' ? '<span class="chip">câu tự nhập</span>' : ''}`;
  $('q-text').textContent = q.question_text;
  $('q-text').hidden = !!settings.hideText;
  $('q-hidden').hidden = !settings.hideText;
  $('btn-toggle-text').textContent = settings.hideText ? '👁️ Hiện chữ' : '🙈 Ẩn chữ';
  $('plays').textContent = st.plays ? `đã nghe ${st.plays} lần` : '';
  renderHints(settings.showHints);
  renderTimerTarget();
  renderBanner();
}

function renderHints(show) {
  const q = st.q;
  const box = $('hints-box');
  box.hidden = !show;
  $('btn-hints').textContent = show ? '💡 Ẩn gợi ý' : '💡 Gợi ý';
  if (!show || !q) return;
  box.innerHTML = `
    <div class="small"><b>Khung phát triển ý:</b> <span class="en-text">${escapeHtml(q.answer_framework)}</span></div>
    ${q.scaffolding_hints.length ? `<div class="small"><b>Ý tưởng:</b><ul>${q.scaffolding_hints.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>` : ''}
    ${q.expected_evidence.length ? `<div class="small"><b>Nên có trong câu trả lời:</b><ul>${q.expected_evidence.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>` : ''}
    ${vocabHintHTML(q)}
    <p class="muted small">Gợi ý để luyện, không phải công thức bắt buộc. Thử nói một lần không xem gợi ý trước.</p>`;
  box.querySelectorAll('[data-vsay]').forEach((b) => b.addEventListener('click', () => speak(speakable(b.dataset.vsay), settings.ttsRate).catch((e) => toast(e.message))));
  box.querySelectorAll('[data-vtopic]').forEach((b) => b.addEventListener('click', () => openVocabTopic(Number(b.dataset.vtopic))));
}

// Cụm từ nên thử cho câu này (lấy từ tab Từ vựng, ưu tiên mục chưa thuộc).
function vocabHintHTML(q) {
  const { items, topics } = suggestFor(q, 6);
  if (!items.length) return '';
  const shown = [...new Map(topics.map((t) => [t.idx, t])).values()].slice(0, 3);
  return `<div class="small"><b>📒 Cụm từ nên thử:</b><ul class="v-hint">${items
    .map((it) => `<li><button class="link-btn" data-vsay="${escapeHtml(it.en)}" aria-label="Nghe">🔊</button> <b>${escapeHtml(it.en)}</b> — ${escapeHtml(it.vi)}</li>`)
    .join('')}</ul>${shown.map((t) => `<button class="btn small-btn" data-vtopic="${t.idx}">${t.icon} Ôn nhóm ${escapeHtml(t.vi)}</button>`).join(' ')}</div>`;
}

function resetAttempt({ keepRetry = true } = {}) {
  st.seconds = 0;
  $('timer').textContent = '0:00';
  updateProgress();
  $('transcript').value = '';
  updateWordCount();
  if (st.audio?.url) URL.revokeObjectURL(st.audio.url);
  st.audio = null;
  $('audio-box').hidden = true;
  $('sample-box').hidden = true;
  $('selfcheck-box').hidden = true;
  $('feedback-box').hidden = true;
  $('analysis-box').hidden = true;
  st.timing = null;
  st.pron = null;
  st.lastResult = null;
  $('rec-status').textContent = 'Bấm nút đỏ để bắt đầu nói';
  st.abort?.abort();
  if (!keepRetry) st.retry = null;
}

export function openQuestion(qid, { banner = '', combo = null } = {}) {
  const q = getQuestion(qid);
  if (!q) return toast('Không tìm thấy câu hỏi.');
  if (st.recording) return toast('Hãy dừng ghi trước khi đổi câu.');
  st.q = q;
  st.plays = 0;
  st.combo = combo;
  st.banner = combo ? comboBannerHTML() : banner;
  resetAttempt({ keepRetry: false });
  renderQuestion();
  window.dispatchEvent(new CustomEvent('opic:show-tab', { detail: 'practice' }));
  window.dispatchEvent(new CustomEvent('opic:practice-view', { detail: 'free' }));
  if (settings.autoListen) setTimeout(listen, 300);
}

function nextQuestion() {
  if (st.recording) return toast('Hãy dừng ghi trước khi đổi câu.');
  const p = pool();
  if (!p.length) {
    st.q = null;
    renderQuestion();
    return;
  }
  let q;
  let guard = 0;
  do q = pick(p);
  while (st.q && q.question_id === st.q.question_id && p.length > 1 && guard++ < 10);
  st.q = q;
  st.plays = 0;
  st.banner = '';
  st.combo = null;
  resetAttempt({ keepRetry: false });
  renderQuestion();
  if (settings.autoListen) listen();
}

// ---------- Combo trong lộ trình ----------
// combo = { qids, idx, title, isDone(qid) }
function comboBannerHTML() {
  const c = st.combo;
  const n = c.qids.length;
  const dots = c.qids.map((id, i) => `<span class="cb-dot ${c.isDone?.(id) ? 'ok' : ''} ${i === c.idx ? 'cur' : ''}">${c.isDone?.(id) ? '✓' : i + 1}</span>`).join('');
  return `<div class="combo-banner"><div><b>🗺️ ${escapeHtml(c.title)}</b> <span class="muted small">câu ${c.idx + 1}/${n}</span></div>
    <div class="cb-dots">${dots}</div>
    <div class="row wrap">
      ${c.idx > 0 ? '<button class="btn small-btn" data-combo-nav="-1">◀ Câu trước</button>' : ''}
      ${c.idx < n - 1 ? '<button class="btn small-btn primary" data-combo-nav="1">Câu tiếp ▶</button>' : '<button class="btn small-btn primary" data-combo-nav="done">✓ Xong combo</button>'}
      <button class="btn small-btn" data-combo-nav="map">🗺️ Lộ trình</button>
    </div>
    <div class="muted small">Nói đủ 15 từ hoặc 20 giây trở lên là câu được tính ✓. Chấm AI hoặc tự kiểm tra để lên ★★, ★★★.</div></div>`;
}
function renderComboBanner() {
  if (!st.combo) return;
  st.banner = comboBannerHTML();
  renderBanner();
}
function comboNav(v) {
  const c = st.combo;
  if (!c) return;
  if (st.recording) return toast('Hãy dừng ghi trước đã.');
  if (v === 'map' || v === 'done') {
    window.dispatchEvent(new CustomEvent('opic:roadmap', { detail: { done: v === 'done' } }));
    return;
  }
  const idx = c.idx + Number(v);
  openQuestion(c.qids[idx], { combo: { ...c, idx } });
}

async function listen() {
  if (!st.q) return;
  st.plays++;
  $('plays').textContent = `đã nghe ${st.plays} lần`;
  try {
    await speak(st.q.question_text, settings.ttsRate);
  } catch (e) {
    toast(e.message);
  }
}

// ---------- Ghi ----------
function updateProgress() {
  const [lo, hi] = st.q ? targetDuration(st.q, settings.target) : [90, 120];
  const bar = $('progress-bar');
  bar.style.width = `${Math.min(100, (st.seconds / hi) * 100)}%`;
  bar.classList.toggle('enough', st.seconds >= lo && st.seconds <= hi + 15);
  bar.classList.toggle('over', st.seconds > hi + 15);
}
const updateWordCount = () => ($('word-count').textContent = `${countWords($('transcript').value)} từ`);

function setMode(mode) {
  settings.mode = mode;
  saveSettings();
  document.querySelectorAll('#tab-practice .seg').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $('mode-hint').textContent =
    mode === 'transcribe'
      ? 'Máy chuyển lời bạn nói thành chữ để AI chấm (Claude hoặc Gemini). Chế độ này không lưu ghi âm, nên AI không nhận xét phát âm.'
      : 'Ghi âm giọng bạn để nghe lại. Gemini có thể nghe file ghi âm và nhận xét cả độ trôi chảy. Claude chỉ đọc chữ, nên bạn cần gõ lại lời nói vào ô bên dưới.';
}

async function startRecording() {
  if (!st.q) return;
  await stopSpeaking();
  resetAttempt();
  try {
    if (settings.mode === 'transcribe') {
      if (!canTranscribe()) throw new Error('Thiết bị này không hỗ trợ chuyển giọng nói thành chữ. Hãy dùng chế độ 🎙️ Ghi âm.');
      st.tracker = createTimingTracker();
      st.tracker.start();
      st.transcriber = createTranscriber((text) => {
        st.tracker?.update(text);
        $('transcript').value = text;
        updateWordCount();
      });
      await st.transcriber.start();
    } else {
      st.recorder = createRecorder();
      await st.recorder.start();
    }
  } catch (e) {
    st.transcriber = st.recorder = null;
    toast(e.message || 'Không mở được micro.', 4500);
    return;
  }
  st.recording = true;
  $('btn-rec').classList.add('recording');
  $('btn-rec').setAttribute('aria-label', 'Dừng');
  $('rec-status').textContent = 'Đang nghe… bấm lần nữa để dừng';
  const [lo, hi] = targetDuration(st.q, settings.target);
  st.timerId = setInterval(() => {
    st.seconds++;
    $('timer').textContent = fmtTime(st.seconds);
    updateProgress();
    if (st.seconds === lo) toast('👍 Đã đủ thời lượng gợi ý tối thiểu');
    if (st.seconds === hi) toast('⏰ Đã tới thời lượng gợi ý tối đa, kết ý thôi!');
    if (st.seconds >= 300) stopRecording();
  }, 1000);
}

async function stopRecording() {
  if (!st.recording) return;
  st.recording = false;
  clearInterval(st.timerId);
  $('btn-rec').classList.remove('recording');
  $('btn-rec').setAttribute('aria-label', 'Bắt đầu nói');
  $('rec-status').textContent = 'Đang xử lý…';
  if (st.transcriber) {
    await st.transcriber.stop();
    st.transcriber = null;
    st.timing = st.tracker?.stop() || null;
    st.tracker = null;
  }
  if (st.recorder) {
    st.audio = await st.recorder.stop();
    st.recorder = null;
    if (st.audio) {
      $('audio').src = st.audio.url;
      $('audio-box').hidden = false;
      st.timing = await pausesFromBlob(st.audio.blob);
    }
  }
  const words = countWords($('transcript').value);
  if (st.q && recordSpoken(st.q.question_id, { words, seconds: st.seconds })) renderComboBanner();
  $('rec-status').textContent = `Xong! ${fmtTime(st.seconds)}${words ? ` · ${words} từ` : ''}. Giờ nhờ AI Coach nhận xét, hoặc tự kiểm tra.`;
  showAnalysis({ log: true });
}

// ---------- Phân tích bài nói (tự động, không tốn lượt AI) ----------
function currentText() {
  const typed = $('transcript').value.trim();
  return typed || st.lastResult?.transcript_used || '';
}
function showAnalysis({ log = false } = {}) {
  if (!st.q || (!st.seconds && !$('transcript').value.trim())) return;
  const a = analyze({ text: currentText(), seconds: st.seconds, target: settings.target, ptype: st.q.prompt_type, timing: st.timing, ai: st.lastResult, pron: st.pron });
  const box = $('analysis-box');
  box.innerHTML = renderAnalysis(a);
  box.hidden = false;
  if (log) logAnalysis(a, { qid: st.q.question_id, ptype: st.q.prompt_type, target: settings.target });
}
let anTimer = null;
function onTranscriptEdit() {
  clearTimeout(anTimer);
  if (st.recording || $('analysis-box').hidden) return;
  anTimer = setTimeout(() => showAnalysis({ log: true }), 800);
}

function onPron() {
  if (st.recording) return toast('Hãy dừng ghi trước đã.');
  const text = $('transcript').value.trim();
  const done = (r) => {
    st.pron = r;
    showAnalysis();
  };
  // Chế độ Ghi âm: soi luôn đoạn vừa nói. Chế độ chữ: chọn 1–3 câu để đọc lại.
  if (st.audio && st.seconds <= 120) return openPron({ text, audio: st.audio, choices: pronChoicesFrom(text), onResult: done });
  openPron({ text: pronChoicesFrom(text)[0] || '', choices: pronChoicesFrom(text || st.q?.question_text || ''), onResult: done });
}

// ---------- Chấm ----------
function inputModeFor() {
  const transcript = $('transcript').value.trim();
  if (st.audio && usesGemini(settings)) return transcript ? 'audio_and_transcript' : 'audio';
  return 'transcript_only';
}

function buildCtx() {
  const q = st.q;
  return {
    question: q.question_text,
    ptype: q.prompt_type,
    ptypeLabel: ptypeLabel(q.prompt_type),
    expected: q.expected_evidence,
    target: settings.target,
    inputMode: inputModeFor(),
    seconds: st.seconds,
    transcript: $('transcript').value,
    retry: st.retry ? { gap: st.retry.gap, goal: st.retry.goal } : null,
  };
}

function baseAttempt(ctx, provider) {
  return {
    mode: st.retry ? 'retry' : st.banner ? 'daily' : 'practice',
    question_id: st.q.question_id,
    question_text: st.q.question_text,
    prompt_type: st.q.prompt_type,
    topic: st.q.topic,
    target_level: settings.target,
    input_mode: ctx.inputMode,
    seconds: st.seconds,
    transcript: ctx.transcript,
    provider,
    retry_of: st.retry?.of || null,
  };
}

async function onGrade() {
  if (st.recording) return toast('Hãy dừng ghi trước đã.');
  if (!st.q) return;
  const ctx = buildCtx();
  const hasText = !!ctx.transcript.trim();
  if (!hasText && !st.audio) return toast('Chưa có bài nói. Hãy nói hoặc gõ câu trả lời vào ô.', 3500);
  const ready = providerReady(settings, !hasText && st.audio ? 'audio' : ctx.inputMode);
  if (!ready.ok) return toast(ready.reason, 5500);
  const box = $('feedback-box');
  box.hidden = false;
  box.innerHTML = `<p class="muted"><span class="spinner"></span> AI Coach đang nghe và nhận xét… thường mất 15–45 giây.</p>
    <button class="btn" id="btn-cancel-grade">Huỷ</button>`;
  $('btn-cancel-grade').addEventListener('click', () => st.abort?.abort());
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('btn-grade').disabled = true;
  st.abort = new AbortController();
  const { result, error } = await grade(settings, ctx, st.audio, st.abort.signal);
  $('btn-grade').disabled = false;
  st.abort = null;
  if (error) {
    box.innerHTML = `<p>⚠️ ${escapeHtml(error)}</p>`;
    return;
  }
  const att = addAttempt({ ...baseAttempt(ctx, settings.provider), coach_result: result });
  st.lastResult = result;
  st.lastAttemptId = att.attempt_id;
  showAnalysis();
  box.innerHTML = renderFeedback(result);
  box.querySelector('[data-action=retry]')?.addEventListener('click', startRetry);
}

function startRetry() {
  const r = st.lastResult;
  if (!r) return;
  st.retry = { of: st.lastAttemptId, gap: r.main_gap.point_vi, goal: r.retry_task.goal_vi, instruction: r.retry_task.instruction_vi };
  resetAttempt();
  renderBanner();
  $('practice-banner').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function onCopy() {
  if (st.recording) return toast('Hãy dừng ghi trước đã.');
  if (!st.q) return;
  const ctx = buildCtx();
  if (!ctx.transcript.trim()) return toast('Chưa có chữ để copy. Hãy dùng chế độ 📝 hoặc gõ lại lời nói.', 3500);
  ctx.inputMode = 'transcript_only';
  const ok = await copyText(buildCopyPrompt(ctx));
  addAttempt({ ...baseAttempt(ctx, 'copy') });
  const box = $('feedback-box');
  box.hidden = false;
  box.innerHTML = ok
    ? `<p>✅ Đã copy yêu cầu chấm bài (kèm câu hỏi và bài nói của bạn).</p><p>Mở app Claude, tạo cuộc trò chuyện mới, <b>dán</b> vào rồi gửi.</p>
       <p><a class="btn primary" href="https://claude.ai/new" target="_blank" rel="noopener">Mở Claude →</a></p>`
    : '<p>⚠️ Không copy được. Hãy thử lại.</p>';
}

// ---------- Bài mẫu ----------
export function renderSampleSet(set, level) {
  const lv = set.levels[level];
  const tabs = ['IM', 'IH', 'AL']
    .map((l) => `<button class="seg ${l === level ? 'active' : ''}" data-sample-level="${l}">${l}</button>`)
    .join('');
  return `
    <div class="segmented">${tabs}</div>
    <p class="muted small">Nhân vật: ${escapeHtml(set.persona_vi)}</p>
    <div class="sample-text en-text">${escapeHtml(lv.text)}</div>
    <div class="row wrap"><button class="btn" data-speak-sample>🔊 Nghe bài mẫu</button><button class="btn" data-shadow-sample>🗣️ Nói theo</button><button class="btn" data-save-sample>📜 Lưu</button><span class="muted small">${lv.word_count} từ — độ dài là hệ quả của việc phát triển ý, không phải tiêu chí chấm.</span></div>
    <h4>Bài ${level} thể hiện</h4><ul>${lv.demonstrates.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
    <h4>Để lên mức tiếp theo</h4><p>${escapeHtml(lv.next_level)}</p>
    <details><summary><b>Khác nhau giữa IM – IH – AL</b></summary><ul>${set.key_differences_vi.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul></details>
    <div class="callout"><b>🚫 Đừng học thuộc:</b> ${escapeHtml(set.not_memorize_vi)}</div>
    <div class="callout callout-ok"><b>✍️ Cá nhân hóa:</b> ${escapeHtml(set.personalize_vi)}</div>
    <p class="muted small">Bài mẫu do AI viết để luyện tập (mục tiêu ${level}), không phải bài thi thật hay điểm chính thức.</p>`;
}

export function bindSampleSet(container, set, initial) {
  let level = initial;
  const draw = () => {
    container.innerHTML = renderSampleSet(set, level);
    container.querySelectorAll('[data-sample-level]').forEach((b) =>
      b.addEventListener('click', () => {
        level = b.dataset.sampleLevel;
        draw();
      }),
    );
    container.querySelector('[data-speak-sample]')?.addEventListener('click', () => speak(set.levels[level].text, settings.ttsRate).catch((e) => toast(e.message)));
    const payload = () => {
      const q = getQuestion(set.question_id);
      return { question_id: set.question_id, question_text: q?.question_text || '', topic: q?.topic || '', text: set.levels[level].text, source: 'sample', level };
    };
    container.querySelector('[data-save-sample]')?.addEventListener('click', () => quickSave(payload()));
    container.querySelector('[data-shadow-sample]')?.addEventListener('click', () => quickSave(payload(), { open: true, mode: 'shadow' }));
  };
  draw();
}

function onSample() {
  const box = $('sample-box');
  if (!box.hidden) return (box.hidden = true);
  const q = st.q;
  const set = sampleSetFor(q.question_id);
  box.hidden = false;
  if (set) {
    box.innerHTML = '<div id="sample-inner"></div>';
    bindSampleSet($('sample-inner'), set, settings.target);
  } else if (q.sample_ih) {
    box.innerHTML = `<h3>📖 Bài mẫu mục tiêu IH</h3>
      <p class="muted small">${escapeHtml(kb.class_persona_vi || '')}</p>
      <div class="sample-text en-text">${escapeHtml(q.sample_ih)}</div>
      <div class="row wrap"><button class="btn" data-speak-ih>🔊 Nghe bài mẫu</button><button class="btn" data-shadow-ih>🗣️ Nói theo</button><button class="btn" data-save-ih>📜 Lưu</button><span class="muted small">${q.sample_wc} từ</span></div>
      <div class="small"><b>Khung đã dùng:</b> <span class="en-text">${escapeHtml(q.answer_framework)}</span></div>
      <div class="callout"><b>🚫 Đừng học thuộc:</b> lấy khung và cụm từ hay, rồi kể chuyện thật của bạn. Câu trả lời học thuộc dễ bị nhận ra và không giúp lên level.</div>
      <p class="muted small">Bài mẫu do AI viết cho ${q.ext ? 'câu hỏi bổ sung (AI soạn, đã qua kiểm tra tự động)' : 'câu hỏi của lớp'}, nhắm mức IH để luyện tập — không phải bài thi thật hay điểm chính thức. Muốn lên AL: thêm diễn biến bất ngờ, lý do và suy nghĩ của bạn; muốn ở mức IM an toàn: nói gọn các ý chính.</p>`;
    box.querySelector('[data-speak-ih]').addEventListener('click', () => speak(q.sample_ih, settings.ttsRate).catch((e) => toast(e.message)));
    const payload = { question_id: q.question_id, question_text: q.question_text, topic: q.topic, text: q.sample_ih, source: 'sample', level: 'IH' };
    box.querySelector('[data-save-ih]').addEventListener('click', () => quickSave(payload));
    box.querySelector('[data-shadow-ih]').addEventListener('click', () => quickSave(payload, { open: true, mode: 'shadow' }));
  } else if (q.user_sample) {
    box.innerHTML = `<h3>📖 Bài mẫu bạn đã nhập</h3><div class="en-text">${md(q.user_sample)}</div>
      <p class="muted small">Nội dung do bạn cung cấp; app không xác định cấp độ của bài này.</p>`;
  } else {
    const same = kb.answer_sets.find((s) => getQuestion(s.question_id)?.prompt_type === q.prompt_type);
    box.innerHTML = `<h3>📖 Chưa có bài mẫu cho câu này</h3>
      <p class="small">Dùng khung phát triển ý: <span class="en-text">${escapeHtml(q.answer_framework)}</span></p>
      ${same ? `<p class="small">Xem bài mẫu 3 cấp của một câu cùng dạng <b>${escapeHtml(ptypeLabel(q.prompt_type))}</b>:</p><div id="sample-inner"></div>` : ''}`;
    if (same) {
      $('sample-inner').insertAdjacentHTML('beforebegin', `<p class="small en-text">“${escapeHtml(getQuestion(same.question_id).question_text)}”</p>`);
      bindSampleSet($('sample-inner'), same, settings.target);
    }
  }
}

// ---------- Tự kiểm tra (không cần AI) ----------
function onSelfCheck() {
  const box = $('selfcheck-box');
  if (!box.hidden) return (box.hidden = true);
  const items = st.q.expected_evidence.length ? st.q.expected_evidence : st.q.answer_framework.split('→').map((s) => s.trim());
  box.hidden = false;
  box.innerHTML = `<h3>✅ Tự kiểm tra</h3><p class="small muted">Nghe lại hoặc đọc lại câu trả lời, đánh dấu những gì bạn đã làm được.</p>
    ${items.map((it, i) => `<label class="check"><input type="checkbox" data-sc="${i}"> ${escapeHtml(it)}</label>`).join('')}
    <button class="btn primary" id="btn-save-sc">Lưu tự đánh giá</button>`;
  $('btn-save-sc').addEventListener('click', () => {
    const checked = [...box.querySelectorAll('[data-sc]')].filter((c) => c.checked).map((c) => items[+c.dataset.sc]);
    const ctx = buildCtx();
    addAttempt({ ...baseAttempt(ctx, 'none'), self_check: { checked, total: items.length } });
    toast(`Đã lưu: ${checked.length}/${items.length} mục`);
    box.hidden = true;
  });
}

// ---------- Khởi tạo ----------
export function initPractice() {
  fillFilters();
  $('f-source').addEventListener('change', (e) => {
    filters.source = e.target.value;
    fillTopics();
    nextQuestion();
  });
  $('f-category').addEventListener('change', (e) => {
    filters.category = e.target.value;
    fillTopics();
    nextQuestion();
  });
  $('f-topic').addEventListener('change', (e) => {
    filters.topic = e.target.value;
    nextQuestion();
  });
  $('f-ptype').addEventListener('change', (e) => {
    filters.ptype = e.target.value;
    nextQuestion();
  });
  document.querySelectorAll('[data-level]').forEach((b) =>
    b.addEventListener('click', () => {
      settings.target = b.dataset.level;
      saveSettings();
      renderLevel();
    }),
  );
  setMode(settings.mode);
  document.querySelectorAll('#tab-practice .seg[data-mode]').forEach((b) =>
    b.addEventListener('click', () => (st.recording ? toast('Hãy dừng ghi trước khi đổi chế độ.') : setMode(b.dataset.mode))),
  );
  $('btn-rec').addEventListener('click', () => (st.recording ? stopRecording() : startRecording()));
  $('btn-listen').addEventListener('click', listen);
  $('btn-next').addEventListener('click', nextQuestion);
  $('btn-toggle-text').addEventListener('click', () => {
    settings.hideText = !settings.hideText;
    saveSettings();
    renderQuestion();
  });
  $('btn-hints').addEventListener('click', () => renderHints($('hints-box').hidden));
  $('transcript').addEventListener('input', () => {
    updateWordCount();
    onTranscriptEdit();
  });
  $('btn-pron').addEventListener('click', onPron);
  $('analysis-box').addEventListener('click', (e) => e.target.closest('[data-pron-open]') && onPron());
  $('btn-grade').addEventListener('click', onGrade);
  $('btn-copy').addEventListener('click', onCopy);
  $('btn-sample').addEventListener('click', onSample);
  $('btn-selfcheck').addEventListener('click', onSelfCheck);
  $('practice-banner').addEventListener('click', (e) => {
    const b = e.target.closest('[data-combo-nav]');
    if (b) comboNav(b.dataset.comboNav);
  });
  $('btn-save-script').addEventListener('click', () => {
    if (st.recording) return toast('Hãy dừng ghi trước đã.');
    const text = $('transcript').value.trim();
    if (!text) return toast('Chưa có lời nói để lưu. Nói hoặc gõ câu trả lời vào ô trước.', 3500);
    quickSave({ question_id: st.q?.question_id, question_text: st.q?.question_text, topic: st.q?.topic, text, source: 'mine', level: settings.target });
  });
  $('feedback-box').addEventListener('click', (e) => {
    const b = e.target.closest('[data-save-expanded]');
    if (!b) return;
    const text = b.closest('details')?.querySelector('.en-text')?.textContent || '';
    quickSave({ question_id: st.q?.question_id, question_text: st.q?.question_text, topic: st.q?.topic, text, source: 'ai', level: settings.target });
  });
  renderLevel();
  const p = pool();
  st.q = p.length ? pick(p) : null;
  renderQuestion();
}

export const refreshPracticeFilters = () => fillFilters();
export const isRecording = () => st.recording;
