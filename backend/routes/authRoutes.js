// routes/authRoutes.js
import express from 'express';
import { signup, login } from '../controller/authcontroller.js';

const router = express.Router();

// =======================================================
// AUTH ROUTES
// Mounted in server.js at: app.use('/api/auth', authRouter)
// =======================================================

// 1. SIGNUP ROUTE
// Full URL: POST http://localhost:6021/api/auth/signup
// Expects body: { username, email, password }
router.post('/signup', signup);

// 2. LOGIN ROUTE
// Full URL: POST http://localhost:6021/api/auth/login
// Expects body: { email, password }
router.post('/login', login);

export default router;