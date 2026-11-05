import express from 'express';
import {
  toggleSaveJob,
  getUserApplications,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/application.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/toggle-save/:jobId', toggleSaveJob);
router.get('/', getUserApplications);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;

