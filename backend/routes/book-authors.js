import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getBookAuthors,
  createBookAuthorLink,
  deleteBookAuthorLink,
} from '../controller/bookAuthorController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getBookAuthors);
router.post('/', createBookAuthorLink);
router.delete('/', deleteBookAuthorLink);

export default router;