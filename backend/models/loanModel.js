import lms from '../config/db.js';

export class LoanModel {
  constructor({ id, book_id, member_id, loan_date, returned_date }) {
    this.id = id;
    this.book_id = book_id;
    this.member_id = member_id;
    this.loan_date = loan_date;
    this.returned_date = returned_date;
  }

  static validateLoanInput(data) {
    const errors = {};
    if (!data || !data.book_id) {
      errors.book_id = "book_id is required";
    }
    if (!data || !data.member_id) {
      errors.member_id = "member_id is required";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static async findAll() {
    const result = await lms.query('SELECT * FROM loan ORDER BY id DESC');
    return result.rows;
  }

  static async create({ book_id, member_id }) {
    const result = await lms.query(
      'INSERT INTO loan (book_id, member_id) VALUES ($1, $2) RETURNING *',
      [book_id, member_id]
    );
    return result.rows[0];
  }

  static async returnLoan(id) {
    const result = await lms.query(
      'UPDATE loan SET returned_date = CURRENT_DATE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
}
