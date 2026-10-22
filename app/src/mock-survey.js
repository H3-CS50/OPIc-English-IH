// Background Survey + Self-Assessment cho bài thi thử.
// Nội dung khảo sát theo tài liệu lớp SEVT OPIc (Lesson 1) và OPIc overview; chỉ giữ các mục app có câu hỏi.

// Mỗi lựa chọn → các chủ đề câu hỏi (topic id trong kb.json).
export const SURVEY = [
  {
    id: 'work',
    part: '1/5',
    title: 'Ngành nào mô tả tốt nhất công việc của bạn?',
    type: 'one',
    options: [
      { id: 'company', vi: 'Kinh doanh / Công ty', topics: ['work'] },
      { id: 'home_business', vi: 'Kinh doanh tại nhà', topics: ['work'] },
      { id: 'teacher', vi: 'Giáo viên', topics: ['work'] },
      { id: 'none', vi: 'Không có kinh nghiệm làm việc', topics: [] },
    ],
    note: 'Chọn "Không có kinh nghiệm làm việc" thì đề vẫn có thể hỏi về công việc.',
  },
  {
    id: 'school',
    part: '2/5',
    title: 'Hiện tại bạn có đi học không?',
    type: 'one',
    options: [
      { id: 'yes', vi: 'Có, toàn thời gian hoặc bán thời gian', topics: [] },
      { id: 'no', vi: 'Không', topics: [] },
    ],
  },
  {
    id: 'housing',
    part: '3/5',
    title: 'Bạn đang sống ở đâu?',
    type: 'one',
    options: [
      { id: 'alone', vi: 'Sống một mình trong nhà hoặc căn hộ', topics: ['housing'] },
      { id: 'others', vi: 'Sống với người không phải gia đình', topics: ['housing'] },
      { id: 'family', vi: 'Sống với gia đình', topics: ['housing'] },
      { id: 'dorm', vi: 'Sống ở ký túc xá', topics: ['housing'] },
    ],
  },
  {
    id: 'leisure',
    part: '4/5',
    title: 'Hoạt động giải trí, sở thích, thể thao, du lịch',
    type: 'many',
    groups: [
      {
        vi: 'Giải trí',
        options: [
          { id: 'movies', vi: 'Đi xem phim', topics: ['movies'] },
          { id: 'parks', vi: 'Đi chơi công viên', topics: ['parks'] },
          { id: 'beach', vi: 'Đi biển', topics: ['beach'] },
          { id: 'bars', vi: 'Đi quán bar / quán nhậu', topics: ['bars'] },
        ],
      },
      { vi: 'Sở thích', options: [{ id: 'music', vi: 'Nghe nhạc', topics: ['music'] }] },
      {
        vi: 'Thể thao',
        options: [
          { id: 'walking', vi: 'Đi bộ', topics: ['walking'] },
          { id: 'jogging', vi: 'Chạy bộ chậm (jogging)', topics: ['walking'] },
        ],
      },
      {
        vi: 'Du lịch',
        options: [
          { id: 'vacation_home', vi: 'Nghỉ mát tại nhà', topics: ['vacation_home'] },
          { id: 'domestic', vi: 'Đi nghỉ mát trong nước', topics: ['domestic_trips'] },
          { id: 'overseas', vi: 'Đi nghỉ mát ở nước ngoài', topics: ['overseas_trips'] },
        ],
      },
    ],
    note: 'Lớp học khuyên chọn khoảng 6 chủ đề thế mạnh và tránh "Quán bar". App chỉ liệt kê các mục có câu hỏi luyện tập.',
  },
  {
    id: 'discuss',
    part: '5/5',
    title: 'Bạn thấy đề tài nào hứng thú để thảo luận?',
    type: 'many',
    options: [
      { id: 'environment', vi: 'Vấn đề môi trường', topics: ['recycling'] },
      { id: 'global_work', vi: 'Nơi làm việc toàn cầu', topics: ['industry', 'oqc_work'] },
      { id: 'culture', vi: 'Văn hóa và xã hội', topics: ['holidays', 'gatherings', 'food'] },
      { id: 'communication', vi: 'Giao tiếp, phương tiện liên lạc', topics: ['phones', 'internet', 'technology'] },
    ],
    note: 'Phần này dùng cho câu 14–15 (câu nâng cao) ở cấp 5–6.',
  },
];

export const DEFAULT_SURVEY = {
  work: 'company',
  school: 'no',
  housing: 'family',
  leisure: ['movies', 'parks', 'music', 'walking', 'vacation_home', 'domestic'],
  discuss: ['environment', 'global_work'],
};

const optionsOf = (part) => (part.groups ? part.groups.flatMap((g) => g.options) : part.options);

export function normalizeSurvey(s) {
  const out = { ...DEFAULT_SURVEY, ...(s || {}) };
  for (const part of SURVEY) {
    const ids = optionsOf(part).map((o) => o.id);
    if (part.type === 'one') {
      if (!ids.includes(out[part.id])) out[part.id] = DEFAULT_SURVEY[part.id];
    } else out[part.id] = (Array.isArray(out[part.id]) ? out[part.id] : []).filter((x) => ids.includes(x));
  }
  return out;
}

// Chủ đề cho 2 combo đầu (phần 1, 3, 4) và chủ đề thảo luận (phần 5).
export function surveyTopics(survey, { oqc = false } = {}) {
  const s = normalizeSurvey(survey);
  const topics = new Set();
  const discuss = new Set();
  for (const part of SURVEY) {
    const chosen = part.type === 'one' ? [s[part.id]] : s[part.id];
    for (const o of optionsOf(part)) {
      if (!chosen.includes(o.id)) continue;
      for (const t of o.topics) (part.id === 'discuss' ? discuss : topics).add(t);
    }
  }
  if (oqc && topics.has('work')) topics.add('oqc_work');
  if (!oqc) discuss.delete('oqc_work');
  return { topics: [...topics], discuss: [...discuss] };
}

// Tóm tắt một dòng cho màn chuẩn bị và phần xem lại.
export function surveySummary(survey) {
  const s = normalizeSurvey(survey);
  const label = (part, id) => optionsOf(part).find((o) => o.id === id)?.vi || '';
  const [work, , housing, leisure, discuss] = SURVEY;
  const bits = [label(work, s.work), label(housing, s.housing)];
  const lz = s.leisure.map((id) => label(leisure, id));
  return { head: bits.filter(Boolean).join(' · '), leisure: lz, discuss: s.discuss.map((id) => label(discuss, id)) };
}

export function surveyFormHTML(survey) {
  const s = normalizeSurvey(survey);
  const opt = (part, o) => {
    const checked = part.type === 'one' ? s[part.id] === o.id : s[part.id].includes(o.id);
    return `<label class="check"><input type="${part.type === 'one' ? 'radio' : 'checkbox'}" name="sv-${part.id}" value="${o.id}" ${checked ? 'checked' : ''}> ${o.vi}</label>`;
  };
  return SURVEY.map(
    (part) => `<fieldset class="sv-part"><legend><span class="badge">${part.part}</span> ${part.title}</legend>
      ${part.groups ? part.groups.map((g) => `<div class="sv-group"><div class="sv-group-t">${g.vi}</div><div class="chip-grid">${g.options.map((o) => opt(part, o)).join('')}</div></div>`).join('') : part.options.map((o) => opt(part, o)).join('')}
      ${part.note ? `<p class="muted small">${part.note}</p>` : ''}</fieldset>`,
  ).join('');
}

export function readSurveyForm(root) {
  const s = {};
  for (const part of SURVEY) {
    const inputs = [...root.querySelectorAll(`[name="sv-${part.id}"]`)];
    s[part.id] = part.type === 'one' ? inputs.find((i) => i.checked)?.value : inputs.filter((i) => i.checked).map((i) => i.value);
  }
  return normalizeSurvey(s);
}

// ---------- Self-Assessment ----------
// Mô tả do app viết lại bằng tiếng Việt; dải điểm theo slide lớp SEVT (1–2: NL–IL, 3–4: NL–IH, 5–6: NL–AL).
export const SELF_LEVELS = [
  { n: 1, vi: 'Tôi chỉ nói được một vài từ hoặc cụm từ tiếng Anh đơn lẻ.', range: 'NL – IL', off: true },
  { n: 2, vi: 'Tôi nói được câu rất ngắn về thông tin cơ bản như tên, tuổi, sở thích.', range: 'NL – IL', off: true },
  { n: 3, vi: 'Tôi nói được về chủ đề quen thuộc bằng câu đơn giản, đôi khi phải dừng để tìm từ.', range: 'NL – IH' },
  { n: 4, vi: 'Tôi nói khá tự tin về chủ đề quen thuộc và kể được chuyện đã xảy ra, dù còn mắc lỗi.', range: 'NL – IH' },
  { n: 5, vi: 'Tôi kể chuyện có mở đầu – diễn biến – kết thúc, mô tả chi tiết, so sánh và xử lý được tình huống phát sinh.', range: 'NL – AL' },
  { n: 6, vi: 'Tôi nói trôi chảy nhiều chủ đề, nêu quan điểm và bàn về vấn đề xã hội, dùng thì chính xác.', range: 'NL – AL' },
];

export const levelToDiff = (n) => (n >= 5 ? '56' : '34');
export const suggestLevel = (target) => (target === 'IM' ? 4 : target === 'AL' ? 6 : 5);
export const clampLevel = (n) => Math.min(6, Math.max(3, n));

export function selfLevelHTML(current) {
  return SELF_LEVELS.map(
    (l) => `<label class="check sa-row ${l.off ? 'sa-off' : ''}"><input type="radio" name="mock-self" value="${l.n}" ${l.off ? 'disabled' : ''} ${current === l.n ? 'checked' : ''}>
      <span><b>Cấp ${l.n}.</b> ${l.vi} <span class="muted small">Có thể đạt: ${l.range}${l.off ? ' · app không có đề cấp này' : ''}</span></span></label>`,
  ).join('');
}
