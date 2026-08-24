import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { Eye, ChevronLeft, ChevronRight, DollarSign, Receipt, CheckCircle, Clock } from "lucide-react";
import api from "../../../api/api";

export default function ReturnBookView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    allIssues,
    handleReturnLoanDirect,
    handlePayFine,
  } = useTransactionController();

  const isRecordsView = searchParams.get("records") === "true";
  const [currentPage, setCurrentPage] = useState(1);
  const [finePaymentHistory, setFinePaymentHistory] = useState([]);
  const ITEMS_PER_PAGE = 5;

  // Fetch fine_payment records from backend
  useEffect(() => {
    let isMounted = true;
    const fetchPayments = async () => {
      try {
        const res = await api.get("/fine-payments");
        if (isMounted && res.data?.payments) {
          setFinePaymentHistory(res.data.payments);
        }
      } catch (err) {
        console.warn("Could not fetch fine-payments:", err?.message);
      }
    };
    fetchPayments();
    return () => { isMounted = false; };
  }, [allIssues]);

  // Pending fines: Overdue books that are NOT yet paid or returned
  const pendingRecords = (allIssues || []).filter((item, index, self) => {
    const finePkr = Number(item.fineAmount) || 0;
    const isPaid = item.fineStatus === "Paid" || item.fine_status === "Paid";
    const isReturned = item.status === "Returned";
    if (isPaid || isReturned) return false;
    const isFirst = self.findIndex((t) => t.id === item.id) === index;
    return isFirst && (item.status === "Overdue" || finePkr > 0);
  });

  // Paid fine records: strictly records where DUE DATE WAS OVER (overdue) AND fine is PAID
  const paidRecords = (allIssues || []).filter((item, index, self) => {
    const isPaid = item.fineStatus === "Paid" || item.fine_status === "Paid";

    const dueDateStr = item.dueDate || item.due_date || item.returnDate;
    const issueDateStr = item.issueDate || item.loan_date;
    const dueDate = dueDateStr ? new Date(dueDateStr) : (issueDateStr ? new Date(new Date(issueDateStr).getTime() + 14 * 24 * 3600 * 1000) : null);
    const endDate = item.returned_date ? new Date(item.returned_date) : new Date();

    const diffDays = dueDate && !isNaN(dueDate.getTime()) ? Math.ceil((endDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)) : 0;
    const wasOverdue = diffDays > 0 || (Number(item.overdueDays) || 0) > 0 || (Number(item.overdueWeeks) || 0) > 0;

    const isFirst = self.findIndex((t) => t.id === item.id) === index;
    return isFirst && isPaid && wasOverdue;
  });

  const activeList = isRecordsView ? paidRecords : pendingRecords;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentRecords = activeList.slice(
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

  const toggleView = (showRecords) => {
    const newParams = new URLSearchParams(searchParams);
    if (showRecords) {
      newParams.set("records", "true");
    } else {
      newParams.delete("records");
    }
    setSearchParams(newParams, { replace: true });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 select-none">
      {/* Main Records Table */}
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
                <th className="py-4 px-5">{isRecordsView ? "FINE PAID" : "FINE (500 PKR/WK)"}</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                    {isRecordsView 
                      ? "No completed fine payment records found."
                      : "No pending fine records found."}
                  </td>
                </tr>
              ) : (
                currentRecords.map((item) => {
                  const isPaid = item.fineStatus === "Paid" || item.fine_status === "Paid";
                  const isReturned = item.status === "Returned" || isPaid;
                  const finePkr = isReturned ? (isPaid ? (item.fineAmount || 500) : 0) : (item.fineAmount || 0);

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
                      <td className={`py-4 px-5 font-extrabold ${isReturned ? "text-emerald-600" : "text-rose-600"}`}>
                        {finePkr} PKR
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                            isReturned
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {isReturned ? "Returned" : (item.status || "Overdue")}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {!isReturned ? (
                            <button
                              onClick={() => handlePayFine(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                              <DollarSign size={13} />
                              <span>Fine Paid</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 italic text-xs font-semibold">
                              <CheckCircle size={13} className="text-emerald-600" />
                              <span>Completed</span>
                            </span>
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
          <span className="text-slate-500 font-medium">
            Showing {activeList.length === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(validCurrentPage * ITEMS_PER_PAGE, activeList.length)} of {activeList.length} records
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
              {getVisiblePages(validCurrentPage, totalPages, 3).map((page) => (
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