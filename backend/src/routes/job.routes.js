import express from 'express';
import {
  searchJobs,
  getJobById,
  submitJob,
  createHirerJob,
  getHirerJobs
} from '../controllers/job.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// User search & view
router.post('/search', searchJobs);
router.get('/:id', getJobById);

// User job submission (Earn coins)
router.post('/submit', submitJob);

// Hirer job management
router.post('/hirer/post', requireRole('HIRER', 'ADMIN'), createHirerJob);
router.get('/hirer/my-jobs', requireRole('HIRER', 'ADMIN'), getHirerJobs);

export default router;

