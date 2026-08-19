import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  assignBookToAuthor,
} from '../controller/authorController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAuthors);
router.get('/:id', getAuthorById);
router.post('/', createAuthor);
router.put('/:id', updateAuthor);
router.delete('/:id', deleteAuthor);
router.post('/assign-book', assignBookToAuthor);

export default router;