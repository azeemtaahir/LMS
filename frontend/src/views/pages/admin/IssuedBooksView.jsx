import { useState } from "react";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function IssuedBooksView() {
  const {
    recentIssues,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    handleReturnLoanDirect,
  } = useTransactionController();

  const [currentPage, setCurrentPage] = useState(1);
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
                    <td className="py-3 px-4 text-slate-600">{item.dueDate || item.returnDate || "-"}</td>
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
                          <button
                            title="Return Book"
                            onClick={() => handleReturnLoanDirect(item)}
                            className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer"
                          >
                            Return
                          </button>
                        ) : (item.status === "Returned" || item.fineStatus === "Paid" || item.fine_status === "Paid") ? (
                          <span className="text-[11px] font-semibold text-slate-400 italic">Completed</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-600 italic">Pending</span>
                        )}
                        <button
                          title="View Details"
                          onClick={() => alert(`Issue Log Details:\nID: ${item.id}\nStudent: ${item.studentName}\nBook: ${item.bookTitle}\nIssue Date: ${item.issueDate}\nStatus: ${item.status}`)}
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
    </div>
  );
}