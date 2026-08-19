import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';

// Existing Route Imports
import bookRoutes from './routes/books.js';
import authorRoutes from './routes/authors.js';
import bookAuthorRoutes from './routes/book-authors.js';
import memberRoutes from './routes/member.js';
import loanRoutes from './routes/loans.js';
import reservationRoutes from './routes/reservations.js';
import fineRoutes from './routes/fines.js';
import userRoutes from './routes/users.js';

// New PBAC, Payment & Audit Log Route Imports
import finePaymentRoutes from './routes/fine-payments.js';
import roleRoutes from './routes/roles.js';
import permissionRoutes from './routes/permissions.js';
import userRoleRoutes from './routes/user-roles.js';
import rolePermissionRoutes from './routes/role-permissions.js';
import auditLogRoutes from './routes/audit-logs.js';
import librarianRoutes from './routes/librarians.js';

// ==========================================
// 1. AUTH ROUTE IMPORT
// Import the auth router containing router.post('/signup') and router.post('/login')
// ==========================================
import authRouter from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 6021;

// ==========================================
// 2. CORS MIDDLEWARE
// Allows your frontend on http://localhost:5173 to talk to this backend
// ==========================================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());

// Catch malformed JSON body errors gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      message: 'Invalid JSON payload sent in request body. Check your quotes and commas.' 
    });
  }
  next();
});

// Existing API Routes
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/book-authors', bookAuthorRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/librarians', librarianRoutes);

// New API Routes
app.use('/api/fine-payments', finePaymentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// ==========================================
// 3. AUTH API ROUTE ATTACHMENT
// Base Path: /api/auth
// ------------------------------------------
// How path matching works:
//  - POST to /api/auth/signup  --> triggers signup() in authcontroller.js
//  - POST to /api/auth/login   --> triggers login() in authcontroller.js
// ==========================================
app.use('/api/auth', authRouter);

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});