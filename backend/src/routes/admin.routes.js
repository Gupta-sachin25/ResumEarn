import express from 'express';
import {
  getStats,
  getSubmissions,
  updateJobStatus,
  deleteJob,
  getUsers,
  adjustUserCoins
} from '../controllers/admin.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce ADMIN role authentication
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/stats', getStats);
router.get('/submissions', getSubmissions);
router.patch('/submissions/:id', updateJobStatus);
router.delete('/submissions/:id', deleteJob);
router.get('/users', getUsers);
router.post('/adjust-coins', adjustUserCoins);

export default router;

