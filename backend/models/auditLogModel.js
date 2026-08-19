import lms from '../config/db.js';

export class AuditLogModel {
  constructor({ id, user_id, action, resource, resource_id, details, created_at }) {
    this.id = id;
    this.user_id = user_id;
    this.action = action;
    this.resource = resource;
    this.resource_id = resource_id;
    this.details = details;
    this.created_at = created_at;
  }

  static async findAll() {
    const result = await lms.query('SELECT * FROM audit_log ORDER BY created_at DESC');
    return result.rows;
  }

  static async findByUserId(userId) {
    const result = await lms.query(
      'SELECT * FROM audit_log WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async create({ user_id, action, resource, resource_id, details }) {
    const result = await lms.query(
      `INSERT INTO audit_log
        (user_id, action, resource, resource_id, details)
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, action, resource, resource_id || null, details || null]
    );
    return result.rows[0];
  }
}
