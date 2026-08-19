import express from 'express';
import {
  getLibrarians,
  createLibrarian,
  updateLibrarian,
  deleteLibrarian,
} from '../controller/librarianController.js';

const router = express.Router();

router.get('/', getLibrarians);
router.post('/', createLibrarian);
router.put('/:id', updateLibrarian);
router.delete('/:id', deleteLibrarian);

export default router;
