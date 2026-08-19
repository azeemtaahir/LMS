import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getRolePermissionsList,
  assignRolePermissionRelation,
  removeRolePermissionRelation,
} from '../controller/rbacController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getRolePermissionsList);
router.post('/', assignRolePermissionRelation);
router.delete('/', removeRolePermissionRelation);

export default router;