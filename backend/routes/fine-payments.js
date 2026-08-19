import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getFinePayments,
  getFinePaymentById,
  createFinePayment,
  deleteFinePayment,
} from '../controller/finePaymentController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getFinePayments);
router.get('/:id', getFinePaymentById);
router.post('/', createFinePayment);
router.delete('/:id', deleteFinePayment);

export default router;