import lms from '../config/db.js';
import { FineModel } from './fineModel.js';

export class LoanModel {
  constructor({ id, book_id, member_id, loan_date, due_date, returned_date }) {
    this.id = id;
    this.book_id = book_id;
    this.member_id = member_id;
    this.loan_date = loan_date;
    this.due_date = due_date;
    this.returned_date = returned_date;
  }

  static validateLoanInput(data) {
    const errors = {};
    if (!data || !(data.book_id || data.bookId)) {
      errors.book_id = "book_id is required";
    }
    if (!data || !(data.member_id || data.studentId)) {
      errors.member_id = "member_id is required";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static async findAll() {
    // Synchronize fines first to ensure DB persistence
    await FineModel.syncOverdueFines();

    const result = await lms.query(`
      SELECT 
        l.id,
        l.book_id,
        l.member_id,
        l.loan_date,
        l.due_date,
        l.returned_date,
        b.title AS "bookTitle",
        b.title AS "book_title",
        COALESCE(TRIM(CONCAT(m.first_name, ' ', m.last_name)), m.email, 'Student') AS "studentName",
        m.user_id AS "studentId",
        CASE 
          WHEN l.returned_date IS NOT NULL OR f.status = 'Paid' THEN 'Returned' 
          WHEN CURRENT_DATE > COALESCE(l.due_date, (l.loan_date + 14)::date) THEN 'Overdue'
          ELSE 'Issued' 
        END AS status,
        TO_CHAR(l.loan_date, 'YYYY-MM-DD') AS "issueDate",
        TO_CHAR(COALESCE(l.due_date, (l.loan_date + 14)::date), 'YYYY-MM-DD') AS "dueDate",
        TO_CHAR(COALESCE(l.due_date, (l.loan_date + 14)::date), 'YYYY-MM-DD') AS "returnDate",
        TO_CHAR(l.returned_date, 'YYYY-MM-DD') AS "actualReturnedDate",
        GREATEST(0, (COALESCE(l.returned_date, CURRENT_DATE) - COALESCE(l.due_date, (l.loan_date + 14)::date))) AS "overdueDays",
        CEIL(GREATEST(0, (COALESCE(l.returned_date, CURRENT_DATE) - COALESCE(l.due_date, (l.loan_date + 14)::date)))::numeric / 7.0) * 500 AS "fineAmount",
        f.status AS "fineStatus",
        f.status AS "fine_status",
        f.id AS "fine_id"
      FROM loan l
      LEFT JOIN book b ON l.book_id = b.id
      LEFT JOIN member m ON l.member_id = m.id
      LEFT JOIN LATERAL (
        SELECT status, id FROM fine WHERE loan_id = l.id ORDER BY id DESC LIMIT 1
      ) f ON true
      ORDER BY l.id DESC
    `);
    return result.rows;
  }

  static async create(data) {
    const rawBookId = data.book_id || data.bookId;
    const rawMemberId = data.member_id || data.memberId || data.studentId;
    const studentId = data.studentId || rawMemberId;
    const studentName = data.studentName;
    const dueDateVal = data.dueDate || data.returnDate;

    let effectiveMemberId = null;

    // 1. Check if passed member_id (if numeric) exists directly in member.id
    if (rawMemberId && !isNaN(Number(rawMemberId))) {
      try {
        const mRes = await lms.query('SELECT id FROM member WHERE id = $1', [Number(rawMemberId)]);
        if (mRes.rows.length > 0) {
          effectiveMemberId = mRes.rows[0].id;
        }
      } catch (e) {}
    }

    // 2. Search member table by user_id
    if (!effectiveMemberId && studentId) {
      try {
        const targetUid = String(studentId);
        const mRes = await lms.query(
          'SELECT id FROM member WHERE user_id = $1 OR user_id = $2',
          [targetUid, `MEM-${targetUid}`]
        );
        if (mRes.rows.length > 0) {
          effectiveMemberId = mRes.rows[0].id;
        }
      } catch (e) {}
    }

    // 3. Search member table by name
    if (!effectiveMemberId && studentName) {
      try {
        const mRes = await lms.query(
          "SELECT id FROM member WHERE CONCAT(first_name, ' ', last_name) ILIKE $1 OR first_name ILIKE $1",
          [`%${String(studentName).trim()}%`]
        );
        if (mRes.rows.length > 0) {
          effectiveMemberId = mRes.rows[0].id;
        }
      } catch (e) {}
    }

    // 4. Auto-create member record if missing from DB
    if (!effectiveMemberId) {
      const parts = (studentName || 'Student Member').trim().split(' ');
      const firstName = parts[0] || 'Member';
      const lastName = parts.slice(1).join(' ') || 'User';
      const uId = String(studentId || rawMemberId || `MEM-${Date.now().toString().slice(-4)}`);

      try {
        const newMemberRes = await lms.query(
          "INSERT INTO member (user_id, first_name, last_name, role, status) VALUES ($1, $2, $3, 'Student', 'active') RETURNING id",
          [uId, firstName, lastName]
        );
        effectiveMemberId = newMemberRes.rows[0].id;
      } catch (mErr) {
        const fallbackRes = await lms.query(
          "INSERT INTO member (first_name, last_name, status) VALUES ($1, $2, 'active') RETURNING id",
          [firstName, lastName]
        );
        effectiveMemberId = fallbackRes.rows[0].id;
      }
    }

    // 5. Check/resolve effectiveBookId and verify availability
    let effectiveBookId = Number(rawBookId) || rawBookId;
    if (effectiveBookId) {
      try {
        const bRes = await lms.query(
          `SELECT b.id, b.copies_owned, 
                  GREATEST(0, COALESCE(b.copies_owned, 0) - COALESCE(active_loans.cnt, 0)) AS available_copies
           FROM book b
           LEFT JOIN (
             SELECT book_id, COUNT(*)::int AS cnt
             FROM loan
             WHERE returned_date IS NULL
             GROUP BY book_id
           ) active_loans ON active_loans.book_id = b.id
           WHERE b.id = $1`,
          [effectiveBookId]
        );
        if (bRes.rows.length === 0) {
          const anyBook = await lms.query('SELECT id FROM book ORDER BY id ASC LIMIT 1');
          if (anyBook.rows.length > 0) {
            effectiveBookId = anyBook.rows[0].id;
          }
        } else if (Number(bRes.rows[0].available_copies) <= 0) {
          const err = new Error('No available copies left for this book');
          err.status = 400;
          throw err;
        }
      } catch (e) {
        if (e.status === 400) throw e;
      }
    }

    let result;
    if (dueDateVal) {
      result = await lms.query(
        'INSERT INTO loan (book_id, member_id, due_date) VALUES ($1, $2, $3) RETURNING *',
        [effectiveBookId, effectiveMemberId, dueDateVal]
      );
    } else {
      result = await lms.query(
        'INSERT INTO loan (book_id, member_id, due_date) VALUES ($1, $2, CURRENT_DATE + 14) RETURNING *',
        [effectiveBookId, effectiveMemberId]
      );
    }

    const newLoan = result.rows[0];

    // Trigger sync in case loan is created as past due
    await FineModel.syncOverdueFines();

    const fullResult = await lms.query(`
      SELECT 
        l.id,
        l.book_id,
        l.member_id,
        l.loan_date,
        l.due_date,
        l.returned_date,
        b.title AS "bookTitle",
        COALESCE(TRIM(CONCAT(m.first_name, ' ', m.last_name)), m.email, 'Student') AS "studentName",
        m.user_id AS "studentId",
        'Issued' AS status,
        TO_CHAR(l.loan_date, 'YYYY-MM-DD') AS "issueDate",
        TO_CHAR(COALESCE(l.due_date, (l.loan_date + 14)::date), 'YYYY-MM-DD') AS "dueDate",
        TO_CHAR(COALESCE(l.due_date, (l.loan_date + 14)::date), 'YYYY-MM-DD') AS "returnDate"
      FROM loan l
      LEFT JOIN book b ON l.book_id = b.id
      LEFT JOIN member m ON l.member_id = m.id
      WHERE l.id = $1
    `, [newLoan.id]);
    return fullResult.rows[0] || newLoan;
  }

  static async returnLoan(id) {
    const result = await lms.query(
      'UPDATE loan SET returned_date = CURRENT_DATE WHERE id = $1 RETURNING *',
      [id]
    );
    await FineModel.syncOverdueFines();
    return result.rows[0] || null;
  }
}
