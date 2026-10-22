// Đề của tuần: cả nhóm cùng làm một đề cố định mỗi tuần (tuần tính từ thứ Hai).
// Đi ngược từ đề cuối bộ (IH-30, IH-29…) để ít trùng với thứ tự tự học (IH-01, IH-02…).
import TESTS from './tests.json';
import { weekStart, dayKey } from './activity.js';

const START = new Date(2026, 9, 19).getTime(); // thứ Hai 19/10/2026 = tuần 1

export function weekNo(now = Date.now()) {
  return Math.max(0, Math.round((weekStart(now).getTime() - START) / (7 * 864e5))) + 1;
}

export function weekTest(level, now = Date.now()) {
  const set = TESTS.sets.find((s) => s.level === level) || TESTS.sets[0];
  const n = weekNo(now);
  const len = set.tests.length;
  const test = set.tests[len - 1 - ((n - 1) % len)];
  const from = weekStart(now);
  const to = new Date(from.getTime() + 6 * 864e5);
  return { test, week: n, key: dayKey(from.getTime()), from, to };
}

export const weekLevelFor = (target) => (target === 'IM' ? '34' : '56');

// Đã làm đề của tuần này chưa (từ 12 câu trở lên, trong tuần này).
export const weekDone = (wt, mocks) => mocks.some((m) => m.testId === wt.test.id && m.at >= wt.from.getTime() && (m.answered || 0) >= 12);
