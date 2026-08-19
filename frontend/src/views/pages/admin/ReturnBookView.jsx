import { useTransactionController } from "../../../hooks/useTransactionHook";
import { Search, BookCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function ReturnBookView() {
  const {
    searchStudentId,
    setSearchStudentId,
    searchBookId,
    setSearchBookId,
    activeReturnDetails,
    handleSearchReturnRecord,
    handleCompleteReturn,
  } = useTransactionController();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1 border border-indigo-500/30">
            <Sparkles size={13} className="text-amber-400 fill-amber-400" />
            <span>Circulation Management</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Return Book Workflow</h1>
          <p className="text-xs text-slate-300 mt-1">Search active loan records by Student ID or Book ID to calculate fines and process return.</p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 items-center justify-center text-indigo-300 shrink-0">
          <BookCheck size={24} />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Search Inputs Section */}
        <form onSubmit={handleSearchReturnRecord} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search Student ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Student ID</label>
            <div className="relative">
              <input
                type="text"
                value={searchStudentId}
                onChange={(e) => setSearchStudentId(e.target.value)}
                placeholder="Enter student ID..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Search Book ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Book ID</label>
            <div className="relative">
              <input
                type="text"
                value={searchBookId}
                onChange={(e) => setSearchBookId(e.target.value)}
                placeholder="Enter book ID..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </form>

        {/* Issued Book Details Card */}
        <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center justify-between">
            <span>Issued Loan Summary</span>
            <span className="badge-indigo text-[10px] px-2.5 py-0.5 rounded-full font-bold">Active Record</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900">{activeReturnDetails?.studentName || "-"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Book Title:</span>
              <span className="font-bold text-slate-900">{activeReturnDetails?.bookTitle || "-"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Issue Date:</span>
              <span className="font-medium text-slate-800">{activeReturnDetails?.issueDate || "-"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Due Date:</span>
              <span className="font-medium text-slate-800">{activeReturnDetails?.dueDate || "-"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Return Date:</span>
              <span className="font-medium text-slate-800">
                {activeReturnDetails ? (activeReturnDetails.returnDate || new Date().toLocaleDateString("en-GB")) : "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm pt-2">
              <span className="font-bold text-slate-900">Fine Due:</span>
              <span className="font-extrabold text-rose-600">{activeReturnDetails?.fine || "$0.00"}</span>
            </div>
          </div>
        </div>

        {/* Return Book Action Button */}
        <div>
          <button
            onClick={handleCompleteReturn}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Complete Book Return</span>
          </button>
        </div>
      </div>
    </div>
  );
}

