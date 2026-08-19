import lms from '../config/db.js';

export class FinePaymentModel {
  constructor({ id, member_id, payment_date, payment_amount }) {
    this.id = id;
    this.member_id = member_id;
    this.payment_date = payment_date;
    this.payment_amount = payment_amount;
  }

  static async findAll() {
    const result = await lms.query('SELECT * FROM fine_payment ORDER BY id ASC');
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM fine_payment WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ member_id, payment_date, payment_amount }) {
    const result = await lms.query(
      `INSERT INTO fine_payment (member_id, payment_date, payment_amount)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3)
       RETURNING *`,
      [member_id, payment_date || null, payment_amount]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await lms.query('DELETE FROM fine_payment WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
