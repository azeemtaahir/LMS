import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { RotateCcw, BookOpen, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import BookCoverImage from "../../components/BookCoverImage";

export default function MemberMyBooksView() {
  const { user } = useAuth();
  const { allIssues } = useTransactionController();
  const [activeTab, setActiveTab] = useState("current");
  const [renewedBookIds, setRenewedBookIds] = useState([]);

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

  const activeLoansSource = memberLoans;

  const currentLoans = activeLoansSource
    .filter((b) => b.status === "Issued" || b.status === "Overdue")
    .map((item) => {
      const isRenewed = renewedBookIds.includes(item.id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let due = item.dueDate ? new Date(item.dueDate) : new Date(today.getTime() + 7 * 24 * 3600 * 1000);
      if (isRenewed) {
        due = new Date(due.getTime() + 14 * 24 * 3600 * 1000);
      }
      due.setHours(0, 0, 0, 0);

      const diffMs = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));
      const isPastDue = diffDays < 0 || item.status === "Overdue";

      let finePkr = 0;
      if (isPastDue) {
        const overdueDays = Math.abs(diffDays);
        const overdueWeeks = Math.ceil((overdueDays || 1) / 7);
        finePkr = (item.fineStatus === "Paid" || item.fine_status === "Paid") ? 0 : (overdueWeeks * 500);
      }

      return {
        ...item,
        title: item.bookTitle || item.title || "Borrowed Book",
        author: item.author || "Library Book",
        category: item.category || "General",
        issueDate: item.issueDate || "2026-08-21",
        dueDate: due.toISOString().split("T")[0],
        daysLeft: diffDays,
        isPastDue,
        fineAmount: finePkr,
        renewalsLeft: isRenewed ? 0 : 1,
      };
    });

  const pastLoans = activeLoansSource.filter((b) => b.status === "Returned");

  const totalPendingFines = currentLoans.reduce((sum, b) => {
    if (!b.isPastDue || b.fineStatus === "Paid" || b.fine_status === "Paid") return sum;
    return sum + b.fineAmount;
  }, 0);

  const handleRenewBook = (loanId) => {
    if (renewedBookIds.includes(loanId)) {
      alert("This book has already been renewed maximum times.");
      return;
    }
    setRenewedBookIds((prev) => [...prev, loanId]);
    alert("Book renewal request processed! Due date extended by 14 days.");
  };

  const handleRequestReturn = (title) => {
    alert(`Return request submitted for "${title}". Please drop off the physical book at the library desk.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Borrowed Books</h1>
          <p className="text-xs text-slate-300 mt-1">Track active loans, request renewals, and view loan history.</p>
        </div>
      </div>

      {/* PENDING FINES ALERT BANNER */}
      {totalPendingFines > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-rose-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">Unpaid Fine Outstanding</h4>
              <p className="text-[11px] text-rose-700 font-medium">
                You have unpaid overdue fines totaling <strong className="text-rose-900 font-extrabold">{totalPendingFines} PKR</strong> on your current unreturned books.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-extrabold shadow-xs whitespace-nowrap">
            {totalPendingFines} PKR Unpaid
          </span>
        </div>
      )}

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "current"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Currently Borrowed ({currentLoans.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Loan History ({pastLoans.length})
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "current" && (
        <div className="space-y-4">
          {currentLoans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <BookOpen size={40} className="mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No active borrowed books currently.</p>
              <p className="text-xs text-slate-400">Search the catalog to find and reserve books!</p>
            </div>
          ) : (
            currentLoans.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-16 shrink-0">
                    <BookCoverImage book={item} className="w-12 h-16 object-cover rounded-xl shadow-md border border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100 inline-block mb-1">
                      {item.category || "General"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">By {item.author}</p>
                    <p className="text-[11px] text-slate-400">Issue Date: {item.issueDate} | Due Date: <strong>{item.dueDate}</strong></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  {item.isPastDue ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                      <AlertTriangle size={14} />
                      Overdue ({Math.abs(item.daysLeft)} days late)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <Clock size={14} />
                      {item.daysLeft} days left
                    </span>
                  )}

                  {item.isPastDue && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.fineStatus === "Paid" || item.fine_status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {item.fineStatus === "Paid" || item.fine_status === "Paid"
                        ? "Fine: Paid"
                        : `Fine: ${item.fineAmount} PKR (Unpaid)`}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-3">
          {pastLoans.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No previous loan history found.
            </div>
          ) : (
            pastLoans.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <BookCoverImage book={item} className="w-10 h-14 object-cover rounded-lg border border-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.bookTitle || item.title}</h4>
                    <p className="text-slate-500">By {item.author || "Author"}</p>
                    <span className="text-[10px] text-slate-400">Issue Date: {item.issueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    <CheckCircle2 size={13} />
                    Returned ({item.actualReturnedDate || "Returned"})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}