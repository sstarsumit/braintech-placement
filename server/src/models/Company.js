import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    industry: { type: String, default: '' },
    website: { type: String, default: '' },
    size: { type: String, default: '' },
    foundedYear: { type: String, default: '' },
    about: { type: String, default: '' },
    hrName: { type: String, default: '' },
    hrPhone: { type: String, default: '' },
    country: { type: String, default: 'India' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
