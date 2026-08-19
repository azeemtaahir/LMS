import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getAuditLogs,
  getUserAuditLogs,
  createAuditLog,
} from '../controller/auditLogController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAuditLogs);
router.get('/user/:userId', getUserAuditLogs);
router.post('/', createAuditLog);

export default router;