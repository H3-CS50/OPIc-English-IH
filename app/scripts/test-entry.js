// Kiểm thử logic không cần giao diện: tạo đề thi thử, đoán dạng câu, nhập CSV, chuẩn hoá kết quả AI.
import './test-setup.js';
import { buildMock } from '../src/mock.js';
import { guessPromptType, importPack, importFile, allQuestions, listPacks } from '../src/data.js';
import { readXlsx } from '../src/xlsx.js';
import { TEMPLATE_HEADER, TEMPLATE_ROWS, xlsxTemplate, csvTemplate, jsonTemplate } from '../src/templates.js';
import { readFileSync } from 'node:fs';
import * as V from '../src/vocab-core.js';
import vocabData from '../src/vocab.json';
import { join } from 'node:path';
import { normalizeResult, buildUserMessage } from '../src/coach.js';

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
  ok(V.TOPICS.length === 24 && V.TOPICS.every((t) => t.items.length > 0), 'vocab topics all non-empty');
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

templateTests()
  .catch((e) => {
    fails++;
    console.error('FAIL template tests threw', e);
  })
  .finally(() => {
    console.log(fails ? `${fails} FAILED` : 'ALL TESTS PASSED');
    process.exit(fails ? 1 : 0);
  });
