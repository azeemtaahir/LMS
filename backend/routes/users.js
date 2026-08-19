import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getUsers,
  getUserRoles,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  createUserRole,
  assignUserRole,
} from '../controller/userController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/roles', getUserRoles);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);
router.post('/roles', createUserRole);
router.post('/assign-role', assignUserRole);

export default router;