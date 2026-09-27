import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getMyProfile, updateMyProfile, uploadResume, adminListCandidates
} from '../controllers/candidateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Resolve server/uploads from this file, not the current working directory,
// so uploads land where app.js serves them from no matter where node was started.
const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `resume-${unique}${ext}`);
  }
});
const upload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|doc|docx|png|jpe?g)$/i.test(file.originalname);
    cb(ok ? null : new Error('Only PDF, DOC, DOCX, PNG or JPG files are allowed'), ok);
  }
});

router.get('/me', protect, authorize('candidate'), getMyProfile);
router.put('/me', protect, authorize('candidate'), updateMyProfile);
router.post('/me/resume', protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/', protect, authorize('admin'), adminListCandidates);

export default router;
