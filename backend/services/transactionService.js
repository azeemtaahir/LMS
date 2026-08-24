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

    const rawBookId = loanData.book_id || loanData.bookId;
    const rawMemberId = loanData.member_id || loanData.memberId || loanData.studentId;

    const book_id = Number(rawBookId) || rawBookId;
    const member_id = Number(rawMemberId) || rawMemberId;

    return await LoanModel.create(loanData);
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

  async updateDueDate(id, dueDate) {
    const loan = await LoanModel.updateDueDate(id, dueDate);
    if (!loan) {
      const err = new Error('Loan record not found');
      err.status = 404;
      throw err;
    }
    return loan;
  },
};
