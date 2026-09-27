import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    recruiterNotes: { type: String, default: '' },
    interviewDate: { type: Date },
    interviewMode: { type: String, enum: ['', 'In-person', 'Phone', 'Video'], default: '' },
    placedAt: { type: Date }
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
