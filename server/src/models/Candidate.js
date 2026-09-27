import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    level: String,
    field: String,
    institute: String,
    year: String
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profilePhoto: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, enum: ['', 'male', 'female', 'other'], default: '' },
    headline: { type: String, default: '', trim: true },
    highestQualification: { type: String, default: '' },
    experienceYears: { type: Number, default: 0, min: 0, max: 50 },
    currentDesignation: { type: String, default: '' },
    currentCompany: { type: String, default: '' },
    skills: { type: [String], default: [] },
    industry: { type: String, default: '' },
    expectedSalary: { type: Number, default: 0 },
    noticePeriod: { type: String, default: '' },
    workingStatus: { type: String, enum: ['', 'working', 'experienced', 'fresher'], default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: 'India' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    resume: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    resumeUploadedAt: { type: Date },
    preferredRoles: { type: [String], default: [] },
    preferredLocations: { type: [String], default: [] },
    preferredJobTypes: { type: [String], default: [] },
    workModePreference: { type: String, enum: ['', 'onsite', 'hybrid', 'remote'], default: '' },
    referral: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

candidateSchema.virtual('completion').get(function () {
  const fields = [
    this.dob,
    this.gender,
    this.highestQualification,
    this.currentDesignation,
    this.city,
    this.state,
    this.resume,
    this.industry
  ];
  let filled = fields.filter(Boolean).length;
  // A populated/projected document may not include the array fields at all,
  // so guard them rather than blowing up when the virtual is serialized.
  if ((this.skills || []).length) filled += 1;
  if ((this.preferredRoles || []).length) filled += 1;
  if ((this.preferredLocations || []).length) filled += 1;
  return Math.round((filled / (fields.length + 3)) * 100);
});

candidateSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Candidate', candidateSchema);
