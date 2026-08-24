import { transactionService } from '../services/transactionService.js';

export const getLoans = async (req, res) => {
  try {
    const loans = await transactionService.getAllLoans();
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
};

export const createLoan = async (req, res) => {
  try {
    const loan = await transactionService.createLoan(req.body);
    res.status(201).json({ message: 'Loan created', loan });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating loan' });
  }
};

export const returnLoan = async (req, res) => {
  try {
    const loan = await transactionService.returnLoan(req.params.id);
    res.status(200).json({ message: 'Book returned', loan });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating return date' });
  }
};

export const updateLoanDueDate = async (req, res) => {
  try {
    const dueDate = req.body.due_date || req.body.dueDate || req.body.returnDate;
    if (!dueDate) {
      return res.status(400).json({ message: 'due_date is required' });
    }
    const loan = await transactionService.updateDueDate(req.params.id, dueDate);
    res.status(200).json({ message: 'Loan due date updated', loan });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating due date' });
  }
};
