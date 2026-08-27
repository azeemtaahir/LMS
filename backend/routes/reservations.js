import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getReservations,
  createReservation,
  updateReservationStatus,
} from '../controller/reservationController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getReservations);
router.post('/', createReservation);
router.patch('/:id/status', updateReservationStatus);

export default router;