/**
 * OPIc OQC — MÁY CHỦ NHÓM (Google Apps Script gắn với một Google Sheet)
 *
 * Làm 5 việc:
 *  1. Nhận tiến độ học (EXP, phút nói, số bài thi thử…) từ app của từng người.
 *  2. Trả bảng xếp hạng ngày / tuần / tháng.
 *  3. Bảng theo dõi cho người quản lý chương trình (cần mã quản trị).
 *  4. "AI của nhóm": chuyển yêu cầu chấm bài tới Gemini bằng key chung (key cất trong Script Properties,
 *     không nằm trong Sheet), giới hạn số lượt mỗi người mỗi ngày.
 *  5. Lưu kết quả thi thật và câu hỏi gặp khi thi do mọi người gửi.
 *
 * Cài đặt: xem tools/group-server/HUONG_DAN_MAY_CHU_NHOM.md
 * Mọi dữ liệu nằm trong Sheet của bạn. Không lưu bài nói hay ghi âm.
 */

var APP_VERSION = 1;

var SHEETS = {
  Users: ['uid', 'name', 'team', 'target', 'est_level', 'joined', 'last_seen', 'app_version'],
  Daily: ['key', 'date', 'uid', 'exp', 'spoken', 'seconds', 'graded', 'mocks', 'week', 'scripts', 'vocab', 'ipa'],
  Mocks: ['key', 'uid', 'at', 'test_id', 'answered', 'total', 'label'],
  Exams: ['key', 'uid', 'date', 'level', 'note'],
  Questions: ['at', 'uid', 'name', 'exam_date', 'level', 'section', 'question'],
  Flags: ['at', 'uid', 'qid', 'note'],
  AIUsage: ['key', 'date', 'uid', 'count'],
  Config: ['key', 'value', 'note'],
};

var DEFAULT_CONFIG = [
  ['admin_pin', '', 'Mã quản trị để xem bảng theo dõi trong app (đặt tối thiểu 6 ký tự). Để trống = tắt.'],
  ['ai_enabled', 'no', 'yes = bật "AI của nhóm". Cần thêm GEMINI_KEY trong Project Settings → Script properties.'],
  ['ai_model', 'gemini-3.8-flash', 'Model Gemini dùng chung.'],
  ['ai_daily_limit', '40', 'Số lượt AI tối đa mỗi người mỗi ngày.'],
  ['max_daily_exp', '800', 'Trần EXP mỗi người mỗi ngày (chống cày điểm).'],
];

// ---------------------------------------------------------------- tiện ích Sheet
function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Cột lưu dạng chữ (để Sheet không tự đổi ngày/mã số, vd. mã quản trị "001234").
var TEXT_COLS = { Daily: ['date'], Exams: ['date'], Questions: ['exam_date'], AIUsage: ['date'], Config: ['value'] };

function sheet_(name) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    (TEXT_COLS[name] || []).forEach(function (col) {
      sh.getRange(1, SHEETS[name].indexOf(col) + 1, sh.getMaxRows(), 1).setNumberFormat('@');
    });
    sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]);
    sh.setFrozenRows(1);
    if (name === 'Config') sh.getRange(2, 1, DEFAULT_CONFIG.length, 3).setValues(DEFAULT_CONFIG);
  }
  return sh;
}

// Chạy một lần sau khi dán mã (chọn "setup" rồi bấm ▶ Chạy): tạo các trang tính và cấp quyền.
function setup() {
  Object.keys(SHEETS).forEach(sheet_);
  return 'Đã tạo ' + Object.keys(SHEETS).length + ' trang tính.';
}

function rows_(name) {
  var sh = sheet_(name);
  var values = sh.getDataRange().getValues();
  var head = values[0];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var o = { _row: i + 1 };
    for (var j = 0; j < head.length; j++) o[head[j]] = values[i][j];
    out.push(o);
  }
  return out;
}

// Ghi đè dòng có cùng khoá (cột đầu) hoặc thêm dòng mới. items: mảng object.
function upsert_(name, items) {
  if (!items.length) return;
  var sh = sheet_(name);
  var head = SHEETS[name];
  var keyCol = head[0];
  var existing = {};
  rows_(name).forEach(function (r) {
    existing[String(r[keyCol])] = r._row;
  });
  var appendRows = [];
  items.forEach(function (it) {
    var row = head.map(function (h) {
      return it[h] === undefined ? '' : it[h];
    });
    var at = existing[String(it[keyCol])];
    if (at) sh.getRange(at, 1, 1, head.length).setValues([row]);
    else {
      appendRows.push(row);
      existing[String(it[keyCol])] = -1;
    }
  });
  if (appendRows.length) sh.getRange(sh.getLastRow() + 1, 1, appendRows.length, head.length).setValues(appendRows);
}

function append_(name, item) {
  var head = SHEETS[name];
  sheet_(name).appendRow(head.map(function (h) {
    return item[h] === undefined ? '' : item[h];
  }));
}

function config_() {
  var c = {};
  DEFAULT_CONFIG.forEach(function (r) {
    c[r[0]] = String(r[1]);
  });
  rows_('Config').forEach(function (r) {
    if (r.key) c[String(r.key)] = String(r.value);
  });
  return c;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function str_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max || 80);
}
function int_(v, max) {
  var n = Math.floor(Number(v) || 0);
  if (n < 0) n = 0;
  return max ? Math.min(n, max) : n;
}
function isDay_(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s));
}
function now_() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------- điểm vào
function doGet() {
  ['Users', 'Daily', 'Config'].forEach(sheet_);
  return json_({ ok: true, app: 'opic-oqc-group', version: APP_VERSION });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Dữ liệu gửi lên không hợp lệ.' });
  }
  try {
    return json_(handle_(req));
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function handle_(req) {
  var a = req.action;
  if (a === 'ping') return { ok: true, app: 'opic-oqc-group', version: APP_VERSION };
  if (a === 'register') return locked_(function () { return register_(req); });
  if (a === 'sync') return locked_(function () { return sync_(req); });
  if (a === 'board') return board_(req);
  if (a === 'admin') return admin_(req);
  if (a === 'question') return locked_(function () { return question_(req); });
  if (a === 'questions') return questions_(req);
  if (a === 'flag') return locked_(function () { return flag_(req); });
  if (a === 'ai') return ai_(req);
  return { ok: false, error: 'Không rõ yêu cầu: ' + a };
}

function locked_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function userOf_(uid) {
  var u = null;
  rows_('Users').forEach(function (r) {
    if (String(r.uid) === String(uid)) u = r;
  });
  return u;
}

function needUser_(uid) {
  if (!/^[a-z0-9]{8,40}$/i.test(String(uid || ''))) throw new Error('Thiếu mã người dùng.');
  var u = userOf_(uid);
  if (!u) throw new Error('Chưa đăng ký. Mở Cài đặt → Nhóm học và bấm Lưu.');
  return u;
}

// ---------------------------------------------------------------- đăng ký / đồng bộ
function register_(req) {
  if (!/^[a-z0-9]{8,40}$/i.test(String(req.uid || ''))) throw new Error('Thiếu mã người dùng.');
  var name = str_(req.name, 40);
  if (!name) throw new Error('Hãy nhập tên hiển thị.');
  var old = userOf_(req.uid);
  if (!old) {
    // Cài lại app / đổi điện thoại: cùng tên và cùng phòng ban thì dùng lại mã cũ để không bị 2 dòng trên bảng xếp hạng.
    var key = (name + '|' + str_(req.team, 40)).toLowerCase();
    rows_('Users').forEach(function (r) {
      if (!old && (String(r.name) + '|' + String(r.team || '')).toLowerCase() === key) old = r;
    });
    if (old) req.uid = String(old.uid);
  }
  upsert_('Users', [{
    uid: req.uid,
    name: name,
    team: str_(req.team, 40),
    target: /^(IM|IH|AL)$/.test(req.target) ? req.target : '',
    est_level: str_(req.est_level, 20),
    joined: old ? old.joined : now_(),
    last_seen: now_(),
    app_version: str_(req.app_version, 20),
  }]);
  return { ok: true, uid: req.uid, ai: aiInfo_() };
}

// Cho app biết nhóm có bật AI dùng chung không (không gửi key).
function aiInfo_() {
  var cfg = config_();
  var has = !!PropertiesService.getScriptProperties().getProperty('GEMINI_KEY');
  return { enabled: cfg.ai_enabled === 'yes' && has, limit: int_(cfg.ai_daily_limit) || 40 };
}

function sync_(req) {
  var u = needUser_(req.uid);
  var cfg = config_();
  var maxExp = int_(cfg.max_daily_exp) || 800;
  var days = (req.days || []).slice(0, 62).filter(function (d) {
    return isDay_(d.date);
  }).map(function (d) {
    return {
      key: req.uid + '|' + d.date,
      date: d.date,
      uid: req.uid,
      exp: int_(d.exp, maxExp),
      spoken: int_(d.spoken, 500),
      seconds: int_(d.seconds, 6 * 3600),
      graded: int_(d.graded, 500),
      mocks: int_(d.mocks, 10),
      week: int_(d.week, 1),
      scripts: int_(d.scripts, 500),
      vocab: int_(d.vocab, 2000),
      ipa: int_(d.ipa, 500),
    };
  });
  upsert_('Daily', days);
  var mocks = (req.mocks || []).slice(0, 100).map(function (m) {
    return {
      key: req.uid + '|' + str_(m.id, 40),
      uid: req.uid,
      at: m.at ? new Date(Number(m.at)).toISOString() : '',
      test_id: str_(m.testId, 10),
      answered: int_(m.answered, 15),
      total: int_(m.total, 15),
      label: str_(m.label, 20),
    };
  });
  upsert_('Mocks', mocks);
  var exams = (req.exams || []).slice(0, 20).filter(function (x) {
    return isDay_(x.date) && /^(NL|NM|NH|IL|IM1|IM2|IM3|IM|IH|AL)$/.test(x.level);
  }).map(function (x) {
    return { key: req.uid + '|' + x.date, uid: req.uid, date: x.date, level: x.level, note: str_(x.note, 120) };
  });
  upsert_('Exams', exams);
  upsert_('Users', [{
    uid: u.uid, name: str_(req.name, 40) || u.name, team: req.team == null ? u.team : str_(req.team, 40),
    target: /^(IM|IH|AL)$/.test(req.target) ? req.target : u.target,
    est_level: req.est_level == null ? u.est_level : str_(req.est_level, 20),
    joined: u.joined, last_seen: now_(), app_version: str_(req.app_version, 20) || u.app_version,
  }]);
  return { ok: true, saved: { days: days.length, mocks: mocks.length, exams: exams.length }, ai: aiInfo_() };
}

// ---------------------------------------------------------------- bảng xếp hạng
// period: day | week | month; date: ngày (YYYY-MM-DD) theo máy người hỏi.
function range_(period, date) {
  if (!isDay_(date)) throw new Error('Ngày không hợp lệ.');
  var p = date.split('-').map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  var fmt = function (x) {
    return x.toISOString().slice(0, 10);
  };
  if (period === 'day') return [date, date];
  if (period === 'week') {
    var dow = (d.getUTCDay() + 6) % 7;
    var from = new Date(d.getTime() - dow * 864e5);
    return [fmt(from), fmt(new Date(from.getTime() + 6 * 864e5))];
  }
  if (period === 'month') return [date.slice(0, 8) + '01', date.slice(0, 8) + '31'];
  throw new Error('Khoảng thời gian không hợp lệ.');
}

function dayStr_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, ss_().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  return String(v).slice(0, 10);
}

function board_(req) {
  var r = range_(req.period || 'week', req.date);
  var users = {};
  rows_('Users').forEach(function (u) {
    users[String(u.uid)] = u;
  });
  var sums = {};
  rows_('Daily').forEach(function (d) {
    var day = dayStr_(d.date);
    if (day < r[0] || day > r[1]) return;
    var k = String(d.uid);
    if (!users[k]) return;
    var s = (sums[k] = sums[k] || { exp: 0, seconds: 0, mocks: 0 });
    s.exp += Number(d.exp) || 0;
    s.seconds += Number(d.seconds) || 0;
    s.mocks += Number(d.mocks) || 0;
  });
  var team = str_(req.team, 40);
  var list = Object.keys(sums).map(function (k) {
    return { uid: k, name: String(users[k].name), team: String(users[k].team || ''), exp: sums[k].exp, minutes: Math.round(sums[k].seconds / 60), mocks: sums[k].mocks };
  }).filter(function (x) {
    return x.exp > 0 && (!team || x.team === team);
  });
  list.sort(function (a, b) {
    return b.exp - a.exp || a.name.localeCompare(b.name);
  });
  var me = null;
  list.forEach(function (x, i) {
    x.rank = i + 1;
    if (x.uid === String(req.uid)) me = { rank: i + 1, exp: x.exp };
  });
  var teams = {};
  Object.keys(users).forEach(function (k) {
    if (users[k].team) teams[String(users[k].team)] = 1;
  });
  return {
    ok: true, from: r[0], to: r[1], me: me, total: list.length, teams: Object.keys(teams).sort(),
    rows: list.slice(0, 100).map(function (x) {
      return { rank: x.rank, name: x.name, team: x.team, exp: x.exp, minutes: x.minutes, mocks: x.mocks, me: x.uid === String(req.uid) };
    }),
  };
}

// ---------------------------------------------------------------- quản trị
function admin_(req) {
  var cfg = config_();
  if (!cfg.admin_pin || String(cfg.admin_pin).length < 6 || String(req.pin) !== String(cfg.admin_pin)) throw new Error('Mã quản trị không đúng.');
  var today = isDay_(req.date) ? req.date : Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
  var from7 = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10)) - 6 * 864e5).toISOString().slice(0, 10);
  var users = rows_('Users');
  var by = {};
  users.forEach(function (u) {
    by[String(u.uid)] = { name: String(u.name), team: String(u.team || ''), target: String(u.target || ''), est: String(u.est_level || ''), last_seen: u.last_seen ? new Date(u.last_seen).toISOString() : '', exp7: 0, min7: 0, days7: 0, expAll: 0, mocks: 0, lastMock: '', lastMockLabel: '', exams: [] };
  });
  rows_('Daily').forEach(function (d) {
    var u = by[String(d.uid)];
    if (!u) return;
    var day = dayStr_(d.date);
    u.expAll += Number(d.exp) || 0;
    if (day >= from7 && day <= today) {
      u.exp7 += Number(d.exp) || 0;
      u.min7 += Math.round((Number(d.seconds) || 0) / 60);
      if (Number(d.exp) > 0) u.days7 += 1;
    }
  });
  rows_('Mocks').forEach(function (m) {
    var u = by[String(m.uid)];
    if (!u) return;
    if (Number(m.answered) >= 12) u.mocks += 1;
    var at = m.at ? new Date(m.at).toISOString() : '';
    if (at > u.lastMock) {
      u.lastMock = at;
      u.lastMockLabel = String(m.label || '');
    }
  });
  rows_('Exams').forEach(function (x) {
    var u = by[String(x.uid)];
    if (u) u.exams.push({ date: dayStr_(x.date), level: String(x.level) });
  });
  var list = Object.keys(by).map(function (k) {
    return by[k];
  });
  list.sort(function (a, b) {
    return b.exp7 - a.exp7;
  });
  var active7 = list.filter(function (u) {
    return u.days7 > 0;
  }).length;
  return {
    ok: true,
    totals: {
      users: list.length,
      active7: active7,
      minutes7: list.reduce(function (a, u) { return a + u.min7; }, 0),
      examTaken: list.filter(function (u) { return u.exams.length; }).length,
      questions: Math.max(0, sheet_('Questions').getLastRow() - 1),
      ai_enabled: cfg.ai_enabled === 'yes',
    },
    users: list,
  };
}

// ---------------------------------------------------------------- câu hỏi thi thật / báo lỗi
function question_(req) {
  var u = needUser_(req.uid);
  var q = str_(req.question, 600);
  if (q.length < 10) throw new Error('Câu hỏi quá ngắn.');
  append_('Questions', { at: now_(), uid: req.uid, name: u.name, exam_date: isDay_(req.exam_date) ? req.exam_date : '', level: str_(req.level, 10), section: str_(req.section, 40), question: q });
  return { ok: true };
}

// Câu hỏi thi thật cả nhóm đã gửi (mới nhất trước).
function questions_(req) {
  needUser_(req.uid);
  var list = rows_('Questions').map(function (r) {
    return { at: r.at ? new Date(r.at).toISOString() : '', name: String(r.name || ''), exam_date: r.exam_date ? dayStr_(r.exam_date) : '', level: String(r.level || ''), section: String(r.section || ''), question: String(r.question || ''), mine: String(r.uid) === String(req.uid) };
  });
  list.reverse();
  return { ok: true, total: list.length, rows: list.slice(0, 150) };
}

function flag_(req) {
  needUser_(req.uid);
  append_('Flags', { at: now_(), uid: req.uid, qid: str_(req.qid, 30), note: str_(req.note, 300) });
  return { ok: true };
}

// ---------------------------------------------------------------- AI của nhóm
function ai_(req) {
  var cfg = config_();
  if (cfg.ai_enabled !== 'yes') throw new Error('Quản trị chưa bật "AI của nhóm".');
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY');
  if (!key) throw new Error('Máy chủ nhóm chưa có GEMINI_KEY.');
  needUser_(req.uid);
  var today = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  var limit = int_(cfg.ai_daily_limit) || 40;
  var count = locked_(function () {
    var k = req.uid + '|' + today;
    var cur = 0;
    rows_('AIUsage').forEach(function (r) {
      if (String(r.key) === k) cur = Number(r.count) || 0;
    });
    if (cur >= limit) return -1;
    upsert_('AIUsage', [{ key: k, date: today, uid: req.uid, count: cur + 1 }]);
    return cur + 1;
  });
  if (count < 0) throw new Error('Bạn đã dùng hết ' + limit + ' lượt AI hôm nay. Mai dùng tiếp nhé.');
  var model = /^[a-z0-9.\-]+$/i.test(cfg.ai_model) ? cfg.ai_model : 'gemini-3.8-flash';
  var res;
  try {
    res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-goog-api-key': key },
      payload: JSON.stringify(req.body || {}),
      muteHttpExceptions: true,
    });
  } catch (err) {
    // Lỗi mạng / quá 60 giây (giới hạn của Apps Script): trả lại lượt đã trừ.
    locked_(function () {
      upsert_('AIUsage', [{ key: req.uid + '|' + today, date: today, uid: req.uid, count: count - 1 }]);
    });
    var m = String((err && err.message) || err);
    throw new Error(/timeout|timed out|thời gian/i.test(m) ? 'AI_TIMEOUT: AI trả lời quá 60 giây.' : 'Máy chủ nhóm không gọi được Gemini: ' + m);
  }
  var text = res.getContentText();
  var data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    data = { error: { message: text.slice(0, 300) } };
  }
  return { ok: true, status: res.getResponseCode(), data: data, used: count, limit: limit, model: model };
}
