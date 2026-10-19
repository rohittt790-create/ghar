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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'KAILASH BHAWAN API is running smoothly',
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
