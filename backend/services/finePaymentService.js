import { FinePaymentModel } from '../models/finePaymentModel.js';

export const finePaymentService = {
  async getAllFinePayments() {
    return await FinePaymentModel.findAll();
  },

  async getFinePaymentById(id) {
    return await FinePaymentModel.findById(id);
  },

  async createFinePayment(data) {
    const { member_id, payment_amount } = data;
    if (!member_id || payment_amount === undefined) {
      const err = new Error('member_id and payment_amount are required');
      err.status = 400;
      throw err;
    }
    return await FinePaymentModel.create(data);
  },

  async deleteFinePayment(id) {
    const payment = await FinePaymentModel.delete(id);
    if (!payment) {
      const err = new Error('Payment not found');
      err.status = 404;
      throw err;
    }
    return payment;
  }
};
