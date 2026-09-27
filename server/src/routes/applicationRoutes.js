import { Router } from 'express';
import {
  applyToJob, myApplications, withdrawApplication, jobApplicants,
  updateApplicationStatus, recruiterStats, adminStats
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Candidate
router.get('/mine', protect, authorize('candidate'), myApplications);
router.post('/job/:id', protect, authorize('candidate'), applyToJob);
router.put('/:id/withdraw', protect, authorize('candidate'), withdrawApplication);

// Recruiter / Admin
router.get('/job/:id/applicants', protect, authorize('recruiter', 'admin'), jobApplicants);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.get('/recruiter/stats', protect, authorize('recruiter'), recruiterStats);

// Admin
router.get('/admin/stats', protect, authorize('admin'), adminStats);

export default router;
