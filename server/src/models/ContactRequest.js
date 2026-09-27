import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    kind: { type: String, enum: ['message', 'callback'], default: 'message' },
    callback: {
      preferredTime: { type: String, default: '' }
    },
    status: { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new' }
  },
  { timestamps: true }
);

export default mongoose.model('ContactRequest', contactSchema);
