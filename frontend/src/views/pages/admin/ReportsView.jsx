import { useState, useMemo, useEffect } from "react";
import api from "../../../api/api";
import {
  FileSpreadsheet,
  BarChart2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer
} from "lucide-react";
import { useTransactionController } from "../../../hooks/useTransactionHook";

const getPastDateStr = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const getTodayStr = () => new Date().toISOString().split("T")[0];

export default function ReportsView() {
  const { allIssues, recentIssues, refreshTransactions } = useTransactionController();

  // Lazy state initializers ensure Date computations only run on initial mount
  const [dateFrom, setDateFrom] = useState(() => getPastDateStr(30));
  const [dateTo, setDateTo] = useState(getTodayStr);
  const [activePreset, setActivePreset] = useState("30days");
  const [dbAnalytics, setDbAnalytics] = useState(null);

  // Fetch reports directly from backend database & listen for live loan updates
  useEffect(() => {
    let isMounted = true;
    const fetchDbReports = async () => {
      try {
        if (refreshTransactions) {
          await refreshTransactions();
        }
        const res = await api.get("/reports", {
          params: { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
        });
        if (isMounted && res.data) {
          setDbAnalytics(res.data);
        }
      } catch (err) {
        console.warn("Backend reports API notice, using synced local dataset:", err?.message);
      }
    };
    fetchDbReports();

    window.addEventListener("book-updated", fetchDbReports);
    return () => {
      isMounted = false;
      window.removeEventListener("book-updated", fetchDbReports);
    };
  }, [dateFrom, dateTo, refreshTransactions]);

  // Memoize rawIssuesList to ensure stable reference across renders
  const rawIssuesList = useMemo(() => {
    return allIssues && allIssues.length > 0 ? allIssues : (recentIssues || []);
  }, [allIssues, recentIssues]);

  // Filter issues by date range
  const filteredIssues = useMemo(() => {
    return rawIssuesList.filter((item) => {
      const issueDateStr = item.issueDate || item.loan_date;
      if (!issueDateStr) return true;
      const dStr = String(issueDateStr).split("T")[0];
      if (dateFrom && dStr < dateFrom) return false;
      if (dateTo && dStr > dateTo) return false;
      return true;
    });
  }, [rawIssuesList, dateFrom, dateTo]);

  // Apply Quick Date Presets
  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "30days") {
      setDateFrom(getPastDateStr(30));
      setDateTo(todayStr);
    } else if (preset === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
      setDateFrom(firstDay);
      setDateTo(todayStr);
    } else if (preset === "thisYear") {
      const jan1 = `${today.getFullYear()}-01-01`;
      setDateFrom(jan1);
      setDateTo(todayStr);
    } else if (preset === "allTime") {
      setDateFrom("");
      setDateTo("");
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setActivePreset("30days");
    setDateFrom(getPastDateStr(30));
    setDateTo(getTodayStr());
  };

  // Compute Top Borrowed Books dynamically
  const topBorrowedBooks = useMemo(() => {
    const counts = {};
    filteredIssues.forEach((issue) => {
      const title = issue.bookTitle || issue.title || "Unknown Book";
      if (!counts[title]) {
        counts[title] = { title, count: 0, category: issue.category || "General" };
      }
      counts[title].count += 1;
    });

    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    const maxCount = sorted[0]?.count || 1;

    return sorted.slice(0, 5).map((item, index) => ({
      rank: index + 1,
      title: item.title,
      category: item.category,
      count: item.count,
      percentage: Math.round((item.count / maxCount) * 100),
    }));
  }, [filteredIssues]);

  // Compute Monthly Circulation Trend
  const monthlyData = useMemo(() => {
    const monthMap = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();

    const refDate = dateTo ? new Date(dateTo) : today;
    const refValid = !isNaN(refDate.getTime()) ? refDate : today;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(refValid.getFullYear(), refValid.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const monthLabel = months[d.getMonth()];
      monthMap[key] = { month: monthLabel, fullKey: key, val: 0, issued: 0, returned: 0 };
    }

    rawIssuesList.forEach((issue) => {
      const dateStr = issue.issueDate || issue.loan_date || issue.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
          if (monthMap[key]) {
            monthMap[key].issued += 1;
            monthMap[key].val += 1;
            if (issue.status === "Returned" || issue.returned_date || issue.returnDate) {
              monthMap[key].returned += 1;
            }
          }
        }
      }
    });

    if (dbAnalytics && dbAnalytics.monthlyTrend && dbAnalytics.monthlyTrend.length > 0) {
      dbAnalytics.monthlyTrend.forEach((item) => {
        const matchingKey = Object.keys(monthMap).find((k) =>
          k.toLowerCase().includes(String(item.month || "").toLowerCase()) ||
          (item.full_key && k.toLowerCase().includes(String(item.full_key).toLowerCase()))
        );
        if (matchingKey && monthMap[matchingKey]) {
          const dbCount = Number(item.count || 0);
          monthMap[matchingKey].val = Math.max(monthMap[matchingKey].val, dbCount);
          monthMap[matchingKey].issued = Math.max(monthMap[matchingKey].issued, dbCount);
        }
      });
    }

    return Object.values(monthMap);
  }, [rawIssuesList, dbAnalytics, dateTo]);

  // Status Counts
  const returnedCount = dbAnalytics?.summary?.returned_count ?? filteredIssues.filter(
    (i) => i.status === "Returned" || i.fineStatus === "Paid" || i.fine_status === "Paid" || Boolean(i.returned_date) || Boolean(i.actualReturnedDate)
  ).length;

  const issuedCount = dbAnalytics?.summary?.issued_count ?? filteredIssues.filter(
    (i) => i.status === "Issued" && !i.returned_date && !i.actualReturnedDate
  ).length;

  const overdueCount = dbAnalytics?.summary?.overdue_count ?? filteredIssues.filter(
    (i) => i.status === "Overdue" && i.status !== "Returned" && !i.returned_date && !i.actualReturnedDate
  ).length;

  const totalPeriodIssues = dbAnalytics?.summary?.total_loans ?? filteredIssues.length;
  const returnRatePercent = totalPeriodIssues > 0 ? Math.round((returnedCount / totalPeriodIssues) * 100) : 100;

  // Export CSV
  const handleExportCSV = () => {
    if (filteredIssues.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Loan ID", "Borrower Name", "Book Title", "Issue Date", "Due Date", "Status"];
    const rows = filteredIssues.map((item) => [
      item.id,
      `"${(item.studentName || "").replace(/"/g, '""')}"`,
      `"${(item.bookTitle || "").replace(/"/g, '""')}"`,
      item.issueDate || item.loan_date || "",
      item.dueDate || item.returnDate || "",
      item.status || "Issued",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Library_Circulation_Report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-10 select-none">
      {/* Date Filter & Preset Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Dark Navy Sub-Bar */}
        <div className="bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-800 shadow-md flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between text-slate-100">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1">
              <Calendar size={13} className="text-indigo-400" /> Date Preset:
            </span>
            {[
              { id: "30days", label: "Last 30 Days" },
              { id: "thisMonth", label: "This Month" },
              { id: "thisYear", label: "This Year" },
              { id: "allTime", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all duration-200 border cursor-pointer select-none ${
                  activePreset === p.id
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
              title="Print / Save as PDF"
            >
              <Printer size={13} className="text-slate-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
              title="Export as CSV Spreadsheet"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Custom Date Inputs */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-slate-700 text-[11px]">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setActivePreset("custom");
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-indigo-500 text-[11px] font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-slate-700 text-[11px]">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setActivePreset("custom");
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:ring-1 focus:ring-indigo-500 text-[11px] font-medium"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            {filteredIssues.length} Records Found
          </span>
        </div>
      </div>

      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Borrowed</span>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{totalPeriodIssues}</div>
            <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">Selected date range</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 border border-indigo-100">
            <BookOpen size={16} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Returned Books</span>
            <div className="text-xl font-extrabold text-emerald-600 tracking-tight mt-0.5">{returnedCount}</div>
            <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">{returnRatePercent}% Return Rate</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Currently Issued</span>
            <div className="text-xl font-extrabold text-amber-600 tracking-tight mt-0.5">{issuedCount}</div>
            <p className="text-[9px] text-amber-600 font-semibold mt-0.5">Active loans out</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 border border-amber-100">
            <Calendar size={16} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overdue Notices</span>
            <div className="text-xl font-extrabold text-rose-600 tracking-tight mt-0.5">{overdueCount}</div>
            <p className="text-[9px] text-rose-600 font-semibold mt-0.5">Pending returns</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0 border border-rose-100">
            <AlertTriangle size={16} />
          </div>
        </div>
      </div>

      {/* Analytics Grid: Ranking & Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Most Borrowed Books Ranking */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-800 shadow-md flex items-center justify-between text-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Top 5 Most Borrowed Books</h3>
            </div>
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/20">
              Live Ranking
            </span>
          </div>

          <div className="space-y-2">
            {topBorrowedBooks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No borrowing data recorded for this date range.</p>
            ) : (
              topBorrowedBooks.map((item) => (
                <div key={item.rank} className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        #{item.rank}
                      </span>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-extrabold text-indigo-600">{item.count}</span>
                      <span className="text-[10px] text-slate-400 font-medium ml-1">loans</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Circulation Trend SVG Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-800 shadow-md flex items-center justify-between text-slate-100">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Monthly Circulation Trend</h3>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Area Curve • Last 6 Months
              </span>
            </div>

            <div className="pt-2 px-1 relative">
              <svg viewBox="0 0 340 210" className="w-full h-[280px] overflow-visible">
                <defs>
                  <linearGradient id="circGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <line x1="20" y1="25" x2="320" y2="25" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="20" y1="77" x2="320" y2="77" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="20" y1="128" x2="320" y2="128" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="20" y1="180" x2="320" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

                <text x="5" y="28" fill="#94a3b8" fontSize="9" fontWeight="bold">{Math.max(...monthlyData.map(m=>m.val), 5)}</text>
                <text x="5" y="80" fill="#94a3b8" fontSize="9" fontWeight="bold">{Math.round(Math.max(...monthlyData.map(m=>m.val), 5) * 0.7)}</text>
                <text x="5" y="131" fill="#94a3b8" fontSize="9" fontWeight="bold">{Math.round(Math.max(...monthlyData.map(m=>m.val), 5) * 0.3)}</text>
                <text x="5" y="183" fill="#94a3b8" fontSize="9" fontWeight="bold">0</text>

                {(() => {
                  const maxV = Math.max(...monthlyData.map(m => m.val), 5);
                  const pts = monthlyData.map((m, idx) => {
                    const x = 30 + (idx / Math.max(monthlyData.length - 1, 1)) * 280;
                    const y = 180 - (m.val / maxV) * 155;
                    return { ...m, x, y };
                  });

                  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaD = `${lineD} L ${pts[pts.length - 1].x} 180 L ${pts[0].x} 180 Z`;

                  return (
                    <g>
                      <path d={areaD} fill="url(#circGradient)" />
                      <path d={lineD} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                      {pts.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          <text
                            x={p.x}
                            y={p.y - 9}
                            textAnchor="middle"
                            fill={p.val > 0 ? "#4338ca" : "#94a3b8"}
                            fontSize="11"
                            fontWeight="bold"
                          >
                            {p.val}
                          </text>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={p.val > 0 ? "5" : "3.5"}
                            fill={p.val > 0 ? "#4f46e5" : "#cbd5e1"}
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            className="transition-all duration-200 hover:r-7"
                          />
                          <text
                            x={p.x}
                            y="200"
                            textAnchor="middle"
                            fill="#475569"
                            fontSize="11"
                            fontWeight="600"
                          >
                            {p.month}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Peak Circulation Month</span>
            <span className="font-bold text-indigo-600">
              {monthlyData.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), monthlyData[0] || {}).month || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}