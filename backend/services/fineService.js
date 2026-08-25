import { FineModel } from '../models/fineModel.js';

export const fineService = {
  async getAllFines() {
    return await FineModel.findAll();
  },

  async createFine({ member_id, loan_id, fine_amount }) {
    return await FineModel.create({ member_id, loan_id, fine_amount });
  },

  async payFine(data) {
    return await FineModel.payFine(data);
  },

  async updateFine(data) {
    return await FineModel.updateFineAmount(data);
  }
};

