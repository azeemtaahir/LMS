import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controller/bookController.js';

const router = express.Router();

// Apply JWT authentication middleware to all endpoints in this router
router.use(authenticateToken);

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;