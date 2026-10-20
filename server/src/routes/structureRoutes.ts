import { Router } from 'express';
import {
  getFloorsByProperty,
  createFloor,
  updateFloor,
  deleteFloor,
  getRoomsByProperty,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomDefect,
  resolveRoomDefect,
  getResidentsByProperty,
  createResident,
  updateResident,
  reassignResidentRoom,
  markResidentMoveOut,
  deleteResident,
  getStructureOverview,
} from '../controllers/structureController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Protect all structure routes with auth
router.use(authenticate);

// ==========================================
// HOUSE OVERVIEW
// ==========================================
router.get('/properties/:propertyId/overview', getStructureOverview);

// ==========================================
// FLOORS
// ==========================================
router.get('/properties/:propertyId/floors', getFloorsByProperty);
router.post('/properties/:propertyId/floors', upload.single('floorPlanImage'), createFloor);

router.put('/floors/:id', upload.single('floorPlanImage'), updateFloor);
router.put('/properties/:propertyId/floors/:id', upload.single('floorPlanImage'), updateFloor);

router.delete('/floors/:id', deleteFloor);
router.delete('/properties/:propertyId/floors/:id', deleteFloor);

// ==========================================
// ROOMS
// ==========================================
router.get('/properties/:propertyId/rooms', getRoomsByProperty);
router.post('/properties/:propertyId/rooms', upload.single('photo'), createRoom);

router.put('/rooms/:id', upload.single('photo'), updateRoom);
router.put('/properties/:propertyId/rooms/:id', upload.single('photo'), updateRoom);

router.delete('/rooms/:id', deleteRoom);
router.delete('/properties/:propertyId/rooms/:id', deleteRoom);

router.post('/rooms/:id/defects', addRoomDefect);
router.post('/properties/:propertyId/rooms/:id/defects', addRoomDefect);

router.put('/rooms/:id/defects/:defectId/resolve', resolveRoomDefect);
router.put('/properties/:propertyId/rooms/:id/defects/:defectId/resolve', resolveRoomDefect);

// ==========================================
// RESIDENTS
// ==========================================
router.get('/properties/:propertyId/residents', getResidentsByProperty);
router.post('/properties/:propertyId/residents', upload.single('profilePhoto'), createResident);

router.put('/residents/:id', upload.single('profilePhoto'), updateResident);
router.put('/properties/:propertyId/residents/:id', upload.single('profilePhoto'), updateResident);

router.put('/residents/:id/reassign', reassignResidentRoom);
router.put('/properties/:propertyId/residents/:id/reassign', reassignResidentRoom);

router.put('/residents/:id/move-out', markResidentMoveOut);
router.put('/properties/:propertyId/residents/:id/move-out', markResidentMoveOut);

router.delete('/residents/:id', deleteResident);
router.delete('/properties/:propertyId/residents/:id', deleteResident);

export default router;
