import { Router } from 'express';
import {
  listJobs, getJob, createJob, updateJob, closeJob, myJobs,
  adminListJobs, adminUpdateJobStatus, adminDeleteJob, searchMeta
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/search-meta', searchMeta);
router.get('/', listJobs);
router.get('/:id', getJob);

// Recruiter
router.get('/mine/list', protect, authorize('recruiter'), myJobs);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.put('/:id/close', protect, authorize('recruiter'), closeJob);

// Admin
router.get('/admin/all', protect, authorize('admin'), adminListJobs);
router.put('/admin/:id/status', protect, authorize('admin'), adminUpdateJobStatus);
router.delete('/admin/:id', protect, authorize('admin'), adminDeleteJob);

export default router;
