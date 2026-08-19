import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controller/rbacController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;