import express from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;

