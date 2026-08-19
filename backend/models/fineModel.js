import lms from '../config/db.js';

export class FineModel {
  constructor({ id, member_id, loan_id, fine_amount, status }) {
    this.id = id;
    this.member_id = member_id;
    this.loan_id = loan_id;
    this.fine_amount = fine_amount;
    this.status = status;
  }

  static async findAll() {
    const result = await lms.query('SELECT * FROM fine ORDER BY id DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM fine WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ member_id, loan_id, fine_amount }) {
    const result = await lms.query(
      'INSERT INTO fine (member_id, loan_id, fine_amount) VALUES ($1, $2, $3) RETURNING *',
      [member_id, loan_id, fine_amount]
    );
    return result.rows[0];
  }

  static async payFine({ member_id, payment_amount }) {
    const result = await lms.query(
      'INSERT INTO fine_payment (member_id, payment_amount) VALUES ($1, $2) RETURNING *',
      [member_id, payment_amount]
    );
    return result.rows[0];
  }
}
