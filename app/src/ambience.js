// Tiếng ồn phòng thi, tạo bằng Web Audio (không cần file âm thanh):
// tiếng rì rầm của nhiều người nói ở xa + tiếng ồn nền của phòng + thỉnh thoảng tiếng gõ phím / ghế.
// Đây là âm thanh mô phỏng, không phải bản ghi phòng thi thật.

export const NOISE_LEVELS = { off: 0, low: 0.35, mid: 0.65, high: 1 };
export const NOISE_LABEL = { off: 'Tắt', low: 'Nhỏ', mid: 'Vừa', high: 'Lớn' };

let ctx = null;
let nodes = null;
let timers = [];

function noiseBuffer(ac, seconds = 4) {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < d.length; i++) {
    // nhiễu hơi "hồng" cho dịu tai
    const w = Math.random() * 2 - 1;
    b = 0.97 * b + 0.03 * w;
    d[i] = w * 0.5 + b * 3;
  }
  return buf;
}

function makeVoice(ac, buf, out) {
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f1 = ac.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.value = 350 + Math.random() * 450;
  f1.Q.value = 3;
  const f2 = ac.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.value = 1100 + Math.random() * 1100;
  f2.Q.value = 4;
  const env = ac.createGain();
  env.gain.value = 0;
  const pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
  if (pan) pan.pan.value = Math.random() * 1.6 - 0.8;
  const mix = ac.createGain();
  mix.gain.value = 0.55;
  src.connect(f1);
  src.connect(f2);
  f1.connect(env);
  f2.connect(mix).connect(env);
  if (pan) env.connect(pan).connect(out);
  else env.connect(out);
  src.start(0, Math.random() * 3);
  return { src, env, f1, f2, talking: Math.random() < 0.6, until: 0, loud: 0.5 + Math.random() * 0.5 };
}

// Mỗi ~120 ms: đổi âm lượng theo nhịp âm tiết (3–6 lần/giây), có lúc dừng như người ngừng nói.
function tickVoices(ac, voices) {
  const t = ac.currentTime;
  for (const v of voices) {
    if (t > v.until) {
      v.talking = !v.talking;
      v.until = t + (v.talking ? 2 + Math.random() * 6 : 0.6 + Math.random() * 3);
    }
    const target = v.talking ? v.loud * (0.25 + Math.random() * 0.75) : 0;
    v.env.gain.setTargetAtTime(target, t, 0.04);
    if (v.talking && Math.random() < 0.3) v.f1.frequency.setTargetAtTime(300 + Math.random() * 600, t, 0.08);
  }
}

function click(ac, buf, out) {
  const s = ac.createBufferSource();
  s.buffer = buf;
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800 + Math.random() * 2000;
  const g = ac.createGain();
  const t = ac.currentTime;
  const n = 1 + Math.floor(Math.random() * 4);
  g.gain.value = 0;
  for (let i = 0; i < n; i++) {
    const at = t + i * (0.09 + Math.random() * 0.12);
    g.gain.setValueAtTime(0.25, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.03);
  }
  s.connect(hp).connect(g).connect(out);
  s.start(t, Math.random() * 3, 0.1 + n * 0.25);
}

export function ambienceSupported() {
  return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
}

// Phải gọi từ một lần bấm của người dùng (trình duyệt chặn âm thanh tự phát).
export async function startAmbience(level = 'mid') {
  stopAmbience();
  const vol = NOISE_LEVELS[level] || 0;
  if (!vol || !ambienceSupported()) return false;
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
  const buf = noiseBuffer(ctx);
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(0.9 * vol, ctx.currentTime, 0.8);
  const distance = ctx.createBiquadFilter();
  distance.type = 'lowpass';
  distance.frequency.value = 2600;
  distance.connect(master).connect(ctx.destination);
  // tiếng ồn nền (điều hoà, quạt máy tính)
  const room = ctx.createBufferSource();
  room.buffer = buf;
  room.loop = true;
  const roomLp = ctx.createBiquadFilter();
  roomLp.type = 'lowpass';
  roomLp.frequency.value = 280;
  const roomG = ctx.createGain();
  roomG.gain.value = 0.18;
  room.connect(roomLp).connect(roomG).connect(master);
  room.start();
  const voices = Array.from({ length: 6 }, () => makeVoice(ctx, buf, distance));
  timers.push(setInterval(() => tickVoices(ctx, voices), 120));
  const scheduleClick = () => {
    timers.push(
      setTimeout(() => {
        if (!nodes) return;
        click(ctx, buf, distance);
        scheduleClick();
      }, 2500 + Math.random() * 7000),
    );
  };
  nodes = { master, room, voices, vol: 0.9 * vol };
  scheduleClick();
  return true;
}

export function setAmbienceMuted(muted) {
  if (!nodes || !ctx) return;
  nodes.master.gain.setTargetAtTime(muted ? 0 : nodes.vol, ctx.currentTime, 0.2);
}

export function stopAmbience() {
  timers.forEach((t) => (clearInterval(t), clearTimeout(t)));
  timers = [];
  if (!nodes) return;
  const n = nodes;
  nodes = null;
  try {
    n.master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => {
      try {
        n.room.stop();
        n.voices.forEach((v) => v.src.stop());
        n.master.disconnect();
      } catch {}
    }, 600);
  } catch {}
}

export const ambiencePlaying = () => !!nodes;
