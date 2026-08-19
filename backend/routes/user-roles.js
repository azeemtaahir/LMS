import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getUserRolesList,
  assignUserRoleRelation,
  removeUserRoleRelation,
} from '../controller/rbacController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getUserRolesList);
router.post('/', assignUserRoleRelation);
router.delete('/:user_id/:role_id', removeUserRoleRelation);

export default router;