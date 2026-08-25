import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { useAuth } from "../../../context/AuthContext";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CheckCircle,
  Pencil,
  X,
} from "lucide-react";

export default function ReturnBookView() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin" || !user?.role || user?.email?.toLowerCase().includes("admin");

  const {
    allIssues,
    handleReturnLoanDirect,
    handlePayFine,
    handleUpdateFineAmount,
  } = useTransactionController();

  const [editFineModalOpen, setEditFineModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newFineAmount, setNewFineAmount] = useState("");
  const [updatingFine, setUpdatingFine] = useState(false);

  const isRecordsView = searchParams.get("records") === "true";

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  // Pending fines: Overdue books that are NOT yet paid or returned
  const pendingRecords = (allIssues || []).filter(
    (item, index, self) => {
      const finePkr = Number(item.fineAmount) || 0;

      const isPaid =
        item.fineStatus === "Paid" ||
        item.fine_status === "Paid";

      const isReturned = item.status === "Returned";

      if (isPaid || isReturned) return false;

      const isFirst =
        self.findIndex((t) => t.id === item.id) === index;

      return (
        isFirst &&
        (item.status === "Overdue" || finePkr > 0)
      );
    }
  );

  // Paid fine records: records where the book was overdue and fine is paid
  const paidRecords = (allIssues || []).filter(
    (item, index, self) => {
      const isPaid =
        item.fineStatus === "Paid" ||
        item.fine_status === "Paid";

      const dueDateStr =
        item.dueDate ||
        item.due_date ||
        item.returnDate;

      const issueDateStr =
        item.issueDate ||
        item.loan_date;

      const dueDate = dueDateStr
        ? new Date(dueDateStr)
        : issueDateStr
        ? new Date(
            new Date(issueDateStr).getTime() +
              14 * 24 * 3600 * 1000
          )
        : null;

      const endDate = item.returned_date
        ? new Date(item.returned_date)
        : new Date();

      const diffDays =
        dueDate && !isNaN(dueDate.getTime())
          ? Math.ceil(
              (endDate.getTime() - dueDate.getTime()) /
                (1000 * 3600 * 24)
            )
          : 0;

      const wasOverdue =
        diffDays > 0 ||
        (Number(item.overdueDays) || 0) > 0 ||
        (Number(item.overdueWeeks) || 0) > 0;

      const isFirst =
        self.findIndex((t) => t.id === item.id) === index;

      return isFirst && isPaid && wasOverdue;
    }
  );

  // Decide which records to display
  const activeList = isRecordsView
    ? paidRecords
    : pendingRecords;

  const totalPages = Math.ceil(
    activeList.length / ITEMS_PER_PAGE
  );

  const validCurrentPage = Math.max(
    1,
    Math.min(currentPage, totalPages || 1)
  );

  const currentRecords = activeList.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // Pagination page numbers
  const getVisiblePages = (
    current,
    total,
    maxVisible = 3
  ) => {
    if (total <= maxVisible) {
      return Array.from(
        { length: total },
        (_, i) => i + 1
      );
    }

    let start = Math.max(1, current - 1);
    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = Math.max(
        1,
        end - maxVisible + 1
      );
    }

    const pages = [];

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 select-none">

      {/* Main Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-[#181C3b] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-5">
                  ID
                </th>

                <th className="py-4 px-5">
                  BORROWER / USER NAME
                </th>

                <th className="py-4 px-5">
                  BOOK TITLE
                </th>

                <th className="py-4 px-5">
                  ISSUE DATE
                </th>

                <th className="py-4 px-5">
                  DUE DATE
                </th>

                <th className="py-4 px-5">
                  {isRecordsView
                    ? "FINE PAID"
                    : "FINE (500 PKR/WK)"}
                </th>

                <th className="py-4 px-5">
                  STATUS
                </th>

                <th className="py-4 px-5 text-center">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">

              {currentRecords.length === 0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    {isRecordsView
                      ? "No completed fine payment records found."
                      : "No pending fine records found."}
                  </td>
                </tr>

              ) : (

                currentRecords.map((item) => {
                  const isPaid =
                    item.fineStatus === "Paid" ||
                    item.fine_status === "Paid";

                  const isReturned =
                    item.status === "Returned" ||
                    isPaid;

                  const finePkr = isReturned
                    ? isPaid
                      ? item.fineAmount || 500
                      : 0
                    : item.fineAmount || 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {item.id}
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900">
                        {item.studentName ||
                          item.borrowerName ||
                          "Muhammad Nouman"}
                      </td>

                      <td className="py-4 px-5 text-slate-700 max-w-xs font-semibold">
                        {item.bookTitle}
                      </td>

                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {item.issueDate || "2026-08-21"}
                      </td>

                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {item.dueDate ||
                          item.returnDate ||
                          "2026-09-04"}
                      </td>

                      <td
                        className={`py-4 px-5 font-extrabold ${
                          isReturned
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
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
                          {isReturned
                            ? "Returned"
                            : item.status || "Overdue"}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-3">

                          {!isReturned ? (
                            <button
                              onClick={() =>
                                handlePayFine(item)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                              <DollarSign size={13} />
                              <span>Fine Paid</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 italic text-xs font-semibold">
                              <CheckCircle
                                size={13}
                                className="text-emerald-600"
                              />
                              <span>Completed</span>
                            </span>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setNewFineAmount(String(finePkr));
                                setEditFineModalOpen(true);
                              }}
                              title="Edit Fine Amount"
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleReturnLoanDirect(item)
                            }
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
            Showing{" "}
            {activeList.length === 0
              ? 0
              : (validCurrentPage - 1) *
                  ITEMS_PER_PAGE +
                1}{" "}
            to{" "}
            {Math.min(
              validCurrentPage * ITEMS_PER_PAGE,
              activeList.length
            )}{" "}
            of {activeList.length} records
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">

              {/* Previous Button */}
              <button
                disabled={validCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {getVisiblePages(
                validCurrentPage,
                totalPages,
                3
              ).map((page) => (
                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    validCurrentPage === page
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                disabled={
                  validCurrentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronRight size={16} />
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Edit Fine Modal for Admin */}
      {editFineModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-left">
            {/* Header */}
            <div className="bg-[#181C3b] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Edit Fine Amount</h3>
              </div>
              <button
                onClick={() => {
                  setEditFineModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Borrower:</span>
                  <span className="font-bold text-slate-900">
                    {editingItem.studentName || editingItem.borrowerName || "Borrower"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Book Title:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                    {editingItem.bookTitle || "Book"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Fine:</span>
                  <span className="font-extrabold text-rose-600">
                    {editingItem.fineAmount || 0} PKR
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Fine Amount (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={newFineAmount}
                  onChange={(e) => setNewFineAmount(e.target.value)}
                  placeholder="Enter fine amount in PKR"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-900 outline-none transition"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditFineModalOpen(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-100 font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingFine}
                onClick={async () => {
                  setUpdatingFine(true);
                  const success = await handleUpdateFineAmount(editingItem, newFineAmount);
                  setUpdatingFine(false);
                  if (success) {
                    setEditFineModalOpen(false);
                    setEditingItem(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {updatingFine ? "Saving..." : "Save Fine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}