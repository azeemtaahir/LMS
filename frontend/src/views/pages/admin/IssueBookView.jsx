import { useNavigate, useLocation } from "react-router-dom";
import { useBookController } from "../../../hooks/useBookHook";
import { useMemberController } from "../../../hooks/useMemberHook";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { User, BookOpen, ArrowRight } from "lucide-react";

export default function IssueBookView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books } = useBookController();
  const { students } = useMemberController();
  const { issueFormData, setIssueFormData, handleIssueBookSubmit } = useTransactionController();

  const selectedStudentObj = students.find((s) => String(s.id) === String(issueFormData.studentId));
  const selectedBookObj = books.find((b) => String(b.id) === String(issueFormData.bookId));

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleIssueBookSubmit(e);
    const targetPath = location.pathname.startsWith("/librarian")
      ? "/librarian/transactions/issued"
      : "/admin/transactions/issued";
    navigate(targetPath);
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
                {students.map((st) => (
                  <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                    {st.name} — [{st.role || "Student"}] ({st.studentId})
                  </option>
                ))}
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
                    {selectedStudentObj ? selectedStudentObj.studentId : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Name:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.name : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Department:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.department : "—"}{" "}
                    {selectedStudentObj?.designation ? `(${selectedStudentObj.designation})` : selectedStudentObj?.semester ? `(${selectedStudentObj.semester})` : ""}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Email:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.email : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-200">Phone:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.phone || "1234567890" : "—"}
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
                  const d = new Date(newIssueDate);
                  let calcReturn = "";
                  if (!isNaN(d.getTime())) {
                    d.setDate(d.getDate() + 7);
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
                {books.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.title} — by {b.author}
                  </option>
                ))}
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
                <div className="space-y-1 text-xs text-slate-300">
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
                      <span className="font-bold text-emerald-400">{selectedBookObj.availableCopies}</span>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Return Date Picker */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/40 shadow-xl text-white">
              <label className="block text-xs font-bold text-indigo-200 mb-2">Return Date</label>
              <input
                type="date"
                value={issueFormData.returnDate}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Submit Action (Full Width Bottom Bar) */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Issue Book</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
