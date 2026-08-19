import { useState } from "react";
import { RotateCcw, BookOpen } from "lucide-react";

export default function MemberMyBooksView() {
  const [activeTab, setActiveTab] = useState("current");

  const [currentLoans, setCurrentLoans] = useState([]);

  const [pastLoans] = useState([]);

  const handleRenewBook = (loanId) => {
    setCurrentLoans((prev) =>
      prev.map((item) =>
        item.id === loanId && item.renewalsLeft > 0
          ? { ...item, dueDate: "2026-09-05", renewalsLeft: item.renewalsLeft - 1, daysLeft: 20 }
          : item
      )
    );
    alert("Book renewal request processed! Extended by 14 days.");
  };

  const handleRequestReturn = (title) => {
    alert(`Return request submitted for "${title}". Please drop off the physical book at the library desk.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Borrowed Books</h1>
          <p className="text-xs text-slate-300 mt-1">Track active loans, request renewals, and view loan history.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "current"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Currently Borrowed ({currentLoans.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Loan History ({pastLoans.length})
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "current" && (
        <div className="space-y-4">
          {currentLoans.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  <BookOpen size={24} />
                </div>
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">By {item.author}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRenewBook(item.id)}
                  disabled={item.renewalsLeft === 0}
                  className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  <span>Renew ({item.renewalsLeft} left)</span>
                </button>

                <button
                  onClick={() => handleRequestReturn(item.title)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Return Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4">
          <p className="text-xs text-slate-600">Loan history records display returned library books.</p>
        </div>
      )}
    </div>
  );
}