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
