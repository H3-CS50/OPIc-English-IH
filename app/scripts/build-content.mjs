// Gom tài liệu Markdown + flashcard thành src/content.json để đóng gói vào app.
// Câu hỏi và bài mẫu nằm trong src/kb.json (sinh bởi tools/kb/build_kb.py).
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, '..', 'src', 'content.json');

const titleOf = (md) => (md.match(/^# (.+)$/m) || [])[1]?.trim() ?? 'Không tên';

const listMd = (dir, section, prefix) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const md = readFileSync(join(root, dir, f), 'utf8');
      return { id: `${prefix}/${f}`, file: f, title: titleOf(md), section, md };
    });

const KB_DIR = 'OPIC_OQC_KNOWLEDGE_BASE_V1';
const kbDoc = (file, id, section, title) => {
  const p = join(root, KB_DIR, file);
  if (!existsSync(p)) return null;
  const md = readFileSync(p, 'utf8');
  return { id, file, title: title || titleOf(md), section, md };
};

const V1_NOTE =
  '> ℹ️ Tài liệu thư viện v1 do AI viết, chưa được giáo viên kiểm định. Các con số như thời lượng hay số câu chỉ là kinh nghiệm từ tài liệu luyện thi, không phải quy định chính thức. Xem mục **IM·IH·AL** trong tab Học để biết thông tin đã đối chiếu với ACTFL.\n\n';

const docs = [
  kbDoc('03_IM_IH_AL_PROFICIENCY_MATRIX.md', 'kb/03', 'Cấp độ & thông tin chính thức', 'Ma trận IM / IH / AL theo FACT'),
  kbDoc('02_OFFICIAL_FINDINGS.md', 'kb/02', 'Cấp độ & thông tin chính thức', 'Thông tin chính thức về OPIc (ACTFL)'),
  ...listMd('01-cau-hoi-bai-mau', 'Thư viện v1: câu hỏi & bài mẫu IH', 'v1').map((d) => ({ ...d, md: V1_NOTE + d.md })),
  ...listMd('02-templates', 'Thư viện v1: khung trả lời & mẹo', 'v1t').map((d) => ({ ...d, md: V1_NOTE + d.md })),
  kbDoc('00_README.md', 'kb/00', 'Về bộ dữ liệu', 'Giới thiệu bộ dữ liệu OPIc OQC'),
  kbDoc('10_QA_AND_GAP_REPORT.md', 'kb/10', 'Về bộ dữ liệu', 'Kiểm định chất lượng & giới hạn'),
].filter(Boolean);

const flashcards = readFileSync(join(root, '03-flashcards', 'anki-opic-ih.tsv'), 'utf8')
  .split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => {
    const [vi, en, ex, tag] = l.split('\t');
    return { vi, en, ex, tag };
  });

writeFileSync(out, JSON.stringify({ docs, flashcards }));
console.log(`content.json: ${docs.length} tài liệu, ${flashcards.length} flashcard`);
