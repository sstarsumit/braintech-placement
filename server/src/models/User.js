import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function () { return this.authProvider === 'local'; },
      minlength: 6,
      select: false
    },
    role: { type: String, enum: ['candidate', 'recruiter', 'admin'], default: 'candidate' },
    phone: { type: String, trim: true, default: '' },
    countryCode: { type: String, default: '+91' },
    avatar: { type: String, default: '' },
    googleId: { type: String, default: '', index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    passwordResetRequired: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);
