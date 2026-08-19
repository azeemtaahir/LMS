import lms from '../config/db.js';

export class ReservationModel {
  constructor({ id, book_id, member_id, status, reservation_date }) {
    this.id = id;
    this.book_id = book_id;
    this.member_id = member_id;
    this.status = status;
    this.reservation_date = reservation_date;
  }

  static async findAll() {
    const result = await lms.query('SELECT * FROM reservation ORDER BY id DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM reservation WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ book_id, member_id }) {
    const result = await lms.query(
      'INSERT INTO reservation (book_id, member_id) VALUES ($1, $2) RETURNING *',
      [book_id, member_id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await lms.query(
      'UPDATE reservation SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }
}
