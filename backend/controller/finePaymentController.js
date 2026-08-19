import { finePaymentService } from '../services/finePaymentService.js';

export const getFinePayments = async (req, res) => {
  try {
    const payments = await finePaymentService.getAllFinePayments();
    res.status(200).json({
      message: 'Fine payments fetched successfully',
      payments
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching fine payments' });
  }
};

export const getFinePaymentById = async (req, res) => {
  try {
    const payment = await finePaymentService.getFinePaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({
      message: 'Fine payment fetched successfully',
      payment
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching fine payment' });
  }
};

export const createFinePayment = async (req, res) => {
  try {
    const payment = await finePaymentService.createFinePayment(req.body);
    res.status(201).json({
      message: 'Fine payment created successfully',
      payment
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating fine payment' });
  }
};

export const deleteFinePayment = async (req, res) => {
  try {
    const payment = await finePaymentService.deleteFinePayment(req.params.id);
    res.status(200).json({
      message: 'Fine payment deleted successfully',
      payment
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting fine payment' });
  }
};
