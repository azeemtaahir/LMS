import express from 'express';
import {
  getLibrarians,
  createLibrarian,
  deleteLibrarian,
} from '../controller/librarianController.js';

const router = express.Router();

router.get('/', getLibrarians);
router.post('/', createLibrarian);
router.delete('/:id', deleteLibrarian);

export default router;
