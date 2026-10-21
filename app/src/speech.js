// Nhận diện giọng nói (chuyển thành chữ), ghi âm và đọc câu hỏi.
// Trên APK dùng plugin Android; khi mở bằng trình duyệt dùng Web Speech API.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const isNative = Capacitor.isNativePlatform();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ghép đoạn mới vào văn bản, bỏ qua nếu trùng với đoạn vừa ghép (kết quả cuối đến trễ).
function appendSegment(text, segment) {
  const s = segment.trim();
  if (!s || text.endsWith(s)) return text;
  return text ? `${text} ${s}` : s;
}

// Android tự dừng nghe sau vài giây im lặng, nên phải tự khởi động lại liên tục
// cho tới khi người dùng bấm dừng.
function nativeTranscriber(onText) {
  let active = false;
  let committed = '';
  let segment = '';
  let awaitingFinal = false;
  let restartTimer = null;
  let watchdog = null;
  let restarting = false;

  const emit = () => onText(appendSegment(committed, segment));

  async function restart() {
    if (!active || restarting) return;
    restarting = true;
    clearTimeout(restartTimer);
    awaitingFinal = false;
    committed = appendSegment(committed, segment);
    segment = '';
    try {
      await SpeechRecognition.start({ language: 'en-US', partialResults: true, popup: false, maxResults: 1 });
    } catch {
      // Lỗi tạm thời (máy bận, không nghe thấy gì…): watchdog sẽ thử lại.
    }
    restarting = false;
  }

  return {
    async start() {
      const perm = await SpeechRecognition.requestPermissions();
      if (perm.speechRecognition !== 'granted') throw new Error('Bạn chưa cấp quyền micro cho app.');
      const { available } = await SpeechRecognition.available();
      if (!available) throw new Error('Máy chưa có dịch vụ nhận diện giọng nói. Hãy cài/cập nhật app Google.');
      await SpeechRecognition.removeAllListeners();
      committed = '';
      segment = '';
      active = true;
      await SpeechRecognition.addListener('partialResults', ({ matches }) => {
        if (!active || !matches?.length) return;
        segment = matches[0];
        emit();
        if (awaitingFinal) restart();
      });
      await SpeechRecognition.addListener('listeningState', ({ status }) => {
        if (status !== 'stopped' || !active) return;
        // Chờ kết quả cuối của đoạn vừa nói rồi mới nghe tiếp.
        awaitingFinal = true;
        restartTimer = setTimeout(restart, 1200);
      });
      watchdog = setInterval(async () => {
        if (!active || restarting || awaitingFinal) return;
        const { listening } = await SpeechRecognition.isListening();
        if (!listening) restart();
      }, 1500);
      await restart();
    },
    async stop() {
      active = false;
      clearInterval(watchdog);
      clearTimeout(restartTimer);
      try {
        await SpeechRecognition.stop();
      } catch {}
      await sleep(600);
      await SpeechRecognition.removeAllListeners();
      committed = appendSegment(committed, segment);
      segment = '';
      onText(committed);
      return committed;
    },
  };
}

function webTranscriber(onText) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let active = false;
  let committed = '';
  let interim = '';

  return {
    async start() {
      if (!Rec) throw new Error('Trình duyệt này không hỗ trợ chuyển giọng nói thành chữ. Hãy dùng Chrome hoặc cài APK.');
      committed = '';
      interim = '';
      active = true;
      rec = new Rec();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) committed = appendSegment(committed, r[0].transcript);
          else interim += r[0].transcript;
        }
        onText(appendSegment(committed, interim));
      };
      rec.onend = () => {
        if (active) rec.start();
      };
      rec.start();
    },
    async stop() {
      active = false;
      rec?.stop();
      await sleep(400);
      committed = appendSegment(committed, interim);
      interim = '';
      onText(committed);
      return committed;
    },
  };
}

export const canTranscribe = () => isNative || !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export const createTranscriber = (onText) => (isNative ? nativeTranscriber(onText) : webTranscriber(onText));

// Ghi âm (MediaRecorder). Không chạy cùng lúc với nhận diện giọng nói vì Android chỉ
// cho một bên dùng micro. Trả về { blob, url, mimeType } để nghe lại hoặc gửi cho AI.
export function createRecorder() {
  let media = null;
  let chunks = [];
  let stream = null;
  return {
    async start() {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Máy không hỗ trợ ghi âm trong app.');
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      } catch {
        throw new Error('Chưa có quyền dùng micro. Hãy cấp quyền micro cho app trong Cài đặt của điện thoại.');
      }
      chunks = [];
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      const mimeType = preferred.find((t) => MediaRecorder.isTypeSupported?.(t));
      media = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      media.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      media.start(1000);
    },
    stop() {
      return new Promise((resolve) => {
        if (!media || media.state === 'inactive') return resolve(null);
        media.onstop = () => {
          stream?.getTracks().forEach((t) => t.stop());
          const mimeType = media.mimeType || 'audio/webm';
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob.size ? { blob, url: URL.createObjectURL(blob), mimeType } : null);
        };
        media.stop();
      });
    },
  };
}

// Đọc văn bản tiếng Anh. Promise kết thúc khi đọc xong (hoặc bị dừng).
export async function speak(text, rate = 0.9) {
  if (isNative) {
    await TextToSpeech.stop().catch(() => {});
    return TextToSpeech.speak({ text, lang: 'en-US', rate });
  }
  if (!window.speechSynthesis) throw new Error('Trình duyệt không hỗ trợ đọc văn bản.');
  speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
    setTimeout(resolve, Math.max(4000, text.length * 120));
  });
}

export async function stopSpeaking() {
  if (isNative) return TextToSpeech.stop().catch(() => {});
  window.speechSynthesis?.cancel();
}
