import lms from '../config/db.js';

export class FinePaymentModel {
  constructor({ id, member_id, payment_date, payment_amount }) {
    this.id = id;
    this.member_id = member_id;
    this.payment_date = payment_date;
    this.payment_amount = payment_amount;
  }

  static async findAll() {
    try {
      const result = await lms.query(`
        SELECT 
          fp.id,
          fp.member_id,
          TO_CHAR(fp.payment_date, 'YYYY-MM-DD') AS "payment_date",
          fp.payment_amount,
          COALESCE(TRIM(CONCAT(m.first_name, ' ', m.last_name)), m.email, 'Member') AS "studentName",
          m.user_id AS "studentId",
          COALESCE(b.title, 'Overdue Book') AS "bookTitle",
          'Paid' AS status
        FROM fine_payment fp
        LEFT JOIN member m ON fp.member_id = m.id
        LEFT JOIN LATERAL (
          SELECT f.loan_id FROM fine f WHERE f.member_id = fp.member_id ORDER BY f.id DESC LIMIT 1
        ) f ON true
        LEFT JOIN loan l ON f.loan_id = l.id
        LEFT JOIN book b ON l.book_id = b.id
        ORDER BY fp.id DESC
      `);
      return result.rows;
    } catch (err) {
      const result = await lms.query('SELECT * FROM fine_payment ORDER BY id DESC');
      return result.rows;
    }
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
