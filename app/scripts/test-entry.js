// Kiểm thử logic không cần giao diện: tạo đề thi thử, đoán dạng câu, nhập CSV, chuẩn hoá kết quả AI.
import './test-setup.js';
import { buildMock, rebuildTail, comboInfo } from '../src/mock.js';
import * as RM from '../src/roadmap-core.js';
import * as IPA from '../src/ipa-core.js';
import { SOUNDS, PAIRS, LESSONS } from '../src/ipa-data.js';
import TESTS from '../src/tests.json';
import { targetDuration, targetWords } from '../src/durations.js';
import * as SC from '../src/scripts-core.js';
import * as PL from '../src/plan.js';
import { surveyTopics, normalizeSurvey, DEFAULT_SURVEY, levelToDiff } from '../src/mock-survey.js';
import { guessPromptType, importPack, importFile, allQuestions, listPacks } from '../src/data.js';
import { readXlsx } from '../src/xlsx.js';
import { TEMPLATE_HEADER, TEMPLATE_ROWS, xlsxTemplate, csvTemplate, jsonTemplate } from '../src/templates.js';
import { readFileSync } from 'node:fs';
import * as V from '../src/vocab-core.js';
import vocabData from '../src/vocab.json';
import * as D from '../src/dict.js';
import { sentenceAround } from '../src/lookup.js';
import kbData from '../src/kb.json';
import { join } from 'node:path';
import { normalizeResult, buildUserMessage, gradeGemini, lookupWordAI, providerReady, usesGemini, aiConfigured } from '../src/coach.js';
import * as ACT from '../src/activity.js';
import * as WK from '../src/week.js';
import { groupPost } from '../src/group-net.js';
import { saveExam, listExams, removeExam } from '../src/group.js';
import { looksEnglish, importRealQuestions, REAL_PACK_NAME } from '../src/data.js';

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) {
    fails++;
    console.error('FAIL', msg);
  }
};

for (let n = 0; n < 300; n++) {
  const diff = n % 2 ? '56' : '34';
  const oqc = n % 3 === 0;
  const topics = n % 5 === 0 ? [] : ['movies', 'housing', 'parks'].slice(0, (n % 3) + 1);
  const m = buildMock({ topics, diff, oqc });
  ok(m.length === 15, `mock length ${m.length}`);
  ok(m[0].prompt_type === 'self_introduction', 'Q1 intro');
  ok(m.slice(1, 7).every((q) => q.topic_category === 'survey'), 'Q2–7 survey');
  ok(m.slice(7, 10).every((q) => q.topic_category === 'unexpected'), 'Q8–10 unexpected');
  ok(m.slice(10, 13).every((q) => q.topic_category === 'role_play'), 'Q11–13 role-play');
  ok(m[11].prompt_type === 'roleplay_problem' && m[12].prompt_type === 'roleplay_experience', 'Q12–13 types');
  if (diff === '56') ok(m.slice(13).every((q) => q.topic_category === 'issue'), 'Q14–15 advanced');
  if (!oqc) ok(m.every((q) => !q.oqc_branch), 'no OQC when off');
  if (topics.length) ok(m.slice(1, 7).every((q) => topics.includes(q.topic)), 'survey topics respected');
  ok(new Set(m.map((q) => q.question_id)).size === 15, 'no duplicate question');
}

// Thi thử chỉ từ câu hỏi của lớp / chỉ từ app
for (let n = 0; n < 200; n++) {
  const source = n % 2 ? 'class' : 'app';
  const diff = n % 3 ? '56' : '34';
  const m = buildMock({ topics: [], diff, oqc: false, source });
  ok(m.length === 15, `mock(${source}) length ${m.length}`);
  ok(m.slice(1).every((q) => (q.origin_set || 'app') === source), `mock(${source}) uses only ${source} after Q1`);
  ok(m[11].prompt_type === 'roleplay_problem' && m[12].prompt_type === 'roleplay_experience', `mock(${source}) Q12–13 types`);
  ok(m.slice(1, 7).every((q) => q.topic_category === 'survey'), `mock(${source}) survey`);
  if (diff === '56') ok(m.slice(13).every((q) => q.topic_category === 'issue'), `mock(${source}) advanced`);
  ok(new Set(m.map((q) => q.question_id)).size === 15, `mock(${source}) no duplicate`);
}
const cls = allQuestions().filter((q) => q.origin_set === 'class');
ok(cls.length === 258, `258 class questions (got ${cls.length})`);
ok(cls.every((q) => q.sample_ih && q.sample_ih.length > 150), 'every class question has an IH sample');

const cases = [
  ["I'd like to give you a situation. Call the store and ask three or four questions about the phone.", 'roleplay_ask'],
  ["I'm sorry, but there is a problem I need you to resolve. Offer two or three alternatives.", 'roleplay_problem'],
  ["That's the end of the situation. Have you ever lost something?", 'roleplay_experience'],
  ['Tell me about a news story you heard about housing.', 'news_report'],
  ['How has the weather changed over the years?', 'comparison_change'],
  ['Tell me about the last time you went to the beach.', 'past_recent'],
  ['What do you usually do on weekends?', 'routine'],
];
for (const [t, want] of cases) ok(guessPromptType(t) === want, `guess ${want} got ${guessPromptType(t)}`);

const before = allQuestions().length;
const n = importPack('No,Topic,Questions,Answer (Sample)\n1,Work,"Tell me about your company, please.",My company...\n2,Parks,What do you usually do at the park?,\n', 'my.csv');
ok(n === 2 && allQuestions().length === before + 2, 'csv import');
const n2 = importPack(JSON.stringify({ pack_name: 'x', questions: [{ question_text: 'Describe your favorite room in detail.' }] }), 'x.json');
ok(n2 === 1, 'json import');

const r = normalizeResult({ practice_level_estimate: { label: 'AL', confidence: 'high' }, delivery: { pronunciation: { status: 'assessed', observation_vi: 'x' } } }, 'transcript_only');
ok(r.delivery.pronunciation.status === 'not_assessed', 'transcript-only forces not_assessed');
ok(r.practice_level_estimate.confidence === 'medium', 'single answer never high confidence');
ok(Array.isArray(r.language_fixes) && r.fact.accuracy.status, 'defaults filled');
const msg = buildUserMessage({ question: 'Q?', ptype: 'routine', ptypeLabel: 'x', expected: ['a'], target: 'IH', inputMode: 'transcript_only', seconds: 60, transcript: 'one two three', retry: { gap: 'g', goal: 'goal' } });
ok(msg.includes('WORD COUNT (transcript): 3') && msg.includes('THIS IS A RETRY'), 'user message');

// File mẫu nhập câu hỏi: CSV / JSON / Excel phải nhập lại được đúng 3 câu.
async function templateTests() {
  const byText = (t) => allQuestions().find((q) => q.question_text === t);
  const nCsv = importPack(csvTemplate(), 'mau.csv');
  ok(nCsv === 3, `csv template imports 3 (got ${nCsv})`);
  ok(byText(TEMPLATE_ROWS[0][0])?.user_sample === TEMPLATE_ROWS[0][2], 'csv template keeps sample answer');
  ok(byText(TEMPLATE_ROWS[1][0])?.prompt_type === 'past_first', 'template row 2 → past_first');
  ok(byText(TEMPLATE_ROWS[2][0])?.prompt_type === 'roleplay_ask', 'template row 3 → roleplay_ask');
  ok(importPack(jsonTemplate(), 'mau.json') === 3 && listPacks().some((p) => p.name === 'Bộ câu hỏi của tôi'), 'json template imports 3 with pack name');

  const table = await readXlsx(xlsxTemplate());
  const pad = (rows) => rows.map((r) => [0, 1, 2].map((i) => r[i] ?? ''));
  ok(JSON.stringify(pad(table)) === JSON.stringify([TEMPLATE_HEADER, ...TEMPLATE_ROWS]), 'xlsx template round-trips (first sheet only)');
  const nX = await importFile(new File([xlsxTemplate()], 'mau_bo_cau_hoi_OPIc.xlsx'));
  ok(nX === 3 && listPacks().some((p) => p.name === 'mau_bo_cau_hoi_OPIc'), 'xlsx template imports 3 via importFile');

  // File Excel do phần mềm khác tạo: có dòng tiêu đề phụ, ô trống, số, ký tự đặc biệt, sheet thứ hai.
  for (const fx of ['openpyxl_sample.xlsx', 'libreoffice_sample.xlsx']) {
    const buf = readFileSync(join(process.env.FIXTURES, fx));
    const t = await readXlsx(buf);
    ok(t[1]?.[2] === 'Questions', `${fx}: header row read`);
    ok(t[2]?.[3] === 'I work at a factory <OQC> team, "quality" checks.', `${fx}: special chars decoded (${t[2]?.[3]})`);
    ok(t[2]?.[0] === '1', `${fx}: number cell as text`);
    ok(t[6]?.[2] === 'Describe the last trip you took. Where did you go?', `${fx}: gap row kept at right index`);
    const n = await importFile(new File([buf], fx));
    ok(n === 3, `${fx}: imports 3 valid questions (got ${n})`);
  }
  let err = '';
  try {
    await importFile(new File([new Uint8Array([1, 2, 3])], 'old.xls'));
  } catch (e) {
    err = e.message;
  }
  ok(/xlsx/.test(err), 'old .xls gives a clear error');
  err = '';
  try {
    importPack('Name,Topic\nabc,def\n', 'bad.csv');
  } catch (e) {
    err = e.message;
  }
  ok(/Questions/.test(err), 'missing Questions column gives a clear error');
}

// ---------- Từ vựng ----------
{
  ok(V.ALL.length === vocabData.items.length && V.ALL.length > 1000, `vocab items ${V.ALL.length}`);
  ok(V.ORIGINAL_COUNT === 618, `618 items from OPIc AL Vocab kept (got ${V.ORIGINAL_COUNT})`);
  ok(V.TOPICS.length === 25 && V.TOPICS.filter((t) => !t.mine).every((t) => t.items.length > 0), 'vocab topics all non-empty (+ Sổ từ)');
  ok(V.ALL.every((it) => it.en && it.vi && it.ex), 'every vocab item has meaning + example');
  ok(new Set(V.ALL.map((it) => it.id)).size === V.ALL.length, 'vocab ids unique');
  const now = new Date('2026-10-22T09:00:00').getTime();
  const it = V.TOPICS[0].items[0];
  V.resetProgress();
  ok(V.isNew(it), 'item starts new');
  let p = V.grade(it, 2, now);
  ok(p.box === 1 && p.due > now && !V.isDue(it, now), 'Nhớ → box 1, due later');
  V.grade(it, 2, now);
  V.grade(it, 2, now);
  ok(V.isLearned(it), 'three Nhớ → learned');
  p = V.grade(it, 1, now);
  ok(p.box === 3, 'Khó keeps box');
  p = V.grade(it, 0, now);
  ok(p.box === 0 && V.isDue(it, now), 'Quên → box 0 and due now');
  const s1 = V.stats(V.ALL, now);
  ok(s1.seen === 1 && s1.due === 1 && s1.learned === 0, `stats after one item ${JSON.stringify(s1)}`);
  const { q, free } = V.studyQueue(V.ALL, 10, now);
  ok(!free && q[0] === it && q.length === 11, `study queue = due + 10 new (got ${q.length})`);
  V.resetProgress();
  const qz = V.quiz(V.TOPICS[2].items);
  ok(qz.length === 10 && qz.every((x) => x.opts.length === 4 && x.opts.includes(x.it) && new Set(x.opts).size === 4), 'quiz 10 x 4 options');
  ok(V.search('tom lai').some((x) => /sum up|In short/.test(x.en)), 'diacritic-free search');
  ok(V.speakable("I've been ...ing for...") === "I've been doing something for, ", `speakable: ${V.speakable("I've been ...ing for...")}`);
  const sug = V.suggestFor({ prompt_type: 'memorable_experience', topic: 'domestic_trips' }, 6);
  ok(sug.items.length === 6 && sug.topics.some((t) => t.id === 'story') && sug.topics.some((t) => t.id === 'travel'), 'suggestions mix story + travel');
  localStorage.setItem('opic.known', JSON.stringify(['When it comes to…', 'plot twist']));
  localStorage.removeItem('opic.vocabMigrated');
  const moved = V.migrateOldFlashcards(now);
  ok(moved === 2 && V.stats().learned === 2, `old flashcards migrated (${moved})`);
  ok(V.migrateOldFlashcards(now) === 0, 'migration runs once');
  V.resetProgress();
}

// ---------- Từ điển / tra từ ----------
{
  const L = (w) => D.lookupWord(w).lemma;
  const cases = { went: 'go', children: 'child', studies: 'study', running: 'run', making: 'make', stopped: 'stop', biggest: 'big', happier: 'happy', cities: 'city', "I'm": 'i', "can't": 'can', tried: 'try', leaves: 'leave', better: 'better' };
  for (const [w, want] of Object.entries(cases)) {
    const got = L(w);
    ok(got === want || (w === 'better' && got), `lemma ${w} → ${want} (got ${got})`);
  }
  // Mọi từ trong nội dung app phải tra được nghĩa (trừ tên riêng / chữ tiếng Việt không dấu)
  const texts = [];
  for (const q of kbData.questions) texts.push(q.question_text, q.sample_ih || '');
  for (const st of kbData.answer_sets) for (const l of Object.values(st.levels)) texts.push(l.text);
  for (const it of vocabData.items) texts.push(it.en, it.ex);
  const forms = new Map();
  for (const t of texts) for (const m of t.matchAll(/[A-Za-z]+(?:'[a-z]+)?/g)) {
    const w = m[0];
    const mid = m.index > 0 && !/[.!?"]\s*$/.test(t.slice(Math.max(0, m.index - 3), m.index));
    const k = w.toLowerCase();
    const f = forms.get(k) || { n: 0, cap: 0 };
    f.n++;
    if (/^[A-Z]/.test(w) && mid) f.cap++;
    forms.set(k, f);
  }
  const miss = [];
  let covered = 0;
  let total = 0;
  for (const [w, f] of forms) {
    if (f.cap >= Math.max(1, 0.8 * f.n) && w !== 'i') continue; // tên riêng
    total++;
    if (D.lookupWord(w).entry) covered++;
    else miss.push(w);
  }
  const pct = covered / total;
  ok(pct >= 0.985, `dictionary covers ${(pct * 100).toFixed(1)}% of word forms in app content; missing e.g. ${miss.slice(0, 40).join(', ')}`);
  if (process.env.DICT_MISS) console.log('MISS', miss.join(' '));
  ok(D.searchDict('bank')[0]?.w === 'bank', 'dict search EN exact first');
  ok(D.searchDict('ngan hang').some((r) => r.w === 'bank'), 'dict search VI (no diacritics) → bank');
  ok(D.searchDict('đi').slice(0, 5).some((r) => r.w === 'go'), 'dict search VI → go in top 5');
  ok(D.searchDict('di').length > 0, 'ascii query still works');
  ok(D.searchDict('studies').some((r) => r.w === 'study'), 'dict search inflected form → lemma');
  const ipaText = readFileSync(join(process.env.FIXTURES, '..', '..', 'www', 'dict', 'ipa-en.txt'), 'utf8');
  ok(D.setIpaText(ipaText) > 100000, 'IPA loaded');
  ok(/^\/.+\/$/.test(D.ipaOf('hello')) && !/ɹ|ɫ/.test(D.ipaOf('really')), `IPA hello ${D.ipaOf('hello')} / really ${D.ipaOf('really')}`);
  ok(D.ipaOf('went', 'go') === D.ipaOf('went') && D.ipaOf('xyzq', 'go') === D.ipaOf('go'), 'IPA falls back to lemma');
  ok(sentenceAround('I live in Hanoi. It was raining when I left. Then I came back.', 'raining') === 'It was raining when I left.', 'sentence around tapped word');
  const links = D.dictLinks("Serendipity's");
  ok(links.length === 4 && links.every((l) => /^https:\/\//.test(l.url)) && links[0].url === 'https://glosbe.com/en/vi/serendipity', 'dictionary links');
  ok(D.parseMT({ responseStatus: 200, responseData: { translatedText: 'sự tình cờ may mắn' } }, 'serendipity') === 'sự tình cờ may mắn', 'parse MyMemory result');
  ok(D.parseMT({ responseStatus: 200, responseData: { translatedText: 'serendipity' } }, 'serendipity') === '', 'untranslated MT ignored');
  ok(D.parseMT({ responseStatus: 429, responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS' } }, 'x') === '', 'MT quota warning ignored');
  ok(D.MT_URL('hello') === 'https://api.mymemory.translated.net/get?q=hello&langpair=en|vi', 'MT url');
  // Survey → chủ đề, chọn lại độ khó sau câu 7
  {
    const st = surveyTopics({ ...DEFAULT_SURVEY, work: 'none', leisure: ['movies', 'overseas'], discuss: ['environment'] }, { oqc: false });
    ok(st.topics.includes('movies') && st.topics.includes('overseas_trips') && st.topics.includes('housing') && !st.topics.includes('work'), `survey topics ${st.topics}`);
    ok(st.discuss.join() === 'recycling', `survey discuss ${st.discuss}`);
    ok(surveyTopics({ ...DEFAULT_SURVEY, discuss: ['global_work'] }, { oqc: false }).discuss.join() === 'industry', 'no OQC discuss when OQC off');
    ok(normalizeSurvey({ work: 'bogus', leisure: ['x', 'music'] }).work === 'company' && normalizeSurvey({ leisure: ['x', 'music'] }).leisure.join() === 'music', 'normalize survey');
    ok(levelToDiff(4) === '34' && levelToDiff(5) === '56', 'level → diff');
    for (let k = 0; k < 20; k++) {
      const m = buildMock({ topics: st.topics, discuss: st.discuss, diff: '34', oqc: false });
      const t = rebuildTail(m, { diff: '56', discuss: ['recycling'], oqc: false });
      if (!(t.length === 15 && t.slice(0, 7).every((q, i) => q === m[i]) && t.slice(13).every((q) => q.topic_category === 'issue') && new Set(t.map((q) => q.question_id)).size === 15)) {
        ok(false, 'rebuild tail harder');
        break;
      }
      const e = rebuildTail(m, { diff: '34', oqc: false });
      if (!(e.slice(13).every((q) => q.topic_category === 'unexpected') && new Set(e.map((q) => q.question_id)).size === 15)) {
        ok(false, 'rebuild tail easier');
        break;
      }
      if (k === 19) ok(true, 'rebuild tail ×20');
    }
  }
  // Sổ kịch bản + nói theo + học thuộc
  {
    const c1 = SC.compareSpeech("I'm going to the park with 3 friends.", 'i am going to park with three friend');
    ok(c1.words.map((w) => w.ok).join() === 'true,true,true,false,true,true,true,false' && c1.score === 75, `compare speech ${JSON.stringify(c1.words)} ${c1.score}`);
    const c2 = SC.compareSpeech('Hello, world!', 'hello world');
    ok(c2.score === 100 && !c2.extra.length, 'compare exact');
    ok(SC.compareSpeech('Hi there.', '').score === 0, 'compare empty');
    ok(SC.compareSpeech('one two', 'one banana two').extra.join() === 'banana', 'compare extra');
    ok(SC.splitSentences('I live in Hanoi. It was fun! Why? Yes').length === 4, 'split sentences');
    const t = 'The beautiful mountain village was quiet and peaceful in the early morning.';
    const m0 = SC.maskedWords(t, 0), m2 = SC.maskedWords(t, 2), m4 = SC.maskedWords(t, 4);
    ok(m0.every((x) => !x.hidden) && m4.every((x) => x.hidden) && m2.filter((x) => x.hidden).length === Math.round(m2.length / 2), 'mask levels');
    ok(m2.filter((x) => x.hidden).every((x) => !['the', 'and', 'in', 'was'].includes(x.w.toLowerCase())), 'content words hidden first');
    ok(JSON.stringify(SC.maskedWords(t, 2, 5)) === JSON.stringify(SC.maskedWords(t, 2, 5)), 'mask deterministic');
    const a = SC.addScript({ text: 'My hometown is small.', source: 'mine', question_text: 'Q' });
    const b = SC.addScript({ text: 'my  hometown is small', source: 'ai' });
    ok(a.script && !a.existed && b.existed && b.script.id === a.script.id, 'script dedupe');
    SC.markPracticed(a.script.id, 80);
    SC.markPracticed(a.script.id, 60);
    ok(SC.getScript(a.script.id).practiced === 2 && SC.getScript(a.script.id).best === 80, 'script practice best');
    SC.removeScript(a.script.id);
    ok(!SC.getScript(a.script.id), 'script remove');
  }
  // Kế hoạch ngày thi + chuỗi thi thử
  {
    const now = new Date(2026, 9, 22, 10).getTime();
    ok(PL.daysLeft('2026-10-30', now) === 8 && PL.daysLeft('2026-10-22', now) === 0 && PL.daysLeft('', now) === null, 'days left');
    ok(PL.phaseOf(30).id === 'base' && PL.phaseOf(10).id === 'build' && PL.phaseOf(5).id === 'sprint' && PL.phaseOf(1).id === 'rest' && PL.phaseOf(0).id === 'day', 'phases');
    const p1 = PL.dailyPlan({ left: 5, vocabDue: 12, weakType: 'routine', weakLabel: 'Thói quen', todayPracticed: 1, mocks: [{ at: now - 3 * 864e5 }], scripts: [], now });
    ok(p1.map((t) => t.id).join() === 'vocab,weak,shadow,mock' && !p1[1].done, `sprint plan ${p1.map((t) => t.id)}`);
    const p2 = PL.dailyPlan({ left: 30, vocabDue: 0, todayPracticed: 1, mocks: [{ at: now - 3 * 864e5 }], scripts: [{ lastPracticed: now }], now });
    ok(p2.length === 3 && p2[1].done && p2[2].done, 'base plan: no mock yet');
    ok(PL.dailyPlan({ left: 1, now }).every((t) => ['review', 'intro'].includes(t.id)), 'rest plan');
    const ser = PL.mockSeries([{ id: 'a', at: 2, label: 'IM', graded: 3 }], [
      { mode: 'mock', mock_id: 'b', created_at: new Date(1).toISOString(), coach_result: { practice_level_estimate: { label: 'IH' } } },
      { mode: 'mock', mock_id: 'b', created_at: new Date(1).toISOString(), coach_result: { practice_level_estimate: { label: 'AL' } } },
      { mode: 'practice', created_at: new Date(1).toISOString() },
    ]);
    ok(ser.graded.map((m) => m.id).join() === 'b,a' && ser.graded[0].label === 'IH', `mock series ${JSON.stringify(ser.graded)}`);
    ok(PL.compareLast(ser.graded).delta === -1, 'compare last');
  }
  // Lộ trình chinh phục
  {
    const stages = RM.buildRoadmap(comboInfo(), { source: 'both', oqc: false, mine: ['movies'] });
    ok(stages.length === 6 && stages[0].nodes.length === 1 && stages[0].nodes[0].combos.every((c) => c.qs.length === 1), 'roadmap intro split');
    ok(stages[1].nodes[0].topic === 'movies' && stages[1].nodes[0].mine, 'survey mine first');
    ok(stages.slice(1, 5).every((s) => s.nodes.length > 0) && stages[2].nodes.every((n) => n.combos.every((c) => c.qs.length === 3)), 'roadmap stages filled');
    ok(!stages.flatMap((s) => s.nodes).some((n) => n.topic === 'oqc_work'), 'roadmap respects OQC off');
    const st0 = RM.roadmapStatus(stages, {});
    ok(st0[0].open && !st0[1].open && st0.every((s) => !s.cleared), 'only stage 1 open at start');
    const intro = stages[0].nodes[0].combos[0].qs[0].question_id;
    const st1 = RM.roadmapStatus(stages, { spoken: { [intro]: { at: 1 } } });
    ok(st1[0].cleared && st1[1].open && !st1[2].open, 'intro unlocks survey');
    const combo = stages[1].nodes[0].combos[0];
    const sp = Object.fromEntries(combo.qs.map((q) => [q.question_id, { at: 1 }]));
    const atts = combo.qs.map((q) => ({ question_id: q.question_id, transcript: '', coach_result: { practice_level_estimate: { label: 'IH' } } }));
    const idx = RM.indexAttempts(atts);
    ok(RM.comboStars(combo, { idx: new Map(), spoken: sp, target: 'IH' }).stars === 1, '1 star spoken');
    ok(RM.comboStars(combo, { idx, spoken: sp, target: 'IH' }).stars === 3, '3 stars at target');
    ok(RM.comboStars(combo, { idx, spoken: sp, target: 'AL' }).stars === 1, 'AL target needs more');
    const atts2 = combo.qs.map((q) => ({ question_id: q.question_id, transcript: '', coach_result: { practice_level_estimate: { label: 'IH_AL_borderline' } } }));
    ok(RM.comboStars(combo, { idx: RM.indexAttempts(atts2), spoken: sp, target: 'AL' }).stars === 2, '2 stars near target');
    const selfAtt = combo.qs.map((q) => ({ question_id: q.question_id, transcript: 'x', self_check: { checked: [1, 2, 3], total: 4 } }));
    ok(RM.comboStars(combo, { idx: RM.indexAttempts(selfAtt), spoken: sp, target: 'IH' }).stars === 2, '2 stars by self-check');
    ok(RM.comboStars(combo, { idx: RM.indexAttempts(combo.qs.slice(0, 2).map((q) => ({ question_id: q.question_id, transcript: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen' }))), spoken: {}, target: 'IH' }).done === 2, 'spoken from transcript');
    ok(!RM.recordSpoken('x', { words: 5, seconds: 3 }) && RM.recordSpoken('x', { words: 20 }) && RM.spokenMap().x, 'record spoken threshold');
    RM.resetRoadmap();
    ok(RM.nextStep(st1).stage.id === 'survey' && RM.nextStep(st1).node.topic === 'movies', 'next step');
  }
  // Bộ đề cố định + thời lượng theo dạng câu
  {
    const ids = new Set(kbData.questions.map((q) => q.question_id));
    const all = TESTS.sets.flatMap((x) => x.tests);
    ok(TESTS.sets.length === 2 && all.length === 60, `60 fixed tests (${all.length})`);
    ok(all.every((t) => t.qids.length === 15 && new Set(t.qids).size === 15 && t.qids.every((id) => ids.has(id))), 'fixed tests: 15 valid unique questions');
    const byId = new Map(kbData.questions.map((q) => [q.question_id, q]));
    ok(all.filter((t) => t.level === '56').every((t) => t.qids.slice(13).every((id) => byId.get(id).mock_slot === 'adv')), 'level 5–6 tests end with advanced questions');
    ok(new Set(all.map((t) => t.id)).size === 60, 'fixed test ids unique');
    ok(kbData.questions.filter((q) => q.ext).length === 99, 'ext combos in app');
    ok(targetDuration({ prompt_type: 'memorable_experience' }, 'IH').join() === '80,100' && targetDuration({ prompt_type: 'roleplay_ask' }, 'IM').join() === '30,45' && targetDuration({ prompt_type: 'issue_concern' }, 'AL').join() === '90,120', 'durations by type');
    ok(targetWords({ prompt_type: 'description' }, 'IH').join() === '100,150', 'target words');
  }
  // Học IPA: nội dung khớp từ điển của app
  {
    const t = IPA.tokenizeIpa('/ˈtitʃɝ/');
    ok(t.map((x) => x.sym).join(',') === 't,i,tʃ,ɝ' && t[0].stress === 'primary', `tokenize teacher ${JSON.stringify(t)}`);
    ok(IPA.tokenizeIpa('/ˌjunəˈvɝsəti/').filter((x) => x.stress).length === 2, 'tokenize stress marks');
    ok(IPA.tokenizeIpa('/ˈɡoʊ/').map((x) => x.sym).join() === 'ɡ,oʊ' && IPA.tokenizeIpa('/ˈdʒʌdʒ/').map((x) => x.sym).join() === 'dʒ,ʌ,dʒ', 'tokenize multi-char');
    ok(SOUNDS.length >= 40 && new Set(SOUNDS.map((x) => x.sym)).size === SOUNDS.length, `sounds ${SOUNDS.length}`);
    const bad = [];
    for (const snd of SOUNDS) for (const [w] of snd.words) if (!IPA.hasSound(D.ipaOf(w), snd.sym)) bad.push(`${snd.sym}:${w}=${D.ipaOf(w)}`);
    ok(!bad.length, `every example word contains its sound (${bad.join(' ')})`);
    const pbad = PAIRS.filter((p) => !D.ipaOf(p.a) || !D.ipaOf(p.b) || p.ia === p.ib || !IPA.tokenizeIpa(p.ia).every((x) => x.known) || !IPA.tokenizeIpa(p.ib).every((x) => x.known));
    ok(!pbad.length, `minimal pairs valid ${pbad.map((p) => p.a + '/' + p.b)}`);
    ok(SOUNDS.filter((x) => x.pair).every((x) => PAIRS.some((p) => (p.a === x.pair[0] && p.b === x.pair[1]) || (p.a === x.pair[1] && p.b === x.pair[0]))), 'sound pairs listed in PAIRS');
    ok(LESSONS.length === 8 && LESSONS.every((l) => l.sounds.every((x) => IPA.soundOf(x))), 'lessons reference known sounds');
    const covered = new Set(LESSONS.flatMap((l) => l.sounds));
    ok(SOUNDS.every((x) => covered.has(x.sym)), 'every sound appears in a lesson');
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 30; k++) {
      const q = IPA.readQuestion((w) => D.ipaOf(w), rnd);
      if (!(q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.word) && q.ipa)) { ok(false, `read question ${JSON.stringify(q)}`); break; }
      const l = IPA.pairQuestion(rnd);
      if (![l.pair.a, l.pair.b].includes(l.word)) { ok(false, 'pair question'); break; }
      if (k === 29) ok(true, 'ipa questions ×30');
    }
    ok(IPA.saidWord('I said Sheep.', 'sheep').ok && !IPA.saidWord('ship', 'sheep').ok, 'said word check');
  }
  const n0 = V.ALL.length;
  const it = V.addMyWord({ en: 'reluctant', vi: 'miễn cưỡng', ex: 'He was reluctant to go.' });
  ok(it && V.isMine('reluctant') && V.ALL.length === n0 + 1 && V.MY_TOPIC.items.length === 1, 'add to Sổ từ');
  ok(V.addMyWord({ en: 'reluctant', vi: 'x' }) === null, 'no duplicate in Sổ từ');
  ok(V.removeMyWord('reluctant') && V.ALL.length === n0 && V.ALL.every((x, i) => x.idx === i), 'remove from Sổ từ + reindex');
}

// ---------- EXP, Đề của tuần, nhóm học ----------
async function groupTests() {
  // EXP
  ok(ACT.computeExp({ spoken: 3, vocab: 150, ipa: 40, scripts: 20 }) === 30 + 100 + 50 + 50, 'computeExp caps per kind');
  ok(ACT.computeExp({ spoken: 200 }) === ACT.MAX_DAY_EXP, 'computeExp daily cap');
  const day = (y, m, d, h = 10) => new Date(y, m - 1, d, h).getTime();
  ACT.resetActivity();
  ok(ACT.logActivity('spoken', { key: 'Q1', seconds: 61, now: day(2026, 10, 20) }) === 10, 'first spoken +10');
  ok(ACT.logActivity('spoken', { key: 'Q1', seconds: 30, now: day(2026, 10, 20, 11) }) === 0, 'same question same day = 0');
  ok(ACT.logActivity('spoken', { key: 'Q1', now: day(2026, 10, 21) }) === 10, 'same question next day counts');
  ACT.logActivity('mocks', { key: 'm1', now: day(2026, 10, 22) });
  ACT.logActivity('vocab', { key: 'v1', now: day(2026, 10, 24) });
  const sm = ACT.summary(day(2026, 10, 24, 20));
  ok(sm.total === 10 + 10 + 100 + 1, `summary total ${sm.total}`);
  ok(sm.streak === 1 && sm.best === 3, `streak ${sm.streak} best ${sm.best}`);
  ok(sm.week === 121 && sm.today === 1, `week ${sm.week} today ${sm.today}`);
  ok(ACT.dayStats('2026-10-20').seconds === 61, 'seconds only counted when logged');
  ok(ACT.summary(day(2026, 10, 25)).streak === 1, 'streak kept until end of next day');
  ok(ACT.summary(day(2026, 10, 26)).streak === 0, 'streak broken after a missed day');
  ok(ACT.levelOf(0).n === 1 && ACT.levelOf(250).n === 2 && ACT.levelOf(250).pct === 17 && ACT.levelOf(99999).next === null, 'levelOf');
  ok(ACT.badges(sm).find((b) => b.id === 'mock1').ok && ACT.badges(sm).find((b) => b.id === 'streak3').ok && !ACT.badges(sm).find((b) => b.id === 'streak7').ok, 'badges');
  ok(ACT.recentDays(35, day(2026, 10, 24)).length === 4, 'recentDays');
  ok(ACT.weekStart(day(2026, 10, 25)).getDate() === 19 && ACT.weekStart(day(2026, 10, 26)).getDate() === 26, 'week starts Monday');
  ACT.resetActivity();

  // Đề của tuần
  ok(WK.weekNo(day(2026, 10, 19)) === 1 && WK.weekNo(day(2026, 10, 25, 23)) === 1 && WK.weekNo(day(2026, 10, 26)) === 2, 'weekNo');
  ok(WK.weekNo(day(2026, 9, 1)) === 1, 'weekNo before start = 1');
  const w1 = WK.weekTest('56', day(2026, 10, 21));
  const w2 = WK.weekTest('56', day(2026, 10, 28));
  ok(w1.test.id === 'IH-30' && w2.test.id === 'IH-29' && WK.weekTest('34', day(2026, 10, 21)).test.id === 'IM-30', `week tests ${w1.test.id} ${w2.test.id}`);
  ok(WK.weekTest('56', day(2027, 5, 17)).test.id !== WK.weekTest('56', day(2027, 5, 10)).test.id, 'week test changes weekly');
  const seen = new Set();
  for (let k = 0; k < 30; k++) seen.add(WK.weekTest('56', day(2026, 10, 19) + k * 7 * 864e5).test.id);
  ok(seen.size === 30, '30 weeks cover all 30 tests');
  ok(WK.weekDone(w1, [{ testId: 'IH-30', at: day(2026, 10, 20), answered: 13 }]) && !WK.weekDone(w1, [{ testId: 'IH-30', at: day(2026, 10, 18), answered: 15 }]) && !WK.weekDone(w1, [{ testId: 'IH-30', at: day(2026, 10, 20), answered: 5 }]), 'weekDone');
  const plan = PL.dailyPlan({ left: 60, week: { id: 'IH-30', done: false } });
  ok(plan.some((t) => t.id === 'week' && !t.done), 'week task in plan');
  ok(!PL.dailyPlan({ left: 60, week: { id: 'IH-30', done: true } }).some((t) => t.id === 'week'), 'no week task once done');

  // Kết quả thi thật
  ok(saveExam({ date: '2026-11-01', level: 'IM2' }) && saveExam({ date: '2026-12-01', level: 'IH' }) && !saveExam({ date: 'x', level: 'IH' }) && !saveExam({ date: '2026-12-02', level: 'B2' }), 'saveExam validates');
  saveExam({ date: '2026-11-01', level: 'IM3' });
  ok(listExams().length === 2 && listExams()[0].date === '2026-12-01' && listExams()[1].level === 'IM3', 'exam list sorted, same date replaced');
  removeExam('2026-11-01');
  removeExam('2026-12-01');
  ok(listExams().length === 0, 'removeExam');

  // Câu hỏi thi thật → bộ luyện tập
  ok(looksEnglish('Tell me about the bank you usually go to.') && !looksEnglish('Hỏi về ngân hàng bạn hay đến') && !looksEnglish('bank'), 'looksEnglish');
  const nReal = importRealQuestions([{ question: 'Tell me about the bank you usually go to.', section: 'Đột xuất' }, { question: 'Hỏi về ngân hàng gần nhà bạn' }]);
  importRealQuestions([{ question: 'Describe a recent change in your neighborhood in detail.' }, { question: 'What do you usually do on weekends with your family?' }]);
  ok(nReal === 1 && listPacks().filter((p) => p.name === REAL_PACK_NAME).length === 1 && listPacks().find((p) => p.name === REAL_PACK_NAME).count === 2, 'real questions pack replaced, not duplicated');

  // Gọi máy chủ nhóm + AI của nhóm (fetch giả)
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    const b = JSON.parse(opts.body);
    if (b.action === 'ai') {
      const text = b.body.systemInstruction.parts[0].text.includes('dictionary')
        ? JSON.stringify({ headword: 'bank', ipa: '/bæŋk/', pos_vi: 'danh từ', meaning_vi: 'ngân hàng', explanation_vi: '', example_en: '', example_vi: '' })
        : JSON.stringify({ practice_level_estimate: { label: 'IH', confidence: 'high' } });
      return { ok: true, status: 200, json: async () => ({ ok: true, status: 200, data: { candidates: [{ content: { parts: [{ text }] } }] } }) };
    }
    if (b.action === 'fail') return { ok: true, status: 200, json: async () => ({ ok: false, error: 'Bạn đã dùng hết 40 lượt AI hôm nay.' }) };
    if (b.action === 'slow') return { ok: true, status: 200, json: async () => ({ ok: false, error: 'AI_TIMEOUT: AI trả lời quá 60 giây.' }) };
    if (b.action === 'html') return { ok: true, status: 200, json: async () => { throw new Error('not json'); } };
    return { ok: true, status: 200, json: async () => ({ ok: true, echo: b.action }) };
  };
  try {
    const r = await groupPost('https://script.google.com/macros/s/x/exec', { action: 'ping' });
    ok(r.echo === 'ping' && calls[0].opts.headers['Content-Type'].startsWith('text/plain'), 'groupPost uses text/plain (no CORS preflight)');
    let err = '';
    try { await groupPost('http://x', { action: 'ping' }); } catch (e) { err = e.message; }
    ok(/https/.test(err), 'groupPost rejects non-https');
    try { await groupPost('https://x/exec', { action: 'fail' }); } catch (e) { err = e.message; }
    ok(/hết 40 lượt/.test(err), 'groupPost surfaces server error');
    try { await groupPost('https://x/exec', { action: 'html' }); } catch (e) { err = e.message; }
    ok(/Bất kỳ ai/.test(err), 'groupPost explains non-JSON reply');

    const gs = { provider: 'group', keys: {}, models: { gemini: 'm' }, group: { url: 'https://x/exec', uid: 'abcdefgh12', registered: true } };
    ok(usesGemini(gs) && aiConfigured(gs) && providerReady(gs, 'audio').ok, 'group provider ready (audio ok)');
    ok(!providerReady({ ...gs, group: { url: '', uid: '' } }, 'transcript_only').ok, 'group provider needs connection');
    calls.length = 0;
    const res = await gradeGemini({ settings: gs, ctx: { question: 'Q', ptype: 'description', ptypeLabel: 'Mô tả', expected: [], target: 'IH', inputMode: 'transcript_only', seconds: 60, transcript: 'I live in Hanoi.' } });
    ok(res.practice_level_estimate.label === 'IH' && res.practice_level_estimate.confidence === 'medium', 'grade via group AI');
    ok(calls[0].body.action === 'ai' && calls[0].body.uid === 'abcdefgh12' && calls[0].body.body.generationConfig.responseJsonSchema, 'group AI request carries Gemini body');
    const lk = await lookupWordAI(gs, 'bank');
    ok(lk.result?.meaning_vi === 'ngân hàng', 'lookup word via group AI');
    globalThis.fetch = async (url, opts) => ({ ok: true, status: 200, json: async () => ({ ok: false, error: 'AI_TIMEOUT: x' }) });
    let te = '';
    try { await gradeGemini({ settings: gs, ctx: { question: 'Q', expected: [], transcript: 'x', inputMode: 'transcript_only' } }); } catch (e) { te = e.message; }
    ok(/60 giây/.test(te), 'friendly timeout message');
  } finally {
    globalThis.fetch = realFetch;
  }
}

templateTests()
  .then(groupTests)
  .catch((e) => {
    fails++;
    console.error('FAIL template tests threw', e);
  })
  .finally(() => {
    console.log(fails ? `${fails} FAILED` : 'ALL TESTS PASSED');
    process.exit(fails ? 1 : 0);
  });
