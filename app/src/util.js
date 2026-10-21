// Tiện ích dùng chung.
import { marked } from 'marked';

export const $ = (id) => document.getElementById(id);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Không cho HTML thô trong Markdown chạy (nội dung AI hiển thị trong app).
marked.use({ gfm: true, breaks: false, renderer: { html: ({ text }) => escapeHtml(text) } });
export const md = (s) => marked.parse(String(s ?? ''));

const PREFIX = 'opic.';
export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },
};

let toastTimer;
export function toast(msg, ms = 2600) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}

export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
export const countWords = (s) => (String(s || '').trim() ? String(s).trim().split(/\s+/).length : 0);
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {}
    ta.remove();
    return ok;
  }
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export const LEVEL_LABEL = {
  below_IM: 'Dưới IM',
  IM: 'IM',
  IM_IH_borderline: 'IM–IH',
  IH: 'IH',
  IH_AL_borderline: 'IH–AL',
  AL: 'AL',
  insufficient_evidence: 'Chưa đủ dữ liệu',
};
export const LEVEL_SCORE = { below_IM: 0, IM: 1, IM_IH_borderline: 1.5, IH: 2, IH_AL_borderline: 2.5, AL: 3 };
export const CONF_LABEL = { low: 'độ tin cậy thấp', medium: 'độ tin cậy trung bình', high: 'độ tin cậy cao' };
export const levelClass = (label) => `lv-${String(label || 'na').split('_')[0]}`;

export function scoreToLabel(x) {
  if (x == null || Number.isNaN(x)) return 'insufficient_evidence';
  if (x < 0.75) return 'below_IM';
  if (x < 1.25) return 'IM';
  if (x < 1.75) return 'IM_IH_borderline';
  if (x < 2.25) return 'IH';
  if (x < 2.75) return 'IH_AL_borderline';
  return 'AL';
}
