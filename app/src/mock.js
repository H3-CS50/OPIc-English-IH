// Thi thử mô phỏng 15 câu (cấu trúc theo tài liệu luyện thi/cộng đồng — không phải đề thật).
import { $, escapeHtml, toast, fmtTime, pick, shuffle, uid, LEVEL_SCORE, scoreToLabel, LEVEL_LABEL } from './util.js';
import { comboIds, getCombo, topicLabel, ptypeLabel } from './data.js';
import { createTranscriber, createRecorder, speak, stopSpeaking, canTranscribe } from './speech.js';
import { grade, providerReady } from './coach.js';
import { renderFeedback, renderCompact, levelBadge } from './feedback.js';
import { addAttempt } from './history.js';
import { settings, saveSettings } from './settings.js';

const TOTAL_SECONDS = 40 * 60;

const ms = {
  phase: 'setup',
  items: [],
  idx: 0,
  answers: [],
  clock: TOTAL_SECONDS,
  clockId: null,
  qTimerId: null,
  qSeconds: 0,
  recording: false,
  transcriber: null,
  recorder: null,
  plays: 0,
  mockId: null,
  grading: false,
  abort: null,
};

// ---------- Tạo đề ----------
function comboInfo() {
  const out = [];
  for (const id of comboIds()) {
    const qs = getCombo(id);
    if (!qs.length || id.startsWith('U-')) continue;
    const kind = id === 'C-intro' ? 'intro' : id.startsWith('RP-') ? 'rp' : id.startsWith('ADV-') ? 'adv' : 'combo';
    out.push({ id, kind, topic: qs[0].topic, category: qs[0].topic_category, oqc: qs.some((q) => q.oqc_branch), qs });
  }
  return out;
}

const SECTION = (i) =>
  i === 0 ? 'Giới thiệu' : i <= 3 ? 'Combo 1' : i <= 6 ? 'Combo 2' : i <= 9 ? 'Combo 3' : i <= 12 ? 'Role-play' : 'Câu nâng cao';

export function buildMock({ topics, diff, oqc }) {
  const info = comboInfo().filter((c) => oqc || !c.oqc);
  const intro = pick(info.find((c) => c.kind === 'intro').qs.filter((q) => oqc || !q.oqc_branch));
  const survey = info.filter((c) => c.kind === 'combo' && c.category === 'survey');
  const chosen = survey.filter((c) => !topics.length || topics.includes(c.topic));
  const pool = chosen.length ? chosen : survey;
  // Ưu tiên 2 chủ đề khác nhau.
  const byTopic = shuffle([...new Set(pool.map((c) => c.topic))]);
  const surveyCombos = [];
  for (const t of byTopic) {
    if (surveyCombos.length < 2) surveyCombos.push(pick(pool.filter((c) => c.topic === t)));
  }
  // Nếu chỉ chọn 1 chủ đề: lấy combo khác của chủ đề đó, hoặc một chủ đề survey khác.
  if (surveyCombos.length < 2) {
    const rest = pool.filter((c) => c !== surveyCombos[0]);
    surveyCombos.push(pick(rest.length ? rest : survey.filter((c) => c !== surveyCombos[0])));
  }
  const unexpected = shuffle(info.filter((c) => c.kind === 'combo' && c.category === 'unexpected'));
  const rpSets = info.filter((c) => c.kind === 'rp' && c.id !== 'RP-ava');
  const rp = pick(rpSets);
  let rpQs = [...rp.qs];
  // Đôi khi câu 11 là dạng "hãy hỏi tôi 3–4 câu".
  if (Math.random() < 0.25) {
    const ava = info.find((c) => c.id === 'RP-ava');
    if (ava) rpQs = [pick(ava.qs), ...rpQs.slice(1)];
  }
  let last;
  if (diff === '56') last = pick(info.filter((c) => c.kind === 'adv')).qs.slice(0, 2);
  else last = unexpected[1].qs.slice(0, 2);
  return [intro, ...surveyCombos[0].qs, ...surveyCombos[1].qs, ...unexpected[0].qs, ...rpQs, ...last];
}

// ---------- Màn hình chuẩn bị ----------
function renderSetup() {
  const surveyTopics = [...new Set(comboInfo().filter((c) => c.kind === 'combo' && c.category === 'survey').map((c) => c.topic))];
  const saved = settings.mockTopics || [];
  $('mock-topics').innerHTML = surveyTopics
    .map((t) => `<label class="check chip-check"><input type="checkbox" value="${t}" ${saved.includes(t) ? 'checked' : ''}> ${escapeHtml(topicLabel(t))}</label>`)
    .join('');
  document.querySelectorAll('[name=mock-diff]').forEach((r) => (r.checked = r.value === (settings.mockDiff || (settings.target === 'IM' ? '34' : '56'))));
  $('mock-oqc').checked = settings.includeOqc;
  document.querySelectorAll('#mock-setup .seg[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === settings.mode));
}

function show(phase) {
  ms.phase = phase;
  $('mock-setup').hidden = phase !== 'setup';
  $('mock-run').hidden = phase !== 'run';
  $('mock-review').hidden = phase !== 'review';
  window.scrollTo(0, 0);
}

function start() {
  const topics = [...document.querySelectorAll('#mock-topics input:checked')].map((i) => i.value);
  const diff = document.querySelector('[name=mock-diff]:checked')?.value || '56';
  settings.mockTopics = topics;
  settings.mockDiff = diff;
  settings.includeOqc = $('mock-oqc').checked;
  saveSettings();
  if (settings.mode === 'transcribe' && !canTranscribe()) return toast('Thiết bị không hỗ trợ chuyển giọng nói thành chữ. Chọn chế độ 🎙️ Ghi âm.', 4500);
  ms.items = buildMock({ topics, diff, oqc: settings.includeOqc });
  ms.answers = ms.items.map(() => ({ transcript: '', audio: null, seconds: 0, result: null, error: '' }));
  ms.idx = 0;
  ms.clock = TOTAL_SECONDS;
  ms.mockId = uid();
  clearInterval(ms.clockId);
  ms.clockId = setInterval(() => {
    ms.clock--;
    $('mock-clock').textContent = fmtTime(ms.clock);
    $('mock-clock').classList.toggle('warn', ms.clock < 300);
    if (ms.clock <= 0) {
      toast('⏰ Hết 40 phút. Chuyển sang phần xem lại.', 4000);
      finish();
    }
  }, 1000);
  show('run');
  renderQuestion();
}

// ---------- Làm bài ----------
function renderQuestion() {
  const q = ms.items[ms.idx];
  ms.plays = 0;
  ms.qSeconds = 0;
  $('mock-progress').textContent = `Câu ${ms.idx + 1}/${ms.items.length}`;
  $('mock-section').textContent = `${SECTION(ms.idx)} · ${ptypeLabel(q.prompt_type)}`;
  $('mock-clock').textContent = fmtTime(ms.clock);
  $('mock-q-text').textContent = q.question_text;
  $('mock-q-text').hidden = true;
  $('mock-q-hidden').hidden = false;
  $('mock-toggle-text').textContent = '👁️ Hiện chữ';
  $('mock-timer').textContent = '0:00';
  $('mock-live').textContent = '';
  $('mock-replay').disabled = false;
  $('mock-rec-status').textContent = 'Nghe câu hỏi, rồi bấm nút đỏ để trả lời';
  $('mock-next').textContent = ms.idx === ms.items.length - 1 ? 'Nộp bài ✓' : 'Câu tiếp ▶';
  setTimeout(() => playQuestion(true), 400);
}

async function playQuestion(first = false) {
  const q = ms.items[ms.idx];
  if (!first && ms.plays >= 2) return;
  ms.plays++;
  if (ms.plays >= 2) $('mock-replay').disabled = true;
  try {
    await speak(q.question_text, settings.ttsRate);
  } catch (e) {
    toast(e.message);
  }
}

async function startRec() {
  await stopSpeaking();
  const a = ms.answers[ms.idx];
  try {
    if (settings.mode === 'transcribe') {
      ms.transcriber = createTranscriber((t) => {
        a.transcript = t;
        $('mock-live').textContent = t.length > 160 ? '…' + t.slice(-160) : t;
      });
      await ms.transcriber.start();
    } else {
      ms.recorder = createRecorder();
      await ms.recorder.start();
    }
  } catch (e) {
    ms.transcriber = ms.recorder = null;
    return toast(e.message || 'Không mở được micro.', 4500);
  }
  ms.recording = true;
  $('mock-replay').disabled = true;
  $('mock-rec').classList.add('recording');
  $('mock-rec-status').textContent = 'Đang ghi… bấm lần nữa để dừng';
  ms.qTimerId = setInterval(() => {
    ms.qSeconds++;
    $('mock-timer').textContent = fmtTime(ms.qSeconds);
  }, 1000);
}

async function stopRec() {
  if (!ms.recording) return;
  ms.recording = false;
  clearInterval(ms.qTimerId);
  $('mock-rec').classList.remove('recording');
  const a = ms.answers[ms.idx];
  a.seconds += ms.qSeconds;
  ms.qSeconds = 0;
  if (ms.transcriber) {
    a.transcript = await ms.transcriber.stop();
    ms.transcriber = null;
  }
  if (ms.recorder) {
    a.audio = await ms.recorder.stop();
    ms.recorder = null;
  }
  $('mock-rec-status').textContent = `Đã lưu câu trả lời (${fmtTime(a.seconds)}). Bấm "${$('mock-next').textContent}" để tiếp tục.`;
}

async function next() {
  await stopRec();
  await stopSpeaking();
  if (ms.idx < ms.items.length - 1) {
    ms.idx++;
    renderQuestion();
  } else finish();
}

async function finish() {
  await stopRec();
  await stopSpeaking();
  clearInterval(ms.clockId);
  show('review');
  renderReview();
}

// ---------- Xem lại & chấm ----------
function renderSummary() {
  const graded = ms.answers.filter((a) => a.result);
  const scores = graded.map((a) => LEVEL_SCORE[a.result.practice_level_estimate.label]).filter((s) => s != null).sort((x, y) => x - y);
  const answered = ms.answers.filter((a) => a.transcript.trim() || a.audio).length;
  const used = TOTAL_SECONDS - Math.max(0, ms.clock);
  let html = `<div class="stat-row"><div class="stat"><b>${answered}/${ms.items.length}</b><span>câu đã trả lời</span></div>
    <div class="stat"><b>${fmtTime(used)}</b><span>thời gian làm bài</span></div>
    <div class="stat"><b>${graded.length}</b><span>câu đã chấm</span></div></div>`;
  if (scores.length) {
    const median = scores[Math.floor((scores.length - 1) / 2)];
    const label = scoreToLabel(median);
    const dist = {};
    graded.forEach((a) => (dist[a.result.practice_level_estimate.label] = (dist[a.result.practice_level_estimate.label] || 0) + 1));
    const gaps = [...new Set(graded.map((a) => a.result.main_gap.point_vi).filter(Boolean))].slice(0, 3);
    html += `<div class="readiness">${levelBadge(label, 'badge-lg')}<div><b>Ước tính luyện tập của cả bài: ${LEVEL_LABEL[label]}</b>
      <div class="small muted">Trung vị của ${scores.length} câu đã chấm. Không phải kết quả OPIc chính thức.</div></div></div>
      <div class="small">${Object.entries(dist).map(([k, v]) => `${levelBadge(k)} × ${v}`).join(' ')}</div>
      ${gaps.length ? `<h4>Điểm cần cải thiện lặp lại</h4><ul class="small">${gaps.map((g) => `<li>${escapeHtml(g)}</li>`).join('')}</ul>` : ''}`;
  }
  $('mock-summary').innerHTML = html;
}

function renderReview() {
  renderSummary();
  $('mock-list').innerHTML = ms.items
    .map((q, i) => {
      const a = ms.answers[i];
      return `<details class="card mock-item" data-i="${i}">
        <summary><span class="badge badge-num">${i + 1}</span> <b>${escapeHtml(SECTION(i))}</b> · <span class="muted small">${escapeHtml(ptypeLabel(q.prompt_type))}</span>
          <div class="mock-item-result">${a.result ? renderCompact(a.result) : a.error ? `<span class="small">⚠️ ${escapeHtml(a.error)}</span>` : a.transcript.trim() || a.audio ? '<span class="muted small">chưa chấm</span>' : '<span class="muted small">bỏ trống</span>'}</div>
        </summary>
        <p class="en-text">${escapeHtml(q.question_text)}</p>
        ${a.audio ? `<audio controls src="${a.audio.url}"></audio>` : ''}
        <label class="field"><span>Lời nói (có thể sửa chỗ máy nghe nhầm)</span><textarea rows="4" data-tr="${i}">${escapeHtml(a.transcript)}</textarea></label>
        <div class="row"><button class="btn primary" data-grade="${i}">🤖 Chấm câu này</button></div>
        <div class="mock-fb">${a.result ? renderFeedback(a.result, { showRetry: false }) : ''}</div>
      </details>`;
    })
    .join('');
  $('mock-list')
    .querySelectorAll('[data-tr]')
    .forEach((t) => t.addEventListener('input', () => (ms.answers[+t.dataset.tr].transcript = t.value)));
  $('mock-list')
    .querySelectorAll('[data-grade]')
    .forEach((b) => b.addEventListener('click', () => gradeOne(+b.dataset.grade, true)));
}

async function gradeOne(i, single = false) {
  const q = ms.items[i];
  const a = ms.answers[i];
  const hasText = !!a.transcript.trim();
  if (!hasText && !a.audio) {
    if (single) toast('Câu này chưa có câu trả lời.');
    return false;
  }
  const inputMode = a.audio && settings.provider === 'gemini' ? (hasText ? 'audio_and_transcript' : 'audio') : 'transcript_only';
  const ready = providerReady(settings, !hasText && a.audio ? 'audio' : inputMode);
  if (!ready.ok) {
    toast(ready.reason, 5500);
    return null;
  }
  const item = $('mock-list').querySelector(`[data-i="${i}"]`);
  const resEl = item.querySelector('.mock-item-result');
  resEl.innerHTML = '<span class="muted small"><span class="spinner"></span> đang chấm…</span>';
  ms.abort = new AbortController();
  const ctx = {
    question: q.question_text,
    ptype: q.prompt_type,
    ptypeLabel: ptypeLabel(q.prompt_type),
    expected: q.expected_evidence,
    target: settings.target,
    inputMode,
    seconds: a.seconds,
    transcript: a.transcript,
  };
  const { result, error } = await grade(settings, ctx, a.audio, ms.abort.signal);
  ms.abort = null;
  if (error) {
    a.error = error;
    resEl.innerHTML = `<span class="small">⚠️ ${escapeHtml(error)}</span>`;
    return false;
  }
  a.result = result;
  a.error = '';
  addAttempt({
    mode: 'mock',
    mock_id: ms.mockId,
    question_id: q.question_id,
    question_text: q.question_text,
    prompt_type: q.prompt_type,
    topic: q.topic,
    target_level: settings.target,
    input_mode: inputMode,
    seconds: a.seconds,
    transcript: a.transcript,
    provider: settings.provider,
    coach_result: result,
  });
  resEl.innerHTML = renderCompact(result);
  item.querySelector('.mock-fb').innerHTML = renderFeedback(result, { showRetry: false });
  renderSummary();
  return true;
}

async function gradeAll() {
  if (ms.grading) {
    ms.stop = true;
    ms.abort?.abort();
    return;
  }
  ms.grading = true;
  ms.stop = false;
  $('mock-grade-all').textContent = '⏹ Dừng chấm';
  for (let i = 0; i < ms.items.length && !ms.stop; i++) {
    if (ms.answers[i].result) continue;
    $('mock-grade-status').textContent = `Đang chấm câu ${i + 1}/${ms.items.length}…`;
    const r = await gradeOne(i);
    if (r === null) break; // chưa cấu hình AI
  }
  ms.grading = false;
  $('mock-grade-all').textContent = '🤖 Chấm tất cả';
  $('mock-grade-status').textContent = '';
}

export function initMock() {
  renderSetup();
  document.querySelectorAll('#mock-setup .seg[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      settings.mode = b.dataset.mode;
      saveSettings();
      renderSetup();
    }),
  );
  $('btn-mock-start').addEventListener('click', start);
  $('mock-rec').addEventListener('click', () => (ms.recording ? stopRec() : startRec()));
  $('mock-replay').addEventListener('click', () => playQuestion());
  $('mock-toggle-text').addEventListener('click', () => {
    const h = !$('mock-q-text').hidden;
    $('mock-q-text').hidden = h;
    $('mock-q-hidden').hidden = !h;
    $('mock-toggle-text').textContent = h ? '👁️ Hiện chữ' : '🙈 Ẩn chữ';
  });
  $('mock-next').addEventListener('click', next);
  $('mock-end').addEventListener('click', () => {
    if (confirm('Kết thúc bài thi thử và chuyển sang phần xem lại?')) finish();
  });
  $('mock-grade-all').addEventListener('click', gradeAll);
  $('mock-new').addEventListener('click', () => {
    if (ms.answers.some((a) => (a.transcript.trim() || a.audio) && !a.result) && !confirm('Còn câu chưa chấm. Ghi âm sẽ mất khi làm bài mới. Tiếp tục?')) return;
    ms.answers.forEach((a) => a.audio?.url && URL.revokeObjectURL(a.audio.url));
    renderSetup();
    show('setup');
  });
}

export const mockBusy = () => ms.phase === 'run' || ms.grading;
