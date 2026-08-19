import { fineService } from '../services/fineService.js';

export const getFines = async (req, res) => {
  try {
    const fines = await fineService.getAllFines();
    res.status(200).json(fines);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching fines' });
  }
};

export const createFine = async (req, res) => {
  try {
    const fine = await fineService.createFine(req.body);
    res.status(201).json({ message: 'Fine issued', fine });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating fine' });
  }
};

export const payFine = async (req, res) => {
  try {
    const payment = await fineService.payFine(req.body);
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error processing payment' });
  }
};
