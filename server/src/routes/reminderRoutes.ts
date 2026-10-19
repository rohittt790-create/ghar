import { Router } from 'express';
import {
  getReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder,
  getActiveAlerts,
} from '../controllers/reminderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getReminders);
router.get('/alerts/active', getActiveAlerts);
router.post('/', createReminder);
router.patch('/:id/status', updateReminderStatus);
router.delete('/:id', deleteReminder);

export default router;
