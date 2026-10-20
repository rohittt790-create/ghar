"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./config/db.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const ownerRoutes_js_1 = __importDefault(require("./routes/ownerRoutes.js"));
const propertyRoutes_js_1 = __importDefault(require("./routes/propertyRoutes.js"));
const taskRoutes_js_1 = __importDefault(require("./routes/taskRoutes.js"));
const reminderRoutes_js_1 = __importDefault(require("./routes/reminderRoutes.js"));
const reportRoutes_js_1 = __importDefault(require("./routes/reportRoutes.js"));
const dashboardRoutes_js_1 = __importDefault(require("./routes/dashboardRoutes.js"));
const structureRoutes_js_1 = __importDefault(require("./routes/structureRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const mongoose_1 = __importDefault(require("mongoose"));
const db_js_2 = require("./config/db.js");
const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (!isServerless) {
    app.use((0, morgan_1.default)('dev'));
}
const os_1 = __importDefault(require("os"));
// Static uploads folder (uses /tmp on serverless environments)
const uploadsPath = isServerless
    ? path_1.default.resolve(os_1.default.tmpdir(), 'uploads')
    : path_1.default.resolve(process.cwd(), 'uploads');
try {
    if (!fs_1.default.existsSync(uploadsPath)) {
        fs_1.default.mkdirSync(uploadsPath, { recursive: true });
    }
}
catch (e) { }
app.use('/uploads', express_1.default.static(uploadsPath));
// Ensure DB is connected for incoming requests
app.use(async (req, _res, next) => {
    if (req.path === '/api/health' || req.path === '/health') {
        return next();
    }
    if (mongoose_1.default.connection.readyState !== 1) {
        try {
            await (0, db_js_1.connectDB)();
        }
        catch (err) {
            console.error('[DB Middleware Error]', err);
        }
    }
    next();
});
// API Routes (supports both /api/* and /* for Vercel rewrites)
app.use(['/api/auth', '/auth'], authRoutes_js_1.default);
app.use(['/api/owners', '/owners'], ownerRoutes_js_1.default);
app.use(['/api/properties', '/properties'], propertyRoutes_js_1.default);
app.use(['/api/tasks', '/tasks'], taskRoutes_js_1.default);
app.use(['/api/reminders', '/reminders'], reminderRoutes_js_1.default);
app.use(['/api/reports', '/reports'], reportRoutes_js_1.default);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes_js_1.default);
app.use(['/api/structure', '/structure'], structureRoutes_js_1.default);
// Health check endpoint (fast, returns immediately)
app.get(['/api/health', '/health'], (_req, res) => {
    const dbState = mongoose_1.default.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: dbState === 1 ? 'ok' : 'degraded',
        database: states[dbState] || 'unknown',
        hasMongoUri: !!process.env.MONGODB_URI,
        lastDbError: db_js_2.lastDbError || null,
        message: dbState === 1
            ? 'KAILASH BHAWAN API is running smoothly'
            : 'Database is not connected. In MongoDB Atlas -> Network Access, add 0.0.0.0/0 (Allow Access from Anywhere).',
        timestamp: new Date().toISOString(),
    });
});
// Global error handler
app.use(errorHandler_js_1.errorHandler);
if (!isServerless) {
    app.listen(PORT, () => {
        console.log(`[KAILASH BHAWAN Server] Server started on port ${PORT}`);
        console.log(`[KAILASH BHAWAN Server] Health check: http://localhost:${PORT}/api/health`);
    });
}
exports.default = app;
