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
    <div className="max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Wireframe Layout Grid */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* LEFT COLUMN: STUDENT SELECTION & PREVIEW */}
          <div className="flex flex-col space-y-4">
            {/* Select User Dropdown */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl text-white">
              <label className="block text-xs font-bold text-indigo-200 mb-2">Select User (Student / Teacher) *</label>
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

            {/* User Information Preview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl space-y-3 text-white flex-1 min-h-[210px]">
              <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider border-b border-indigo-900/60 pb-2">
                User Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
                  <User size={32} />
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div>
                    <span className="font-semibold text-indigo-200">Role:</span>{" "}
                    <span className="font-bold text-indigo-400">{selectedStudentObj ? selectedStudentObj.role || "Student" : "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">User ID:</span>{" "}
                    {selectedStudentObj ? (selectedStudentObj.studentId || selectedStudentObj.user_id || selectedStudentObj.id) : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Name:</span>{" "}
                    {selectedStudentObj ? (selectedStudentObj.name || `${selectedStudentObj.first_name || ''} ${selectedStudentObj.last_name || ''}`.trim()) : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Department:</span>{" "}
                    {selectedStudentObj ? (selectedStudentObj.department || "CS") : "—"}{" "}
                    {selectedStudentObj?.designation ? `(${selectedStudentObj.designation})` : selectedStudentObj?.semester ? `(${selectedStudentObj.semester})` : ""}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Email:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.email : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Phone:</span>{" "}
                    {selectedStudentObj ? (selectedStudentObj.phone || "1234567890") : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Date Picker */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl text-white">
              <label className="block text-xs font-bold text-indigo-200 mb-2">Issue Date</label>
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

          {/* RIGHT COLUMN: BOOK SELECTION & PREVIEW */}
          <div className="flex flex-col space-y-4">
            {/* Select Book Dropdown */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl text-white">
              <label className="block text-xs font-bold text-indigo-200 mb-2">Select Book *</label>
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
                      {b.title} — by {b.author} {avail <= 0 ? "(OUT OF STOCK - 0 Copies)" : `(${avail} available)`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Book Information Preview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl space-y-3 text-white flex-1 min-h-[210px]">
              <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider border-b border-indigo-900/60 pb-2">
                Book Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
                  <BookOpen size={30} />
                </div>
                <div className="space-y-1 text-xs text-slate-300 w-full">
                  <div>
                    <span className="font-semibold text-indigo-200">Title:</span>{" "}
                    {selectedBookObj ? selectedBookObj.title : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Author:</span>{" "}
                    {selectedBookObj ? selectedBookObj.author : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">ISBN:</span>{" "}
                    {selectedBookObj ? selectedBookObj.isbn : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Category:</span>{" "}
                    {selectedBookObj ? selectedBookObj.category : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Available Copies:</span>{" "}
                    {selectedBookObj ? (
                      <span className={`font-bold ${isOutOfStock ? "text-rose-400" : "text-emerald-400"}`}>
                        {selectedBookObj.availableCopies ?? 0} / {selectedBookObj.totalQuantity ?? selectedBookObj.copies_owned ?? 0}
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              {/* OUT OF STOCK ALERT CARD */}
              {isOutOfStock && (
                <div className="p-3 rounded-xl bg-rose-900/70 border border-rose-500/50 text-rose-100 text-xs font-bold flex items-center gap-2.5 animate-pulse mt-3">
                  <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                  <div>
                    <p className="font-bold text-rose-200">Book Not Available!</p>
                    <p className="text-[11px] text-rose-300 font-normal mt-0.5">
                      0 copies available out of {selectedBookObj.totalQuantity ?? selectedBookObj.copies_owned ?? 0}. This book cannot be issued right now.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIVE BOOK TITLE/ISBN LOAN CONSTRAINT ALERT CARD */}
              {hasActiveSameTitleOrIsbnLoan && !isOutOfStock && (
                <div className="p-3 rounded-xl bg-amber-900/70 border border-amber-500/50 text-amber-100 text-xs font-bold flex items-center gap-2.5 mt-3">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-amber-200">Duplicate Book Borrowing Restricted!</p>
                    <p className="text-[11px] text-amber-300 font-normal mt-0.5">
                      This member already has an active loan for '{selectedBookObj?.title}'. One person can never take the same book title at a time.
                    </p>
                  </div>
                </div>
              )}
            </div>



            {/* Return Date Picker */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl text-white">
              <label className="block text-xs font-bold text-indigo-200 mb-2">Return Due Date</label>
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

        {/* Submit Action (Full Width Bottom Bar) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isOutOfStock || hasActiveSameTitleOrIsbnLoan}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs transition shadow-xl flex items-center justify-center gap-2 ${
              (isOutOfStock || hasActiveSameTitleOrIsbnLoan)
                ? "bg-stone-700 text-stone-400 cursor-not-allowed border border-stone-600 opacity-70"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 cursor-pointer active:scale-98"
            }`}
          >
            <span>
              {isOutOfStock
                ? "Book Not Available (0 Copies)"
                : hasActiveSameTitleOrIsbnLoan
                ? "Already Borrowed (Same Book Constraint)"
                : "Issue Book"}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
