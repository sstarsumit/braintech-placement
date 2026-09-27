import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    department: { type: String, default: '' },
    industry: { type: String, default: '' },
    description: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    location: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract'],
      default: 'Full Time'
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'On-site'
    },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 30 },
    education: { type: String, default: '' },
    openings: { type: Number, default: 1 },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'closed'],
      default: 'pending'
    },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', skills: 'text', description: 'text' });

export default mongoose.model('Job', jobSchema);
