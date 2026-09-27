import { Router } from 'express';
import { adminLogin } from '../controllers/authController.js';

// Separate mount from /api/auth so the admin portal has its own endpoint.
const router = Router();

router.post('/login', adminLogin);

export default router;
