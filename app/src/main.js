// OPIc OQC — app luyện nói OPIc tiếng Anh (IM · IH · AL).
import pkg from '../package.json';
import { $, toast } from './util.js';
import { initSettings, onSettingsChange } from './settings.js';
import { initPractice, refreshPracticeFilters, isRecording } from './practice.js';
import { initMock, mockBusy } from './mock.js';
import { initLearn, refreshLearn } from './learn.js';
import { initProgress, renderProgress } from './progress.js';
import { initHelp } from './help.js';

const TITLES = { practice: 'Luyện nói', mock: 'Thi thử', learn: 'Học', progress: 'Tiến bộ', settings: 'Cài đặt' };
let current = 'practice';

function showTab(name) {
  if (name === current) return;
  if (current === 'mock' && mockBusy()) return toast('Đang thi thử. Bấm "Kết thúc" để thoát bài thi.', 3500);
  if (current === 'practice' && isRecording()) return toast('Hãy dừng ghi âm trước khi chuyển tab.');
  current = name;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${name}`));
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  $('screen-title').textContent = TITLES[name];
  if (name === 'progress') renderProgress();
  window.scrollTo(0, 0);
}

document.querySelectorAll('.tabbar button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
window.addEventListener('opic:show-tab', (e) => {
  if (current === 'mock' && mockBusy()) return;
  current = null;
  showTab(e.detail);
});

initSettings({ version: pkg.version });
initPractice();
initMock();
initLearn();
initProgress();
initHelp({ navigate: (tab) => showTab(tab), getTab: () => current });

let packCount = -1;
onSettingsChange(() => {
  // Khi nhập/xoá bộ câu hỏi, làm mới bộ lọc.
  const n = JSON.parse(localStorage.getItem('opic.packs') || '[]').length;
  if (n !== packCount) {
    packCount = n;
    refreshPracticeFilters();
    refreshLearn();
  }
});
