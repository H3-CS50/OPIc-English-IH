// Thời lượng nói gợi ý (giây) theo dạng câu và mục tiêu.
// Thiết kế của app dựa trên số liệu cộng đồng (Ringle Prep: số từ tối thiểu theo cấp; OPIcmansur: IH ~1:30/câu)
// và quỹ 40 phút cho 15 câu — không phải quy định của bài thi (bài thi không giới hạn thời gian từng câu).
const GROUP = {
  self_introduction: 'intro',
  description: 'short', routine: 'short', preference_opinion: 'short', comparison_two: 'short',
  past_recent: 'story', past_first: 'story', memorable_experience: 'story', problem_experience: 'story', roleplay_experience: 'story',
  roleplay_ask: 'ask', roleplay_ask_ava: 'ask',
  roleplay_problem: 'problem',
  comparison_change: 'adv', issue_concern: 'adv', news_report: 'adv',
};
export const DURATIONS = {
  intro: { IM: [30, 45], IH: [30, 45], AL: [30, 45] },
  short: { IM: [50, 60], IH: [60, 75], AL: [75, 90] },
  story: { IM: [50, 70], IH: [80, 100], AL: [90, 120] },
  ask: { IM: [30, 45], IH: [45, 60], AL: [50, 70] },
  problem: { IM: [45, 60], IH: [60, 75], AL: [75, 90] },
  adv: { IM: [50, 70], IH: [75, 90], AL: [90, 120] },
};
export const durationGroup = (ptype) => GROUP[ptype] || 'short';
export function targetDuration(q, level = 'IH') {
  const g = DURATIONS[durationGroup(q?.prompt_type)];
  return g[level] || g.IH;
}
// Số từ gợi ý cho bài mẫu: người học nói khoảng 100–120 từ/phút.
export const targetWords = (q, level = 'IH') => targetDuration(q, level).map((s, i) => Math.round((s / 60) * (i ? 120 : 100)));
