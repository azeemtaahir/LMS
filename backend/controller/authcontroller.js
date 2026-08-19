import { authService } from '../services/authService.js';

export const signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error registering user' });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error logging in' });
  }
};