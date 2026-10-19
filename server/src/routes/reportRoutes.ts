import { Router } from 'express';
import { generateMonthlyReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/monthly', generateMonthlyReport);

export default router;
