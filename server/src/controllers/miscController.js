import ContactRequest from '../models/ContactRequest.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Candidate from '../models/Candidate.js';
import PlacementStory from '../models/PlacementStory.js';
import Application from '../models/Application.js';

export async function createContact(req, res) {
  try {
    const { name, email, message, kind } = req.body;
    if (kind === 'callback') {
      if (!name || !req.body.phone) {
        return res.status(400).json({ message: 'Name and phone are required for a callback' });
      }
    } else if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    const allowed = ['name', 'email', 'phone', 'company', 'subject', 'message', 'kind', 'callback'];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }
    if (!['message', 'callback'].includes(payload.kind)) payload.kind = 'message';
    const contact = await ContactRequest.create(payload);
    res.status(201).json({ message: 'Thank you! Our team will contact you soon.', contact });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function listContacts(req, res) {
  try {
    const contacts = await ContactRequest.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function updateContactStatus(req, res) {
  try {
    const contact = await ContactRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(contact);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function listUsers(req, res) {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function toggleBlockUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block an admin' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function verifyCandidate(req, res) {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    candidate.isVerified = !candidate.isVerified;
    await candidate.save();
    if (candidate.user) {
      await User.findByIdAndUpdate(candidate.user, { isVerified: candidate.isVerified });
    }
    res.json(candidate);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function listCompaniesAdmin(req, res) {
  try {
    const companies = await Company.find().populate('owner', 'name email phone').sort({ createdAt: -1 });
    res.json(companies);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function setCompanyVerification(req, res) {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const company = await Company.findByIdAndUpdate(req.params.id, { verificationStatus: status }, { new: true });
    res.json(company);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function adminListApplications(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const apps = await Application.find(filter)
      .populate({ path: 'candidate', select: 'user', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'job', select: 'title company', populate: { path: 'company', select: 'companyName' } })
      .sort({ createdAt: -1 })
      .limit(300);
    res.json(apps);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function listStories(req, res) {
  try {
    const stories = await PlacementStory.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function adminStories(req, res) {
  try {
    const stories = await PlacementStory.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function createStory(req, res) {
  try {
    const story = await PlacementStory.create(req.body);
    res.status(201).json(story);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function deleteStory(req, res) {
  try {
    await PlacementStory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
