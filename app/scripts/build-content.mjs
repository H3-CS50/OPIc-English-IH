// Đọc tài liệu Markdown ở thư mục gốc repo và tạo src/content.json để đóng gói vào app.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, '..', 'src', 'content.json');

const listMd = (dir) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => ({ path: `${dir}/${f}`, md: readFileSync(join(root, dir, f), 'utf8') }));

const titleOf = (md) => (md.match(/^# (.+)$/m) || [])[1]?.trim() ?? 'Không tên';

// Tách câu hỏi: dòng `> **Q:** *"..."*` + khối trích dẫn ngay sau đó là bài mẫu.
function extractQuestions(md) {
  const lines = md.split('\n');
  const questions = [];
  let heading = '';
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^#{2,3} (.+)$/);
    if (h) heading = h[1].trim();
    const q = lines[i].match(/^> \*\*Q:\*\* \*"(.+)"\*\s*$/);
    if (!q) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    const sample = [];
    while (j < lines.length && lines[j].startsWith('>')) {
      sample.push(lines[j].replace(/^> ?/, ''));
      j++;
    }
    const text = sample.join('\n').trim();
    questions.push({
      heading,
      q: q[1].trim(),
      // Bài mẫu chỉ là lời chỉ dẫn (bắt đầu bằng →) thì không coi là bài mẫu.
      sample: text.startsWith('→') ? '' : text,
      note: text.startsWith('→') ? text : '',
    });
  }
  return questions;
}

const topics = listMd('01-cau-hoi-bai-mau').map(({ path, md }) => ({
  id: path,
  title: titleOf(md),
  md,
  questions: extractQuestions(md),
}));

const templates = listMd('02-templates').map(({ path, md }) => ({ id: path, title: titleOf(md), md }));

const flashcards = readFileSync(join(root, '03-flashcards', 'anki-opic-ih.tsv'), 'utf8')
  .split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => {
    const [vi, en, ex, tag] = l.split('\t');
    return { vi, en, ex, tag };
  });

const content = { topics, templates, flashcards };
writeFileSync(out, JSON.stringify(content));

const qCount = topics.reduce((n, t) => n + t.questions.length, 0);
console.log(`content.json: ${topics.length} chủ đề, ${qCount} câu hỏi, ${templates.length} template, ${flashcards.length} flashcard`);
