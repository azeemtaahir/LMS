import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import lms from '../config/db.js';
import { UserModel } from '../models/userModel.js';

export const authService = {
  async signup({ username, email, password, name, role = "member" }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const finalUsername = username || email.split('@')[0];

    const existingUser = await lms.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      const err = new Error('User with this email already exists');
      err.status = 409;
      throw err;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await lms.query(
      'INSERT INTO users (username, email, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name, status, created_at',
      [finalUsername, email, hashedPassword, name || finalUsername]
    );

    const newUser = result.rows[0];

    // Assign default role if available in DB
    try {
      const roleRes = await lms.query('SELECT id FROM roles WHERE role_name = $1', [role.toLowerCase()]);
      if (roleRes.rows.length > 0) {
        await lms.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newUser.id, roleRes.rows[0].id]);
      }
    } catch (roleErr) {
      console.warn("Could not auto-assign role in user_roles:", roleErr.message);
    }

    return newUser;
  },

  async login({ email, password }) {
    const validation = UserModel.validateLoginInput({ email, password });
    if (!validation.isValid) {
      const err = new Error(Object.values(validation.errors).join(', '));
      err.status = 400;
      throw err;
    }

    const result = await lms.query(
      `SELECT u.id, u.member_id, u.username, u.email, u.password_hash, u.name, u.status,
              r.role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const statusLower = user.status ? String(user.status).toLowerCase() : 'active';
    if (statusLower === 'inactive' || statusLower === 'pending') {
      const err = new Error('Your account is inactive or pending approval by an admin.');
      err.status = 403;
      throw err;
    }

    let mappedRole = 'Student';
    if (user.role_name === 'admin') mappedRole = 'Admin';
    else if (user.role_name === 'librarian') mappedRole = 'Librarian';
    else if (user.role_name === 'member') mappedRole = 'Student';

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: mappedRole },
      process.env.JWT_SECRET || 'your_fallback_secret',
      { expiresIn: '2h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        role: mappedRole,
        member_id: user.member_id,
        status: user.status
      },
    };
  },
};
