"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const structureController_js_1 = require("../controllers/structureController.js");
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const router = (0, express_1.Router)();
// Protect all structure routes with auth
router.use(auth_js_1.authenticate);
// ==========================================
// HOUSE OVERVIEW
// ==========================================
router.get('/properties/:propertyId/overview', structureController_js_1.getStructureOverview);
// ==========================================
// FLOORS
// ==========================================
router.get('/properties/:propertyId/floors', structureController_js_1.getFloorsByProperty);
router.post('/properties/:propertyId/floors', upload_js_1.upload.single('floorPlanImage'), structureController_js_1.createFloor);
router.put('/floors/:id', upload_js_1.upload.single('floorPlanImage'), structureController_js_1.updateFloor);
router.put('/properties/:propertyId/floors/:id', upload_js_1.upload.single('floorPlanImage'), structureController_js_1.updateFloor);
router.delete('/floors/:id', structureController_js_1.deleteFloor);
router.delete('/properties/:propertyId/floors/:id', structureController_js_1.deleteFloor);
// ==========================================
// ROOMS
// ==========================================
router.get('/properties/:propertyId/rooms', structureController_js_1.getRoomsByProperty);
router.post('/properties/:propertyId/rooms', upload_js_1.upload.single('photo'), structureController_js_1.createRoom);
router.put('/rooms/:id', upload_js_1.upload.single('photo'), structureController_js_1.updateRoom);
router.put('/properties/:propertyId/rooms/:id', upload_js_1.upload.single('photo'), structureController_js_1.updateRoom);
router.delete('/rooms/:id', structureController_js_1.deleteRoom);
router.delete('/properties/:propertyId/rooms/:id', structureController_js_1.deleteRoom);
router.post('/rooms/:id/defects', structureController_js_1.addRoomDefect);
router.post('/properties/:propertyId/rooms/:id/defects', structureController_js_1.addRoomDefect);
router.put('/rooms/:id/defects/:defectId/resolve', structureController_js_1.resolveRoomDefect);
router.put('/properties/:propertyId/rooms/:id/defects/:defectId/resolve', structureController_js_1.resolveRoomDefect);
// ==========================================
// RESIDENTS
// ==========================================
router.get('/properties/:propertyId/residents', structureController_js_1.getResidentsByProperty);
router.post('/properties/:propertyId/residents', upload_js_1.upload.single('profilePhoto'), structureController_js_1.createResident);
router.put('/residents/:id', upload_js_1.upload.single('profilePhoto'), structureController_js_1.updateResident);
router.put('/properties/:propertyId/residents/:id', upload_js_1.upload.single('profilePhoto'), structureController_js_1.updateResident);
router.put('/residents/:id/reassign', structureController_js_1.reassignResidentRoom);
router.put('/properties/:propertyId/residents/:id/reassign', structureController_js_1.reassignResidentRoom);
router.put('/residents/:id/move-out', structureController_js_1.markResidentMoveOut);
router.put('/properties/:propertyId/residents/:id/move-out', structureController_js_1.markResidentMoveOut);
router.delete('/residents/:id', structureController_js_1.deleteResident);
router.delete('/properties/:propertyId/residents/:id', structureController_js_1.deleteResident);
exports.default = router;
