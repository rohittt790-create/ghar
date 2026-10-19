"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ownerController_js_1 = require("../controllers/ownerController.js");
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const router = (0, express_1.Router)();
// All owner operations are private and scoped to the authenticated user account
router.use(auth_js_1.authenticate);
router.get('/', ownerController_js_1.getOwners);
router.get('/:id', ownerController_js_1.getOwnerById);
router.post('/', upload_js_1.upload.single('profilePicture'), ownerController_js_1.createOwner);
router.put('/:id', upload_js_1.upload.single('profilePicture'), ownerController_js_1.updateOwner);
router.delete('/:id', ownerController_js_1.deleteOwner);
exports.default = router;
