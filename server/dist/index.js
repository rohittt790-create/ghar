"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Connect to MongoDB
(0, db_js_1.connectDB)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Static uploads folder
const uploadsPath = path_1.default.resolve(process.cwd(), 'uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
const mongoose_1 = __importDefault(require("mongoose"));
// Ensure DB is connected for all incoming requests (especially serverless cold starts)
app.use(async (_req, _res, next) => {
    try {
        await (0, db_js_1.connectDB)();
    }
    catch (err) {
        console.error('[DB Middleware Error]', err);
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
// Health check endpoint
app.get(['/api/health', '/health'], async (_req, res) => {
    try {
        await (0, db_js_1.connectDB)();
    }
    catch (e) { }
    const dbState = mongoose_1.default.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: dbState === 1 ? 'ok' : 'degraded',
        database: states[dbState] || 'unknown',
        hasMongoUri: !!process.env.MONGODB_URI,
        message: dbState === 1
            ? 'KAILASH BHAWAN API is running smoothly'
            : 'Database is not connected. Please verify MONGODB_URI in Vercel Settings and ensure Atlas IP Access List has 0.0.0.0/0 enabled.',
        timestamp: new Date().toISOString(),
    });
});
// Global error handler
app.use(errorHandler_js_1.errorHandler);
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`[KAILASH BHAWAN Server] Server started on port ${PORT}`);
        console.log(`[KAILASH BHAWAN Server] Health check: http://localhost:${PORT}/api/health`);
    });
}
exports.default = app;
