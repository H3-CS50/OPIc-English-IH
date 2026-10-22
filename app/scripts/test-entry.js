// Kiểm thử logic không cần giao diện: tạo đề thi thử, đoán dạng câu, nhập CSV, chuẩn hoá kết quả AI.
import './test-setup.js';
import { buildMock } from '../src/mock.js';
import { guessPromptType, importPack, allQuestions } from '../src/data.js';
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

console.log(fails ? `${fails} FAILED` : 'ALL TESTS PASSED');
process.exit(fails ? 1 : 0);
