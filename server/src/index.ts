import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

import mongoose from 'mongoose';

// Ensure DB is connected for all incoming requests (especially serverless cold starts)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Middleware Error]', err);
  }
  next();
});

// API Routes (supports both /api/* and /* for Vercel rewrites)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/owners', '/owners'], ownerRoutes);
app.use(['/api/properties', '/properties'], propertyRoutes);
app.use(['/api/tasks', '/tasks'], taskRoutes);
app.use(['/api/reminders', '/reminders'], reminderRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], async (_req, res) => {
  try {
    await connectDB();
  } catch (e) {}
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    database: states[dbState] || 'unknown',
    hasMongoUri: !!process.env.MONGODB_URI,
    message:
      dbState === 1
        ? 'KAILASH BHAWAN API is running smoothly'
        : 'Database is not connected. Please verify MONGODB_URI in Vercel Settings and ensure Atlas IP Access List has 0.0.0.0/0 enabled.',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[KAILASH BHAWAN Server] Server started on port ${PORT}`);
    console.log(`[KAILASH BHAWAN Server] Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
