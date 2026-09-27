// One-off: build a minimal single-page PDF resume for parser testing.
const lines = [
  'RAHUL SHARMA',
  'Email: rahul.sharma@gmail.com',
  'Phone: +91 98765 43210',
  'Location: Jaipur, Rajasthan',
  'Date of birth: 14/03/1998',
  'Gender: Male',
  '',
  'SKILLS',
  'React, Node.js, MongoDB, JavaScript, HTML, CSS, REST API, Git',
  '',
  'EXPERIENCE',
  'Frontend Developer at Tech Solutions Pvt Ltd (2022 - Present)',
  '3 years of experience building web applications with React and REST APIs.',
  '',
  'EDUCATION',
  'B.Tech Computer Science, Rajasthan Technical University, 2020',
  '',
  'Expected salary: 6 LPA'
];

// Minimal PDF writer: one text object per line, Helvetica 11pt.
function esc(s) { return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
let y = 780;
const parts = [];
for (const l of lines) {
  parts.push(`BT /F1 11 Tf 50 ${y} Td (${esc(l)}) Tj ET`);
  y -= 16;
}
const stream = parts.join('\n');
const objs = [];
objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
objs[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
objs[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>';
objs[4] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
objs[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

let pdf = '%PDF-1.4\n';
const offsets = [0];
for (let i = 1; i <= 5; i++) {
  offsets[i] = pdf.length;
  pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
}
const xrefStart = pdf.length;
pdf += `xref\n0 6\n0000000000 65535 f \n`;
for (let i = 1; i <= 5; i++) {
  pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
}
pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

const fs = await import('fs');
fs.writeFileSync('C:/Users/HP/OneDrive/Desktop/brainplacement/.freebuff/test-resume.pdf', pdf, 'latin1');
console.log('written test-resume.pdf', pdf.length, 'bytes');
