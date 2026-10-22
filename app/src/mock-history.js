// Kết quả các bài thi thử (để vẽ biểu đồ tiến bộ). Lưu trên máy, tối đa 60 bài.
import { store } from './util.js';

const KEY = 'mocks';
const MAX = 60;
let mocks = store.get(KEY, null);
if (!Array.isArray(mocks)) mocks = [];
const listeners = new Set();

export const onMocksChange = (fn) => listeners.add(fn);
export const listMocks = () => [...mocks].sort((a, b) => a.at - b.at);

export function saveMockRecord(rec) {
  const i = mocks.findIndex((m) => m.id === rec.id);
  if (i >= 0) mocks[i] = { ...mocks[i], ...rec };
  else mocks.push(rec);
  mocks.sort((a, b) => a.at - b.at);
  if (mocks.length > MAX) mocks = mocks.slice(-MAX);
  store.set(KEY, mocks);
  listeners.forEach((fn) => fn());
}

export function clearMocks() {
  mocks = [];
  store.remove(KEY);
  listeners.forEach((fn) => fn());
}
