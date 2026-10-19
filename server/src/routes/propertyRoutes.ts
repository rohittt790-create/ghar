import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', upload.array('propertyPhotos', 10), createProperty);
router.put('/:id', upload.array('propertyPhotos', 10), updateProperty);
router.delete('/:id', deleteProperty);

export default router;
