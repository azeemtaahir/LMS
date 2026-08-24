import lms from '../config/db.js';

export class ReportModel {
  static async getAnalytics({ dateFrom, dateTo }) {
    // 1. Top 5 Most Borrowed Books Query
    const topBooksRes = await lms.query(
      `SELECT 
         b.id, 
         b.title, 
         COALESCE(b.category, 'General') AS category, 
         COUNT(l.id)::int AS count
       FROM loan l
       JOIN book b ON l.book_id = b.id
       WHERE ($1::date IS NULL OR l.loan_date >= $1::date)
         AND ($2::date IS NULL OR l.loan_date <= $2::date)
       GROUP BY b.id, b.title, b.category
       ORDER BY count DESC
       LIMIT 5`,
      [dateFrom || null, dateTo || null]
    );

    // 2. Monthly Circulation Trend Query (Dynamically filtered by date range or default 6 months)
    const monthlyTrendRes = await lms.query(
      `SELECT 
         TO_CHAR(loan_date, 'Mon') AS month,
         TO_CHAR(loan_date, 'Mon YYYY') AS full_key,
         COUNT(*)::int AS count
       FROM loan
       WHERE ($1::date IS NULL OR loan_date >= $1::date)
         AND ($2::date IS NULL OR loan_date <= $2::date)
       GROUP BY TO_CHAR(loan_date, 'Mon'), TO_CHAR(loan_date, 'Mon YYYY'), DATE_TRUNC('month', loan_date)
       ORDER BY DATE_TRUNC('month', loan_date) ASC`,
      [dateFrom || null, dateTo || null]
    );

    // 3. Status Summary Metrics Query
    const statusSummaryRes = await lms.query(
      `SELECT 
         COUNT(*)::int AS total_loans,
         COUNT(CASE WHEN l.returned_date IS NOT NULL OR f.status = 'Paid' THEN 1 END)::int AS returned_count,
         COUNT(CASE WHEN l.returned_date IS NULL AND (f.status IS NULL OR f.status != 'Paid') AND CURRENT_DATE <= COALESCE(l.due_date, (l.loan_date + 14)::date) THEN 1 END)::int AS issued_count,
         COUNT(CASE WHEN l.returned_date IS NULL AND CURRENT_DATE > COALESCE(l.due_date, (l.loan_date + 14)::date) AND (f.status IS NULL OR f.status != 'Paid') THEN 1 END)::int AS overdue_count
       FROM loan l
       LEFT JOIN LATERAL (
         SELECT status FROM fine WHERE loan_id = l.id ORDER BY id DESC LIMIT 1
       ) f ON true
       WHERE ($1::date IS NULL OR l.loan_date >= $1::date)
         AND ($2::date IS NULL OR l.loan_date <= $2::date)`,
      [dateFrom || null, dateTo || null]
    );

    return {
      topBorrowedBooks: topBooksRes.rows,
      monthlyTrend: monthlyTrendRes.rows,
      summary: statusSummaryRes.rows[0] || {
        total_loans: 0,
        returned_count: 0,
        issued_count: 0,
        overdue_count: 0
      }
    };
  }
}
