// Phân tích bài nói theo 4 mục (ý tưởng khung Complexity–Accuracy–Fluency–Pronunciation):
// Độ trôi chảy · Độ phong phú · Độ chính xác · Phát âm.
// Hàm thuần, chạy trên máy, không tốn lượt AI. Ngưỡng là thiết kế của app (hiệu chỉnh trên bài mẫu IM/IH/AL của app),
// không phải tiêu chí chấm OPIc.
import { targetWords, durationGroup } from './durations.js';

// ---------- Tách từ ----------
export const words = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .match(/[a-z]+(?:'[a-z]+)?/g) || [];
const joined = (w) => ` ${w.join(' ')} `;
const countPhrase = (s, p) => {
  let n = 0;
  let i = s.indexOf(` ${p} `);
  while (i >= 0) {
    n++;
    i = s.indexOf(` ${p} `, i + p.length + 1);
  }
  return n;
};

// ---------- Độ trôi chảy ----------
export const FILLERS = ['um', 'umm', 'uh', 'uhh', 'uhm', 'er', 'erm', 'ah', 'ahh', 'hmm', 'mm', 'you know', 'i mean'];
const HESITATION = new Set(['um', 'umm', 'uh', 'uhh', 'uhm', 'er', 'erm', 'ah', 'ahh', 'hmm', 'mm']);

export function fillerStats(w) {
  const s = joined(w);
  const found = {};
  for (const f of FILLERS) {
    const n = f.includes(' ') ? countPhrase(s, f) : w.filter((x) => x === f).length;
    if (n) found[f] = n;
  }
  return { total: Object.values(found).reduce((a, b) => a + b, 0), found };
}

// Lặp lại liền nhau: "I I", "the the", "I went I went". Bỏ qua từ đệm và các cặp hay lặp có chủ ý.
const OK_REPEAT = new Set(['very', 'really', 'so', 'had', 'that', 'bye', 'no', 'yes', 'ha', 'many', 'more', 'far', 'again', 'long', 'over', 'round', 'little', 'bit']);
export function repetitions(w) {
  const list = [];
  for (let i = 1; i < w.length; i++) {
    if (w[i] === w[i - 1] && !OK_REPEAT.has(w[i]) && !HESITATION.has(w[i])) list.push(w[i]);
    else if (i >= 3 && w[i] === w[i - 2] && w[i - 1] === w[i - 3] && w[i] !== w[i - 1] && !HESITATION.has(w[i])) list.push(`${w[i - 1]} ${w[i]}`);
  }
  return list;
}

// ---------- Độ phong phú ----------
// Đa dạng từ: MATTR (tỉ lệ từ khác nhau trung bình trên cửa sổ 40 từ) — ít phụ thuộc độ dài bài.
export function mattr(w, win = 40) {
  const c = w.filter((x) => !HESITATION.has(x));
  if (!c.length) return 0;
  if (c.length < win) return new Set(c).size / c.length;
  let sum = 0;
  let n = 0;
  for (let i = 0; i + win <= c.length; i++) {
    sum += new Set(c.slice(i, i + win)).size / win;
    n++;
  }
  return sum / n;
}

export const CONNECTORS = [
  'because', 'so', 'but', 'although', 'though', 'even though', 'however', 'also', 'actually', 'then', 'after that', 'before',
  'when', 'while', 'if', 'since', 'which', 'who', 'where', 'for example', 'for instance', 'such as', 'on the other hand',
  'in addition', 'besides', "that's why", 'as a result', 'first', 'finally', 'eventually', 'at first', 'later', 'whereas',
  'unless', 'so that', 'in fact', 'anyway', 'plus', 'overall', 'to be honest', 'not only', 'as well', 'instead', 'otherwise',
  'until', 'as soon as', 'in the end', 'at the end of the day', 'by the way', 'in my opinion', 'i think', 'i guess',
  'compared to', 'these days', 'nowadays', 'back then', 'in the past',
];
export function connectorsUsed(w) {
  const s = joined(w);
  return CONNECTORS.filter((c) => countPhrase(s, c) > 0);
}

// Dấu hiệu thì (gần đúng): quá khứ, hiện tại, tương lai, hoàn thành.
const IRREGULAR_PAST = new Set(
  'was were did had went came saw took made got gave found thought told became left felt brought began kept held stood heard meant met ran paid sat spoke lay led grew lost fell sent built understood drew broke spent rose drove bought wore chose threw caught won forgot hung shook rode sang swam wrote ate drank flew hid slept fought taught sold stuck lit fed knew bit blew bled dug froze stole swore swept tore woke wept overcame forgave began sank sought dealt fled shot slid'.split(' '),
);
const ED_NOT_PAST = new Set(
  'bed red shed seed speed feed need indeed hundred weed breed bleed proceed exceed succeed interested excited tired bored worried surprised scared relaxed crowded satisfied disappointed amazed pleased confused stressed exhausted annoyed frustrated embarrassed located based related talented experienced advanced detailed limited complicated sophisticated skilled crowded used beloved naked wicked sacred'.split(' '),
);
const PERFECT_PP = new Set('been gone done seen taken eaten made had known given written driven ridden spoken broken chosen forgotten grown flown thrown shown begun swum drunk sung worn'.split(' '));
const NOT_VERB_AFTER_GOING_TO = new Set('the a an my your his her our their this that these those some school work bed church be'.split(' '));

export function tenseMarkers(w) {
  let past = 0;
  let future = 0;
  let present = 0;
  let perfect = 0;
  for (let i = 0; i < w.length; i++) {
    const x = w[i];
    const prev = w[i - 1];
    if (x === 'used' && w[i + 1] === 'to') past++;
    else if (IRREGULAR_PAST.has(x) || (x.length >= 5 && x.endsWith('ed') && !ED_NOT_PAST.has(x) && !['have', 'has', "i've", "we've", "you've", "they've", 'be', 'been', 'is', 'are', 'am', 'get', 'got'].includes(prev))) past++;
    if (x === 'will' || x === 'gonna' || /^(i|you|we|they|he|she|it)'ll$/.test(x)) future++;
    if (x === 'going' && w[i + 1] === 'to' && w[i + 2] && !NOT_VERB_AFTER_GOING_TO.has(w[i + 2])) future++;
    if (['am', 'is', 'are', "i'm", "you're", "we're", "they're", 'do', 'does', "don't", "doesn't", "isn't", "aren't", 'usually', 'always', 'often', 'sometimes', 'nowadays', 'every', 'now', 'today', 'currently', 'these', "it's", "there's", "that's", 'can', 'has'].includes(x)) present++;
    if ((['have', 'has', 'had'].includes(prev) || /'ve$/.test(prev || '')) && (PERFECT_PP.has(x) || (x.endsWith('ed') && !ED_NOT_PAST.has(x)))) perfect++;
  }
  return { past, present, future, perfect };
}

// Loại câu cần thì gì (để nhắc khi thiếu).
const NEEDS = {
  past_recent: ['past'], past_first: ['past'], memorable_experience: ['past'], problem_experience: ['past'], roleplay_experience: ['past'],
  comparison_change: ['past', 'present'], news_report: ['past'],
};

// Cụm từ hay (lấy từ kho từ vựng của app) mà người học đã dùng.
export function goodPhrases(w, vocabItems) {
  const s = joined(w);
  const out = [];
  const seen = new Set();
  for (const it of vocabItems) {
    const en = String(it.en || '');
    if (/sb|sth|\/|\(|\.\.\.|…/.test(en)) continue;
    const p = words(en).join(' ');
    if (!p || seen.has(p)) continue;
    const n = p.split(' ').length;
    if (n < 2 && p.length < 9) continue; // từ đơn ngắn thường là từ thông dụng
    if (n >= 2 && ['i think', 'i like', 'you know', 'i mean', 'a lot', 'and then', 'so much'].includes(p)) continue;
    if (countPhrase(s, p)) {
      seen.add(p);
      out.push({ en: en.replace(/[.,!?]+$/, ''), vi: it.vi });
    }
  }
  return out.sort((a, b) => b.en.length - a.en.length).slice(0, 8);
}

// ---------- Độ chính xác: lỗi dễ thấy (máy dò theo mẫu, có thể sót) ----------
const AUX = new Set('does did do can could will would should must might may let make made help helped watch saw hear heard'.split(' '));
const BASE_VERBS = 'go have do like want live work make take play watch need think know say get come use love enjoy try study eat cook read write listen visit spend feel look walk drive ride stay buy'.split(' ');
const VOWEL_EXC = /^(one|once|uni|use|usu|usa|ufo|eu|ewe|ura|uro|uti)/;
const SILENT_H = /^(hour|honest|honou?r|heir)/;
export const ERROR_RULES = [
  {
    id: 'a_an',
    re: / a ([aeiou][a-z']*) /g,
    ok: (m) => !VOWEL_EXC.test(m[1]),
    fix: (m) => [`a ${m[1]}`, `an ${m[1]}`],
    vi: 'Trước từ bắt đầu bằng nguyên âm dùng "an".',
  },
  {
    // Chỉ xét he/she (luôn là chủ ngữ); bỏ qua câu hỏi/khuyết thiếu: does he go, can she play…
    id: 'third_person',
    re: new RegExp(`(?<! (?:${[...AUX].join('|')})) (he|she) (${BASE_VERBS.join('|')}) `, 'g'),
    ok: () => true,
    fix: (m) => [`${m[1]} ${m[2]}`, `${m[1]} ${thirdPerson(m[2])}`],
    vi: 'Chủ ngữ he/she ở hiện tại: động từ thêm -s/-es.',
  },
  {
    id: 'did_past',
    re: / (didn't|did not|doesn't|does not|don't|do not|did you|did he|did she|did they|did we|did i) ([a-z]+ed|went|saw|took|made|got|came|ate|bought|had) /g,
    ok: (m) => !ED_NOT_PAST.has(m[2]),
    fix: (m) => [`${m[1]} ${m[2]}`, IRR_BASE[m[2]] ? `${m[1]} ${IRR_BASE[m[2]]}` : `${m[1]} + động từ nguyên mẫu`],
    vi: 'Sau did/didn\'t/don\'t dùng động từ nguyên mẫu.',
  },
  {
    id: 'be_agree',
    re: / (i am|i'm|we are|we're|they are|they're) (not )?agree /g,
    ok: () => true,
    fix: (m) => [`${m[1]} ${m[2] || ''}agree`, `I ${m[2] ? "don't " : ''}agree`],
    vi: '"agree" là động từ: nói "I agree / I don\'t agree", không có "am".',
  },
  {
    id: 'subject_be',
    re: / ([a-z']+) (i is|i are|he are|she are|it are|they is|we is|you is|we was|they was|you was|people is|people was) /g,
    ok: (m) => !['and', 'or', 'of', 'like', 'about', 'with', 'than', 'that', 'which', 'make', 'makes', 'made', 'let'].includes(m[1]),
    fix: (m) => [m[2], fixBe(m[2])],
    vi: 'Động từ "to be" phải hợp với chủ ngữ.',
  },
  {
    id: 'double_comp',
    re: / (more|most) (better|worse|easier|bigger|smaller|cheaper|faster|happier|best|worst|easiest|biggest) /g,
    ok: () => true,
    fix: (m) => [`${m[1]} ${m[2]}`, m[2]],
    vi: 'Không dùng "more/most" với tính từ đã có -er/-est.',
  },
  {
    id: 'modal_to',
    re: / (can|could|will|would|should|must|might) to ([a-z]+) /g,
    ok: () => true,
    fix: (m) => [`${m[1]} to ${m[2]}`, `${m[1]} ${m[2]}`],
    vi: 'Sau can/will/should… dùng động từ nguyên mẫu, không có "to".',
  },
  {
    id: 'discuss_about',
    re: / (discuss|discussed|discussing) about /g,
    ok: () => true,
    fix: (m) => [`${m[1]} about`, m[1]],
    vi: '"discuss" không đi với "about".',
  },
  {
    id: 'go_to_home',
    re: / (go|went|come|came|get|got) to home /g,
    ok: () => true,
    fix: (m) => [`${m[1]} to home`, `${m[1]} home`],
    vi: 'Nói "go home", không có "to".',
  },
  {
    id: 'since_years',
    re: / since (two|three|four|five|six|seven|eight|nine|ten|\d+|many|a few|several) (years|months|weeks|days) /g,
    ok: () => true,
    fix: (m) => [`since ${m[1]} ${m[2]}`, `for ${m[1]} ${m[2]}`],
    vi: 'Khoảng thời gian dùng "for" (for 5 years); "since" đi với mốc (since 2020).',
  },
];
function thirdPerson(v) {
  if (v === 'have') return 'has';
  if (v === 'do' || v === 'go') return `${v}es`;
  if (/(s|sh|ch|x|z)$/.test(v)) return `${v}es`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`;
  return `${v}s`;
}
const IRR_BASE = { went: 'go', saw: 'see', took: 'take', made: 'make', got: 'get', came: 'come', ate: 'eat', bought: 'buy', had: 'have' };
function fixBe(p) {
  const [subj, be] = p.split(' ');
  const past = be === 'was' || be === 'were';
  if (subj === 'i') return past ? 'I was' : 'I am';
  if (['he', 'she', 'it'].includes(subj)) return `${subj} ${past ? 'was' : 'is'}`;
  return `${subj} ${past ? 'were' : 'are'}`;
}

// Nhận văn bản (tách theo dấu câu để không ghép nhầm 2 câu) hoặc mảng từ.
export function easyErrors(input) {
  const parts = Array.isArray(input) ? [input] : String(input || '').split(/[.!?;:]+/).map(words);
  return parts.flatMap(errorsIn);
}
function errorsIn(w) {
  const s = joined(w);
  const out = [];
  for (const r of ERROR_RULES) {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(s))) {
      if (r.ok(m)) {
        const [from, to] = r.fix(m);
        out.push({ id: r.id, from: from.trim(), to: to.trim(), vi: r.vi });
      }
      r.re.lastIndex = m.index + 1;
    }
  }
  return out;
}

// ---------- Đánh giá từng mục ----------
// level: good | ok | work | na
const LV = { good: 2, ok: 1, work: 0 };
const fromPoints = (pts) => {
  const v = pts.filter((x) => x != null);
  if (!v.length) return 'na';
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  return avg >= 1.5 ? 'good' : avg >= 0.75 ? 'ok' : 'work';
};
const band = (x, work, good, higherIsBetter = true) => (x == null ? null : higherIsBetter ? (x >= good ? 2 : x >= work ? 1 : 0) : x <= good ? 2 : x <= work ? 1 : 0);
const WPM = { IM: [60, 85], IH: [75, 100], AL: [85, 110] };

/**
 * text: lời nói · seconds: thời gian ghi · target: IM|IH|AL · ptype: dạng câu
 * timing: { gaps:[giây], firstWordDelay, source:'asr'|'audio', speakingRatio? } (có thể thiếu)
 * ai: kết quả AI Coach (có thể thiếu) · pron: kết quả Soi phát âm (có thể thiếu) · vocab: danh sách mục từ vựng
 */
export function analyzeSpeech({ text = '', seconds = 0, target = 'IH', ptype = null, timing = null, ai = null, pron = null, vocab = [] } = {}) {
  const w = words(text);
  const n = w.filter((x) => !HESITATION.has(x)).length;
  const mins = seconds > 0 ? seconds / 60 : null;
  const longThr = timing?.source === 'audio' ? 2 : 3;
  const longPauses = timing?.gaps ? timing.gaps.filter((g) => g >= longThr).length : null;
  const fill = fillerStats(w);
  const reps = repetitions(w);
  const rawWpm = mins && n ? Math.round(n / mins) : null;
  // Trên 200 từ/phút gần như chắc là chữ gõ thêm / dán vào, không phải tốc độ nói thật.
  const wpm = rawWpm != null && rawWpm <= 200 ? rawWpm : null;
  const [wWork, wGood] = WPM[target] || WPM.IH;

  const fluency = {
    wpm,
    wpmUnreliable: rawWpm != null && wpm == null,
    longPauses,
    longThr,
    firstWordDelay: timing?.firstWordDelay ?? null,
    speakingRatio: timing?.speakingRatio ?? null,
    fillers: fill.total,
    fillerList: fill.found,
    repeats: reps,
  };
  const per100 = (x) => (n ? (100 * x) / n : 0);
  fluency.level =
    n < 15
      ? 'na'
      : fromPoints([
          band(wpm, wWork, wGood),
          longPauses == null || !mins ? null : band(longPauses / mins, 2, 1, false),
          band(per100(fill.total), 5, 2, false),
          band(per100(reps.length), 5, 2, false),
        ]);

  const div = mattr(w);
  const conns = connectorsUsed(w);
  const tenses = tenseMarkers(w);
  const need = NEEDS[ptype] || [];
  const missing = need.filter((t) => (t === 'past' ? per100(tenses.past) < 3 : per100(tenses.present) < 2));
  const [twLo] = ptype ? targetWords({ prompt_type: ptype }, target) : [null];
  const complexity = {
    words: n,
    targetWords: twLo,
    diversity: Math.round(div * 100) / 100,
    connectors: conns,
    tenses,
    missingTenses: missing,
    phrases: goodPhrases(w, vocab),
  };
  complexity.level =
    n < 15
      ? 'na'
      : fromPoints([
          band(div, 0.7, 0.8),
          band(conns.length, 4, 7),
          twLo ? band(n / twLo, 0.6, 0.9) : null,
          need.length ? (missing.length ? 0 : 2) : null,
        ]);

  const errs = easyErrors(text);
  const fixes = ai?.language_fixes || [];
  const accuracy = { easy: errs, aiFixes: fixes.length, aiMajor: fixes.filter((f) => f.impact === 'affects_meaning').length, aiNote: ai?.fact?.accuracy?.observation_vi || '' };
  if (ai) accuracy.level = accuracy.aiMajor >= 2 || fixes.length >= 4 ? 'work' : fixes.length >= 2 || accuracy.aiMajor === 1 ? 'ok' : 'good';
  else accuracy.level = n < 15 ? 'na' : errs.length >= 3 ? 'work' : errs.length ? 'ok' : 'na';
  accuracy.source = ai ? 'ai' : 'rules';

  const pronunciation = { level: 'na', note: '', source: null };
  if (pron) {
    pronunciation.level = pron.overall?.clarity === 'clear' ? 'good' : pron.overall?.clarity === 'mostly_clear' ? 'ok' : 'work';
    pronunciation.note = pron.overall?.summary_vi || '';
    pronunciation.words = (pron.words || []).length;
    pronunciation.source = 'pron';
  } else if (ai?.delivery?.pronunciation?.status === 'assessed') {
    pronunciation.note = ai.delivery.pronunciation.observation_vi;
    pronunciation.source = 'ai';
  }

  return { words: n, seconds, fluency, complexity, accuracy, pronunciation, tip: pickTip({ fluency, complexity, accuracy, pronunciation, target, wGood, n }) };
}

function pickTip({ fluency, complexity, accuracy, target, wGood, n }) {
  if (n < 15) return 'Bài nói còn quá ngắn để phân tích. Hãy nói ít nhất 15 từ (khoảng 20 giây).';
  if (complexity.missingTenses.includes('past')) return 'Câu này hỏi về trải nghiệm đã qua: kể bằng động từ quá khứ (went, saw, was, decided…) và có mốc thời gian (last year, when I was…).';
  if (complexity.missingTenses.includes('present')) return 'Câu so sánh xưa – nay: nói rõ cả "trước đây" (used to, back then) lẫn "bây giờ" (these days, now).';
  const cands = [];
  if (fluency.level === 'work' || fluency.level === 'ok') {
    if (fluency.wpm != null && fluency.wpm < wGood) cands.push([fluency.level, `Tốc độ ${fluency.wpm} từ/phút. Mục tiêu ${target} khoảng ${wGood}+ từ/phút: chuẩn bị sẵn cụm mở đầu (Well, let me think…, To be honest…) để không bị ngừng lâu.`]);
    if (fluency.longPauses) cands.push([fluency.level, `Có ${fluency.longPauses} lần ngừng từ ${fluency.longThr} giây trở lên. Khi bí ý, dùng cụm câu giờ thay vì im lặng: "Let me see…", "How can I put it…".`]);
    if (fluency.fillers >= 3) cands.push([fluency.level, `Dùng ${fluency.fillers} từ đệm (um, uh, you know…). Thử ngừng ngắn rồi nói tiếp, hoặc thay bằng "Well," hay "So,".`]);
    if (fluency.repeats.length >= 3) cands.push([fluency.level, `Lặp từ ${fluency.repeats.length} lần (${fluency.repeats.slice(0, 3).join(', ')}). Nghĩ trọn cụm trước khi nói.`]);
  }
  if (complexity.level === 'work' || complexity.level === 'ok') {
    if (complexity.connectors.length < 5) cands.push([complexity.level, 'Nối ý bằng nhiều từ nối hơn: because, so, but, although, after that, for example, on the other hand… để thành đoạn văn mạch lạc (dấu hiệu của IH).']);
    if (complexity.targetWords && complexity.words < complexity.targetWords * 0.8) cands.push([complexity.level, `Bài nói ${complexity.words} từ, gợi ý khoảng ${complexity.targetWords}+ từ cho mục tiêu ${target}: thêm ví dụ, lý do, cảm nhận.`]);
    if (complexity.diversity < 0.72) cands.push([complexity.level, 'Từ ngữ hơi lặp: thay từ hay dùng (good, very, like) bằng từ cụ thể hơn (amazing, quite, enjoy…).']);
  }
  if (accuracy.easy.length) cands.push(['ok', `Sửa lỗi: "${accuracy.easy[0].from}" → "${accuracy.easy[0].to}". ${accuracy.easy[0].vi}`]);
  cands.sort((a, b) => LV[a[0]] - LV[b[0]]);
  return cands[0]?.[1] || 'Tốt lắm! Giữ tốc độ này và thử thêm một ví dụ cụ thể hoặc một câu so sánh để bài nói sâu hơn.';
}

// ---------- Nhịp nói từ máy nhận giọng (khi không có ghi âm) ----------
// Ghi lại lúc số từ tăng lên; khoảng trống dài giữa hai lần tăng ≈ ngừng nói (cộng thêm độ trễ của máy nhận giọng).
export function createTimingTracker(now = () => Date.now()) {
  let t0 = 0;
  let last = 0;
  let lastWords = 0;
  let gaps = [];
  let first = null;
  return {
    start() {
      t0 = last = now();
      lastWords = 0;
      gaps = [];
      first = null;
    },
    update(text) {
      const n = words(text).length;
      const t = now();
      if (n > lastWords) {
        if (first == null) first = (t - t0) / 1000;
        else {
          const g = (t - last) / 1000;
          if (g >= 1) gaps.push(Math.round(g * 10) / 10);
        }
        last = t;
      }
      lastWords = n;
    },
    stop() {
      return { gaps: gaps.slice(), firstWordDelay: first == null ? null : Math.round(first * 10) / 10, source: 'asr' };
    },
  };
}

// ---------- Nhịp nói từ ghi âm ----------
// samples: Float32Array (mono), rate: Hz. Trả về thời lượng, thời gian thực sự nói, các khoảng ngừng (bỏ khoảng lặng đầu/cuối).
export function pausesFromSamples(samples, rate) {
  const frame = Math.max(1, Math.round(rate * 0.02));
  const rms = [];
  for (let i = 0; i + frame <= samples.length; i += frame) {
    let s = 0;
    for (let j = i; j < i + frame; j++) s += samples[j] * samples[j];
    rms.push(Math.sqrt(s / frame));
  }
  if (!rms.length) return null;
  const sorted = [...rms].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.1)];
  const peak = sorted[Math.floor(sorted.length * 0.95)];
  if (peak < 0.003) return { duration: samples.length / rate, speechTime: 0, speakingRatio: 0, gaps: [], firstWordDelay: null, source: 'audio' };
  const thr = floor + 0.12 * (peak - floor);
  const speech = rms.map((v) => v > thr);
  // Bỏ các khoảng lặng rất ngắn (< 0,25 s) giữa các tiếng.
  const minGap = Math.round(0.25 / 0.02);
  const firstIdx = speech.indexOf(true);
  const lastIdx = speech.lastIndexOf(true);
  const gaps = [];
  let speechFrames = 0;
  let run = 0;
  for (let i = firstIdx; i <= lastIdx; i++) {
    if (speech[i]) {
      if (run >= minGap) gaps.push(Math.round(run * 0.02 * 10) / 10);
      else speechFrames += run;
      run = 0;
      speechFrames++;
    } else run++;
  }
  const active = (lastIdx - firstIdx + 1) * 0.02;
  return {
    duration: samples.length / rate,
    speechTime: Math.round(speechFrames * 0.02 * 10) / 10,
    speakingRatio: active > 0 ? Math.round((speechFrames * 0.02 * 100) / active) / 100 : 0,
    gaps: gaps.filter((g) => g >= 0.3),
    firstWordDelay: Math.round(firstIdx * 0.02 * 10) / 10,
    source: 'audio',
  };
}

// Giải mã file ghi âm rồi tính nhịp nói (chạy trên máy). Lỗi thì trả về null.
export async function pausesFromBlob(blob) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !blob) return null;
    const ctx = new AC();
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    ctx.close?.();
    return pausesFromSamples(buf.getChannelData(0), buf.sampleRate);
  } catch {
    return null;
  }
}

export const LEVEL_VI = { good: 'Tốt', ok: 'Khá', work: 'Cần luyện', na: 'Chưa có' };
export const groupOf = durationGroup;
