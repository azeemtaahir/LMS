import { useNavigate, useLocation } from "react-router-dom";
import { useBookController } from "../../../hooks/useBookHook";
import { useMemberController } from "../../../hooks/useMemberHook";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { User, BookOpen, ArrowRight, AlertTriangle } from "lucide-react";

export default function IssueBookView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books } = useBookController();
  const { students, allStudents } = useMemberController();
  const { issueFormData, setIssueFormData, handleIssueBookSubmit, allIssues } = useTransactionController();

  const userList = (allStudents && allStudents.length > 0) ? allStudents : (students || []);

  const selectedStudentObj = userList.find(
    (s) =>
      String(s.db_id) === String(issueFormData.studentId) ||
      String(s.id) === String(issueFormData.studentId) ||
      String(s.studentId) === String(issueFormData.studentId) ||
      String(s.user_id) === String(issueFormData.studentId)
  );
  const selectedBookObj = books.find((b) => String(b.id) === String(issueFormData.bookId));
  const isOutOfStock = selectedBookObj && Number(selectedBookObj.availableCopies ?? selectedBookObj.copies_owned ?? 0) <= 0;

  const targetTitle = selectedBookObj?.title ? String(selectedBookObj.title).trim().toLowerCase() : "";
  const targetIsbn = selectedBookObj?.isbn ? String(selectedBookObj.isbn).trim().toLowerCase() : "";
  const targetBookId = String(selectedBookObj?.id || issueFormData.bookId);
  const targetMemberIdStr = String(selectedStudentObj?.db_id || selectedStudentObj?.id || selectedStudentObj?.user_id || issueFormData.studentId).toLowerCase();

  const hasActiveSameTitleOrIsbnLoan = Boolean(
    selectedStudentObj && selectedBookObj && (allIssues || []).some((loan) => {
      const isUnreturned = loan.status !== "Returned" && !loan.returned_date;
      if (!isUnreturned) return false;
      const loanMemberIdStr = String(loan.member_id || loan.studentId || "").toLowerCase();
      const isSameMember = loanMemberIdStr === targetMemberIdStr || loan.studentName === (selectedStudentObj?.name || `${selectedStudentObj?.first_name || ''} ${selectedStudentObj?.last_name || ''}`.trim());
      if (!isSameMember) return false;
      const loanTitle = loan.bookTitle || loan.title ? String(loan.bookTitle || loan.title).trim().toLowerCase() : "";
      const loanIsbn = loan.isbn ? String(loan.isbn).trim().toLowerCase() : "";
      if (targetTitle && loanTitle && targetTitle === loanTitle) return true;
      if (targetIsbn && loanIsbn && targetIsbn === loanIsbn) return true;
      return String(loan.book_id || loan.bookId) === targetBookId;
    })
  );

  const selectedStudentOverdueLoans = (selectedStudentObj && allIssues) ? (allIssues || []).filter((item) => {
    const isReturned = item.status === "Returned" || Boolean(item.returned_date || item.actualReturnedDate);
    const isPaid = item.fineStatus === "Paid" || item.fine_status === "Paid";
    if (isReturned || isPaid) return false;

    const uId = String(selectedStudentObj.id || "");
    const uDbId = String(selectedStudentObj.db_id || selectedStudentObj.member_id || "");
    const uStudentId = String(selectedStudentObj.studentId || selectedStudentObj.user_id || "");
    const uName = String(selectedStudentObj.name || `${selectedStudentObj.first_name || ""} ${selectedStudentObj.last_name || ""}`).toLowerCase().trim();
    const uEmail = String(selectedStudentObj.email || "").toLowerCase().trim();

    const mMemberId = String(item.member_id || item.user_id || "");
    const mStudentId = String(item.studentId || "");
    const mName = String(item.studentName || item.memberName || "").toLowerCase().trim();
    const mEmail = String(item.email || "").toLowerCase().trim();

    const isUserLoan =
      (uId && mMemberId === uId) ||
      (uDbId && mMemberId === uDbId) ||
      (uStudentId && (mStudentId === uStudentId || mMemberId === uStudentId)) ||
      (uName && mName && (mName.includes(uName) || uName.includes(mName))) ||
      (uEmail && (mEmail === uEmail || (mName && mName.includes(uEmail))));

    if (!isUserLoan) return false;

    const dueDateStr = item.dueDate || item.due_date || item.returnDate;
    const isPastDue = dueDateStr ? new Date(dueDateStr) < new Date() : false;

    return item.status === "Overdue" || isPastDue;
  }) : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isOutOfStock) {
      alert(`Book "${selectedBookObj.title}" is not available (0/${selectedBookObj.totalQuantity ?? selectedBookObj.copies_owned ?? 0} copies available). Cannot issue this book!`);
      return;
    }
    if (hasActiveSameTitleOrIsbnLoan) {
      alert(`This member already has an active issue/borrow for '${selectedBookObj?.title}'. One person can never take the same book title at a time.`);
      return;
    }
    const success = await handleIssueBookSubmit(e, selectedStudentObj, selectedBookObj);
    if (success) {
      const isLibrarianRoute = location.pathname.includes("-lib") || location.pathname.includes("librarian");
      const targetPath = isLibrarianRoute ? "/issued-lib" : "/issued";
      navigate(targetPath);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-8 select-none">
      <form onSubmit={onSubmit} className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Issue Book Form</h2>
              <p className="text-xs text-indigo-300/80">Select member, book, and dates to issue a book</p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: BORROWER DETAILS */}
          <div className="space-y-4">
            {/* User Dropdown */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">Select User (Student / Teacher) *</label>
              <select
                value={issueFormData.studentId}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none transition cursor-pointer"
                required
              >
                <option value="" className="bg-slate-900 text-white">Select borrower user</option>
                {userList.map((st, idx) => {
                  const uVal = st.db_id || st.id || st.studentId || st.user_id;
                  return (
                    <option key={st.db_id || st.id || idx} value={uVal} className="bg-slate-900 text-white">
                      {st.name} — [{st.role || "Student"}] ({st.studentId || st.user_id || uVal})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* User Preview Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">User Information</span>
                {selectedStudentObj && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedStudentObj.role || "Student"}
                  </span>
                )}
              </div>

              {selectedStudentObj ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
                      <User size={22} />
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <p className="font-bold text-white text-sm">
                        {selectedStudentObj.name || `${selectedStudentObj.first_name || ''} ${selectedStudentObj.last_name || ''}`.trim()}
                      </p>
                      <p><span className="text-indigo-200 font-semibold">User ID:</span> {selectedStudentObj.studentId || selectedStudentObj.user_id || selectedStudentObj.id}</p>
                      <p><span className="text-indigo-200 font-semibold">Dept:</span> {selectedStudentObj.department || "CS"} {selectedStudentObj?.semester ? `(${selectedStudentObj.semester})` : ""}</p>
                      <p><span className="text-indigo-200 font-semibold">Email:</span> {selectedStudentObj.email || "N/A"}</p>
                    </div>
                  </div>

                  {selectedStudentOverdueLoans.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                      <span>
                        <strong>Overdue Warning:</strong> This member currently has {selectedStudentOverdueLoans.length} unreturned overdue book(s)!
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs italic">
                  Select a user from dropdown to view borrower details
                </div>
              )}
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">Issue Date</label>
              <input
                type="date"
                value={issueFormData.issueDate}
                onChange={(e) => {
                  const newIssueDate = e.target.value;
                  const days = issueFormData.loanDurationDays && issueFormData.loanDurationDays !== "custom" ? Number(issueFormData.loanDurationDays) : 7;
                  const d = new Date(newIssueDate);
                  let calcReturn = "";
                  if (!isNaN(d.getTime())) {
                    d.setDate(d.getDate() + days);
                    calcReturn = d.toISOString().split("T")[0];
                  }
                  setIssueFormData((prev) => ({
                    ...prev,
                    issueDate: newIssueDate,
                    returnDate: calcReturn || prev.returnDate,
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: BOOK DETAILS */}
          <div className="space-y-4">
            {/* Book Dropdown */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">Select Book *</label>
              <select
                value={issueFormData.bookId}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, bookId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none transition cursor-pointer"
                required
              >
                <option value="" className="bg-slate-900 text-white">Select book</option>
                {books.map((b) => {
                  const avail = Number(b.availableCopies ?? b.copies_owned ?? 0);
                  return (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.title} — by {b.author} {avail <= 0 ? "(OUT OF STOCK)" : `(${avail} avail)`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Book Preview Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Book Information</span>
                {selectedBookObj && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${isOutOfStock ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                    {selectedBookObj.availableCopies ?? 0} / {selectedBookObj.totalQuantity ?? selectedBookObj.copies_owned ?? 0} Copies
                  </span>
                )}
              </div>

              {selectedBookObj ? (
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
                    <BookOpen size={22} />
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="font-bold text-white text-sm">{selectedBookObj.title}</p>
                    <p><span className="text-indigo-200 font-semibold">Author:</span> {selectedBookObj.author}</p>
                    <p><span className="text-indigo-200 font-semibold">ISBN:</span> {selectedBookObj.isbn || "N/A"}</p>
                    <p><span className="text-indigo-200 font-semibold">Category:</span> {selectedBookObj.category || "General"}</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs italic">
                  Select a book from dropdown to view details
                </div>
              )}
            </div>

            {/* Return Date */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">Return Due Date</label>
              <input
                type="date"
                value={issueFormData.returnDate}
                onChange={(e) => {
                  const selectedReturn = e.target.value;
                  setIssueFormData((prev) => ({
                    ...prev,
                    loanDurationDays: "custom",
                    returnDate: selectedReturn,
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Warning Alerts */}
        {isOutOfStock && (
          <div className="p-3 rounded-xl bg-rose-900/70 border border-rose-500/50 text-rose-100 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            <span>Book Not Available! 0 copies available right now.</span>
          </div>
        )}

        {hasActiveSameTitleOrIsbnLoan && !isOutOfStock && (
          <div className="p-3 rounded-xl bg-amber-900/70 border border-amber-500/50 text-amber-100 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <span>Duplicate Borrowing Restriction! User already has an active loan for this book title.</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 border-t border-indigo-900/50">
          <button
            type="submit"
            disabled={isOutOfStock || hasActiveSameTitleOrIsbnLoan}
            className={`w-full py-3 px-6 rounded-xl font-bold text-xs transition shadow-xl flex items-center justify-center gap-2 ${
              (isOutOfStock || hasActiveSameTitleOrIsbnLoan)
                ? "bg-stone-700 text-stone-400 cursor-not-allowed border border-stone-600 opacity-70"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 cursor-pointer active:scale-98"
            }`}
          >
            <span>
              {isOutOfStock
                ? "Book Not Available (0 Copies)"
                : hasActiveSameTitleOrIsbnLoan
                ? "Already Borrowed (Duplicate Constraint)"
                : "Issue Book"}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
}


