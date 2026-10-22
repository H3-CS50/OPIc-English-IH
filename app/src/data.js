// Dữ liệu câu hỏi, bài mẫu, tài liệu + bộ câu hỏi người dùng tự nhập.
import kb from './kb.json';
import content from './content.json';
import { store, uid } from './util.js';
import { readXlsx } from './xlsx.js';

export { kb, content };

export const topicLabel = (key) => kb.topics[key]?.vi || (key === 'imported' ? 'Câu hỏi tự nhập' : key);
export const ptypeLabel = (key) => kb.prompt_types[key]?.vi || key;

export const CATEGORY_LABEL = {
  intro: 'Giới thiệu',
  survey: 'Chủ đề Survey',
  unexpected: 'Chủ đề bất ngờ',
  role_play: 'Role-play (Q11–13)',
  issue: 'Câu nâng cao (Q14–15)',
  imported: 'Câu hỏi tự nhập',
};

export const SOURCE_LABEL = { class: 'Câu hỏi của lớp', app: 'Ngân hàng của app', imported: 'Câu hỏi tự nhập' };
export const originOf = (q) => q.origin_set || (q.content_origin === 'user_provided' ? 'imported' : 'app');

// ---------- Bộ câu hỏi tự nhập (lưu trên máy) ----------
let packs = store.get('packs', []);
const savePacks = () => store.set('packs', packs);
// Bộ câu hỏi của lớp nay đã có sẵn trong app: bỏ bản tự nhập cũ để không bị trùng.
if (packs.some((p) => p.name === 'Câu hỏi từ tài liệu lớp (List câu hỏi)')) {
  packs = packs.filter((p) => p.name !== 'Câu hỏi từ tài liệu lớp (List câu hỏi)');
  savePacks();
}

export const listPacks = () => packs.map((p) => ({ id: p.id, name: p.name, count: p.questions.length, created: p.created }));
export function deletePack(id) {
  packs = packs.filter((p) => p.id !== id);
  savePacks();
  rebuild();
}

// Đoán dạng câu từ nội dung câu hỏi (dùng cho câu tự nhập).
export function guessPromptType(text) {
  const t = text.toLowerCase();
  if (/ask (me )?(three|two|3|2) (or|to) (four|three|4|3) questions|ask .*questions/.test(t)) return /ask me/.test(t) ? 'roleplay_ask_ava' : 'roleplay_ask';
  if (/problem (that )?i need you to resolve|resolve (the|this) (problem|situation)|alternatives/.test(t)) return 'roleplay_problem';
  if (/end of the situation/.test(t)) return 'roleplay_experience';
  if (/news|article|report(ed)?/.test(t)) return 'news_report';
  if (/issue|concern|problems? (that )?people (have|face)|challenges/.test(t)) return 'issue_concern';
  if (/compare|similarit|differen|changed|how has|over the years|in the past/.test(t)) return /two|both/.test(t) && !/changed|past/.test(t) ? 'comparison_two' : 'comparison_change';
  if (/problem|went wrong|trouble|unexpected/.test(t)) return 'problem_experience';
  if (/memorable|unforgettable|special|surprising|unusual/.test(t)) return 'memorable_experience';
  if (/first (time|became|started|trip)|when did you (first|start)|childhood|as a child|growing up/.test(t)) return 'past_first';
  if (/last time|recently|recent/.test(t)) return 'past_recent';
  if (/tell me (a little )?(something )?about yourself|introduce yourself/.test(t)) return 'self_introduction';
  if (/usually|typical|routine|normally|often/.test(t)) return 'routine';
  if (/why do you like|favorite|prefer|what kind/.test(t)) return 'preference_opinion';
  return 'description';
}

function slotFor(ptype) {
  if (ptype === 'self_introduction') return 'intro';
  if (ptype === 'roleplay_ask' || ptype === 'roleplay_ask_ava') return 'rp_ask';
  if (ptype === 'roleplay_problem') return 'rp_problem';
  if (ptype === 'roleplay_experience') return 'rp_experience';
  if (ptype === 'issue_concern' || ptype === 'news_report') return 'adv';
  return 'combo';
}

// CSV đơn giản (có ngoặc kép), tự nhận dấu phân cách , ; hoặc tab.
function parseCsv(text) {
  const first = text.split(/\r?\n/)[0] || '';
  const delim = first.includes('\t') ? '\t' : (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}

function normalizeImported(raw, packId, i) {
  const text = String(raw.question_text || raw.question || raw.questions || raw.Questions || raw.Question || '').trim();
  if (text.length < 10) return null;
  const ptype = kbPromptType(raw.prompt_type) || guessPromptType(text);
  const pt = kb.prompt_types[ptype];
  const topicText = String(raw.topic || raw.Topic || '').trim();
  return {
    question_id: `U-${packId}-${i + 1}`,
    topic: 'imported',
    topic_text: topicText,
    topic_category: 'imported',
    question_text: text,
    prompt_type: ptype,
    target_practice_levels: pt?.difficulty === 'challenging' ? ['IH', 'AL'] : ['IM', 'IH', 'AL'],
    difficulty_design: pt?.difficulty || 'medium',
    mock_slot: slotFor(ptype),
    combo_id: `U-${packId}`,
    combo_order: i + 1,
    oqc_branch: false,
    expected_evidence: [],
    follow_up_questions: [],
    scaffolding_hints: [],
    answer_framework: kb.frameworks[ptype] || '',
    time_frame_targets: pt?.time_frames || ['present'],
    content_origin: 'user_provided',
    origin_set: 'imported',
    user_sample: String(raw.sample_answer || raw.answer || raw['Answer (Sample)'] || raw.Answer || '').trim(),
  };
}
const kbPromptType = (p) => (p && kb.prompt_types[p] ? p : null);

// Dòng tiêu đề → danh sách {question_text, topic, sample_answer}. Dùng cho CSV và Excel.
function rowsFromTable(table) {
  const hi = table.findIndex((r) => r.some((c) => /^(question_text|questions?|câu hỏi)$/i.test(String(c ?? '').trim())));
  if (hi < 0) throw new Error('Không thấy cột "Questions" trong file. Hãy dùng file mẫu và giữ nguyên dòng tiêu đề.');
  const header = table[hi].map((h) => String(h ?? '').trim());
  const qi = header.findIndex((h) => /^(question_text|questions?|câu hỏi)$/i.test(h));
  const ti = header.findIndex((h) => /^(topic|chủ đề)$/i.test(h));
  const ai = header.findIndex((h) => /^(answer|answer \(sample\)|sample_answer|bài mẫu)$/i.test(h));
  return table.slice(hi + 1).map((r) => ({ question_text: r[qi] ?? '', topic: ti >= 0 ? r[ti] ?? '' : '', sample_answer: ai >= 0 ? r[ai] ?? '' : '' }));
}

function addPack(name, rows) {
  const id = uid();
  const questions = rows.map((r, i) => normalizeImported(typeof r === 'string' ? { question_text: r } : r, id, i)).filter(Boolean);
  if (!questions.length) throw new Error('File không có câu hỏi hợp lệ (mỗi câu cần ít nhất 10 ký tự).');
  packs.push({ id, name, created: new Date().toISOString(), questions });
  if (!savePacks()) {
    packs.pop();
    throw new Error('Bộ nhớ máy không đủ để lưu bộ câu hỏi này.');
  }
  rebuild();
  return questions.length;
}

const baseName = (filename) => filename.replace(/\.[^.]+$/, '');

// Trả về số câu đã nhập. Hỗ trợ JSON (mảng câu hỏi hoặc {questions:[...]}) và CSV/TSV có cột "Questions".
export function importPack(text, filename = 'pack') {
  let name = baseName(filename);
  const trimmed = text.trim().replace(/^\uFEFF/, '');
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    let data;
    try {
      data = JSON.parse(trimmed);
    } catch {
      throw new Error('File JSON bị lỗi cú pháp. Hãy so với file mẫu JSON.');
    }
    if (!Array.isArray(data) && data.pack_name) name = data.pack_name;
    return addPack(name, Array.isArray(data) ? data : data.questions || []);
  }
  return addPack(name, rowsFromTable(parseCsv(trimmed)));
}

// Nhập từ file người dùng chọn: .xlsx, .csv, .tsv, .txt, .json.
export async function importFile(file) {
  if (/\.xlsx$/i.test(file.name)) {
    return addPack(baseName(file.name), rowsFromTable(await readXlsx(await file.arrayBuffer())));
  }
  if (/\.(xls|xlsm|ods|numbers|docx?|pdf)$/i.test(file.name)) {
    throw new Error('Chưa đọc được loại file này. Hãy lưu lại dạng Excel .xlsx hoặc .csv rồi nhập lại.');
  }
  return importPack(await file.text(), file.name);
}

// ---------- Chỉ mục ----------
let all = [];
let byId = new Map();
let combos = new Map();
const setsByQ = new Map(kb.answer_sets.map((s) => [s.question_id, s]));

function rebuild() {
  all = [...kb.questions, ...packs.flatMap((p) => p.questions)];
  byId = new Map(all.map((q) => [q.question_id, q]));
  combos = new Map();
  for (const q of all) {
    if (!combos.has(q.combo_id)) combos.set(q.combo_id, []);
    combos.get(q.combo_id).push(q);
  }
  for (const list of combos.values()) list.sort((a, b) => a.combo_order - b.combo_order);
}
rebuild();

export const allQuestions = () => all;
export const getQuestion = (id) => byId.get(id);
export const sampleSetFor = (qid) => setsByQ.get(qid);
export const getCombo = (id) => combos.get(id) || [];
export const comboIds = () => [...combos.keys()];

export function filterQuestions({ source = '', category = '', topic = '', ptype = '', level = '', oqc = true, search = '' } = {}) {
  const s = search.trim().toLowerCase();
  return all.filter(
    (q) =>
      (!source || originOf(q) === source) &&
      (!category || q.topic_category === category) &&
      (!topic || q.topic === topic) &&
      (!ptype || q.prompt_type === ptype) &&
      (!level || q.target_practice_levels.includes(level)) &&
      (oqc || !q.oqc_branch) &&
      (!s || q.question_text.toLowerCase().includes(s) || topicLabel(q.topic).toLowerCase().includes(s)),
  );
}

export const docs = content.docs;
