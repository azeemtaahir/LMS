import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getPermissions,
  createPermission,
  deletePermission,
} from '../controller/rbacController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPermissions);
router.post('/', createPermission);
router.delete('/:id', deletePermission);

export default router;