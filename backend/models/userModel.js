import lms from '../config/db.js';

export class UserModel {
  constructor({ id, email, username, status, created_at, role = "Student", studentId = "", department = "" }) {
    this.id = id;
    this.email = email;
    this.username = username || email?.split("@")[0] || "";
    this.status = status || "active";
    this.created_at = created_at;
    this.role = role;
    this.studentId = studentId;
    this.department = department;
  }

  static validateLoginInput(credentials) {
    const errors = {};
    if (!credentials || !credentials.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = "Invalid email format";
    }

    if (!credentials || !credentials.password) {
      errors.password = "Password is required";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateUserInput(data) {
    const errors = {};
    if (!data || !data.name || !data.name.trim()) {
      errors.name = "Full name is required";
    }
    if (!data || !data.studentId || !data.studentId.trim()) {
      errors.studentId = data?.role === "Teacher" ? "Teacher / Employee ID is required" : "Student ID is required";
    }
    if (!data || !data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Valid email is required";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static async findAll() {
    const result = await lms.query(`
      SELECT id, member_id, username, email, status, name, created_at
      FROM users
      ORDER BY id ASC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query(
      `SELECT id, member_id, username, email, status, name, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ member_id, username, password_hash, email, status, name }) {
    const result = await lms.query(
      `INSERT INTO users 
        (member_id, username, password_hash, email, status, name)
       VALUES 
        ($1, $2, $3, $4, $5, $6)
       RETURNING id, member_id, username, email, status, name, created_at`,
      [member_id || null, username, password_hash, email, status || 'active', name || username]
    );
    return result.rows[0];
  }

  static async update(id, { username, email, status, name }) {
    const result = await lms.query(
      `UPDATE users
       SET username = $1, email = $2, status = $3, name = $4
       WHERE id = $5
       RETURNING id, member_id, username, email, status, name, created_at`,
      [username, email, status, name, id]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id, status) {
    const result = await lms.query(
      `UPDATE users
       SET status = $1
       WHERE id = $2
       RETURNING id, username, email, status`,
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await lms.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username, email`,
      [id]
    );
    return result.rows[0] || null;
  }
}
