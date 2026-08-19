import { useState } from "react";
import { Filter, Download, FileSpreadsheet, BarChart2, PieChart, Users, Sparkles, TrendingUp } from "lucide-react";
import { useMemberHook } from "../../../hooks/useMemberHook";
import { useTransactionHook } from "../../../hooks/useTransactionHook";

export default function ReportsView() {
  const [dateFrom, setDateFrom] = useState("2024-05-01");
  const [dateTo, setDateTo] = useState("2024-05-31");
  const { students } = useMemberHook();
  const { overdueBooks } = useTransactionHook();

  const topBorrowedBooks = [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1 border border-indigo-500/30">
            <Sparkles size={13} className="text-amber-400 fill-amber-400" />
            <span>Library Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-300 mt-1">Generate circulation reports, monitor monthly trend metrics, and export data summaries.</p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 items-center justify-center text-indigo-300 shrink-0">
          <BarChart2 size={24} />
        </div>
      </div>

      {/* Date Filter & Export Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-1.5">
            <Filter size={14} />
            <span>Apply Filter</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5">
            <Download size={14} />
            <span>Export PDF</span>
          </button>
          <button className="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5">
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Borrowed Books */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Most Borrowed Books</h3>
            </div>
            <span className="badge-indigo text-[10px] px-2.5 py-0.5 rounded-full font-bold">Top Ranked</span>
          </div>

          <div className="space-y-3">
            {topBorrowedBooks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No borrowing data recorded yet.</p>
            ) : (
              topBorrowedBooks.map((item) => (
                <div key={item.rank} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition">
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-indigo-600/20">
                      #{item.rank}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <span className="text-[10px] font-medium text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600">{item.count}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Loans</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Issued Books Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Monthly Circulation Trend</h3>
            <BarChart2 size={18} className="text-indigo-600" />
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { month: "Jan", val: 0 },
              { month: "Feb", val: 0 },
              { month: "Mar", val: 0 },
              { month: "Apr", val: 0 },
              { month: "May", val: 0 },
              { month: "Jun", val: 0 },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.val}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-xl hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-md shadow-indigo-600/20"
                  style={{ height: `${Math.max(bar.val, 4)}%` }}
                />
                <span className="text-[11px] font-semibold text-slate-500">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Students Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Registered Students</span>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{students.length} Students</div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Live database total</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
            <Users size={24} />
          </div>
        </div>

        {/* Overdue Books Summary Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue Books Pending</span>
            <div className="text-2xl font-extrabold text-rose-600 tracking-tight mt-1">{overdueBooks.length} Overdue</div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Live database total</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
            <PieChart size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

