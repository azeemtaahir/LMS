import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getLoans, createLoan, returnLoan, updateLoanDueDate } from '../controller/loanController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLoans);
router.post('/', createLoan);
router.put('/:id/return', returnLoan);
router.put('/:id/extend', updateLoanDueDate);
router.put('/:id', updateLoanDueDate);

export default router;