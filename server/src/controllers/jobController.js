import Job from '../models/Job.js';
import Company from '../models/Company.js';

function buildFilter(query) {
  const filter = { status: 'active' };
  const q = query.q ? String(query.q).trim() : '';
  const location = query.location ? String(query.location).trim() : '';

  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { skills: rx }, { description: rx }, { industry: rx }];
  }
  if (location) {
    const rxl = new RegExp(location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.location = rxl;
  }
  if (query.jobType) {
    const types = String(query.jobType).split(',').filter(Boolean);
    if (types.length) filter.employmentType = { $in: types };
  }
  if (query.workMode) {
    const modes = String(query.workMode).split(',').filter(Boolean);
    if (modes.length) filter.workMode = { $in: modes };
  }
  if (query.industry) {
    const inds = String(query.industry).split(',').filter(Boolean);
    if (inds.length) filter.industry = { $in: inds };
  }
  if (query.experience) {
    // buckets: fresher (0), 0-2, 2-5, 5+
    const buckets = String(query.experience).split(',').filter(Boolean);
    if (buckets.length) {
      const conds = buckets.map((b) => {
        if (b === 'fresher') return { experienceMin: 0 };
        if (b === '0-2') return { experienceMin: { $lte: 2 }, experienceMax: { $gte: 0 } };
        if (b === '2-5') return { experienceMin: { $lte: 5 }, experienceMax: { $gte: 2 } };
        return { experienceMax: { $gte: 5 } };
      });
      filter.$and = (filter.$and || []).concat(conds.map((c) => [{ ...c }][0]));
    }
  }
  if (query.salary) {
    // buckets in LPA: 0-10k monthly style not used; use LPA ranges
    const salaries = String(query.salary).split(',').filter(Boolean);
    if (salaries.length) {
      const conds = salaries.map((s) => {
        if (s === '0-3') return { salaryMin: { $lte: 3 } };
        if (s === '3-6') return { salaryMax: { $gte: 3 }, salaryMin: { $lte: 6 } };
        if (s === '6-10') return { salaryMax: { $gte: 6 }, salaryMin: { $lte: 10 } };
        return { salaryMax: { $gte: 10 } };
      });
      filter.$or = filter.$or || [];
      filter.$and = (filter.$and || []).concat([{ $or: conds }]);
    }
  }
  return filter;
}

export async function searchMeta(req, res) {
  try {
    const [skills, titles, locations, industries] = await Promise.all([
      Job.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$skills' },
        { $group: { _id: { $toLower: '$skills' }, label: { $first: '$skills' }, count: { $sum: 1 } } },
        { $sort: { count: -1, label: 1 } },
        { $limit: 200 }
      ]),
      Job.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: { $toLower: '$title' }, label: { $first: '$title' }, count: { $sum: 1 } } },
        { $sort: { count: -1, label: 1 } },
        { $limit: 150 }
      ]),
      Job.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: { $toLower: '$location' }, label: { $first: '$location' }, count: { $sum: 1 } } },
        { $sort: { count: -1, label: 1 } },
        { $limit: 150 }
      ]),
      Job.distinct('industry', { status: 'active' })
    ]);
    res.json({
      skills: skills.map((s) => ({ label: s.label, count: s.count })),
      titles: titles.map((s) => ({ label: s.label, count: s.count })),
      locations: locations.map((s) => ({ label: s.label, count: s.count })),
      industries: industries.filter(Boolean).sort()
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function listJobs(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 9, 50);
    const filter = buildFilter(req.query);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', 'companyName logo city')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter)
    ]);

    res.json({ jobs, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function getJob(req, res) {
  try {
    const job = await Job.findById(req.params.id).populate(
      'company',
      'companyName logo city state about website size industry'
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function createJob(req, res) {
  try {
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) return res.status(400).json({ message: 'Create your company profile first' });
    if (company.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Your company must be approved by admin before posting jobs'
      });
    }
    const job = await Job.create({ ...req.body, company: company._id, postedBy: req.user._id });
    res.status(201).json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function updateJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const company = await Company.findOne({ owner: req.user._id });
    if (!company || String(job.company) !== String(company._id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    Object.assign(job, req.body);
    if (job.status === 'rejected' || job.status === 'closed') job.status = 'pending';
    await job.save();
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function closeJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const company = await Company.findOne({ owner: req.user._id });
    if (!company || String(job.company) !== String(company._id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    job.status = 'closed';
    await job.save();
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function myJobs(req, res) {
  try {
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) return res.json([]);
    const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });
    const counts = await Promise.all(
      jobs.map(async (j) => {
        const Application = (await import('../models/Application.js')).default;
        const total = await Application.countDocuments({ job: j._id });
        const shortlisted = await Application.countDocuments({
          job: j._id,
          status: { $in: ['shortlisted', 'interview', 'selected'] }
        });
        return { ...j.toObject(), applicantCount: total, shortlistedCount: shortlisted };
      })
    );
    res.json(counts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function adminListJobs(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const jobs = await Job.find(filter)
      .populate('company', 'companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function adminUpdateJobStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'rejected', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function adminDeleteJob(req, res) {
  try {
    const Application = (await import('../models/Application.js')).default;
    await Application.deleteMany({ job: req.params.id });
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
