import { ReservationModel } from '../models/reservationModel.js';

export const reservationService = {
  async getAllReservations() {
    return await ReservationModel.findAll();
  },

  async createReservation({ book_id, member_id }) {
    return await ReservationModel.create({ book_id, member_id });
  },

  async updateReservationStatus(id, status) {
    const reservation = await ReservationModel.updateStatus(id, status);
    if (!reservation) {
      const err = new Error('Reservation not found');
      err.status = 404;
      throw err;
    }
    return reservation;
  }
};
