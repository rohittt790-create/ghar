import { Router } from 'express';
import { register, login, getMe, getTeamMembers } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/team', authenticate, getTeamMembers);

export default router;
