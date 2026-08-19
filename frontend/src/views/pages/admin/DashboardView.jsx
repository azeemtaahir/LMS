import { useMemberController } from "../../../hooks/useMemberHook";
import { useBookController } from "../../../hooks/useBookHook";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  UserCheck,
  Upload,
  AlertTriangle,
  BookCheck,
  ArrowRight,
  ClipboardList,
  Sparkles,
} from "lucide-react";

export default function DashboardView() {
  // IMPORTANT:
  // All hooks are called before any return.
  const { stats, recentIssues, students } = useMemberController();
  const { allBooks } = useBookController();

  const totalBooksDisplay =
    stats.totalBooks > 0
      ? stats.totalBooks
      : allBooks
        ? allBooks.length
        : 0;

  const user =
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(localStorage.getItem("lms_user") || "null");

  const displayName = user?.name || "Admin";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none">
      {/* GREETING HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <Sparkles
                size={13}
                className="text-amber-400 fill-amber-400"
              />

              <span>Executive Admin Hub</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {displayName}!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Monitor catalog metrics, manage circulation records, and track
              real-time user activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/transactions/issue"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 inline-flex items-center gap-1.5"
            >
              <Upload size={14} />
              <span>Quick Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">

        {/* Total Books */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalBooksDisplay}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Total Books
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.registeredUsers ??
                stats.registeredStudents ??
                0}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Total Users
            </div>
          </div>
        </div>

        {/* Librarians */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalLibrarians ?? 0}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Total Librarians
            </div>
          </div>
        </div>

        {/* Issued */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Upload size={22} />
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.booksIssued ?? 0}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Books Issued
            </div>
          </div>
        </div>

        {/* Returned */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BookCheck size={22} />
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.booksReturned ?? 0}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Books Returned
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.overdueBooks ?? 0}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Overdue Books
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS + USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RECENT TRANSACTIONS */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-tight">
              <ClipboardList
                size={18}
                className="text-indigo-400"
              />

              <span>Recent Transactions</span>
            </div>

            <Link
              to="/admin/transactions/issued"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">

              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">
                    Borrower / User Name
                  </th>
                  <th className="py-3.5 px-5">Book Name</th>
                  <th className="py-3.5 px-5">Issue Date</th>
                  <th className="py-3.5 px-5">Return Date</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentIssues.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {item.id}
                    </td>

                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {item.studentName}
                    </td>

                    <td className="py-3.5 px-5 text-slate-600">
                      {item.bookTitle}
                    </td>

                    <td className="py-3.5 px-5 text-slate-500">
                      {item.issueDate}
                    </td>

                    <td className="py-3.5 px-5 text-slate-500">
                      {item.returnDate || "15-05-2024"}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === "Issued"
                            ? "bg-amber-100 text-amber-800"
                            : item.status === "Returned"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT USERS */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-tight">
                <Users
                  size={18}
                  className="text-indigo-400"
                />

                <span>Recent Users</span>
              </div>

              <Link
                to="/admin/users/manage"
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-4 space-y-2.5">
              {students.slice(0, 4).map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/20">
                    {st.name ? st.name[0] : "U"}
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {st.name}
                    </div>

                    <div className="text-[10px] text-slate-500 truncate">
                      {st.role ? `${st.role} • ` : ""}
                      {st.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}