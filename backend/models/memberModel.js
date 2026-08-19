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

  static async update(id, { first_name, last_name, joined_date, status }) {
    const result = await lms.query(
      'UPDATE member SET first_name = $1, last_name = $2, joined_date = $3, status = $4 WHERE id = $5 RETURNING *',
      [first_name, last_name, joined_date, status, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await lms.query('DELETE FROM member WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
