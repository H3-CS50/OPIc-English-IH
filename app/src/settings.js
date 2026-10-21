// Cài đặt (lưu trên máy) + màn hình Cài đặt.
import { $, store, toast, escapeHtml } from './util.js';
import { CLAUDE_MODELS, GEMINI_MODELS, checkClaudeKey, checkGeminiKey } from './coach.js';
import { importPack, listPacks, deletePack, kb } from './data.js';
import { clearAttempts, listAttempts } from './history.js';

const legacyKey = store.get('apiKey', '');
const saved = store.get('settings', {});
export const settings = {
  target: 'IH',
  provider: legacyKey ? 'claude' : 'none',
  keys: { claude: legacyKey || '', gemini: '' },
  models: { claude: CLAUDE_MODELS[0].id, gemini: GEMINI_MODELS[0].id },
  ttsRate: 0.9,
  autoListen: true,
  showHints: false,
  mode: 'transcribe',
  includeOqc: true,
  ...saved,
};
settings.keys = { claude: legacyKey || '', gemini: '', ...(saved.keys || {}) };
settings.models = { claude: CLAUDE_MODELS[0].id, gemini: GEMINI_MODELS[0].id, ...(saved.models || {}) };
if (legacyKey) store.remove('apiKey');

const listeners = new Set();
export const onSettingsChange = (fn) => listeners.add(fn);
export function saveSettings() {
  store.set('settings', settings);
  listeners.forEach((fn) => fn(settings));
}

function modelOptions(list, current) {
  const known = list.some((m) => m.id === current);
  return (
    list.map((m) => `<option value="${m.id}" ${m.id === current ? 'selected' : ''}>${escapeHtml(m.label)}</option>`).join('') +
    `<option value="__custom" ${known ? '' : 'selected'}>Model khác…</option>`
  );
}

function renderPacks() {
  const packs = listPacks();
  $('pack-list').innerHTML = packs.length
    ? packs
        .map(
          (p) => `<div class="pack-row"><div><b>${escapeHtml(p.name)}</b><div class="muted small">${p.count} câu · ${new Date(p.created).toLocaleDateString('vi-VN')}</div></div>
          <button class="btn small-btn" data-del-pack="${p.id}">Xoá</button></div>`,
        )
        .join('')
    : '<p class="muted small">Chưa nhập bộ câu hỏi nào.</p>';
  $('pack-list')
    .querySelectorAll('[data-del-pack]')
    .forEach((b) =>
      b.addEventListener('click', () => {
        if (confirm('Xoá bộ câu hỏi này khỏi máy?')) {
          deletePack(b.dataset.delPack);
          renderPacks();
          saveSettings();
        }
      }),
    );
}

function syncProviderUi() {
  document.querySelectorAll('[name=provider]').forEach((r) => (r.checked = r.value === settings.provider));
  $('claude-box').hidden = settings.provider !== 'claude';
  $('gemini-box').hidden = settings.provider !== 'gemini';
}

function bindModel(selId, customId, list, key) {
  const sel = $(selId);
  const custom = $(customId);
  sel.innerHTML = modelOptions(list, settings.models[key]);
  custom.hidden = list.some((m) => m.id === settings.models[key]);
  custom.value = custom.hidden ? '' : settings.models[key];
  sel.addEventListener('change', () => {
    if (sel.value === '__custom') {
      custom.hidden = false;
      custom.focus();
    } else {
      custom.hidden = true;
      settings.models[key] = sel.value;
      saveSettings();
    }
  });
  custom.addEventListener('change', () => {
    if (custom.value.trim()) {
      settings.models[key] = custom.value.trim();
      saveSettings();
    }
  });
}

function bindKey(inputId, showId, checkId, statusId, key, checker) {
  const input = $(inputId);
  input.value = settings.keys[key] || '';
  input.addEventListener('change', () => {
    settings.keys[key] = input.value.trim();
    saveSettings();
    $(statusId).textContent = settings.keys[key] ? '✅ Đã lưu key trên máy này.' : 'Đã xoá key.';
  });
  $(showId).addEventListener('click', () => (input.type = input.type === 'password' ? 'text' : 'password'));
  $(checkId).addEventListener('click', async () => {
    const k = input.value.trim();
    if (!k) return ($(statusId).textContent = 'Hãy nhập key trước.');
    settings.keys[key] = k;
    saveSettings();
    $(statusId).innerHTML = '<span class="spinner"></span> Đang kiểm tra…';
    const r = await checker(k, settings.models[key]);
    $(statusId).textContent = r.ok ? '✅ Key dùng được với model đã chọn.' : `⚠️ ${r.error}`;
  });
}

export function initSettings({ version }) {
  document.querySelectorAll('[name=provider]').forEach((r) =>
    r.addEventListener('change', () => {
      settings.provider = r.value;
      saveSettings();
      syncProviderUi();
    }),
  );
  syncProviderUi();
  bindModel('claude-model', 'claude-model-custom', CLAUDE_MODELS, 'claude');
  bindModel('gemini-model', 'gemini-model-custom', GEMINI_MODELS, 'gemini');
  bindKey('claude-key', 'claude-show', 'claude-check', 'claude-status', 'claude', checkClaudeKey);
  bindKey('gemini-key', 'gemini-show', 'gemini-check', 'gemini-status', 'gemini', checkGeminiKey);

  const rate = $('tts-rate');
  rate.value = settings.ttsRate;
  const showRate = () => ($('rate-label').textContent = `${Number(settings.ttsRate).toFixed(2)}x`);
  showRate();
  rate.addEventListener('input', () => {
    settings.ttsRate = Number(rate.value);
    showRate();
    saveSettings();
  });
  for (const [id, key] of [
    ['auto-listen', 'autoListen'],
    ['show-hints', 'showHints'],
    ['include-oqc', 'includeOqc'],
  ]) {
    $(id).checked = !!settings[key];
    $(id).addEventListener('change', (e) => {
      settings[key] = e.target.checked;
      saveSettings();
    });
  }

  $('pack-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = importPack(await file.text(), file.name);
      toast(`✅ Đã nhập ${n} câu hỏi`);
      renderPacks();
      saveSettings();
    } catch (err) {
      toast(`⚠️ ${err.message}`, 4500);
    }
    e.target.value = '';
  });
  renderPacks();

  $('btn-clear-data').addEventListener('click', () => {
    if (!confirm('Xoá toàn bộ lịch sử luyện tập trên máy này? Không thể hoàn tác.')) return;
    clearAttempts();
    toast('Đã xoá lịch sử luyện tập.');
    saveSettings();
  });
  $('btn-export').addEventListener('click', async () => {
    const data = JSON.stringify({ exported_at: new Date().toISOString(), attempts: listAttempts() }, null, 1);
    const { copyText } = await import('./util.js');
    toast((await copyText(data)) ? '✅ Đã copy dữ liệu luyện tập (JSON). Dán vào ghi chú hoặc email để lưu.' : '⚠️ Không copy được.', 4000);
  });

  $('app-version').textContent = `OPIc OQC · phiên bản ${version} · bộ dữ liệu ${kb.dataset_version} · ${kb.questions.length} câu hỏi · ${kb.answer_sets.length} bộ bài mẫu`;
}
