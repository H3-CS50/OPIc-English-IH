// Kiểm thử Code.gs bằng các đối tượng Google Apps Script giả lập (chạy: node tools/group-server/test-server.mjs).
import assert from 'node:assert/strict';
import { makeEnv } from './fake-gas.mjs';

let n = 0;
const ok = (name) => console.log(`✓ ${++n}. ${name}`);

// ---- cơ bản
{
  const { ctx, sheets } = makeEnv();
  const r = JSON.parse(ctx.doGet().body);
  assert.equal(r.ok, true);
  assert.ok(sheets.Users && sheets.Daily && sheets.Config);
  assert.equal(ctx.setup().startsWith('Đã tạo 8'), true);
  assert.deepEqual(sheets.Config.grid[0], ['key', 'value', 'note']);
  ok('doGet + setup tạo đủ trang tính');
}

// ---- đăng ký, đồng bộ, xếp hạng
{
  const { post, sheets } = makeEnv();
  assert.equal(post({ action: 'sync', uid: 'abcdefgh12' }).ok, false, 'chưa đăng ký thì không đồng bộ được');
  assert.equal(post({ action: 'register', uid: 'bad', name: 'A' }).ok, false);
  assert.equal(post({ action: 'register', uid: 'abcdefgh12', name: '' }).ok, false);
  const reg = post({ action: 'register', uid: 'abcdefgh12', name: 'Anh Tuấn', team: 'Phòng QA', target: 'IH' });
  assert.equal(reg.ok, true);
  assert.deepEqual(reg.ai, { enabled: false, limit: 40 });
  assert.equal(post({ action: 'register', uid: 'zzzzzzzz99', name: 'Chị Lan', team: 'Phòng HR', target: 'IM' }).ok, true);
  assert.equal(post({ action: 'register', uid: 'yyyyyyyy77', name: 'Ông Ba', team: 'Phòng QA', target: 'AL' }).ok, true);
  assert.equal(sheets.Users.grid.length, 4);
  // đăng ký lại không tạo dòng mới
  assert.equal(post({ action: 'register', uid: 'abcdefgh12', name: 'Anh Tuấn', team: 'Phòng QA', target: 'IH' }).ok, true);
  assert.equal(sheets.Users.grid.length, 4);
  // cài lại app (mã mới) cùng tên + phòng ban → dùng lại mã cũ
  const again = post({ action: 'register', uid: 'newphone0001', name: 'anh tuấn', team: 'Phòng QA', target: 'IH' });
  assert.equal(again.uid, 'abcdefgh12');
  assert.equal(sheets.Users.grid.length, 4);
  post({ action: 'register', uid: 'abcdefgh12', name: 'Anh Tuấn', team: 'Phòng QA', target: 'IH' });
  // cùng tên nhưng khác phòng ban → người khác
  const other = post({ action: 'register', uid: 'otherperson1', name: 'Anh Tuấn', team: 'Phòng HR' });
  assert.equal(other.uid, 'otherperson1');
  assert.equal(sheets.Users.grid.length, 5);
  sheets.Users.grid.pop();
  ok('đăng ký / đăng ký lại / cài lại app');

  let r = post({
    action: 'sync',
    uid: 'abcdefgh12',
    days: [
      { date: '2026-10-26', exp: 120, seconds: 600, spoken: 10 },
      { date: '2026-10-27', exp: 99999, seconds: 900 },
      { date: 'bad', exp: 5 },
    ],
    mocks: [{ id: 'm1', at: Date.UTC(2026, 9, 27), testId: 'IH-01', answered: 15, total: 15, label: 'IM3' }],
    exams: [{ date: '2026-11-20', level: 'IH' }, { date: '2026-11-21', level: 'XX' }],
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.saved, { days: 2, mocks: 1, exams: 1 });
  r = post({ action: 'sync', uid: 'zzzzzzzz99', days: [{ date: '2026-10-27', exp: 300, seconds: 1200 }] });
  r = post({ action: 'sync', uid: 'yyyyyyyy77', days: [{ date: '2026-10-20', exp: 500 }] });
  // đồng bộ lại cùng ngày: ghi đè, không cộng dồn
  post({ action: 'sync', uid: 'abcdefgh12', days: [{ date: '2026-10-26', exp: 150, seconds: 700 }] });
  assert.equal(sheets.Daily.grid.length, 5);
  ok('đồng bộ: lọc ngày sai, ghi đè theo ngày, lọc cấp thi sai');

  // ngày được lưu dạng chữ, không bị đổi thành Date
  assert.equal(typeof sheets.Daily.grid[1][1], 'string');

  const day = post({ action: 'board', uid: 'abcdefgh12', period: 'day', date: '2026-10-27' });
  assert.equal(day.rows.length, 2);
  assert.equal(day.rows[0].name, 'Anh Tuấn');
  assert.equal(day.rows[0].exp, 800, 'trần EXP mỗi ngày');
  assert.equal(day.rows[0].me, true);
  assert.deepEqual(day.me, { rank: 1, exp: 800 });

  const week = post({ action: 'board', uid: 'zzzzzzzz99', period: 'week', date: '2026-10-28' });
  assert.equal(week.from, '2026-10-26');
  assert.equal(week.to, '2026-11-01');
  assert.deepEqual(week.rows.map((x) => [x.name, x.exp]), [['Anh Tuấn', 950], ['Chị Lan', 300]]);
  assert.deepEqual(week.me, { rank: 2, exp: 300 });
  assert.deepEqual(week.teams, ['Phòng HR', 'Phòng QA']);
  assert.equal(week.rows[0].minutes, 27);
  assert.equal(week.rows[0].mocks, 0);

  const month = post({ action: 'board', uid: 'zzzzzzzz99', period: 'month', date: '2026-10-05' });
  assert.equal(month.rows.length, 3);
  assert.equal(month.rows[0].name, 'Anh Tuấn');
  const qa = post({ action: 'board', uid: 'zzzzzzzz99', period: 'month', date: '2026-10-05', team: 'Phòng QA' });
  assert.deepEqual(qa.rows.map((x) => x.name), ['Anh Tuấn', 'Ông Ba']);
  assert.equal(qa.me, null);
  assert.equal(post({ action: 'board', period: 'year', date: '2026-10-05' }).ok, false);
  ok('bảng xếp hạng ngày / tuần / tháng / lọc theo nhóm');
}

// ---- ngày bị Sheet đổi thành Date (cột không ở dạng chữ) vẫn đọc đúng theo múi giờ của Sheet
{
  const { post, sheets, ctx } = makeEnv();
  ctx.setup();
  post({ action: 'register', uid: 'abcdefgh12', name: 'A' });
  sheets.Daily.grid.push(['abcdefgh12|2026-10-27', new Date('2026-10-27T00:00:00+07:00'), 'abcdefgh12', 40, 0, 60, 0, 0, 0, 0, 0, 0]);
  const b = post({ action: 'board', uid: 'abcdefgh12', period: 'day', date: '2026-10-27' });
  assert.equal(b.rows.length, 1);
  assert.equal(b.rows[0].exp, 40);
  assert.ok(ctx);
  ok('đọc đúng ngày kiểu Date theo múi giờ của Sheet');
}

// ---- quản trị
{
  const { post, setCfg } = makeEnv();
  post({ action: 'register', uid: 'abcdefgh12', name: 'A', team: 'T1', target: 'IH' });
  post({ action: 'register', uid: 'bbbbbbbb12', name: 'B', team: 'T2', target: 'IM' });
  post({ action: 'sync', uid: 'abcdefgh12', days: [{ date: '2026-10-20', exp: 100, seconds: 120 }, { date: '2026-10-27', exp: 50, seconds: 300 }], mocks: [{ id: 'x', at: Date.UTC(2026, 9, 25), answered: 14, total: 15, label: 'IH' }], exams: [{ date: '2026-11-01', level: 'IM2' }] });
  assert.equal(post({ action: 'admin', pin: '' }).ok, false, 'chưa đặt mã thì không mở được');
  setCfg('admin_pin', '001234');
  assert.equal(post({ action: 'admin', pin: '1234' }).ok, false);
  const a = post({ action: 'admin', pin: '001234', date: '2026-10-27' });
  assert.equal(a.ok, true);
  assert.equal(a.totals.users, 2);
  assert.equal(a.totals.active7, 1);
  assert.equal(a.totals.minutes7, 5);
  assert.equal(a.totals.examTaken, 1);
  const A = a.users.find((u) => u.name === 'A');
  assert.equal(A.expAll, 150);
  assert.equal(A.exp7, 50);
  assert.equal(A.mocks, 1);
  assert.equal(A.lastMockLabel, 'IH');
  assert.deepEqual(A.exams, [{ date: '2026-11-01', level: 'IM2' }]);
  ok('bảng theo dõi quản trị (mã có số 0 ở đầu)');
}

// ---- câu hỏi thi thật, báo lỗi
{
  const { post, sheets } = makeEnv();
  post({ action: 'register', uid: 'abcdefgh12', name: 'A' });
  assert.equal(post({ action: 'question', uid: 'abcdefgh12', question: 'short' }).ok, false);
  assert.equal(post({ action: 'question', uid: 'abcdefgh12', exam_date: '2026-11-01', level: 'IH', section: 'Combo 2', question: 'Tell me about the bank you use and what you usually do there.' }).ok, true);
  assert.equal(post({ action: 'flag', uid: 'abcdefgh12', qid: 'Q-0001', note: 'sai chính tả' }).ok, true);
  assert.equal(sheets.Questions.grid.length, 2);
  assert.equal(sheets.Questions.grid[1][2], 'A');
  assert.equal(sheets.Flags.grid.length, 2);
  post({ action: 'register', uid: 'cccccccc12', name: 'C' });
  post({ action: 'question', uid: 'cccccccc12', question: 'Describe a recent change in your neighborhood.', section: 'Đột xuất' });
  const qs = post({ action: 'questions', uid: 'abcdefgh12' });
  assert.equal(qs.total, 2);
  assert.equal(qs.rows[0].name, 'C', 'mới nhất trước');
  assert.equal(qs.rows[0].mine, false);
  assert.equal(qs.rows[1].mine, true);
  assert.equal(qs.rows[1].exam_date, '2026-11-01');
  assert.equal(post({ action: 'questions', uid: 'nouser123' }).ok, false);
  assert.equal(post({ action: 'nope' }).ok, false);
  assert.equal(JSON.parse(makeEnv().ctx.doPost({ postData: { contents: '{bad' } }).body).ok, false);
  ok('gửi câu hỏi thi thật / báo lỗi / yêu cầu sai');
}

// ---- AI của nhóm
{
  const env = makeEnv({
    props: { GEMINI_KEY: 'k-123' },
    fetchImpl: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"a":1}' }] } }] }) }),
  });
  const { post, setCfg, fetched } = env;
  post({ action: 'register', uid: 'abcdefgh12', name: 'A' });
  let r = post({ action: 'ai', uid: 'abcdefgh12', body: { contents: [] } });
  assert.equal(r.ok, false, 'chưa bật AI');
  setCfg('ai_enabled', 'yes');
  setCfg('ai_daily_limit', '2');
  assert.deepEqual(post({ action: 'sync', uid: 'abcdefgh12' }).ai, { enabled: true, limit: 2 });
  assert.equal(post({ action: 'ai', uid: 'nouser999', body: {} }).ok, false, 'chưa đăng ký');
  r = post({ action: 'ai', uid: 'abcdefgh12', body: { contents: [{ parts: [{ text: 'hi' }] }] } });
  assert.equal(r.ok, true);
  assert.equal(r.status, 200);
  assert.equal(r.used, 1);
  assert.equal(r.data.candidates[0].content.parts[0].text, '{"a":1}');
  assert.match(fetched[0].url, /models\/gemini-3\.8-flash:generateContent$/);
  assert.equal(fetched[0].opts.headers['x-goog-api-key'], 'k-123');
  assert.equal(JSON.parse(fetched[0].opts.payload).contents[0].parts[0].text, 'hi');
  assert.equal(post({ action: 'ai', uid: 'abcdefgh12', body: {} }).used, 2);
  r = post({ action: 'ai', uid: 'abcdefgh12', body: {} });
  assert.equal(r.ok, false);
  assert.match(r.error, /hết 2 lượt/);
  assert.equal(fetched.length, 2, 'hết lượt thì không gọi Gemini');
  setCfg('ai_model', 'bad model!');
  setCfg('ai_daily_limit', '10');
  post({ action: 'ai', uid: 'abcdefgh12', body: {} });
  assert.match(fetched[2].url, /gemini-3\.8-flash/, 'tên model lạ thì dùng mặc định');
  // quá thời gian: báo lỗi rõ ràng và trả lại lượt
  const slow = makeEnv({ props: { GEMINI_KEY: 'k' }, fetchImpl: () => { throw new Error('Timeout: https://generativelanguage.googleapis.com'); } });
  slow.post({ action: 'register', uid: 'abcdefgh12', name: 'A' });
  slow.setCfg('ai_enabled', 'yes');
  const t = slow.post({ action: 'ai', uid: 'abcdefgh12', body: {} });
  assert.equal(t.ok, false);
  assert.match(t.error, /^AI_TIMEOUT/);
  assert.equal(slow.sheets.AIUsage.grid[1][3], 0, 'trả lại lượt khi lỗi');
  const noKey = makeEnv();
  noKey.post({ action: 'register', uid: 'abcdefgh12', name: 'A' });
  noKey.setCfg('ai_enabled', 'yes');
  assert.match(noKey.post({ action: 'ai', uid: 'abcdefgh12', body: {} }).error, /GEMINI_KEY/);
  ok('AI của nhóm: bật/tắt, key, hạn mức mỗi ngày, model');
}

console.log(`\nGROUP SERVER: ${n} nhóm kiểm thử đều đạt.`);
