import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import patientsRoutes from './modules/patients/patients.routes.js';
import plansRoutes from './modules/plans/plans.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/plans', plansRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

export default app;

