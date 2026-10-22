// Lộ trình chinh phục: chặng → chủ đề → combo. Dữ liệu và cách tính sao (không đụng DOM).
import { store, LEVEL_SCORE, countWords } from './util.js';
import { logActivity } from './activity.js';

// Chặng theo thứ tự đề thi: giới thiệu → survey → đột xuất → role-play → nâng cao → thi thử.
export const STAGES = [
  { id: 'intro', icon: '👋', title: 'Khởi động', desc: 'Câu 1 luôn là giới thiệu bản thân. Nói trôi chảy câu này trước.', need: 1, match: (c) => c.kind === 'intro' },
  { id: 'survey', icon: '🏠', title: 'Chủ đề Survey', desc: 'Combo 3 câu về chủ đề bạn chọn trong Background Survey: miêu tả → thói quen → kể trải nghiệm.', need: 3, match: (c) => c.kind === 'combo' && c.category === 'survey' },
  { id: 'unexpected', icon: '⚡', title: 'Chủ đề đột xuất', desc: 'Chủ đề bạn không chọn nhưng đề vẫn hỏi. Luyện để không bị bất ngờ.', need: 3, match: (c) => c.kind === 'combo' && c.category === 'unexpected' },
  { id: 'roleplay', icon: '🎭', title: 'Role-play', desc: 'Câu 11–13: hỏi thông tin → giải quyết vấn đề → kể trải nghiệm liên quan.', need: 2, match: (c) => c.kind === 'rp' || c.kind === 'ava' },
  { id: 'advanced', icon: '🧠', title: 'Câu nâng cao', desc: 'Câu 14–15 ở cấp 5–6: so sánh, thay đổi, vấn đề xã hội. Đây là phần tách IH với AL.', need: 2, match: (c) => c.kind === 'adv' },
  { id: 'boss', icon: '🏆', title: 'Thi thử tổng', desc: 'Làm trọn một bài thi thử 15 câu, trả lời ít nhất 12 câu.', need: 1, boss: true },
];

// ---------- Tiến độ "đã nói" (lưu trên máy) ----------
const KEY = 'roadmap';
let prog = store.get(KEY, null);
if (!prog || typeof prog !== 'object') prog = { spoken: {} };
prog.spoken ||= {};
const listeners = new Set();
export const onRoadmapChange = (fn) => listeners.add(fn);
export const MIN_WORDS = 15;
export const MIN_SECONDS = 20;

// Gọi khi người học nói xong một câu (đủ dài mới tính).
export function recordSpoken(qid, { words = 0, seconds = 0 } = {}) {
  if (!qid || (words < MIN_WORDS && seconds < MIN_SECONDS)) return false;
  const old = prog.spoken[qid];
  prog.spoken[qid] = { at: Date.now(), words: Math.max(words, old?.words || 0), seconds: Math.max(seconds, old?.seconds || 0) };
  store.set(KEY, prog);
  logActivity('spoken', { key: qid, seconds });
  listeners.forEach((fn) => fn());
  return true;
}
export const spokenMap = () => prog.spoken;
export function resetRoadmap() {
  prog = { spoken: {} };
  store.set(KEY, prog);
  listeners.forEach((fn) => fn());
}

// ---------- Dựng lộ trình ----------
// combos: kết quả comboInfo() của mock.js; mine: chủ đề người học chọn trong Survey.
export function buildRoadmap(combos, { source = 'both', oqc = true, mine = [], topicLabel = (t) => t } = {}) {
  const usable = combos.filter((c) => (oqc || !c.oqc) && (source === 'both' || c.source === source || c.kind === 'intro'));
  return STAGES.map((s) => {
    if (s.boss) return { ...s, nodes: [] };
    let list = usable.filter(s.match);
    // Giới thiệu: mỗi câu là một lựa chọn riêng (không phải chuỗi 3 câu).
    if (s.id === 'intro') list = list.flatMap((c) => c.qs.filter((q) => oqc || !q.oqc_branch).map((q, i) => ({ ...c, id: `${c.id}#${i}`, qs: [q] })));
    const byTopic = new Map();
    for (const c of list) {
      if (!byTopic.has(c.topic)) byTopic.set(c.topic, []);
      byTopic.get(c.topic).push(c);
    }
    const nodes = [...byTopic.entries()].map(([topic, cs]) => ({
      key: `${s.id}:${topic}`,
      topic,
      label: topicLabel(topic),
      mine: s.id === 'survey' && mine.includes(topic),
      combos: cs.sort((a, b) => (a.source === b.source ? a.id.localeCompare(b.id) : a.source === 'class' ? -1 : 1)),
    }));
    // Chủ đề bạn chọn trong Survey lên đầu, còn lại theo tên.
    nodes.sort((a, b) => Number(b.mine) - Number(a.mine) || a.label.localeCompare(b.label, 'vi'));
    return { ...s, nodes };
  });
}

// ---------- Tính sao ----------
// Gom lịch sử theo câu hỏi một lần cho nhanh.
export function indexAttempts(attempts = []) {
  const idx = new Map();
  for (const a of attempts) {
    if (!a.question_id) continue;
    const x = idx.get(a.question_id) || { ai: null, self: 0, spoken: false };
    const s = LEVEL_SCORE[a.coach_result?.practice_level_estimate?.label];
    if (s != null) x.ai = Math.max(x.ai ?? -1, s);
    if (a.self_check?.total) x.self = Math.max(x.self, a.self_check.checked.length / a.self_check.total);
    if (countWords(a.transcript) >= MIN_WORDS || (a.seconds || 0) >= MIN_SECONDS) x.spoken = true;
    idx.set(a.question_id, x);
  }
  return idx;
}

// ★1: nói hết các câu của combo. ★2: thêm mỗi câu được AI chấm gần mục tiêu (cách ≤ nửa bậc) hoặc tự kiểm tra ≥ 70%.
// ★3: mọi câu được AI chấm đạt mục tiêu.
export function comboStars(combo, { idx, spoken = {}, target = 'IH' }) {
  const tgt = LEVEL_SCORE[target] ?? 2;
  const qs = combo.qs;
  const info = qs.map((q) => ({ ...(idx.get(q.question_id) || {}), spoken: !!spoken[q.question_id] || !!idx.get(q.question_id)?.spoken }));
  const done = info.filter((x) => x.spoken).length;
  if (done < qs.length) return { stars: 0, done, total: qs.length };
  const near = info.every((x) => (x.ai != null && x.ai >= tgt - 0.5) || (x.self || 0) >= 0.7);
  const hit = info.every((x) => x.ai != null && x.ai >= tgt);
  return { stars: hit ? 3 : near ? 2 : 1, done, total: qs.length };
}

export function roadmapStatus(stages, { attempts = [], spoken = {}, target = 'IH', mocks = [] } = {}) {
  const idx = indexAttempts(attempts);
  let prevOpen = true;
  let prevDone = true;
  return stages.map((s, i) => {
    let nodes;
    let doneNodes;
    let bossInfo = null;
    if (s.boss) {
      const full = mocks.filter((m) => (m.answered || 0) >= 12);
      doneNodes = full.length ? 1 : 0;
      nodes = [];
      bossInfo = { attempts: mocks.length, full: full.length };
    } else {
      nodes = s.nodes.map((n) => {
        const cs = n.combos.map((c) => ({ ...c, ...comboStars(c, { idx, spoken, target }) }));
        const stars = Math.max(0, ...cs.map((c) => c.stars));
        const started = cs.some((c) => c.done > 0);
        return { ...n, combos: cs, stars, started, done: stars > 0 };
      });
      doneNodes = nodes.filter((n) => n.done).length;
    }
    const need = Math.min(s.need, s.boss ? 1 : nodes.length || 1);
    const open = i === 0 || (prevOpen && prevDone);
    const cleared = doneNodes >= need;
    prevOpen = open;
    prevDone = cleared;
    const stars = nodes.reduce((a, n) => a + n.stars, 0);
    return { ...s, nodes, open, cleared, doneNodes, need, stars, maxStars: nodes.length * 3, boss: bossInfo, isBoss: !!s.boss };
  });
}

// Chủ đề nên làm tiếp: chặng mở đầu tiên chưa vượt; trong chặng, chủ đề đang dở → chủ đề bạn chọn → chủ đề đầu tiên chưa xong.
export function nextStep(status) {
  const st = status.find((s) => s.open && !s.cleared) || status.find((s) => s.open && s.nodes.some((n) => n.stars < 3));
  if (!st) return null;
  if (st.isBoss) return { stage: st, node: null };
  const node = st.nodes.find((n) => n.started && !n.done) || st.nodes.find((n) => n.mine && !n.done) || st.nodes.find((n) => !n.done) || st.nodes.find((n) => n.stars < 3);
  return { stage: st, node };
}
