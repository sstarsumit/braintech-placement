// Resume parsing: extract text from PDF/DOCX, then infer structured fields
// with regex heuristics. Only fields the parser is confident about are
// returned; the caller decides whether to overwrite user data.
import * as pdfParseNS from 'pdf-parse';
import mammoth from 'mammoth';
import { SKILLS, CITIES, STATES } from './skillsTaxonomy.js';

// pdf-parse v2 exposes a PDFParse class; v1 was a callable default export.
const PDFParse = pdfParseNS.PDFParse;

async function pdfToText(buffer) {
  if (typeof PDFParse === 'function') {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy?.();
    }
  }
  const callable = pdfParseNS.default || pdfParseNS;
  const result = await callable(buffer);
  return result.text || '';
}

// ---------- Text extraction ----------

export async function extractText(buffer, filename) {
  const name = (filename || '').toLowerCase();
  if (name.endsWith('.pdf')) {
    return pdfToText(buffer);
  }
  if (name.endsWith('.docx')) {
    const out = await mammoth.extractRawText({ buffer });
    return out.value || '';
  }
  if (name.endsWith('.doc')) {
    // Legacy binary .doc — try mammoth, fall back to a latin1 scan.
    try {
      const out = await mammoth.extractRawText({ buffer });
      return out.value || '';
    } catch {
      return buffer.toString('latin1').replace(/[^\x20-\x7E\n]+/g, ' ');
    }
  }
  if (/\.(png|jpe?g|webp)$/.test(name)) {
    throw new Error('IMAGE_RESUME');
  }
  return buffer.toString('utf8').replace(/[^\x20-\x7E\n\t]+/g, ' ');
}

// ---------- Normalization helpers ----------

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

const titleCase = (s) =>
  clean(s).toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());

// ---------- Email / phone ----------

export function parseEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0].toLowerCase() : '';
}

export function parsePhone(text) {
  // Indian formats: +91 98765 43210, 09876543210, +91-9876543210, 9876543210
  const m = text.match(/(?:\+?91[-\s]?)?\b([6-9]\d{4})[-\s]?(\d{5})\b/);
  if (!m) return '';
  return `+91 ${m[1]} ${m[2]}`;
}

// ---------- Name ----------
// First plausible personal-name line near the top, skipping resume furniture.

const NAME_BLACKLIST =
  /(curriculum|resume|vitae|profile|summary|objective|experience|education|skill|address|email|phone|mobile|contact|date of birth|dob|gender|nationality|language|declaration|reference|project|certification|career|work history|personal|details|information|@|\d{5,})/i;

export function parseName(lines) {
  const candidates = [];
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const l = clean(lines[i]);
    if (!l) continue;
    if (NAME_BLACKLIST.test(l)) continue;
    const words = l.split(' ').filter((w) => /^[A-Za-z.]{2,}$/.test(w));
    if (words.length < 2 || words.length > 4) continue;
    if (l.length > 40) continue;
    candidates.push(l);
    if (candidates.length >= 3) break;
  }
  if (!candidates.length) return '';
  // Prefer the candidate with the most words (full name beats partial).
  candidates.sort((a, b) => b.split(' ').length - a.split(' ').length);
  return titleCase(candidates[0]);
}

// ---------- Skills ----------
// Match text against the platform taxonomy (incl. common written variants).

const SKILL_VARIANTS = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  'react.js': 'React',
  reactjs: 'React',
  'react js': 'React',
  'react native': 'React Native',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node js': 'Node.js',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  psql: 'PostgreSQL',
  mssql: 'SQL Server',
  'sql server': 'SQL Server',
  'ms sql': 'SQL Server',
  'next js': 'Next.js',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',
  tailwind: 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  mern: 'MERN Stack',
  'mern stack': 'MERN Stack',
  expressjs: 'Express',
  'express js': 'Express',
  'express.js': 'Express',
  typescript: 'TypeScript',
  html5: 'HTML',
  css3: 'CSS',
  scss: 'Sass',
  sass: 'Sass',
  redux: 'Redux',
  graphql: 'GraphQL',
  rest: 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  java: 'Java',
  'spring boot': 'Spring Boot',
  springboot: 'Spring Boot',
  php: 'PHP',
  laravel: 'Laravel',
  wordpress: 'WordPress',
  excel: 'MS Excel',
  'ms excel': 'MS Excel',
  'advanced excel': 'MS Excel',
  tally: 'Tally',
  tallyerp: 'Tally',
  gst: 'GST',
  tds: 'TDS',
  accounting: 'Accounting',
  bookkeeping: 'Bookkeeping',
  'human resources': 'HR Management',
  hr: 'HR Management',
  recruitment: 'Recruitment',
  'talent acquisition': 'Talent Acquisition',
  payroll: 'Payroll Processing',
  seo: 'SEO',
  sem: 'SEM',
  'digital marketing': 'Digital Marketing',
  'social media marketing': 'Social Media Marketing',
  'content writing': 'Content Writing',
  sales: 'Sales',
  b2b: 'B2B Sales',
  b2c: 'B2C Sales',
  telesales: 'Telesales',
  'business development': 'Business Development',
  negotiation: 'Negotiation',
  'customer service': 'Customer Service',
  'client servicing': 'Client Servicing',
  counselling: 'Counselling',
  counseling: 'Counselling',
  autocad: 'AutoCAD',
  'solid works': 'SolidWorks',
  solidworks: 'SolidWorks',
  plc: 'PLC Programming',
  scada: 'SCADA',
  'quality control': 'Quality Control',
  'quality assurance': 'Quality Assurance',
  logistics: 'Logistics',
  'supply chain': 'Supply Chain Management',
  'supply chain management': 'Supply Chain Management',
  'power bi': 'Power BI',
  powerbi: 'Power BI',
  tableau: 'Tableau',
  'data analysis': 'Data Analysis',
  'data entry': 'Data Entry',
  'ms office': 'MS Office',
  'ms word': 'MS Word',
  git: 'Git',
  github: 'GitHub',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  linux: 'Linux',
  'c++': 'C++',
  'c#': 'C#',
  '.net': '.NET',
  dotnet: '.NET',
  angular: 'Angular',
  flutter: 'Flutter',
  dart: 'Dart',
  kotlin: 'Kotlin',
  swift: 'Swift',
  android: 'Android Development',
  ios: 'iOS Development'
};

export function parseSkills(text) {
  const found = new Set();
  for (const skill of SKILLS) {
    const rx = new RegExp(`(^|[^a-zA-Z])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zA-Z]|$)`, 'i');
    if (rx.test(text)) found.add(skill);
  }
  for (const [variant, canonical] of Object.entries(SKILL_VARIANTS)) {
    const rx = new RegExp(`(^|[^a-zA-Z])${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zA-Z]|$)`, 'i');
    if (rx.test(text)) found.add(canonical);
  }
  return [...found].slice(0, 30);
}

// ---------- Highest qualification ----------

const QUAL_PATTERNS = [
  { rx: /\b(ph\.?d|doctorate)\b/i, v: 'PhD' },
  { rx: /\b(m\.?tech|m\.?e\b\(?\s*(engg|engineering)?)?\b/i, v: '' }, // placeholder, handled below
  { rx: /\b(mba|pgdm|pgdm\b|m\.?ms)\b/i, v: 'MBA/PGDM' },
  { rx: /\b(m\.?c\.?a)\b/i, v: 'MCA' },
  { rx: /\b(m\.?com)\b/i, v: 'M.Com' },
  { rx: /\b(m\.?sc)\b/i, v: 'M.Sc' },
  { rx: /\b(m\.?a)\b/i, v: 'M.A' },
  { rx: /\b(b\.?tech|b\.?e\b|bachelor of engineering|bachelor of technology)\b/i, v: 'B.Tech/BE' },
  { rx: /\b(b\.?c\.?a)\b/i, v: 'BCA' },
  { rx: /\b(b\.?b\.?a)\b/i, v: 'BBA' },
  { rx: /\b(b\.?com)\b/i, v: 'B.Com' },
  { rx: /\b(b\.?sc)\b/i, v: 'B.Sc' },
  { rx: /\b(b\.?a)\b/i, v: 'B.A' },
  { rx: /\b(diploma)\b/i, v: 'Diploma' },
  { rx: /\b(iti)\b/i, v: 'ITI' },
  { rx: /\b(12th|higher secondary|h\.?sc)\b/i, v: '12th' },
  { rx: /\b(10th|secondary|s\.?s\.?c)\b/i, v: '10th' }
];

export function parseQualification(text) {
  // Order matters: post-graduate beats graduate, so test PG first.
  const pg = [
    [/\bph\.?d\b|doctorate/i, 'PhD'],
    [/\bmba\b|\bpgdm\b|post graduate diploma in management/i, 'MBA/PGDM'],
    [/\bm\.?c\.?a\b/i, 'MCA'],
    [/\bm\.?tech\b|master of technology/i, 'M.Tech'],
    [/\bm\.?com\b/i, 'M.Com'],
    [/\bm\.?sc\b/i, 'M.Sc'],
    [/\bm\.?a\b(?!rch)/i, 'M.A'],
    [/\bm\.?b\.?b\.?s\b/i, 'MBBS'],
    [/\bll\.?m\b/i, 'LLM']
  ];
  for (const [rx, v] of pg) if (rx.test(text)) return v;
  const ug = [
    [/\bb\.?tech\b|bachelor of technology/i, 'B.Tech'],
    [/\bb\.?e\b(?!d\b)|bachelor of engineering/i, 'B.Tech/BE'],
    [/\bb\.?c\.?a\b/i, 'BCA'],
    [/\bb\.?b\.?a\b(?!chelor)/i, 'BBA'],
    [/\bb\.?com\b/i, 'B.Com'],
    [/\bb\.?sc\b/i, 'B.Sc'],
    [/\bb\.?a\b(?!chelor)/i, 'B.A'],
    [/\bll\.?b\b/i, 'LLB'],
    [/\bdiploma\b/i, 'Diploma'],
    [/\biti\b/i, 'ITI'],
    [/\b12th\b|higher secondary|\bh\.?sc\b/i, '12th'],
    [/\b10th\b|\bs\.?s\.?c\b|secondary school/i, '10th']
  ];
  for (const [rx, v] of ug) if (rx.test(text)) return v;
  return '';
}

// ---------- Experience ----------

export function parseExperienceYears(text) {
  // "3+ years", "five years", "2.5 years of experience"
  const wordNums = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  let m = text.match(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\b(?!\s*of\s*age)/i);
  if (m) return Math.min(parseFloat(m[1]), 50);
  m = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*\+?\s*(?:years?|yrs?)\b/i);
  if (m && wordNums[m[1].toLowerCase()]) return wordNums[m[1].toLowerCase()];
  // Fresher declarations
  if (/\bfresher\b/i.test(text)) return 0;
  return null;
}

// ---------- Designation (current/last job title) ----------

const TITLE_RX = [
  /\b(senior|jr\.?|junior|lead|head|chief|assistant|associate|deputy)?\s*(software|frontend|backed?nd|full[-\s]?stack|web|mobile|app)\s*(developer|engineer|programmer)\b/i,
  /\b(senior|junior|lead)?\s*(react|node|python|java|php|android|ios|flutter|dot ?net|\.net)\s*(developer|engineer)\b/i,
  /\b(hr|human resources?)\s*(executive|manager|generalist|recruiter)\b/i,
  /\b(sales|marketing|business development)\s*(executive|manager|officer|head|trainee)\b/i,
  /\b(accounts?|accountant|finance|accounts executive|accounts manager)\b/i,
  /\b(team lead|project manager|product manager|program manager)\b/i,
  /\b(data (entry|analyst|operator))\b/i,
  /\b(counsellor|counselor)\b/i,
  /\b(technician|electrician|fitter|welder|machine operator)\b/i,
  /\b(receptionist|front office executive|back office executive|office assistant|office executive)\b/i,
  /\b(teacher|faculty|lecturer|trainer)\b/i,
  /\b(customer support|customer care|telecaller|telecaller executive|call center executive)\b/i,
  /\b(qa|quality (analyst|engineer|inspector|control))\b/i,
  /\b(intern|trainee)\b/i
];

export function parseDesignation(text) {
  for (const rx of TITLE_RX) {
    const m = text.match(rx);
    if (m) return clean(m[0]).replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return '';
}

// ---------- Location (city + state) ----------

export function parseLocation(text) {
  let city = '';
  let state = '';

  // "Jaipur, Rajasthan" style pairs win immediately.
  for (const s of STATES) {
    const rx = new RegExp(`([A-Za-z .]+),\\s*${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const m = text.match(rx);
    if (m) {
      city = clean(m[1]).split(/\b(?=India)/i)[0].trim();
      state = s;
      break;
    }
  }
  if (!state) {
    for (const s of STATES) {
      if (new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) { state = s; break; }
    }
  }
  if (!city) {
    // Longest matching known city (avoid matching "Jaipur" inside "JaipurRoad").
    const hits = CITIES.filter((c) => new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
    if (hits.length) city = hits.sort((a, b) => b.length - a.length)[0];
  }
  return { city, state };
}

// ---------- Working status ----------

export function parseWorkingStatus(text, expYears) {
  if (/\b(currently working|present(?:ly)? (?:employed|working)|working here)\b/i.test(text)) return 'working';
  if (expYears !== null && expYears > 0) return 'experienced';
  if (/\bfresher\b/i.test(text)) return 'fresher';
  return '';
}

// ---------- Salary (expected CTC in LPA) ----------

export function parseExpectedSalary(text) {
  // "12 LPA", "12 lacs", "₹12,00,000", "12-15 LPA"
  let m = text.match(/(\d{1,2}(?:\.\d)?)\s*(?:-|to)\s*(\d{1,2}(?:\.\d)?)\s*(?:lpa|lacs|lakhs)/i);
  if (m) return parseFloat(m[2]); // take the upper bound as expectation
  m = text.match(/(\d{1,2}(?:\.\d)?)\s*(?:lpa|lacs per annum|lakhs per annum|lacs p\.?a\.?)/i);
  if (m) return parseFloat(m[1]);
  m = text.match(/(?:₹|rs\.?|inr)\s*(\d{1,2}),?\s*(\d{2})?,?\s*(\d{4,5})\b/i);
  if (m) {
    const total = parseInt(m[1] + (m[2] || '') + m[3], 10);
    if (total >= 100000) return Math.round((total / 100000) * 10) / 10;
  }
  return null;
}

// ---------- Gender / DOB ----------

export function parseGender(text) {
  if (/\b(female)\b/i.test(text)) return 'female';
  if (/\b(male)\b/i.test(text)) return 'male';
  return '';
}

export function parseDob(text) {
  // dd/mm/yyyy, dd-mm-yyyy, dd MMM yyyy
  let m = text.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](19|20)\d{2}\b/);
  if (m) {
    const iso = `${m[3]}${text.slice(m.index + m[0].length - 4, m.index + m[0].length)}`;
    const dd = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    if (Number(mm) >= 1 && Number(mm) <= 12) {
      const year = m[0].slice(-4);
      return `${year}-${mm}-${dd}`;
    }
    void iso;
  }
  m = text.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+((?:19|20)\d{2})\b/i);
  if (m) {
    const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    const mm = months[m[2].toLowerCase()];
    return `${m[3]}-${mm}-${String(m[1]).padStart(2, '0')}`;
  }
  return '';
}

// ---------- Master entry point ----------

export async function parseResume(buffer, filename) {
  const text = await extractText(buffer, filename);
  if (!text || text.replace(/\s/g, '').length < 40) {
    return { text: '', parsed: {} };
  }
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);

  const expYears = parseExperienceYears(text);
  const { city, state } = parseLocation(text);

  const parsed = {};
  const email = parseEmail(text);
  if (email) parsed.email = email;
  const phone = parsePhone(text);
  if (phone) parsed.phone = phone;

  const name = parseName(lines);
  if (name) parsed.name = name;

  const skills = parseSkills(text);
  if (skills.length) parsed.skills = skills;

  const qualification = parseQualification(text);
  if (qualification) parsed.highestQualification = qualification;

  if (expYears !== null) parsed.experienceYears = expYears;

  const designation = parseDesignation(text);
  if (designation) parsed.currentDesignation = designation;

  if (city) parsed.city = city;
  if (state) parsed.state = state;

  const status = parseWorkingStatus(text, expYears);
  if (status) parsed.workingStatus = status;

  const salary = parseExpectedSalary(text);
  if (salary !== null) parsed.expectedSalary = salary;

  const gender = parseGender(text);
  if (gender) parsed.gender = gender;

  const dob = parseDob(text);
  if (dob) parsed.dob = dob;

  return { text, parsed };
}
