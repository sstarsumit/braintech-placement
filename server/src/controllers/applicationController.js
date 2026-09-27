import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import Company from '../models/Company.js';

export async function applyToJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'active') {
      return res.status(400).json({ message: 'This job is not accepting applications' });
    }

    const profile = await Candidate.findOne({ user: req.user._id });
    if (!profile || !profile.resume) {
      return res.status(400).json({
        message: 'You need a resume to apply. Upload one and your application will be submitted.'
      });
    }

    const existing = await Application.findOne({ job: job._id, candidate: profile._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Snapshot the resume used at apply time — later profile replacements
    // must not change what the employer sees for this application.
    const app = await Application.create({
      job: job._id,
      candidate: profile._id,
      user: req.user._id,
      resume: profile.resume,
      resumeName: profile.resumeName || '',
      coverLetter: req.body.coverLetter || ''
    });

    res.status(201).json({ message: 'Application submitted successfully', application: app });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function myApplications(req, res) {
  try {
    const profile = await Candidate.findOne({ user: req.user._id });
    if (!profile) return res.json([]);
    const apps = await Application.find({ candidate: profile._id })
      .populate({
        path: 'job',
        select: 'title location employmentType workMode salaryMin salaryMax status company',
        populate: { path: 'company', select: 'companyName logo' }
      })
      .sort({ createdAt: -1 });
    res.json(apps.filter((a) => a.job));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function withdrawApplication(req, res) {
  try {
    const app = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    app.status = 'withdrawn';
    await app.save();
    res.json(app);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function jobApplicants(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const company = await Company.findOne({ owner: req.user._id });
    if (!company || String(job.company) !== String(company._id)) {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    }

    const apps = await Application.find({ job: req.params.id })
      .populate({
        path: 'candidate',
        select: 'experienceYears skills city highestQualification resume resumeName user',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function updateApplicationStatus(req, res) {
  try {
    const { status, notes, interviewDate, interviewMode } = req.body;
    const app = await Application.findById(req.params.id).populate('job', 'company');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role !== 'admin') {
      const company = await Company.findOne({ owner: req.user._id });
      if (!company || String(app.job.company) !== String(company._id)) {
        return res.status(403).json({ message: 'Not allowed' });
      }
    }

    if (status) app.status = status;
    if (notes !== undefined) app.recruiterNotes = notes;
    if (interviewDate) app.interviewDate = interviewDate;
    if (interviewMode) app.interviewMode = interviewMode;
    if (status === 'selected') app.placedAt = new Date();
    await app.save();
    res.json(app);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function recruiterStats(req, res) {
  try {
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      return res.json({ activeJobs: 0, applicants: 0, shortlisted: 0, interviews: 0, hired: 0 });
    }
    const jobs = await Job.find({ company: company._id }).select('_id');
    const ids = jobs.map((j) => j._id);
    const [applicants, shortlisted, interviews, hired] = await Promise.all([
      Application.countDocuments({ job: { $in: ids } }),
      Application.countDocuments({ job: { $in: ids }, status: 'shortlisted' }),
      Application.countDocuments({ job: { $in: ids }, status: 'interview' }),
      Application.countDocuments({ job: { $in: ids }, status: 'selected' })
    ]);
    res.json({
      activeJobs: await Job.countDocuments({ company: company._id, status: 'active' }),
      applicants,
      shortlisted,
      interviews,
      hired
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function adminStats(req, res) {
  try {
    const Application_ = Application;
    const [
      candidates,
      companies,
      activeJobs,
      applications,
      placements,
      pendingCompanies,
      pendingJobs,
      newContacts
    ] = await Promise.all([
      Candidate.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application_.countDocuments(),
      Application_.countDocuments({ status: 'selected' }),
      Company.countDocuments({ verificationStatus: 'pending' }),
      Job.countDocuments({ status: 'pending' }),
      (await import('../models/ContactRequest.js')).default.countDocuments({ status: 'new' })
    ]);
    res.json({
      candidates,
      companies,
      activeJobs,
      applications,
      placements,
      pendingCompanies,
      pendingJobs,
      newContacts
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
