import { LoanModel } from '../models/loanModel.js';

export const transactionService = {
  async getAllLoans() {
    return await LoanModel.findAll();
  },

  async createLoan(loanData) {
    const validation = LoanModel.validateLoanInput(loanData);
    if (!validation.isValid) {
      const err = new Error(Object.values(validation.errors).join(', '));
      err.status = 400;
      throw err;
    }

    const { book_id, member_id } = loanData;
    return await LoanModel.create({ book_id, member_id });
  },

  async returnLoan(id) {
    const loan = await LoanModel.returnLoan(id);
    if (!loan) {
      const err = new Error('Loan record not found');
      err.status = 404;
      throw err;
    }
    return loan;
  },
};
