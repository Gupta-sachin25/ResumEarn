import express from 'express';
import { getBalance, getHistory } from '../controllers/coin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/balance', getBalance);
router.get('/history', getHistory);

export default router;

