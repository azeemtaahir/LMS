import bcrypt from 'bcryptjs';
import lms from '../config/db.js';

export const librarianService = {
  async ensureLibrarianRole() {
    try {
      const res = await lms.query("SELECT id FROM roles WHERE LOWER(role_name) = 'librarian'");
      if (res.rows.length === 0) {
        const newRole = await lms.query(
          "INSERT INTO roles (role_name, description) VALUES ('librarian', 'Standard Librarian Access') RETURNING id"
        );
        return newRole.rows[0].id;
      }
      return res.rows[0].id;
    } catch (e) {
      console.warn("Librarian role query warning:", e.message);
      return null;
    }
  },

  async getAllLibrarians() {
    try {
      const result = await lms.query(`
        SELECT u.id, u.member_id AS "librarianId", u.name, u.email, u.status, u.created_at AS "joinedDate"
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE LOWER(r.role_name) = 'librarian' OR u.email LIKE '%librarian%'
        ORDER BY u.id ASC
      `);
      return result.rows;
    } catch (err) {
      console.error("Error in getAllLibrarians:", err);
      return [];
    }
  },

  async createLibrarian(data) {
    const email = data.email;
    const password = data.password || "librarian123";
    const name = data.fullName || data.name || email.split("@")[0];
    const librarianId = data.librarianId || data.member_id || `LIB-${Date.now().toString().slice(-4)}`;
    const username = email.split("@")[0];

    if (!email) {
      const err = new Error("Librarian email is required");
      err.status = 400;
      throw err;
    }

    // Check if user already exists
    const existing = await lms.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      const err = new Error("User with this email already exists");
      err.status = 409;
      throw err;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const userRes = await lms.query(
      `INSERT INTO users (member_id, username, email, password_hash, name, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, member_id AS "librarianId", username, email, name, status, created_at AS "joinedDate"`,
      [librarianId, username, email, password_hash, name, 'active']
    );

    const newLibrarian = userRes.rows[0];

    // Assign Librarian Role
    const roleId = await this.ensureLibrarianRole();
    if (roleId && newLibrarian.id) {
      try {
        await lms.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [newLibrarian.id, roleId]
        );
      } catch (roleErr) {
        console.warn("Could not assign librarian role:", roleErr.message);
      }
    }

    return {
      ...newLibrarian,
      shift: data.shift || "Morning",
      accessLevel: data.accessLevel || "Standard Librarian",
      phone: data.phone || "",
    };
  },

  async deleteLibrarian(id) {
    const result = await lms.query("DELETE FROM users WHERE id = $1 RETURNING id, email, name", [id]);
    return result.rows[0] || null;
  }
};
