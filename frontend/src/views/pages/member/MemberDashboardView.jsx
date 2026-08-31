import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useBookController } from "../../../hooks/useBookHook";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import BookCoverImage from "../../components/BookCoverImage";
import {
  BookMarked,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Sparkles,
  Clock,
  UserCheck,
  GraduationCap,
} from "lucide-react";

export default function MemberDashboardView() {
  const { user } = useAuth();
  const { books } = useBookController();
  const { allIssues } = useTransactionController();

  const memberName = user?.name || user?.username || "Member";
  const memberRole = user?.role || "Student";
  const memberId = user?.studentId || user?.user_id || user?.id || "M-101";
  const department = user?.department || "General";

  // Filter loans belonging to logged-in user
  const memberLoans = (allIssues || []).filter((item) => {
    if (!user) return false;
    const uId = String(user.id || "");
    const uDbId = String(user.db_id || user.member_id || "");
    const uStudentId = String(user.studentId || user.user_id || "");
    const uName = String(user.name || `${user.first_name || ""} ${user.last_name || ""}`).toLowerCase().trim();
    const uEmail = String(user.email || "").toLowerCase().trim();

    const mMemberId = String(item.member_id || item.user_id || "");
    const mStudentId = String(item.studentId || "");
    const mName = String(item.studentName || item.memberName || "").toLowerCase().trim();
    const mEmail = String(item.email || "").toLowerCase().trim();

    const matchesSpecificUser = (
      (uId && mMemberId === uId) ||
      (uDbId && mMemberId === uDbId) ||
      (uStudentId && (mStudentId === uStudentId || mMemberId === uStudentId)) ||
      (uName && mName && (mName.includes(uName) || uName.includes(mName))) ||
      (uEmail && (mEmail === uEmail || (mName && mName.includes(uEmail))))
    );

    return matchesSpecificUser;
  });

  // Strictly filter only the logged-in member's active loans
  const activeLoansList = memberLoans.filter(
    (b) => b.status === "Issued" || b.status === "Overdue"
  );

  const borrowedBooks = activeLoansList.map((item) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const issueDateStr = item.issueDate || item.loan_date;
    const dueDateStr = item.dueDate || item.due_date || item.returnDate;

    let due = dueDateStr ? new Date(dueDateStr) : null;
    if (!due || isNaN(due.getTime())) {
      const issueD = issueDateStr ? new Date(issueDateStr) : new Date();
      due = new Date(issueD.getTime() + 14 * 24 * 3600 * 1000);
    }
    due.setHours(0, 0, 0, 0);

    const diffMs = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 3600 * 24));
    const isPastDue = daysLeft < 0 || item.status === "Overdue";

    let finePkr = 0;
    if (isPastDue) {
      const overdueDays = Math.abs(daysLeft);
      const overdueWeeks = Math.ceil((overdueDays || 1) / 7);
      finePkr = (item.fineStatus === "Paid" || item.fine_status === "Paid") ? 0 : (overdueWeeks * 500);
    }

    return {
      ...item,
      title: item.bookTitle || item.title || "Borrowed Book",
      author: item.author || "Library Book",
      category: item.category || "General",
      issueDate: item.issueDate || item.loan_date || "2026-08-21",
      dueDate: due.toISOString().split("T")[0],
      daysLeft,
      isPastDue,
      fineAmount: finePkr,
    };
  });

  const overdueCount = borrowedBooks.filter((b) => b.isPastDue).length;
  const totalPendingFines = borrowedBooks.reduce((sum, b) => {
    if (!b.isPastDue || b.fineStatus === "Paid" || b.fine_status === "Paid") return sum;
    return sum + b.fineAmount;
  }, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 select-none">
      {/* GREETING HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3 sm:px-5 sm:py-3 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold mb-0.5 border border-indigo-500/30">
              <Sparkles size={11} className="text-amber-400 fill-amber-400" />
              <span>Library Portal</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              Welcome back, {memberName}!
            </h1>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-300 leading-tight">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-[10px]">
                {memberRole === "Teacher" ? <UserCheck size={11} /> : <GraduationCap size={11} />}
                {memberRole}
              </span>
              <span>•</span>
              <span>ID: <strong className="text-white">{memberId}</strong></span>
              <span>•</span>
              <span>{department}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/search"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm inline-flex items-center gap-1.5"
            >
              <Search size={13} />
              <span>Search Books</span>
            </Link>
          </div>
        </div>
      </div>

      {/* PENDING FINES ALERT BANNER */}
      {totalPendingFines > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-rose-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 leading-tight">Pending Fine Alert</h4>
              <p className="text-[11px] text-rose-700 font-medium leading-tight">
                You have unpaid overdue fines totaling <strong className="text-rose-900 font-extrabold">{totalPendingFines} PKR</strong>. Please clear fine at counter.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-extrabold shadow-xs whitespace-nowrap">
            {totalPendingFines} PKR Unpaid
          </span>
        </div>
      )}

      {/* 4 MEMBER STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookMarked size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {borrowedBooks.length}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">Borrowed</div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {overdueCount}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">Overdue</div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {books.length}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">Total Books</div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs">
            PKR
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">{totalPendingFines} PKR</div>
            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">Fines</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: ACTIVE LOANS & RECOMMENDED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-w-0">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-3 flex items-center justify-between text-white border-b border-indigo-900/40">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-tight">
              <BookMarked size={16} className="text-indigo-400" />
              <span>Loans</span>
            </div>
            <Link
              to="/my-books"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-3 space-y-2 flex-1">
            {borrowedBooks.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                No active borrowed books currently.
              </div>
            ) : (
              borrowedBooks.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-12 shrink-0">
                      <BookCoverImage book={item} className="w-9 h-12 object-cover rounded shadow-xs border border-slate-200" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">{item.title}</h3>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">By {item.author}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 text-[9px]">
                          {item.category}
                        </span>
                        <span className="text-slate-400 text-[10px]">Issued: {item.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium leading-none">Due Date</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">{item.dueDate}</span>
                    </div>

                    <div className="flex flex-col sm:items-end gap-0.5">
                      {item.isPastDue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                          <AlertTriangle size={11} />
                          Overdue ({Math.abs(item.daysLeft)}d late)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <Clock size={11} />
                          {item.daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-w-0">
          <div className="bg-slate-900 px-5 py-3 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-tight">
              <Sparkles size={16} className="text-amber-400" />
              <span>Explore</span>
            </div>
            <Link
              to="/search"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              Search All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-3 space-y-1.5">
            {books.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-11 shrink-0">
                  <BookCoverImage book={b} className="w-8 h-11 object-cover rounded border border-slate-200 shadow-xs" />
                </div>
                <div className="truncate flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate leading-tight">{b.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{b.author}</div>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">
                    Available ({b.availableQuantity || b.availableCopies || 1})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}