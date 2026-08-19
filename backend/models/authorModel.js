import lms from '../config/db.js';

export class AuthorModel {
  constructor({ id, first_name, last_name }) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
  }

  static async findAll() {
    const result = await lms.query('SELECT * FROM author ORDER BY id ASC');
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM author WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ first_name, last_name }) {
    const result = await lms.query(
      'INSERT INTO author (first_name, last_name) VALUES ($1, $2) RETURNING *',
      [first_name, last_name]
    );
    return result.rows[0];
  }

  static async update(id, { first_name, last_name }) {
    const result = await lms.query(
      'UPDATE author SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING *',
      [first_name, last_name, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await lms.query('DELETE FROM author WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  static async assignBook(book_id, author_id) {
    const result = await lms.query(
      'INSERT INTO book_author (book_id, author_id) VALUES ($1, $2) RETURNING *',
      [book_id, author_id]
    );
    return result.rows[0];
  }
}
