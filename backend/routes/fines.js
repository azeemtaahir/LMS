import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getFines, createFine, payFine } from '../controller/fineController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getFines);
router.post('/', createFine);
router.post('/pay', payFine);

export default router;