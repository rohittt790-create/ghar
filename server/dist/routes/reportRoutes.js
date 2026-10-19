"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_js_1 = require("../controllers/reportController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.get('/monthly', reportController_js_1.generateMonthlyReport);
exports.default = router;
