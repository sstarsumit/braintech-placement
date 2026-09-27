import { Router } from 'express';
import { getMyCompany, updateMyCompany } from '../controllers/companyController.js';
import { listCompaniesAdmin, setCompanyVerification } from '../controllers/miscController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/me', protect, authorize('recruiter'), getMyCompany);
router.put('/me', protect, authorize('recruiter'), updateMyCompany);
router.get('/', protect, authorize('admin'), listCompaniesAdmin);
router.put('/:id/verification', protect, authorize('admin'), setCompanyVerification);

export default router;
