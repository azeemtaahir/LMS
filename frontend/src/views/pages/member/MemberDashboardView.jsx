import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useBookController } from "../../../hooks/useBookHook";
import {
  BookOpen,
  BookMarked,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Sparkles,
  Clock,
  UserCheck,
  GraduationCap,
} from "lucide-react";

export default function MemberDashboardView() {
  const { user } = useAuth();
  const { books } = useBookController();

  const [borrowedBooks] = useState([]);

  const memberName = user?.name || user?.username || "Member";
  const memberRole = user?.role || "Student";
  const memberId = user?.studentId || "M-101";
  const department = user?.department || "General";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none">
      {/* GREETING HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <Sparkles size={13} className="text-amber-400 fill-amber-400" />
              <span>Library User Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {memberName}!
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {memberRole === "Teacher" ? <UserCheck size={12} /> : <GraduationCap size={12} />}
                {memberRole}
              </span>
              <span>•</span>
              <span>ID: <strong className="text-white">{memberId}</strong></span>
              <span>•</span>
              <span>{department}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/member/search"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 inline-flex items-center gap-1.5"
            >
              <Search size={14} />
              <span>Search Books</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 MEMBER STAT CARDS */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 bg-white shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookMarked size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {borrowedBooks.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Currently Borrowed</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 bg-white shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {borrowedBooks.filter((b) => b.daysLeft < 0).length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Overdue Books</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 bg-white shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {books.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Total Books</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 bg-white shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold text-lg">
            $
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">$0.00</div>
            <div className="text-[11px] font-semibold text-slate-500">Pending Fines</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: ACTIVE LOANS & RECOMMENDED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-tight">
              <BookMarked size={18} className="text-indigo-400" />
              <span>My Active Borrowed Books</span>
            </div>
            <Link
              to="/member/my-books"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              View My Books <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {borrowedBooks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No active borrowed books currently.
              </div>
            ) : (
              borrowedBooks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-14 rounded-lg bg-gradient-to-br ${item.coverColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md`}
                    >
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">By {item.author}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                          {item.category}
                        </span>
                        <span className="text-slate-400">Issued: {item.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Due Date</span>
                      <span className="text-xs font-bold text-slate-800">{item.dueDate}</span>
                    </div>

                    {item.daysLeft < 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                        <AlertTriangle size={12} />
                        Overdue ({Math.abs(item.daysLeft)} days)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        <Clock size={12} />
                        {item.daysLeft} days left
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-tight">
              <Sparkles size={18} className="text-amber-400" />
              <span>Catalog Suggestions</span>
            </div>
            <Link
              to="/member/search"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              Search All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {books.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <div className="w-9 h-11 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 font-bold">
                  <BookOpen size={18} />
                </div>
                <div className="truncate flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{b.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{b.author}</div>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">
                    Available ({b.availableQuantity || 3})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
