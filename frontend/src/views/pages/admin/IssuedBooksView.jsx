import { useState } from "react";
import { toast } from "sonner";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { Eye, ChevronLeft, ChevronRight, Edit3, X, Calendar } from "lucide-react";

export default function IssuedBooksView() {
  const {
    recentIssues,
    handleReturnLoanDirect,
    handleExtendLoanDueDate,
  } = useTransactionController();

  const [currentPage, setCurrentPage] = useState(1);
  const [editingLoan, setEditingLoan] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [extensionPreset, setExtensionPreset] = useState("7");

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil((recentIssues || []).length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentIssues = (recentIssues || []).slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  const getVisiblePages = (current, total, maxVisible = 3) => {
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, current - 1);
    let end = start + maxVisible - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const openEditModal = (item) => {
    setEditingLoan(item);
    const initialDue = item.dueDate || item.returnDate || new Date().toISOString().split("T")[0];
    setNewDueDate(initialDue);
    setExtensionPreset("custom");
  };

  const handleSaveDueDate = async (e) => {
    e.preventDefault();
    if (!editingLoan || !newDueDate) return;
    const ok = await handleExtendLoanDueDate(editingLoan.id, newDueDate);
    if (ok) {
      setEditingLoan(null);
    }
  };

  const applyPresetExtension = (days) => {
    if (!editingLoan) return;
    const baseDateStr = editingLoan.dueDate || editingLoan.returnDate || editingLoan.issueDate || new Date().toISOString().split("T")[0];
    const d = new Date(baseDateStr);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + Number(days));
      setNewDueDate(d.toISOString().split("T")[0]);
      setExtensionPreset(String(days));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Issued Books Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-200 font-semibold uppercase tracking-wider text-[11px] border-b border-indigo-950">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Borrower / User Name</th>
                <th className="py-3.5 px-4">Book Title</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentIssues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No issued records found.
                  </td>
                </tr>
              ) : (
                currentIssues.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.studentName}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{item.bookTitle}</td>
                    <td className="py-3 px-4 text-slate-600">{item.issueDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-semibold text-indigo-900">
                      {item.dueDate || item.returnDate || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          (item.status === "Returned" || item.fineStatus === "Paid" || item.fine_status === "Paid")
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "Issued"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {(item.status === "Returned" || item.fineStatus === "Paid" || item.fine_status === "Paid") ? "Returned" : item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === "Issued" ? (
                          <>
                            <button
                              title="Extend Loan / Edit Due Date"
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 size={13} />
                              <span>Extend</span>
                            </button>
                            <button
                              title="Return Book"
                              onClick={() => handleReturnLoanDirect(item)}
                              className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer"
                            >
                              Return
                            </button>
                          </>
                        ) : (item.status === "Returned" || item.fineStatus === "Paid" || item.fine_status === "Paid") ? (
                          <span className="text-[11px] font-semibold text-slate-400 italic">Completed</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-600 italic">Pending</span>
                        )}
                        <button
                          title="View Details"
                          onClick={() => toast.info(`Issue Log #${item.id} Details`, { description: `Student: ${item.studentName} | Book: ${item.bookTitle} | Issued: ${item.issueDate} | Due: ${item.dueDate || item.returnDate} | Status: ${item.status}` })}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(validCurrentPage * ITEMS_PER_PAGE, (recentIssues || []).length)} of {(recentIssues || []).length} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft size={16} />
              </button>
              {getVisiblePages(validCurrentPage, totalPages, 3).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    validCurrentPage === page
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={validCurrentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT / EXTEND LOAN DUE DATE MODAL */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl border border-indigo-900/50 shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-indigo-200">Extend / Edit Loan Duration</h3>
              </div>
              <button
                onClick={() => setEditingLoan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-900/30">
              <p><span className="text-indigo-300 font-semibold">Borrower:</span> {editingLoan.studentName}</p>
              <p><span className="text-indigo-300 font-semibold">Book:</span> {editingLoan.bookTitle}</p>
              <p><span className="text-indigo-300 font-semibold">Issued Date:</span> {editingLoan.issueDate}</p>
              <p><span className="text-indigo-300 font-semibold">Current Due Date:</span> {editingLoan.dueDate || editingLoan.returnDate || "-"}</p>
            </div>

            <form onSubmit={handleSaveDueDate} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-indigo-200">Extend By Duration:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "+1 Wk", days: 7 },
                    { label: "+2 Wks", days: 14 },
                    { label: "+3 Wks", days: 21 },
                    { label: "+4 Wks", days: 28 },
                  ].map((btn) => (
                    <button
                      type="button"
                      key={btn.days}
                      onClick={() => applyPresetExtension(btn.days)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        extensionPreset === String(btn.days)
                          ? "bg-indigo-600 border-indigo-400 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-indigo-200">New Return Due Date *</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => {
                    setNewDueDate(e.target.value);
                    setExtensionPreset("custom");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  Save New Due Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}