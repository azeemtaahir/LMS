import { useNavigate } from "react-router-dom";
import { useBookController } from "../../../hooks/useBookHook";
import { useMemberController } from "../../../hooks/useMemberHook";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { User, BookOpen, ArrowRight } from "lucide-react";

export default function IssueBookView() {
  const navigate = useNavigate();
  const { books } = useBookController();
  const { students } = useMemberController();
  const { issueFormData, setIssueFormData, handleIssueBookSubmit } = useTransactionController();

  const selectedStudentObj = students.find((s) => String(s.id) === String(issueFormData.studentId));
  const selectedBookObj = books.find((b) => String(b.id) === String(issueFormData.bookId));

  const onSubmit = (e) => {
    e.preventDefault();
    handleIssueBookSubmit(e);
    navigate("/admin/transactions/issued");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Wireframe #6 Layout Grid */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN: STUDENT SELECTION & PREVIEW */}
          <div className="space-y-4">
            {/* Select User Dropdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Select User (Student / Teacher) *</label>
              <select
                value={issueFormData.studentId}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              >
                <option value="">Select borrower user</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — [{st.role || "Student"}] ({st.studentId})
                  </option>
                ))}
              </select>
            </div>

            {/* User Information Preview Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-2">
                User Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <User size={32} />
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <div>
                    <span className="font-semibold text-stone-800">Role:</span>{" "}
                    <span className="font-bold text-indigo-600">{selectedStudentObj ? selectedStudentObj.role || "Student" : "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">User ID:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.studentId : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Name:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.name : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Department:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.department : "—"}{" "}
                    {selectedStudentObj?.designation ? `(${selectedStudentObj.designation})` : selectedStudentObj?.semester ? `(${selectedStudentObj.semester})` : ""}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Email:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.email : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Phone:</span>{" "}
                    {selectedStudentObj ? selectedStudentObj.phone || "1234567890" : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Date Picker */}
            <div className="bg-white p-4 rounded-xl border border-amber-900/10 shadow-xs">
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Issue Date</label>
              <input
                type="date"
                value={issueFormData.issueDate}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>

            {/* Notes (Optional) */}
            <div className="bg-white p-4 rounded-xl border border-amber-900/10 shadow-xs">
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Notes (Optional)</label>
              <textarea
                rows="2"
                value={issueFormData.notes}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter notes..."
                className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: BOOK SELECTION & PREVIEW */}
          <div className="space-y-4">
            {/* Select Book Dropdown */}
            <div className="bg-white p-4 rounded-xl border border-amber-900/10 shadow-xs">
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Select Book *</label>
              <select
                value={issueFormData.bookId}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, bookId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
                required
              >
                <option value="">Select book</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — by {b.author}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Information Preview Card */}
            <div className="bg-white p-5 rounded-xl border border-amber-900/10 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-2">
                Book Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-20 rounded-lg bg-amber-50 border border-amber-900/10 flex items-center justify-center text-[#522E1E] shrink-0">
                  <BookOpen size={30} />
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <div>
                    <span className="font-semibold text-stone-800">Title:</span>{" "}
                    {selectedBookObj ? selectedBookObj.title : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Author:</span>{" "}
                    {selectedBookObj ? selectedBookObj.author : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">ISBN:</span>{" "}
                    {selectedBookObj ? selectedBookObj.isbn : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Category:</span>{" "}
                    {selectedBookObj ? selectedBookObj.category : "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800">Available Copies:</span>{" "}
                    {selectedBookObj ? (
                      <span className="font-bold text-emerald-700">{selectedBookObj.availableCopies}</span>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Return Date Picker */}
            <div className="bg-white p-4 rounded-xl border border-amber-900/10 shadow-xs">
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Return Date</label>
              <input
                type="date"
                value={issueFormData.returnDate}
                onChange={(e) => setIssueFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#2C1810] text-white font-semibold text-xs hover:bg-[#42261A] transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Issue Book</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
