import { useState } from "react";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { Eye, ChevronLeft, ChevronRight, CheckCircle2, DollarSign } from "lucide-react";

export default function ReturnBookView() {
  const {
    allIssues,
    handleReturnLoanDirect,
    handlePayFine,
  } = useTransactionController();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const records = (allIssues || []).filter((item) => {
    const finePkr = Number(item.fineAmount) || 0;
    const isPaidOrReturned = item.status === "Returned" || item.fineStatus === "Paid" || item.fine_status === "Paid";
    return !isPaidOrReturned && (item.status === "Overdue" || finePkr > 0);
  });
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentRecords = records.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 select-none">
      {/* Records Table Matching Screenshot Structure */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181C3b] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-5">ID</th>
                <th className="py-4 px-5">BORROWER / USER NAME</th>
                <th className="py-4 px-5">BOOK TITLE</th>
                <th className="py-4 px-5">ISSUE DATE</th>
                <th className="py-4 px-5">DUE DATE</th>
                <th className="py-4 px-5">FINE (500 PKR/WK)</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                    No pending fine records found.
                  </td>
                </tr>
              ) : (
                currentRecords.map((item) => {
                  const isReturned = item.status === "Returned" || item.fineStatus === "Paid" || item.fine_status === "Paid";
                  const finePkr = isReturned ? 0 : (item.fineAmount || 0);
                  const isOverdue = !isReturned && (item.status === "Overdue" || finePkr > 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">{item.id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {item.studentName || item.borrowerName || "Muhammad Nouman"}
                      </td>
                      <td className="py-4 px-5 text-slate-700 max-w-xs font-semibold">
                        {item.bookTitle}
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">{item.issueDate || "2026-08-21"}</td>
                      <td className="py-4 px-5 text-slate-600 font-medium">{item.dueDate || item.returnDate || "2026-09-04"}</td>
                      <td className="py-4 px-5 font-extrabold text-rose-600">
                        {finePkr} PKR
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                            isReturned
                              ? "bg-emerald-100 text-emerald-700"
                              : isOverdue
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isReturned ? "Returned" : (item.status || "Overdue")}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {isOverdue ? (
                            <button
                              onClick={() => handlePayFine(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                              <DollarSign size={13} />
                              <span>Fine Paid</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-medium">Completed</span>
                          )}
                          <button
                            onClick={() => handleReturnLoanDirect(item)}
                            title="View / Complete Action"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Matching Screenshot */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
          <span className="text-slate-500 font-medium">
            Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(validCurrentPage * ITEMS_PER_PAGE, records.length)} of {records.length} records
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
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
          )}
        </div>
      </div>
    </div>
  );
}
