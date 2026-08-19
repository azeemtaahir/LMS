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
    const result = await lms.query('SELECT * FROM member ORDER BY id ASC');
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM member WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ first_name, last_name, joined_date, status }) {
    const safeJoinedDate = joined_date || new Date().toISOString().split('T')[0];
    const safeStatus = status || 'active';
    const result = await lms.query(
      'INSERT INTO member (first_name, last_name, joined_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, safeJoinedDate, safeStatus]
    );
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
