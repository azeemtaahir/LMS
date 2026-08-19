import lms from '../config/db.js';

export class BookAuthorModel {
  static async findAll() {
    const query = `
      SELECT 
        ba.book_id,
        b.title AS book_title,
        ba.author_id,
        a.first_name || ' ' || a.last_name AS author_name
      FROM book_author ba
      JOIN book b ON ba.book_id = b.id
      JOIN author a ON ba.author_id = a.id
      ORDER BY ba.book_id ASC;
    `;
    const result = await lms.query(query);
    return result.rows;
  }

  static async create(book_id, author_id) {
    const result = await lms.query(
      `INSERT INTO book_author (book_id, author_id) VALUES ($1, $2) RETURNING *`,
      [book_id, author_id]
    );
    return result.rows[0];
  }

  static async delete(book_id, author_id) {
    const result = await lms.query(
      `DELETE FROM book_author WHERE book_id = $1 AND author_id = $2 RETURNING *`,
      [book_id, author_id]
    );
    return result.rows[0] || null;
  }
}
