// Giả lập các đối tượng Google Apps Script để chạy Code.gs trong Node (dùng cho kiểm thử).
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('./Code.gs', import.meta.url), 'utf8');

export function makeEnv({ props = {}, fetchImpl } = {}) {
  const sheets = {};
  const textCols = {};
  const sheet = (name) => {
    const grid = [];
    const sh = {
      name,
      grid,
      getMaxRows: () => 1000,
      getLastRow: () => grid.length,
      setFrozenRows() {},
      appendRow(row) {
        grid.push(row.slice());
      },
      getDataRange() {
        return { getValues: () => grid.map((r) => r.slice()) };
      },
      getRange(r, c, nr = 1, nc = 1) {
        return {
          setValues(vals) {
            assert.equal(vals.length, nr, 'số dòng setValues');
            for (let i = 0; i < nr; i++) {
              assert.equal(vals[i].length, nc, 'số cột setValues');
              while (grid.length < r + i) grid.push([]);
              for (let j = 0; j < nc; j++) {
                let v = vals[i][j];
                // Giả lập Sheet tự đổi "YYYY-MM-DD" thành ngày nếu cột không ở dạng chữ.
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !(textCols[name] || []).includes(c + j)) v = new Date(v + 'T00:00:00+07:00');
                grid[r + i - 1][c + j - 1] = v;
              }
            }
          },
          setNumberFormat(f) {
            if (f === '@') (textCols[name] ||= []).push(c);
          },
        };
      },
    };
    return sh;
  };
  const ss = {
    getSheetByName: (n) => sheets[n] || null,
    insertSheet: (n) => (sheets[n] = sheet(n)),
    getSpreadsheetTimeZone: () => 'Asia/Ho_Chi_Minh',
  };
  const fetched = [];
  const ctx = {
    console,
    JSON,
    Math,
    Date,
    String,
    Number,
    Object,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s) => ({ body: s, setMimeType() { return this; } }),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null }) },
    Utilities: {
      formatDate(d, tz) {
        const off = tz === 'Asia/Ho_Chi_Minh' ? 7 : 0;
        return new Date(d.getTime() + off * 3600e3).toISOString().slice(0, 10);
      },
    },
    UrlFetchApp: {
      fetch(url, opts) {
        fetched.push({ url, opts });
        return fetchImpl ? fetchImpl(url, opts) : { getResponseCode: () => 200, getContentText: () => '{"candidates":[]}' };
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const post = (body) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).body);
  const setCfg = (key, value) => {
    if (!sheets.Config) ctx.setup();
    const g = sheets.Config.grid;
    const row = g.find((r) => r[0] === key);
    if (row) row[1] = value;
    else g.push([key, value, '']);
  };
  return { ctx, sheets, post, setCfg, fetched };
}
