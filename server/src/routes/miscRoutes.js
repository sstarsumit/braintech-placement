import { Router } from 'express';
import {
  createContact, listContacts, updateContactStatus,
  listUsers, toggleBlockUser, verifyCandidate,
  listStories, adminStories, createStory, deleteStory, adminListApplications
} from '../controllers/miscController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public
router.post('/contact', createContact);
router.get('/stories', listStories);

// Admin
router.get('/admin/contacts', protect, authorize('admin'), listContacts);
router.put('/admin/contacts/:id', protect, authorize('admin'), updateContactStatus);
router.get('/admin/users', protect, authorize('admin'), listUsers);
router.put('/admin/users/:id/block', protect, authorize('admin'), toggleBlockUser);
router.put('/admin/candidates/:id/verify', protect, authorize('admin'), verifyCandidate);
router.get('/admin/applications', protect, authorize('admin'), adminListApplications);
router.get('/admin/stories', protect, authorize('admin'), adminStories);
router.post('/admin/stories', protect, authorize('admin'), createStory);
router.delete('/admin/stories/:id', protect, authorize('admin'), deleteStory);

export default router;
