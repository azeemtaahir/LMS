import { reservationService } from '../services/reservationService.js';

export const getReservations = async (req, res) => {
  try {
    const reservations = await reservationService.getAllReservations();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching reservations' });
  }
};

export const createReservation = async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.status(201).json({ message: 'Reservation created', reservation });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating reservation' });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const reservation = await reservationService.updateReservationStatus(req.params.id, req.body.status);
    res.status(200).json({ message: 'Reservation updated', reservation });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating reservation' });
  }
};
