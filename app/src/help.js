// Hướng dẫn sử dụng: màn chào mừng lần đầu + trang hướng dẫn chi tiết (nút ❓ trên thanh tiêu đề).
import { $, md, store, escapeHtml } from './util.js';
import { docs, kb } from './data.js';

const WELCOME_VERSION = 1;
const classCount = kb.questions.filter((q) => q.origin_set === 'class').length;

const SLIDES = [
  {
    icon: '👋',
    title: 'Chào mừng đến OPIc OQC',
    lead: 'App luyện nói OPIc tiếng Anh theo lộ trình IM → IH → AL.',
    items: [
      ['🎤', 'Nghe câu hỏi và nói như khi thi thật'],
      ['🤖', 'AI Coach nhận xét, chỉ ra điểm cần sửa và giao bài nói lại'],
      ['📖', 'Bài mẫu, khung trả lời, flashcard'],
      ['📝', 'Thi thử 15 câu trong 40 phút'],
    ],
  },
  {
    icon: '🎤',
    title: 'Luyện một câu trong 4 bước',
    lead: 'Tất cả nằm ở tab Luyện.',
    items: [
      ['1', 'Chọn mục tiêu <b>IM / IH / AL</b> và <b>bộ câu hỏi</b>'],
      ['2', 'Bấm <b>🔊 Nghe</b> để nghe câu hỏi'],
      ['3', 'Bấm <b>nút đỏ</b> để nói, bấm lần nữa để dừng'],
      ['4', 'Bấm <b>🤖 AI Coach</b>, <b>📖 Bài mẫu</b> hoặc <b>✅ Tự kiểm tra</b>'],
    ],
  },
  {
    icon: '🤖',
    title: 'Bật AI Coach',
    lead: 'AI cần API key của riêng bạn. Key chỉ lưu trên máy này.',
    items: [
      ['⚙️', 'Vào <b>Cài đặt</b> → chọn <b>Gemini</b> (có gói miễn phí) hoặc <b>Claude</b> → dán key'],
      ['📋', 'Chưa có key? Bấm <b>Copy nhờ Claude</b> rồi dán vào app Claude'],
      ['🔒', 'Đừng đưa thông tin nội bộ công ty vào bài nói'],
    ],
    action: { label: '⚙️ Mở Cài đặt ngay', tab: 'settings' },
  },
  {
    icon: '🏫',
    title: `${classCount} câu hỏi của lớp`,
    lead: 'Mỗi câu có sẵn một bài mẫu mức IH.',
    items: [
      ['🎤', 'Tab Luyện: ô <b>Bộ câu hỏi</b> → <b>Câu hỏi của lớp</b>'],
      ['📚', 'Tab Học → <b>Câu hỏi</b>: xem và tìm toàn bộ'],
      ['📝', 'Tab Thi thử: chọn <b>Nguồn câu hỏi</b>'],
    ],
  },
  {
    icon: '⚠️',
    title: 'Hai điều cần nhớ',
    lead: '',
    items: [
      ['📊', 'IM / IH / AL trong app là <b>ước tính luyện tập</b>, không phải điểm OPIc chính thức'],
      ['🚫', '<b>Đừng học thuộc bài mẫu.</b> Học khung và cụm từ, rồi kể chuyện của chính bạn'],
      ['❓', 'Cần xem lại cách dùng? Bấm nút <b>?</b> ở góc trên bên phải bất cứ lúc nào'],
    ],
  },
];

// Mục trong hướng dẫn tương ứng với từng tab (khớp theo chữ trong tiêu đề ##).
const TAB_SECTION = { practice: 'Tab Luyện', mock: 'Tab Thi thử', learn: 'Tab Học', progress: 'Tab Tiến bộ', settings: 'Tab Cài đặt' };
const QUICK = [
  ['Bắt đầu nhanh', 'Bắt đầu nhanh'],
  ['Lộ trình', 'Lộ trình'],
  ['Luyện', 'Tab Luyện'],
  ['Thi thử', 'Tab Thi thử'],
  ['Học', 'Tab Học'],
  ['Tiến bộ', 'Tab Tiến bộ'],
  ['Cài đặt', 'Tab Cài đặt'],
  ['API key', 'API key'],
  ['Câu hỏi của lớp', 'Câu hỏi của lớp'],
  ['Mẹo', 'Mẹo'],
  ['Hỏi đáp', 'Câu hỏi thường gặp'],
];

let slide = 0;
let onNavigate = () => {};
let currentTab = () => 'practice';

// ---------- Màn chào mừng ----------
function renderSlide() {
  const s = SLIDES[slide];
  const last = slide === SLIDES.length - 1;
  $('welcome-body').innerHTML = `
    <div class="welcome-icon" aria-hidden="true">${s.icon}</div>
    <h2>${escapeHtml(s.title)}</h2>
    ${s.lead ? `<p class="welcome-lead">${escapeHtml(s.lead)}</p>` : ''}
    <ul class="welcome-list">${s.items.map(([i, t]) => `<li><span class="welcome-bullet">${i}</span><span>${t}</span></li>`).join('')}</ul>
    ${s.action ? `<button class="btn" data-welcome-go="${s.action.tab}">${s.action.label}</button>` : ''}`;
  $('welcome-dots').innerHTML = SLIDES.map((_, i) => `<span class="${i === slide ? 'on' : ''}"></span>`).join('');
  $('welcome-prev').style.visibility = slide ? 'visible' : 'hidden';
  $('welcome-next').hidden = last;
  $('welcome-done').hidden = !last;
  $('welcome-guide').hidden = !last;
  $('welcome-body')
    .querySelector('[data-welcome-go]')
    ?.addEventListener('click', (e) => {
      closeWelcome();
      onNavigate(e.currentTarget.dataset.welcomeGo);
    });
}
const go = (step) => {
  slide = Math.min(SLIDES.length - 1, Math.max(0, slide + step));
  renderSlide();
};

export function showWelcome() {
  slide = 0;
  renderSlide();
  $('welcome').hidden = false;
  document.body.classList.add('no-scroll');
}
function closeWelcome() {
  $('welcome').hidden = true;
  document.body.classList.remove('no-scroll');
  store.set('welcomeSeen', WELCOME_VERSION);
}

// ---------- Trang hướng dẫn chi tiết ----------
let rendered = false;
function renderGuide() {
  if (rendered) return;
  const guide = docs.find((d) => d.id === 'guide');
  const body = $('help-content');
  body.innerHTML = guide ? md(guide.md) : '<p class="muted">Không tìm thấy hướng dẫn.</p>';
  body.querySelectorAll('h2').forEach((h, i) => (h.id = `help-s${i}`));
  body.querySelectorAll('a[href^="http"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $('help-quick').innerHTML = QUICK.filter(([, key]) => findSection(key))
    .map(([label, key]) => `<button class="chip-btn" data-help-jump="${escapeHtml(key)}">${escapeHtml(label)}</button>`)
    .join('');
  $('help-quick')
    .querySelectorAll('[data-help-jump]')
    .forEach((b) => b.addEventListener('click', () => jump(b.dataset.helpJump)));
  rendered = true;
}
function findSection(key) {
  return [...$('help-content').querySelectorAll('h2')].find((h) => h.textContent.includes(key));
}
function jump(key) {
  const h = findSection(key);
  const sheet = $('help-scroll');
  $('help-quick')
    .querySelectorAll('[data-help-jump]')
    .forEach((b) => {
      b.classList.toggle('active', b.dataset.helpJump === key);
      if (b.dataset.helpJump === key) b.scrollIntoView({ inline: 'center', block: 'nearest' });
    });
  if (!h) return (sheet.scrollTop = 0);
  sheet.scrollTop = h.offsetTop - $('help-quick').offsetHeight - 8;
}

export function openHelp(sectionKey) {
  renderGuide();
  $('help').hidden = false;
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => jump(sectionKey || ''));
}
function closeHelp() {
  $('help').hidden = true;
  document.body.classList.remove('no-scroll');
}

export function initHelp({ navigate, getTab }) {
  onNavigate = navigate;
  currentTab = getTab;
  $('btn-help').addEventListener('click', () => openHelp(TAB_SECTION[currentTab()]));
  $('help-close').addEventListener('click', closeHelp);
  $('help-top').addEventListener('click', () => jump(''));

  $('welcome-next').addEventListener('click', () => go(1));
  $('welcome-prev').addEventListener('click', () => go(-1));
  $('welcome-skip').addEventListener('click', closeWelcome);
  $('welcome-done').addEventListener('click', () => {
    closeWelcome();
    onNavigate('practice');
  });
  $('welcome-guide').addEventListener('click', () => {
    closeWelcome();
    openHelp('Bắt đầu nhanh');
  });
  // Vuốt trái/phải để chuyển trang.
  let x0 = null;
  $('welcome-card').addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  $('welcome-card').addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('help').hidden) closeHelp();
    else if (!$('welcome').hidden) closeWelcome();
  });

  $('btn-open-guide').addEventListener('click', () => openHelp());
  $('btn-open-welcome').addEventListener('click', showWelcome);

  if (store.get('welcomeSeen', 0) < WELCOME_VERSION) showWelcome();
}
