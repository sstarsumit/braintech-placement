import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import { parseResume } from '../lib/resumeParser.js';

export async function getMyProfile(req, res) {
  const profile =
    (await Candidate.findOne({ user: req.user._id })) ||
    (await Candidate.create({ user: req.user._id }));
  res.json(profile);
}

export async function updateMyProfile(req, res) {
  // Whitelist — req.body comes from the client and must never touch resume
  // fields (uploads go through POST /me/resume) or internal flags.
  const allowed = [
    'dob', 'gender', 'headline', 'highestQualification', 'experienceYears',
    'currentDesignation', 'currentCompany', 'skills', 'industry',
    'expectedSalary', 'noticePeriod', 'workingStatus', 'address', 'country',
    'state', 'city', 'preferredRoles', 'preferredLocations', 'preferredJobTypes',
    'workModePreference', 'referral'
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const profile = await Candidate.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  res.json(profile);
}

// ---------- Resume parsing + profile auto-fill ----------

// Scalar fields the parser may write. Only applied when the stored value is
// empty, so anything the candidate already entered is never overwritten.
const FILLABLE = [
  'dob', 'gender', 'highestQualification', 'experienceYears', 'currentDesignation',
  'city', 'state', 'expectedSalary', 'workingStatus'
];

function inferIndustry(skills, designation) {
  const t = `${(skills || []).join(' ')} ${designation || ''}`.toLowerCase();
  if (/(react|node|python|java|php|software|developer|engineer|mern|frontend|backend|full.?stack|\.net|angular|flutter|data entry|ms excel)/.test(t)) return 'IT';
  if (/(autocad|plc|scada|welder|fitter|electrician|technician|quality control)/.test(t)) return 'Electronics';
  if (/(account|tally|gst|tax|finance|bookkeeping|audit)/.test(t)) return 'FMCG';
  return '';
}

export async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const profile =
    (await Candidate.findOne({ user: req.user._id })) ||
    (await Candidate.create({ user: req.user._id }));

  // The resume itself is persisted unconditionally here (previously it was only
  // written when at least one auto-fill field changed — plain/image resumes were
  // silently dropped). Auto-fill values below are merged into the same update.
  const setOps = {
    resume: '/uploads/' + req.file.filename,
    resumeName: req.file.originalname,
    resumeUploadedAt: new Date()
  };
  let parsedFields = {};
  let autofill = [];
  let parseNote = '';

  try {
    const buffer = fs.readFileSync(req.file.path);
    const { parsed } = await parseResume(buffer, req.file.originalname);
    parsedFields = parsed;

    const changes = {};

    // 1) Fill empty scalar fields.
    for (const key of FILLABLE) {
      const v = parsed[key];
      if (v === undefined || v === '' || v === null) continue;
      const cur = profile[key];
      const isEmpty =
        cur === undefined || cur === null || cur === '' ||
        (key === 'experienceYears' && Number(cur) === 0 && Number(v) > 0) ||
        (key === 'expectedSalary' && Number(cur) === 0 && Number(v) > 0);
      if (isEmpty) {
        changes[key] = v;
        setOps[key] = v;
      }
    }

    // 2) Merge parsed skills into existing list (union, capped at 30).
    if (parsed.skills?.length) {
      const merged = [...new Set([...(profile.skills || []), ...parsed.skills])].slice(0, 30);
      const added = merged.filter((s) => !(profile.skills || []).includes(s));
      if (merged.length) {
        setOps.skills = merged;
        if (added.length) {
          changes.skills = added;
          autofill.push('skills');
        }
      }
    }

    // 3) Infer industry when empty.
    if (!profile.industry) {
      const ind = inferIndustry(parsed.skills, parsed.currentDesignation);
      if (ind) {
        setOps.industry = ind;
        changes.industry = ind;
      }
    }

    if (Object.keys(changes).length) {
      autofill = [...autofill, ...Object.keys(changes).filter((k) => k !== 'skills')];
    }

    // 4) Phone lives on the User account — fill it if registration left it empty.
    if (parsed.phone && !req.user.phone) {
      await User.findByIdAndUpdate(req.user._id, { phone: parsed.phone });
      autofill.push('phone');
    }

    const labels = {
      dob: 'date of birth', gender: 'gender', highestQualification: 'qualification',
      experienceYears: 'experience', currentDesignation: 'designation', city: 'city',
      state: 'state', expectedSalary: 'expected salary',      workingStatus: 'working status', skills: 'skills', industry: 'industry', phone: 'phone' };
    if (autofill.length) {
      const nice = autofill.map((k) => labels[k] || k);
      parseNote = `We read your resume and filled: ${nice.join(', ')}. Please review them below.`;
    }
  } catch (err) {
    if (err?.message !== 'IMAGE_RESUME') {
      console.error('resume parse failed:', err?.message);
    }
  }

  const updated = await Candidate.findOneAndUpdate(
    { user: req.user._id },
    { $set: setOps },
    { new: true, runValidators: true }
  );
  res.json({ ...updated.toJSON(), parsedFields, autofill, parseNote });
}

export async function adminListCandidates(req, res) {
  const { search = '' } = req.query;
  const filter = {};
  if (search) {
    const users = await mongooseFindUsers(search);
    filter.user = { $in: users };
  }
  const candidates = await Candidate.find(filter)
    .populate('user', 'name email phone createdAt')
    .sort({ createdAt: -1 });
  res.json(candidates);
}

async function mongooseFindUsers(search) {
  const users = await User.find({ role: 'candidate', name: new RegExp(search, 'i') }).select('_id');
  return users.map((u) => u._id);
}
