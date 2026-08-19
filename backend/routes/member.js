import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from '../controller/memberController.js';

const router = express.Router();

router.get('/', authenticateToken, getMembers);
router.get('/:id', authenticateToken, getMemberById);
router.post('/', createMember);
router.put('/:id', authenticateToken, updateMember);
router.delete('/:id', authenticateToken, deleteMember);

export default router;