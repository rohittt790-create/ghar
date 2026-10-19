import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  uploadTaskPhotos,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', upload.array('progressPhotos', 10), createTask);
router.put('/:id', upload.array('progressPhotos', 10), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/photos', upload.array('photos', 10), uploadTaskPhotos);
router.delete('/:id', deleteTask);

export default router;
