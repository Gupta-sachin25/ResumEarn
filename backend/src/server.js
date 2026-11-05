import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import profileRoutes from './routes/profile.routes.js';
import coinRoutes from './routes/coin.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Configure CORS for both local development and production Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production deployment
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'InternMatch AI API is running with Coin System, AI Job Discovery, and Application Tracker',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
