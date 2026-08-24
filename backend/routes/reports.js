import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getReportsAnalytics } from '../controller/reportController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getReportsAnalytics);

export default router;
