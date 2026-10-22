// File mẫu để người dùng tự soạn bộ câu hỏi rồi nhập vào app.
import { buildXlsx } from './xlsx.js';

export const TEMPLATE_HEADER = ['Questions', 'Topic', 'Answer (Sample)'];
export const TEMPLATE_ROWS = [
  [
    'Tell me about a park you often go to. Where is it, what does it look like, and what do people usually do there?',
    'Parks',
    'There is a small park about five minutes from my apartment, and I go there almost every evening. It has a lake in the middle, a walking path around it and a lot of old trees. In the evening, people jog, older people do exercises together and kids ride their bikes. I like it because it is the quietest place in my neighborhood.',
  ],
  ['When did you start your current job? Tell me about your first day and how you felt.', 'Work', ''],
  [
    'I would like to give you a situation and ask you to act it out. You want to join a gym near your house. Call the gym and ask three or four questions to get the information you need.',
    'Role-play',
    '',
  ],
];

export const TEMPLATE_BASENAME = 'mau_bo_cau_hoi_OPIc';
export const MIME = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  json: 'application/json',
};

const GUIDE_ROWS = [
  ['Cột', 'Bắt buộc?', 'Ghi gì'],
  ['Questions', 'Bắt buộc', 'Câu hỏi tiếng Anh. Mỗi dòng một câu.'],
  ['Topic', 'Không', 'Chủ đề, ví dụ Work, Travel, Role-play. Để trống cũng được.'],
  ['Answer (Sample)', 'Không', 'Bài mẫu của bạn. Để trống nếu chưa có.'],
  ['', '', ''],
  ['Cách làm', '', ''],
  ['1', '', 'Mở sheet "Câu hỏi", giữ nguyên dòng tiêu đề đầu tiên.'],
  ['2', '', 'Xoá 3 dòng ví dụ, rồi điền câu hỏi của bạn, mỗi dòng một câu.'],
  ['3', '', 'Lưu file (.xlsx hoặc .csv).'],
  ['4', '', 'Trong app: Cài đặt → Nhập bộ câu hỏi → Chọn file để nhập.'],
  ['5', '', 'Câu mới nằm ở tab Luyện → ô Bộ câu hỏi → Câu hỏi tự nhập.'],
  ['', '', ''],
  ['Lưu ý', '', 'App chỉ đọc sheet đầu tiên. Tên file sẽ thành tên bộ câu hỏi.'],
];

export function xlsxTemplate() {
  return buildXlsx([
    { name: 'Câu hỏi', rows: [TEMPLATE_HEADER, ...TEMPLATE_ROWS], widths: [60, 14, 70] },
    { name: 'Hướng dẫn', rows: GUIDE_ROWS, widths: [16, 11, 70] },
  ]);
}

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
export function csvTemplate() {
  return '\uFEFF' + [TEMPLATE_HEADER, ...TEMPLATE_ROWS].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export function jsonTemplate() {
  return (
    JSON.stringify(
      {
        pack_name: 'Bộ câu hỏi của tôi',
        questions: TEMPLATE_ROWS.map(([question_text, topic, sample_answer]) => ({ question_text, topic, sample_answer })),
      },
      null,
      2,
    ) + '\n'
  );
}
