import express from 'express';
import { uploadMiddleware, uploadAndAnalyzeResume } from '../controllers/resume.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload', authMiddleware, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadAndAnalyzeResume);

export default router;

