import lms from '../config/db.js';

export class MemberModel {
  constructor({ id, first_name, last_name, joined_date, status }) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.joined_date = joined_date;
    this.status = status;
  }

  static async findAll() {
    try {
      const result = await lms.query(`
        SELECT 
          m.id,
          COALESCE(m.user_id, u.username, CONCAT('MEM-', m.id)) AS "studentId",
          m.user_id,
          m.first_name,
          m.last_name,
          CONCAT(m.first_name, ' ', m.last_name) AS "name",
          COALESCE(m.email, u.email, CONCAT(LOWER(m.first_name), '@library.com')) AS "email",
          COALESCE(m.role, 'Student') AS "role",
          m.joined_date,
          m.status
        FROM member m
        LEFT JOIN users u ON u.member_id = m.id
        ORDER BY m.id DESC
      `);
      return result.rows;
    } catch (e) {
      const result = await lms.query('SELECT * FROM member ORDER BY id DESC');
      return result.rows;
    }
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM member WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ user_id, first_name, last_name, email, role, password_hash, joined_date, status }) {
    const safeJoinedDate = joined_date || new Date().toISOString().split('T')[0];
    const safeStatus = status || 'active';
    const safeRole = role || 'Student';
    let result;
    try {
      result = await lms.query(
        'INSERT INTO member (user_id, first_name, last_name, email, role, password_hash, joined_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [user_id || null, first_name, last_name, email || null, safeRole, password_hash || null, safeJoinedDate, safeStatus]
      );
    } catch (dbErr) {
      try {
        result = await lms.query(
          'INSERT INTO member (user_id, first_name, last_name, role, password_hash, joined_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [user_id || null, first_name, last_name, safeRole, password_hash || null, safeJoinedDate, safeStatus]
        );
      } catch (e) {
        result = await lms.query(
          'INSERT INTO member (first_name, last_name, joined_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [first_name, last_name, safeJoinedDate, safeStatus]
        );
      }
    }
    return result.rows[0];
  }

  static async update(id, { first_name, last_name, email, role, joined_date, status }) {
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();
    let result;
    try {
      result = await lms.query(
        `UPDATE member 
         SET first_name = COALESCE($1, first_name), 
             last_name = COALESCE($2, last_name), 
             email = COALESCE($3, email),
             role = COALESCE($4, role),
             joined_date = COALESCE($5, joined_date), 
             status = COALESCE($6, status) 
         WHERE id = $7 RETURNING *`,
        [first_name || null, last_name || null, email || null, role || null, joined_date || null, status || null, id]
      );
    } catch (err) {
      result = await lms.query(
        `UPDATE member 
         SET first_name = COALESCE($1, first_name), 
             last_name = COALESCE($2, last_name), 
             joined_date = COALESCE($3, joined_date), 
             status = COALESCE($4, status) 
         WHERE id = $5 RETURNING *`,
        [first_name || null, last_name || null, joined_date || null, status || null, id]
      );
    }

    if (id) {
      try {
        await lms.query(
          `UPDATE users
           SET name = COALESCE($1, name),
               email = COALESCE($2, email),
               status = COALESCE($3, status)
           WHERE member_id = $4`,
          [fullName || null, email || null, status || null, id]
        );
      } catch (uErr) {
        console.warn("Linked user update warning:", uErr.message);
      }
    }

    const updated = result.rows[0];
    return updated ? {
      ...updated,
      studentId: updated.user_id || `MEM-${updated.id}`,
      name: `${updated.first_name || ''} ${updated.last_name || ''}`.trim() || fullName,
      email: updated.email || email,
      role: updated.role || role || 'Student',
    } : null;
  }

  static async delete(id) {
    const result = await lms.query('DELETE FROM member WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
