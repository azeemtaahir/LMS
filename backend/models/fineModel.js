import lms from '../config/db.js';

export class FineModel {
  constructor({ id, member_id, loan_id, fine_amount, status, fine_date }) {
    this.id = id;
    this.member_id = member_id;
    this.loan_id = loan_id;
    this.fine_amount = fine_amount;
    this.status = status;
    this.fine_date = fine_date;
  }

  /**
   * Automatically calculate & synchronize overdue fines in database
   * Rule: 500 PKR per week (7 days) for overdue books past due date.
   */
  static async syncOverdueFines() {
    try {
      // Find all loans past due date
      const overdueLoans = await lms.query(`
        SELECT 
          l.id AS loan_id,
          l.member_id,
          COALESCE(l.due_date, (l.loan_date + 14)::date) AS due_date,
          COALESCE(l.returned_date, CURRENT_DATE) AS end_date,
          GREATEST(0, (COALESCE(l.returned_date, CURRENT_DATE) - COALESCE(l.due_date, (l.loan_date + 14)::date))) AS days_overdue
        FROM loan l
        WHERE COALESCE(l.returned_date, CURRENT_DATE) > COALESCE(l.due_date, (l.loan_date + 14)::date)
      `);

      for (const loan of overdueLoans.rows) {
        const daysOverdue = Number(loan.days_overdue) || 0;
        if (daysOverdue > 0) {
          const weeksOverdue = Math.ceil(daysOverdue / 7);
          const fineAmount = weeksOverdue * 500; // 500 PKR per week

          // Check if fine record exists for this loan
          const existing = await lms.query('SELECT * FROM fine WHERE loan_id = $1', [loan.loan_id]);

          if (existing.rows.length > 0) {
            // Update existing fine amount dynamically if unpaid
            const currentFine = existing.rows[0];
            if (currentFine.status !== 'Paid') {
              await lms.query(
                'UPDATE fine SET fine_amount = $1, fine_date = CURRENT_DATE WHERE id = $2',
                [fineAmount, currentFine.id]
              );
            }
          } else {
            // Insert new fine row in database according to ERD schema
            await lms.query(
              "INSERT INTO fine (member_id, loan_id, fine_date, fine_amount, status) VALUES ($1, $2, CURRENT_DATE, $3, 'Unpaid')",
              [loan.member_id, loan.loan_id, fineAmount]
            );
          }
        }
      }
    } catch (err) {
      console.warn('Auto fine sync notice:', err.message);
    }
  }

  static async findAll() {
    await FineModel.syncOverdueFines();
    const result = await lms.query(`
      SELECT 
        f.id,
        f.member_id,
        f.loan_id,
        TO_CHAR(f.fine_date, 'YYYY-MM-DD') AS fine_date,
        f.fine_amount,
        COALESCE(f.status, 'Unpaid') AS status,
        b.title AS "bookTitle",
        COALESCE(TRIM(CONCAT(m.first_name, ' ', m.last_name)), m.email, 'Member') AS "studentName",
        m.user_id AS "studentId",
        GREATEST(0, (COALESCE(l.returned_date, CURRENT_DATE) - COALESCE(l.due_date, (l.loan_date + 14)::date))) AS "overdueDays",
        CEIL(GREATEST(0, (COALESCE(l.returned_date, CURRENT_DATE) - COALESCE(l.due_date, (l.loan_date + 14)::date)))::numeric / 7.0) AS "overdueWeeks"
      FROM fine f
      JOIN loan l ON f.loan_id = l.id
      LEFT JOIN member m ON f.member_id = m.id
      LEFT JOIN book b ON l.book_id = b.id
      WHERE (f.status != 'Paid' OR f.status IS NULL) AND l.returned_date IS NULL
      ORDER BY f.id DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await lms.query('SELECT * FROM fine WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ member_id, loan_id, fine_amount, status }) {
    const result = await lms.query(
      "INSERT INTO fine (member_id, loan_id, fine_date, fine_amount, status) VALUES ($1, $2, CURRENT_DATE, $3, $4) RETURNING *",
      [member_id, loan_id, fine_amount || 500, status || 'Unpaid']
    );
    return result.rows[0];
  }

  static async payFine({ member_id, loan_id, fine_id, payment_amount }) {
    const targetLoanId = loan_id || fine_id;
    let targetMemberId = member_id;

    // Ensure fine_payment table exists per exact ERD schema
    await lms.query(`
      CREATE TABLE IF NOT EXISTS fine_payment (
        id SERIAL PRIMARY KEY,
        member_id INT NOT NULL REFERENCES member(id) ON DELETE CASCADE,
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        payment_amount DECIMAL(8,2) NOT NULL CHECK (payment_amount >= 0)
      );
    `).catch(() => { });

    if (targetLoanId) {
      // Find member_id from loan if targetMemberId not valid
      try {
        const lRes = await lms.query('SELECT member_id FROM loan WHERE id = $1', [targetLoanId]);
        if (lRes.rows.length > 0 && lRes.rows[0].member_id) {
          targetMemberId = lRes.rows[0].member_id;
        }
      } catch (e) { }

      // 1. Set returned_date on loan so status changes from 'Overdue' to 'Returned'
      try {
        await lms.query('UPDATE loan SET returned_date = CURRENT_DATE WHERE id = $1', [targetLoanId]);
      } catch (e) {
        console.warn('Auto loan return update warning:', e.message);
      }

      // 2. Update fine table status to 'Paid' or insert new 'Paid' fine record if missing
      const existingFine = await lms.query('SELECT id FROM fine WHERE loan_id = $1 OR id = $1', [targetLoanId]);
      if (existingFine.rows.length > 0) {
        await lms.query("UPDATE fine SET status = 'Paid' WHERE loan_id = $1 OR id = $1", [targetLoanId]);
      } else {
        await lms.query(
          "INSERT INTO fine (member_id, loan_id, fine_date, fine_amount, status) VALUES ($1, $2, CURRENT_DATE, $3, 'Paid')",
          [targetMemberId || 1, targetLoanId, payment_amount || 500]
        );
      }
    }

    if (!targetMemberId) {
      try {
        const anyMem = await lms.query('SELECT id FROM member ORDER BY id ASC LIMIT 1');
        if (anyMem.rows.length > 0) {
          targetMemberId = anyMem.rows[0].id;
        }
      } catch (e) { }
    }

    // 3. Update member status in database to 'active' once fine is paid
    if (targetMemberId) {
      try {
        await lms.query("UPDATE member SET status = 'active' WHERE id = $1", [targetMemberId]);
        await lms.query("UPDATE users SET status = 'active' WHERE member_id = $1", [targetMemberId]).catch(() => { });
      } catch (e) {
        console.warn('Member status update warning:', e.message);
      }
    }

    // 4. Insert payment record into fine_payment database table according to ER schema
    const result = await lms.query(
      'INSERT INTO fine_payment (member_id, payment_date, payment_amount) VALUES ($1, CURRENT_DATE, $2) RETURNING *',
      [targetMemberId || 1, payment_amount || 500]
    );

    return result.rows[0];
  }

  static async updateFineAmount({ id, loan_id, fine_amount }) {
    const amount = Number(fine_amount);
    if (isNaN(amount) || amount < 0) {
      const err = new Error('Invalid fine amount');
      err.status = 400;
      throw err;
    }

    const targetLoanId = loan_id || id;
    const targetFineId = id && !isNaN(Number(id)) ? Number(id) : null;

    // Check if fine row exists
    let existing = null;
    if (targetFineId) {
      const fRes = await lms.query('SELECT * FROM fine WHERE id = $1', [targetFineId]);
      if (fRes.rows.length > 0) existing = fRes.rows[0];
    }
    if (!existing && targetLoanId) {
      const lRes = await lms.query('SELECT * FROM fine WHERE loan_id = $1 ORDER BY id DESC LIMIT 1', [targetLoanId]);
      if (lRes.rows.length > 0) existing = lRes.rows[0];
    }

    if (existing) {
      const result = await lms.query(
        'UPDATE fine SET fine_amount = $1 WHERE id = $2 RETURNING *',
        [amount, existing.id]
      );
      return result.rows[0];
    } else {
      let memberId = 1;
      if (targetLoanId) {
        const lRes = await lms.query('SELECT member_id FROM loan WHERE id = $1', [targetLoanId]);
        if (lRes.rows.length > 0 && lRes.rows[0].member_id) {
          memberId = lRes.rows[0].member_id;
        }
      }
      const result = await lms.query(
        "INSERT INTO fine (member_id, loan_id, fine_date, fine_amount, status) VALUES ($1, $2, CURRENT_DATE, $3, 'Unpaid') RETURNING *",
        [memberId, targetLoanId, amount]
      );
      return result.rows[0];
    }
  }
}

