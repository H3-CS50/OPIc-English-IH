// Thi thử mô phỏng 15 câu (cấu trúc theo tài liệu luyện thi/cộng đồng — không phải đề thật).
import { $, escapeHtml, toast, fmtTime, pick, shuffle, uid, LEVEL_SCORE, scoreToLabel, LEVEL_LABEL, countWords } from './util.js';
import { comboIds, getCombo, getQuestion, topicLabel, ptypeLabel } from './data.js';
import TESTS from './tests.json';
import { createTranscriber, createRecorder, speak, stopSpeaking, canTranscribe } from './speech.js';
import { grade, providerReady, usesGemini } from './coach.js';
import { renderFeedback, renderCompact, levelBadge } from './feedback.js';
import { addAttempt } from './history.js';
import { settings, saveSettings, onSettingsChange } from './settings.js';
import {
  normalizeSurvey, surveyTopics, surveySummary, surveyFormHTML, readSurveyForm,
  selfLevelHTML, levelToDiff, suggestLevel, clampLevel,
} from './mock-survey.js';
import { saveMockRecord, listMocks, onMocksChange } from './mock-history.js';
import { quickSave } from './scripts.js';
import { targetDuration } from './durations.js';
import { logActivity } from './activity.js';
import { weekTest, weekDone } from './week.js';
import { recordSpoken } from './roadmap-core.js';
import { createTimingTracker, pausesFromBlob } from './analysis.js';
import { analyze, renderAnalysis, analysisChips, logAnalysis } from './analysis-ui.js';
import { openPron, pronChoicesFrom } from './pron.js';
import { startAmbience, stopAmbience, setAmbienceMuted, ambienceSupported, ambiencePlaying } from './ambience.js';

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
// Mỗi combo được phân loại theo mock_slot của câu hỏi; nguồn: app (ngân hàng của app) hoặc class (câu hỏi của lớp).
export function comboInfo() {
  const out = [];
  for (const id of comboIds()) {
    const qs = getCombo(id);
    if (!qs.length || id.startsWith('U-')) continue;
    const slots = new Set(qs.map((q) => q.mock_slot));
    const kind = slots.has('intro')
      ? 'intro'
      : qs.every((q) => q.prompt_type === 'roleplay_ask_ava')
        ? 'ava'
        : [...slots].some((x) => x.startsWith('rp_'))
          ? 'rp'
          : slots.has('adv')
            ? 'adv'
            : 'combo';
    const need = kind === 'rp' || kind === 'combo' ? 3 : kind === 'adv' ? 2 : 1;
    if (qs.length < need) continue;
    out.push({ id, kind, source: qs[0].origin_set || 'app', topic: qs[0].topic, category: qs[0].topic_category, oqc: qs.some((q) => q.oqc_branch), qs });
  }
  return out;
}

const SECTION = (i) =>
  i === 0 ? 'Giới thiệu' : i <= 3 ? 'Combo 1' : i <= 6 ? 'Combo 2' : i <= 9 ? 'Combo 3' : i <= 12 ? 'Role-play' : ms.level >= 5 ? 'Câu nâng cao' : 'Câu 14–15';

// source: 'both' | 'app' | 'class'
function pools({ oqc, source = 'both' }) {
  const all = comboInfo().filter((c) => oqc || !c.oqc);
  let info = all.filter((c) => source === 'both' || c.source === source);
  // Nguồn quá ít câu cho một phần nào đó thì lấy thêm từ nguồn còn lại.
  const enough = (k, cat, n) => info.filter((c) => c.kind === k && (!cat || c.category === cat)).length >= n;
  if (!enough('combo', 'survey', 2) || !enough('combo', 'unexpected', 2) || !enough('rp', null, 1) || !enough('adv', null, 1)) info = all;
  return { all, info };
}

const hardness = (c) => c.qs.filter((q) => q.difficulty_design === 'challenging').length;
// Chọn ngẫu nhiên, nghiêng về combo khó hơn khi hard = true.
const pickCombo = (list, hard) => {
  if (!hard || list.length < 2) return pick(list);
  const top = Math.max(...list.map(hardness));
  const hardList = list.filter((c) => hardness(c) === top);
  return pick(hardList.length ? hardList : list);
};

// Câu 8–15: combo đột xuất, role-play, 2 câu cuối (nâng cao nếu cấp 5–6).
function tailItems(info, { diff, discuss = [], hard = false, exclude = new Set(), avoidTopics = new Set() }) {
  const unexp = info.filter((c) => c.kind === 'combo' && c.category === 'unexpected' && !exclude.has(c.id));
  const fresh = unexp.filter((c) => !avoidTopics.has(c.topic));
  const u1 = pickCombo(fresh.length ? fresh : unexp, hard);
  const rp = pick(info.filter((c) => c.kind === 'rp' && !exclude.has(c.id)));
  let rpQs = [...rp.qs];
  // Đôi khi câu 11 là dạng "hãy hỏi tôi 3–4 câu".
  const avas = info.filter((c) => c.kind === 'ava');
  if (avas.length && Math.random() < 0.25) rpQs = [pick(pick(avas).qs), ...rpQs.slice(1)];
  let last;
  if (diff === '56') {
    const adv = info.filter((c) => c.kind === 'adv' && !exclude.has(c.id));
    const liked = adv.filter((c) => discuss.includes(c.topic));
    last = pickCombo(liked.length ? liked : adv, hard).qs.slice(0, 2);
  } else {
    const rest = unexp.filter((c) => c !== u1 && c.topic !== u1.topic);
    last = pickCombo(rest.length ? rest : unexp.filter((c) => c !== u1), false).qs.slice(0, 2);
  }
  return [...u1.qs, ...rpQs, ...last];
}

export function buildMock({ topics = [], discuss = [], diff, oqc, source = 'both', hard = false }) {
  const { all, info } = pools({ oqc, source });
  const intro = pick(all.find((c) => c.kind === 'intro').qs.filter((q) => oqc || !q.oqc_branch));
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
  const head = [intro, ...surveyCombos[0].qs, ...surveyCombos[1].qs];
  return [...head, ...tailItems(info, { diff, discuss, hard, exclude: new Set(surveyCombos.map((c) => c.id)) })];
}

// Sau câu 7: đổi độ khó cho phần còn lại (câu 8–15), giữ nguyên 7 câu đầu.
export function rebuildTail(items, { diff, discuss = [], oqc, source = 'both', hard = false }) {
  const { info } = pools({ oqc, source });
  const head = items.slice(0, 7);
  const used = new Set(head.map((q) => q.combo_id).filter(Boolean));
  const topics = new Set(head.map((q) => q.topic));
  return [...head, ...tailItems(info, { diff, discuss, hard, exclude: used, avoidTopics: topics })];
}

// ---------- Màn hình chuẩn bị ----------
const TARGET_HINT = {
  IM: 'Gợi ý: tự đánh giá cấp 3–4. Đề không có câu nâng cao ở cuối.',
  IH: 'Gợi ý: tự đánh giá cấp 5 hoặc 6. Hai cấp này đều 15 câu, độ khó tương đương.',
  AL: 'Gợi ý: tự đánh giá cấp 6 để có câu so sánh và câu về vấn đề xã hội.',
};

function currentSurvey() {
  if (!settings.survey && settings.mockTopics?.length) {
    // Bản cũ chỉ lưu danh sách chủ đề — chuyển sang khảo sát.
    const map = { movies: 'movies', parks: 'parks', beach: 'beach', bars: 'bars', music: 'music', walking: 'walking', vacation_home: 'vacation_home', domestic_trips: 'domestic', overseas_trips: 'overseas' };
    const leisure = settings.mockTopics.map((t) => map[t]).filter(Boolean);
    settings.survey = normalizeSurvey({ leisure: leisure.length ? leisure : undefined });
  }
  return normalizeSurvey(settings.survey);
}

function renderSurveySummary() {
  const sum = surveySummary(currentSurvey());
  $('mock-survey-sum').innerHTML = `<div>${escapeHtml(sum.head)}</div>
    <div class="sv-tags">${sum.leisure.map((x) => `<span class="sv-tag">${escapeHtml(x)}</span>`).join('') || '<span class="muted">Chưa chọn hoạt động nào — đề sẽ lấy chủ đề ngẫu nhiên.</span>'}</div>
    ${sum.discuss.length ? `<div class="muted">Đề tài thảo luận: ${sum.discuss.map(escapeHtml).join(', ')}</div>` : ''}`;
}

function renderSetup() {
  renderTests();
  const src = settings.mockSource || 'both';
  document.querySelectorAll('[name=mock-source]').forEach((r) => (r.checked = r.value === src));
  document.querySelectorAll('#mock-target .seg').forEach((b) => b.classList.toggle('active', b.dataset.target === settings.target));
  $('mock-target-hint').textContent = TARGET_HINT[settings.target] || '';
  $('mock-survey-form').innerHTML = surveyFormHTML(currentSurvey());
  renderSurveySummary();
  const lvl = settings.mockSelf || (settings.mockDiff === '34' ? 4 : settings.mockDiff === '56' ? 5 : suggestLevel(settings.target));
  $('mock-self').innerHTML = selfLevelHTML(clampLevel(lvl));
  $('mock-reselect').checked = settings.mockReselect !== false;
  $('mock-oqc').checked = settings.includeOqc;
  $('mock-noise').value = settings.mockNoise || 'off';
  $('mock-noise').disabled = !ambienceSupported();
  document.querySelectorAll('#mock-setup .seg[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === settings.mode));
}

function show(phase) {
  ms.phase = phase;
  $('mock-setup').hidden = phase !== 'setup';
  $('mock-run').hidden = phase !== 'run';
  $('mock-review').hidden = phase !== 'review';
  window.scrollTo(0, 0);
}

// Lưu tùy chọn chung (cách trả lời, tiếng ồn) rồi bắt đầu chạy đề.
function launch(items) {
  settings.mockNoise = $('mock-noise').value;
  saveSettings();
  if (settings.mode === 'transcribe' && !canTranscribe()) {
    toast('Thiết bị không hỗ trợ chuyển giọng nói thành chữ. Chọn chế độ 🎙️ Ghi âm.', 4500);
    return false;
  }
  ms.items = items;
  ms.answers = ms.items.map(() => ({ transcript: '', audio: null, seconds: 0, result: null, error: '', timing: null, pron: null }));
  ms.idx = 0;
  ms.clock = TOTAL_SECONDS;
  ms.mockId = uid();
  ms.started = Date.now();
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
  showReselect(false);
  clearTimeout(ms.previewTimer);
  ms.noiseMuted = false;
  startAmbience(settings.mockNoise).then((on) => {
    $('mock-noise-mute').hidden = !on;
    $('mock-noise-mute').textContent = '🔇';
  });
  renderQuestion();
  return true;
}

// ---------- Bộ đề cố định ----------
export const testSets = () => TESTS.sets;
const testById = (id) => TESTS.sets.flatMap((s) => s.tests).find((t) => t.id === id);
function testStatus(id) {
  const done = listMocks().filter((m) => m.testId === id);
  if (!done.length) return null;
  const graded = done.filter((m) => m.label);
  return { times: done.length, last: done.at(-1), best: graded.length ? graded.reduce((a, m) => (LEVEL_SCORE[m.label] > LEVEL_SCORE[a.label] ? m : a)) : null };
}
const testTopics = (t) => t.sections.slice(1).map((s) => topicLabel(s.topic).replace(/^Role-play: /, '🎭 '));

function renderTests() {
  const lv = settings.testLevel || (settings.target === 'IM' ? '34' : '56');
  document.querySelectorAll('#tests-level .seg').forEach((b) => b.classList.toggle('active', b.dataset.tlevel === lv));
  const set = TESTS.sets.find((s) => s.level === lv);
  const st = set.tests.map((t) => [t, testStatus(t.id)]);
  const done = st.filter(([, s]) => s).length;
  const next = st.find(([, s]) => !s)?.[0];
  const showAll = !!settings.testsShowAll;
  const list = showAll ? st : st.filter(([t, s]) => !s || t === next).slice(0, 6);
  const wt = weekTest(lv);
  const wDone = weekDone(wt, listMocks());
  const dm = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  $('week-box').innerHTML = `<div class="week-box ${wDone ? 'done' : ''}">
    <div class="row between"><b>🗓️ Đề của tuần ${wt.week}</b><span class="muted small">${dm(wt.from)} – ${dm(wt.to)}</span></div>
    <div class="row between"><span class="small">Đề <b>${wt.test.id}</b> · ${wDone ? '✅ bạn đã làm tuần này' : 'cả nhóm cùng làm, <b>+50 EXP</b>'}</span>
      <button class="btn ${wDone ? '' : 'primary'} small-btn" data-test="${wt.test.id}">${wDone ? 'Làm lại' : '▶ Làm ngay'}</button></div>
  </div>`;
  $('tests-summary').innerHTML = `<div class="row between"><span class="small"><b>${done}/${set.tests.length}</b> đề đã làm</span>${next ? `<button class="btn primary small-btn" data-test="${next.id}">▶ Làm đề ${next.id}</button>` : '<span class="small">🎉 Đã làm hết bộ này</span>'}</div>
    <span class="rm-bar"><span style="width:${Math.round((100 * done) / set.tests.length)}%"></span></span>`;
  $('tests-list').innerHTML =
    list
      .map(([t, s]) => {
        const badge = s?.best ? levelBadge(s.best.label) : s ? '<span class="badge">✓</span>' : `<span class="badge badge-num">${t.no}</span>`;
        return `<button class="list-item test-item ${s ? 'done' : ''}" data-test="${t.id}">
          <div class="row between"><b>Đề ${t.id}</b>${badge}</div>
          <div class="muted small">${testTopics(t).map(escapeHtml).join(' · ')}</div>
          ${s ? `<div class="small">Đã làm ${s.times} lần · lần gần nhất ${new Date(s.last.at).toLocaleDateString('vi-VN')} · trả lời ${s.last.answered}/${s.last.total} câu${s.best ? '' : ' · chưa chấm'}</div>` : ''}
        </button>`;
      })
      .join('') +
    `<button class="link-btn" data-tests-all>${showAll ? 'Thu gọn' : `Xem cả ${set.tests.length} đề`}</button>`;
}

function startFixed(id) {
  const t = testById(id);
  if (!t) return;
  const items = t.qids.map(getQuestion).filter(Boolean);
  if (items.length !== 15) return toast('Đề này thiếu câu hỏi. Hãy cập nhật app.');
  ms.testId = id;
  ms.level = t.level === '34' ? 4 : 5;
  ms.level0 = ms.level;
  ms.reselected = null;
  ms.fixed = true;
  ms.discuss = [];
  launch(items);
}

function start() {
  ms.testId = null;
  ms.fixed = false;
  settings.survey = readSurveyForm($('mock-survey-form'));
  settings.mockSelf = +(document.querySelector('[name=mock-self]:checked')?.value || suggestLevel(settings.target));
  settings.mockReselect = $('mock-reselect').checked;
  settings.includeOqc = $('mock-oqc').checked;
  settings.mockSource = document.querySelector('[name=mock-source]:checked')?.value || 'both';
  const { topics, discuss } = surveyTopics(settings.survey, { oqc: settings.includeOqc });
  ms.level = settings.mockSelf;
  ms.level0 = ms.level;
  ms.reselected = null;
  ms.discuss = discuss;
  launch(buildMock({ topics, discuss, diff: levelToDiff(ms.level), oqc: settings.includeOqc, source: settings.mockSource, hard: ms.level === 6 }));
}

// ---------- Chọn lại độ khó sau câu 7 ----------
function showReselect(on) {
  $('mock-reselect-panel').hidden = !on;
  $('mock-q-card').hidden = on;
  $('mock-recorder').hidden = on;
  $('mock-next').hidden = on;
  if (on) {
    $('mock-progress').textContent = 'Xong 7/15 câu';
    $('mock-section').textContent = 'Chọn lại độ khó';
  }
}

function applyReselect(delta) {
  const before = ms.level;
  ms.level = clampLevel(ms.level + delta);
  ms.reselected = delta;
  const hard = delta > 0 || ms.level === 6;
  const tail = rebuildTail(ms.items, { diff: levelToDiff(ms.level), discuss: ms.discuss, oqc: settings.includeOqc, source: settings.mockSource, hard });
  ms.items = tail;
  showReselect(false);
  toast(delta === 0 ? 'Giữ độ khó như cũ.' : ms.level === before ? 'Đã ở mức giới hạn của app — giữ nguyên cấp, chọn câu khó hơn.' : `Phần còn lại theo cấp ${ms.level}.`, 3000);
  ms.idx = 7;
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
  const [lo, hi] = targetDuration(q, settings.target);
  $('mock-timer-target').textContent = ` / gợi ý ${fmtTime(lo)}–${fmtTime(hi)}`;
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
      ms.tracker = createTimingTracker();
      ms.tracker.start();
      ms.transcriber = createTranscriber((t) => {
        ms.tracker?.update(t);
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
    a.timing = mergeTiming(a.timing, ms.tracker?.stop());
    ms.tracker = null;
  }
  if (ms.recorder) {
    a.audio = await ms.recorder.stop();
    ms.recorder = null;
    if (a.audio) pausesFromBlob(a.audio.blob).then((t) => (a.timing = t));
  }
  recordSpoken(ms.items[ms.idx]?.question_id, { words: countWords(a.transcript), seconds: a.seconds });
  $('mock-rec-status').textContent = `Đã lưu câu trả lời (${fmtTime(a.seconds)}). Bấm "${$('mock-next').textContent}" để tiếp tục.`;
}

async function next() {
  await stopRec();
  await stopSpeaking();
  if (ms.idx === 6 && !ms.fixed && settings.mockReselect && ms.reselected === null) {
    showReselect(true);
    return;
  }
  if (ms.idx < ms.items.length - 1) {
    ms.idx++;
    renderQuestion();
  } else finish();
}

async function finish() {
  await stopRec();
  await stopSpeaking();
  clearInterval(ms.clockId);
  stopAmbience();
  $('mock-noise-mute').hidden = true;
  showReselect(false);
  show('review');
  renderReview();
  recordMock();
  // Ghi âm cần vài giây để tính khoảng ngừng: vẽ lại phân tích rồi lưu chỉ số.
  setTimeout(() => {
    if (ms.phase !== 'review') return;
    ms.items.forEach((q, i) => {
      renderItemAnalysis(i);
      logAnalysis(answerAnalysis(i), { qid: q.question_id, ptype: q.prompt_type, target: settings.target });
    });
    renderSummary();
  }, 1500);
}

// ---------- Xem lại & chấm ----------
function renderSummary() {
  const graded = ms.answers.filter((a) => a.result);
  const scores = graded.map((a) => LEVEL_SCORE[a.result.practice_level_estimate.label]).filter((s) => s != null).sort((x, y) => x - y);
  const answered = ms.answers.filter((a) => a.transcript.trim() || a.audio).length;
  const used = TOTAL_SECONDS - Math.max(0, ms.clock);
  const flow = ms.testId ? `Đề ${ms.testId} (bộ đề cố định)` : `Tự đánh giá cấp ${ms.level0}${ms.reselected !== null && ms.level !== ms.level0 ? ` → cấp ${ms.level} sau câu 7` : ms.reselected !== null ? ' · giữ nguyên sau câu 7' : ''}`;
  let html = `<div class="mock-flow">${flow}</div><div class="stat-row"><div class="stat"><b>${answered}/${ms.items.length}</b><span>câu đã trả lời</span></div>
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
  html += overallAnalysisHTML();
  $('mock-summary').innerHTML = html;
}

// Nói một câu nhiều lần (dừng rồi ghi tiếp): gộp các khoảng ngừng.
function mergeTiming(prev, next) {
  if (!next) return prev;
  if (!prev) return next;
  return { ...prev, gaps: [...prev.gaps, ...next.gaps] };
}
const answerAnalysis = (i) => {
  const a = ms.answers[i];
  return analyze({ text: a.transcript.trim() || a.result?.transcript_used || '', seconds: a.seconds, target: settings.target, ptype: ms.items[i].prompt_type, timing: a.timing, ai: a.result, pron: a.pron });
};
function renderItemAnalysis(i) {
  const item = $('mock-list')?.querySelector(`[data-i="${i}"]`);
  if (!item) return;
  const an = answerAnalysis(i);
  item.querySelector('.mock-an').innerHTML = renderAnalysis(an, { pronButton: !!ms.answers[i].audio });
  item.querySelector('.mock-an-chips').innerHTML = analysisChips(an);
}
// Tổng hợp cả bài: tốc độ trung bình, số lần ngừng dài, từ nối, lỗi dễ thấy.
function overallAnalysisHTML() {
  const list = ms.items.map((_, i) => answerAnalysis(i)).filter((x) => x.words >= 15);
  if (!list.length) return '';
  const avg = (arr) => (arr.length ? Math.round(arr.reduce((p, c) => p + c, 0) / arr.length) : null);
  const wpm = avg(list.map((x) => x.fluency.wpm).filter((x) => x != null));
  const scored = list.filter((x) => x.fluency.pauseScored);
  const pauses = scored.length ? scored.reduce((p, x) => p + (x.fluency.longPauses || 0), 0) : '–';
  const conns = avg(list.map((x) => x.complexity.connectors.length));
  const errs = list.flatMap((x) => x.accuracy.easy);
  const byRule = {};
  errs.forEach((e) => (byRule[e.vi] = (byRule[e.vi] || 0) + 1));
  const topErr = Object.entries(byRule).sort((a, b) => b[1] - a[1])[0];
  const missing = list.filter((x) => x.complexity.missingTenses.length).length;
  return `<div class="an-sum"><h4>📊 Phân tích cả bài (${list.length} câu)</h4>
    <div class="stat-row"><div class="stat"><b>${wpm ?? '–'}</b><span>từ/phút trung bình</span></div><div class="stat"><b>${pauses}</b><span>lần ngừng dài${scored.length ? '' : ' (cần ghi âm)'}</span></div><div class="stat"><b>${conns ?? '–'}</b><span>từ nối mỗi câu</span></div></div>
    ${topErr ? `<p class="small">🎯 Lỗi dễ thấy lặp nhiều nhất (${topErr[1]} lần): ${escapeHtml(topErr[0])}</p>` : ''}
    ${missing ? `<p class="small">⏳ ${missing} câu kể chuyện / so sánh dùng ít thì quá khứ hoặc hiện tại.</p>` : ''}
    <p class="muted small">Mở từng câu bên dưới để xem phân tích chi tiết.</p></div>`;
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
        <div class="mock-an-chips"></div>
        <div class="row wrap"><button class="btn primary" data-grade="${i}">🤖 Chấm câu này</button><button class="btn" data-save-mine="${i}">📜 Lưu kịch bản</button>${a.audio ? `<button class="btn" data-pron-item="${i}">🔍 Soi phát âm</button>` : ''}</div>
        <details class="mock-an-box"><summary class="small">📊 Phân tích câu này</summary><div class="mock-an"></div></details>
        <div class="mock-fb">${a.result ? renderFeedback(a.result, { showRetry: false }) : ''}</div>
      </details>`;
    })
    .join('');
  ms.items.forEach((_, i) => renderItemAnalysis(i));
  let anT = null;
  $('mock-list')
    .querySelectorAll('[data-tr]')
    .forEach((t) =>
      t.addEventListener('input', () => {
        ms.answers[+t.dataset.tr].transcript = t.value;
        clearTimeout(anT);
        anT = setTimeout(() => {
          renderItemAnalysis(+t.dataset.tr);
          renderSummary();
        }, 800);
      }),
    );
  $('mock-list').onclick = (e) => {
    const pr = e.target.closest('[data-pron-item], [data-pron-open]');
    if (pr) {
      const i = +(pr.dataset.pronItem ?? pr.closest('[data-i]').dataset.i);
      const a = ms.answers[i];
      return openPron({
        text: a.transcript.trim(),
        audio: a.audio && a.seconds <= 120 ? a.audio : null,
        choices: pronChoicesFrom(a.transcript),
        onResult: (r) => {
          a.pron = r;
          renderItemAnalysis(i);
        },
      });
    }
    const save = e.target.closest('[data-save-mine]');
    const exp = e.target.closest('[data-save-expanded]');
    if (!save && !exp) return;
    const i = +(save ? save.dataset.saveMine : exp.closest('[data-i]').dataset.i);
    const q = ms.items[i];
    const text = save ? ms.answers[i].transcript.trim() : exp.closest('details').querySelector('.en-text')?.textContent || '';
    if (!text) return toast('Câu này chưa có lời nói (dạng chữ) để lưu.');
    quickSave({ question_id: q.question_id, question_text: q.question_text, topic: q.topic, text, source: save ? 'mine' : 'ai', level: settings.target });
  };
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
  const inputMode = a.audio && usesGemini(settings) ? (hasText ? 'audio_and_transcript' : 'audio') : 'transcript_only';
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
  renderItemAnalysis(i);
  renderSummary();
  recordMock();
  return true;
}

// Lưu kết quả bài thi thử để vẽ biểu đồ tiến bộ.
function recordMock() {
  if (!ms.answers.some((a) => a.transcript.trim() || a.audio)) return; // bỏ trống cả bài thì không lưu
  const graded = ms.answers.filter((a) => a.result);
  const scores = graded.map((a) => LEVEL_SCORE[a.result.practice_level_estimate.label]).filter((x) => x != null).sort((x, y) => x - y);
  const answered = ms.answers.filter((a) => a.transcript.trim() || a.audio).length;
  if (answered >= 12) {
    logActivity('mocks', { key: ms.mockId });
    const wt = ms.testId && weekTest(ms.testId.startsWith('IM') ? '34' : '56');
    if (wt && wt.test.id === ms.testId) logActivity('week', { key: wt.key });
  }
  saveMockRecord({
    id: ms.mockId,
    testId: ms.testId || null,
    at: ms.started || Date.now(),
    target: settings.target,
    self: ms.level0,
    selfEnd: ms.level,
    answered: ms.answers.filter((a) => a.transcript.trim() || a.audio).length,
    total: ms.items.length,
    seconds: TOTAL_SECONDS - Math.max(0, ms.clock),
    graded: scores.length,
    label: scores.length ? scoreToLabel(scores[Math.floor((scores.length - 1) / 2)]) : null,
    gaps: [...new Set(graded.map((a) => a.result.main_gap?.point_vi).filter(Boolean))].slice(0, 3),
  });
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
  document.querySelectorAll('[name=mock-source]').forEach((r) =>
    r.addEventListener('change', () => {
      settings.mockSource = r.value;
      saveSettings();
      renderSetup();
    }),
  );
  document.querySelectorAll('#mock-target .seg').forEach((b) =>
    b.addEventListener('click', () => {
      settings.target = b.dataset.target;
      settings.mockSelf = suggestLevel(settings.target);
      saveSettings();
      renderSetup();
    }),
  );
  $('mock-survey-form').addEventListener('change', () => {
    settings.survey = readSurveyForm($('mock-survey-form'));
    saveSettings();
    renderSurveySummary();
  });
  $('mock-self').addEventListener('change', (e) => {
    settings.mockSelf = +e.target.value;
    saveSettings();
  });
  $('mock-noise').addEventListener('change', () => {
    settings.mockNoise = $('mock-noise').value;
    saveSettings();
  });
  $('mock-noise-test').addEventListener('click', async () => {
    if (ambiencePlaying()) {
      stopAmbience();
      clearTimeout(ms.previewTimer);
      $('mock-noise-test').textContent = '▶ Nghe thử';
      return;
    }
    const lvl = $('mock-noise').value === 'off' ? 'mid' : $('mock-noise').value;
    if (!(await startAmbience(lvl))) return toast('Máy không phát được âm thanh mô phỏng.');
    $('mock-noise-test').textContent = '⏹ Dừng';
    ms.previewTimer = setTimeout(() => {
      stopAmbience();
      $('mock-noise-test').textContent = '▶ Nghe thử';
    }, 8000);
  });
  $('mock-noise-mute').addEventListener('click', () => {
    ms.noiseMuted = !ms.noiseMuted;
    setAmbienceMuted(ms.noiseMuted);
    $('mock-noise-mute').textContent = ms.noiseMuted ? '🔉' : '🔇';
  });
  document.querySelectorAll('[data-reselect]').forEach((b) => b.addEventListener('click', () => applyReselect(+b.dataset.reselect)));
  $('btn-mock-start').addEventListener('click', start);
  $('mock-tests').addEventListener('click', (e) => {
    const lv = e.target.closest('[data-tlevel]');
    if (lv) {
      settings.testLevel = lv.dataset.tlevel;
      saveSettings();
      return renderTests();
    }
    if (e.target.closest('[data-tests-all]')) {
      settings.testsShowAll = !settings.testsShowAll;
      saveSettings();
      return renderTests();
    }
    const b = e.target.closest('[data-test]');
    if (b) startFixed(b.dataset.test);
  });
  onMocksChange(() => ms.phase === 'setup' && renderTests());
  // Từ kế hoạch hôm nay (tab Tiến bộ): mở tab Thi thử tại Đề của tuần.
  window.addEventListener('opic:goto-week', () => {
    if (ms.phase !== 'setup') return;
    settings.testLevel = settings.target === 'IM' ? '34' : '56';
    saveSettings();
    renderTests();
    setTimeout(() => $('week-box').scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  });
  // Đổi mục tiêu ở tab Luyện tập thì cập nhật ở đây.
  onSettingsChange(() => {
    if (ms.phase !== 'setup') return;
    document.querySelectorAll('#mock-target .seg').forEach((b) => b.classList.toggle('active', b.dataset.target === settings.target));
    $('mock-target-hint').textContent = TARGET_HINT[settings.target] || '';
  });
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
