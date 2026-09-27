import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Company from '../models/Company.js';
import { signToken } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config/env.js';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export async function register(req, res) {
  try {
    const { name, email, password, role, phone, countryCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (role && !['candidate', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      phone: phone || '',
      countryCode: countryCode || '+91'
    });

    if (user.role === 'candidate') {
      await Candidate.create({ user: user._id });
    } else {
      await Company.create({
        owner: user._id,
        companyName: name + ' (Company)',
        verificationStatus: 'pending'
      });
    }

    res.status(201).json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }
    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

/**
 * Dedicated admin login for the /admin portal. Queries with role:'admin' so a
 * valid candidate/recruiter password can NEVER mint an admin session, and
 * errors are intentionally generic (no account/role disclosure).
 */
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase(), role: 'admin' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'This admin account has been blocked' });
    }
    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

/**
 * Google Sign-In: verify the ID token from Google Identity Services, then
 * find-or-create the linked user (candidates get a profile automatically).
 * Body: { credential } (GSI ID token), optional { loginType: 'candidate'|'company' }.
 * Roles are never changed or created from loginType alone:
 *  - Candidate tab: new Google emails become candidates.
 *  - Company tab: only EXISTING recruiter/admin accounts may sign in; a Google
 *    email with no company account is told to register first (no auto-recruiter).
 */
export async function googleAuth(req, res) {
  try {
    if (!googleClient) {
      return res.status(501).json({
        message: 'Google Sign-In is not configured on this server. Add GOOGLE_CLIENT_ID to server/.env.'
      });
    }
    const { credential, loginType } = req.body;
    const as = loginType === 'company' ? 'company' : 'candidate';
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ message: 'Google sign-in failed: invalid or expired token. Try again.' });
    }
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ $or: [{ email }, { googleId: payload.sub }] });

    if (user?.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    if (!user) {
      // A brand-new Google email can only ever enter as a candidate; the
      // Company tab never auto-creates recruiters (registration does that).
      if (as === 'company') {
        return res.status(403).json({
          message: 'No company account exists for this Google email. Please register your company first, then sign in with Google to link it.'
        });
      }
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        authProvider: 'google',
        avatar: payload.picture || '',
        isVerified: true,
        role: 'candidate'
      });
      await Candidate.create({ user: user._id });
    } else {
      // Route the existing account to the matching workspace tab.
      const isCompanyAccount = user.role === 'recruiter' || user.role === 'admin';
      if (as === 'company' && !isCompanyAccount) {
        return res.status(403).json({ message: 'This Google account is linked to a candidate account. Please use Candidate Login.' });
      }
      if (as === 'candidate' && user.role === 'recruiter') {
        return res.status(403).json({ message: 'This Google account is linked to a company account. Please use Company Login.' });
      }
      // Link an existing local account to this Google identity.
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.authProvider = 'google';
        if (!user.avatar && payload.picture) user.avatar = payload.picture;
        await user.save();
      }
    }

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function getMe(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone
    }
  });
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
