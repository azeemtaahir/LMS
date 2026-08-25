import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getFines, createFine, payFine, updateFine } from '../controller/fineController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getFines);
router.post('/', createFine);
router.post('/pay', payFine);
router.put('/:id', updateFine);

export default router;