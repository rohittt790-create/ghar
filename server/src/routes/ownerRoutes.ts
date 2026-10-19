import { Router } from 'express';
import {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner,
} from '../controllers/ownerController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// All owner operations are private and scoped to the authenticated user account
router.use(authenticate);

router.get('/', getOwners);
router.get('/:id', getOwnerById);
router.post('/', upload.single('profilePicture'), createOwner);
router.put('/:id', upload.single('profilePicture'), updateOwner);
router.delete('/:id', deleteOwner);

export default router;
