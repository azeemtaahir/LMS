import lms from '../config/db.js';

export class BookModel {
  constructor({
    id,
    title,
    category,
    publication_year,
    copies_owned = 0,
    isbn = "",
    author = "",
    description = "",
    publisher = "",
    edition = "",
    shelf_number = "",
    shelfNumber = "",
  }) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.publication_year = publication_year;
    this.copies_owned = copies_owned;
    this.isbn = isbn;
    this.author = author;
    this.description = description;
    this.publisher = publisher;
    this.edition = edition;
    this.shelf_number = shelf_number || shelfNumber;
    this.shelfNumber = shelfNumber || shelf_number;
  }

  static async ensureColumnsExist() {
    try {
      await lms.query(`
        ALTER TABLE book 
        ADD COLUMN IF NOT EXISTS isbn VARCHAR(255),
        ADD COLUMN IF NOT EXISTS publisher VARCHAR(255),
        ADD COLUMN IF NOT EXISTS edition VARCHAR(255),
        ADD COLUMN IF NOT EXISTS shelf_number VARCHAR(255),
        ADD COLUMN IF NOT EXISTS cover_image TEXT;
      `);

      const check = await lms.query('SELECT COUNT(*) FROM book');
      if (parseInt(check.rows[0].count, 10) === 0) {
        await lms.query(`
          INSERT INTO book (title, category, publication_year, copies_owned, isbn, publisher, edition, shelf_number)
          VALUES 
          ('Clean Code: A Handbook of Agile Software Craftsmanship', 'Computer Science', 2008, 5, '978-0132350884', 'Prentice Hall', '1st Edition', 'CS-A1'),
          ('The Selfish Gene', 'Science & Technology', 2006, 3, '978-0199291151', 'Oxford University Press', '3rd Edition', 'SCI-B2'),
          ('The C++ Programming Language', 'Computer Science', 2013, 4, '978-0321563842', 'Addison-Wesley', '4th Edition', 'CS-C3'),
          ('Refactoring: Improving Design of Existing Code', 'Computer Science', 2018, 2, '978-0134757599', 'Addison-Wesley', '2nd Edition', 'CS-A2');
        `);
      }

      // Sync sequence with MAX(id) to avoid duplicate key violations on INSERT
      try {
        await lms.query(`
          DO $$ 
          DECLARE 
            seq text; 
          BEGIN 
            seq := pg_get_serial_sequence('book', 'id'); 
            IF seq IS NOT NULL THEN 
              PERFORM setval(seq, COALESCE((SELECT MAX(id) FROM book), 1)); 
            END IF; 
          END $$;
        `);
      } catch (seqErr) {
        console.warn("Sequence setval warning:", seqErr.message);
      }
    } catch (e) {
      console.warn("Table alter/seed check warning:", e.message);
    }
  }

  static validateBookInput(data) {
    const errors = {};
    if (!data || !data.title || !data.title.trim()) {
      errors.title = "Book title is required";
    }
    if (data && data.copies_owned !== undefined && data.copies_owned < 0) {
      errors.copies_owned = "Copies owned cannot be negative";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static async findAll() {
    await BookModel.ensureColumnsExist();
    const result = await lms.query(`
      SELECT b.id, b.title, b.category, b.publication_year, 
             COALESCE(b.copies_owned, 0) AS copies_owned,
             COALESCE(b.copies_owned, 0) AS "totalQuantity",
             COALESCE(b.copies_owned, 0) AS "availableCopies",
             CASE WHEN COALESCE(b.copies_owned, 0) > 0 THEN 'Available' ELSE 'Out of Stock' END AS status,
             COALESCE(b.isbn, '') AS isbn,
             COALESCE(b.publisher, '') AS publisher,
             COALESCE(b.edition, '') AS edition,
             COALESCE(b.shelf_number, '') AS "shelfNumber",
             COALESCE(b.shelf_number, '') AS shelf_number,
             COALESCE(b.cover_image, '') AS "coverImage",
             COALESCE((
               SELECT STRING_AGG(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ', ')
               FROM book_author ba
               JOIN author a ON ba.author_id = a.id
               WHERE ba.book_id = b.id
             ), 'Unknown Author') AS author
      FROM book b
      ORDER BY b.id ASC
    `);
    return result.rows;
  }

  static async findById(id) {
    await BookModel.ensureColumnsExist();
    const result = await lms.query(`
      SELECT b.id, b.title, b.category, b.publication_year, 
             COALESCE(b.copies_owned, 0) AS copies_owned,
             COALESCE(b.copies_owned, 0) AS "totalQuantity",
             COALESCE(b.copies_owned, 0) AS "availableCopies",
             CASE WHEN COALESCE(b.copies_owned, 0) > 0 THEN 'Available' ELSE 'Out of Stock' END AS status,
             COALESCE(b.isbn, '') AS isbn,
             COALESCE(b.publisher, '') AS publisher,
             COALESCE(b.edition, '') AS edition,
             COALESCE(b.shelf_number, '') AS "shelfNumber",
             COALESCE(b.shelf_number, '') AS shelf_number,
             COALESCE(b.cover_image, '') AS "coverImage",
             COALESCE((
               SELECT STRING_AGG(TRIM(CONCAT(a.first_name, ' ', a.last_name)), ', ')
               FROM book_author ba
               JOIN author a ON ba.author_id = a.id
               WHERE ba.book_id = b.id
             ), 'Unknown Author') AS author
      FROM book b
      WHERE b.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create({ title, category, publication_year, copies_owned, totalQuantity, author, isbn, publisher, edition, shelfNumber, shelf_number, coverImage, cover_image }) {
    await BookModel.ensureColumnsExist();
    const qty = Number(copies_owned ?? totalQuantity ?? 1);
    const pubYear = Number(publication_year || new Date().getFullYear());
    const shelf = shelfNumber || shelf_number || '';
    const img = coverImage || cover_image || '';

    const result = await lms.query(
      `INSERT INTO book (title, category, publication_year, copies_owned, isbn, publisher, edition, shelf_number, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, category || 'General', pubYear, qty, isbn || '', publisher || '', edition || '', shelf, img]
    );
    const newBook = result.rows[0];

    if (author && author.trim()) {
      try {
        const parts = author.trim().split(' ');
        const firstName = parts[0] || 'Unknown';
        const lastName = parts.slice(1).join(' ') || 'Author';

        const authRes = await lms.query(
          `INSERT INTO author (first_name, last_name) VALUES ($1, $2) RETURNING id`,
          [firstName, lastName]
        );
        const authorId = authRes.rows[0].id;

        await lms.query(
          `INSERT INTO book_author (book_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newBook.id, authorId]
        );
      } catch (err) {
        console.warn("Author mapping warning:", err.message);
      }
    }

    return {
      ...newBook,
      author: author || 'Unknown Author',
      shelfNumber: newBook.shelf_number || shelf,
      totalQuantity: newBook.copies_owned,
      availableCopies: newBook.copies_owned,
      status: newBook.copies_owned > 0 ? 'Available' : 'Out of Stock'
    };
  }

  static async update(id, { title, category, publication_year, copies_owned, totalQuantity, author, isbn, publisher, edition, shelfNumber, shelf_number }) {
    await BookModel.ensureColumnsExist();
    const qty = Number(copies_owned ?? totalQuantity ?? 1);
    const pubYear = Number(publication_year || new Date().getFullYear());
    const shelf = shelfNumber || shelf_number || '';

    const result = await lms.query(
      `UPDATE book
       SET title = $1, category = $2, publication_year = $3, copies_owned = $4,
           isbn = $5, publisher = $6, edition = $7, shelf_number = $8
       WHERE id = $9 RETURNING *`,
      [title, category || 'General', pubYear, qty, isbn || '', publisher || '', edition || '', shelf, id]
    );

    if (author && author.trim()) {
      try {
        const parts = author.trim().split(' ');
        const firstName = parts[0] || 'Unknown';
        const lastName = parts.slice(1).join(' ') || 'Author';

        const authRes = await lms.query(
          `INSERT INTO author (first_name, last_name) VALUES ($1, $2) RETURNING id`,
          [firstName, lastName]
        );
        const authorId = authRes.rows[0].id;

        await lms.query(`DELETE FROM book_author WHERE book_id = $1`, [id]);
        await lms.query(
          `INSERT INTO book_author (book_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, authorId]
        );
      } catch (err) {
        console.warn("Author update warning:", err.message);
      }
    }

    const updatedBook = result.rows[0];
    return updatedBook ? {
      ...updatedBook,
      author: author || 'Unknown Author',
      shelfNumber: updatedBook.shelf_number || shelf,
      totalQuantity: updatedBook.copies_owned,
      availableCopies: updatedBook.copies_owned,
      status: updatedBook.copies_owned > 0 ? 'Available' : 'Out of Stock'
    } : null;
  }

  static async delete(id) {
    const result = await lms.query('DELETE FROM book WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
