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
  const { stats, recentIssues, students, recentLogins } = useMemberController();
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
    <div className="space-y-4 max-w-7xl mx-auto pb-6 select-none">
      {/* GREETING HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3 sm:px-5 sm:py-3 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold mb-0.5 border border-indigo-500/30">
              <Sparkles
                size={11}
                className="text-amber-400 fill-amber-400"
              />

              <span>Executive Admin Hub</span>
            </div>

            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              Welcome back, {displayName}!
            </h1>

            <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl leading-tight">
              Monitor catalog metrics, manage circulation records, and track
              real-time user activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/issue"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm inline-flex items-center gap-1.5"
            >
              <Upload size={13} />
              <span>Quick Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">

        {/* Total Books */}
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {totalBooksDisplay}
            </div>

            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
              Total Books
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {stats.registeredUsers ??
                stats.registeredStudents ??
                0}
            </div>

            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
              Total Users
            </div>
          </div>
        </div>

        {/* Librarians */}
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {stats.totalLibrarians ?? 0}
            </div>

            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
              Total Librarians
            </div>
          </div>
        </div>

        {/* Issued */}
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Upload size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {stats.booksIssued ?? 0}
            </div>

            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
              Books Issued
            </div>
          </div>
        </div>

        {/* Returned */}
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BookCheck size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {stats.booksReturned ?? 0}
            </div>

            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
              Books Returned
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
              {stats.overdueBooks ?? 0}
            </div>

            <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
              Overdue Books
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS + USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 flex-1 min-h-0">

        {/* RECENT TRANSACTIONS */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-w-0">

          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-3 flex items-center justify-between text-white border-b border-indigo-900/40">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-tight">
              <ClipboardList
                size={16}
                className="text-indigo-400"
              />

              <span>Recent Transactions</span>
            </div>

            <Link
              to="/issued"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              View All
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar flex-1">
            <table className="w-full text-left text-xs">

              <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-200 font-bold uppercase tracking-wider text-[10px] border-b border-indigo-950">
                <tr>
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">
                    Borrower / User Name
                  </th>
                  <th className="py-2.5 px-4">Book Name</th>
                  <th className="py-2.5 px-4">Issue Date</th>
                  <th className="py-2.5 px-4">Return Date</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentIssues.slice(0, 4).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {item.id}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item.studentName}
                    </td>

                    <td className="py-2.5 px-4 text-slate-600">
                      {item.bookTitle}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500">
                      {item.issueDate}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500">
                      {item.returnDate || "15-05-2024"}
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === "Issued"
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

        {/* RECENT LOGINS */}
        <div className="min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-tight">
                <Users
                  size={16}
                  className="text-indigo-400"
                />

                <span>Recent Users</span>
              </div>

              <Link
                to="/users"
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
              >
                View All
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="p-3 space-y-1.5">
              {(() => {
                const userList = (recentLogins && recentLogins.length > 0) ? recentLogins : (students || []);
                const itemsToDisplay = userList.slice(0, 4);

                if (itemsToDisplay.length === 0) {
                  return (
                    <div className="py-4 text-center text-slate-400 text-xs font-medium">
                      No recent users found.
                    </div>
                  );
                }

                return itemsToDisplay.map((st) => (
                  <div
                    key={st.id || st.studentId || st.email || st.user_id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {st.name ? st.name[0].toUpperCase() : (st.first_name ? st.first_name[0].toUpperCase() : "U")}
                      </div>

                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                          {st.name || `${st.first_name || ""} ${st.last_name || ""}`.trim() || "User"}
                        </div>

                        <div className="text-[10px] text-slate-500 truncate">
                          {st.role ? `${st.role} • ` : ""}
                          {st.email || st.studentId || st.user_id}
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}