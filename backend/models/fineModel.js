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
    if (targetLoanId) {
      // 1. Update fine table status to 'Paid'
      await lms.query("UPDATE fine SET status = 'Paid' WHERE id = $1 OR loan_id = $1", [targetLoanId]);
      // 2. Update loan table status to 'Returned' and set returned_date
      await lms.query("UPDATE loan SET status = 'Returned', returned_date = CURRENT_DATE WHERE id = $1", [targetLoanId]);
      // 3. Restore book copy quantity
      await lms.query(
        `UPDATE book SET available_copies = available_copies + 1 
         FROM loan WHERE book.id = loan.book_id AND loan.id = $1`,
        [targetLoanId]
      ).catch(() => {});
    }

    const targetMemberId = member_id || 1;
    // 4. Record payment in fine_payment table
    const result = await lms.query(
      'INSERT INTO fine_payment (member_id, payment_amount, payment_date) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [targetMemberId, payment_amount || 500]
    );
    return result.rows[0];
  }
}
