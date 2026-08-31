import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  BookUp, 
  BookDown, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

import { useBookHook } from '../../../hooks/useBookHook';
import { useTransactionHook } from '../../../hooks/useTransactionHook';

export default function LibrarianDashboardView() {
  const navigate = useNavigate();
  const { books } = useBookHook();
  const { recentIssues, overdueBooks } = useTransactionHook();

  const stats = [
    { label: "Total Books in Catalog", value: books.length.toString(), icon: BookOpen, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Active Issued Loans", value: recentIssues.filter(i => i.status === 'Issued').length.toString(), icon: BookUp, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Returned Today", value: recentIssues.filter(i => i.status === 'Returned').length.toString(), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Overdue Notices", value: overdueBooks.length.toString(), icon: AlertCircle, color: "text-rose-600 bg-rose-50 border-rose-100" },
  ];

  const recentTransactions = recentIssues.map(issue => ({
    id: `TX-${issue.id}`,
    member: issue.studentName || issue.member || 'N/A',
    book: issue.bookTitle || issue.book || 'N/A',
    issueDate: issue.issueDate || 'N/A',
    dueDate: issue.dueDate || issue.returnDate || 'N/A',
    status: issue.status || 'Issued'
  }));

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 select-none">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3 sm:px-5 sm:py-3 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold mb-0.5 border border-indigo-500/30">
              Circulation Desk
            </span>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">Librarian Workbench</h1>
            <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl leading-tight">Manage catalog inventory, execute book circulation, and inspect analytics.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => navigate('/issue-lib')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BookUp size={13} />
              <span>Issue Book</span>
            </button>
            
            <button 
              onClick={() => navigate('/return-lib')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700/80 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BookDown size={13} />
              <span>Fine Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* Circulation Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card glass-card-hover p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">
                  {item.value}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 truncate leading-none">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Circulation Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col min-w-0">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-3 flex items-center justify-between text-white border-b border-indigo-900/40">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">Recent Circulation Logs</h2>
            <p className="text-[11px] text-slate-300 leading-tight">Real-time status of issued and returned items.</p>
          </div>
          
          <button 
            onClick={() => navigate('/issued-lib')}
            className="text-xs text-indigo-300 font-semibold hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            View Issued Books →
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-200 font-bold uppercase tracking-wider text-[10px] border-b border-indigo-950">
                <th className="py-2.5 px-4">TX ID</th>
                <th className="py-2.5 px-4">Member Name</th>
                <th className="py-2.5 px-4">Book Title</th>
                <th className="py-2.5 px-4">Issue Date</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentTransactions.slice(0, 4).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{tx.id}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{tx.member}</td>
                  <td className="py-2.5 px-4 text-slate-600">{tx.book}</td>
                  <td className="py-2.5 px-4 text-slate-500">{tx.issueDate}</td>
                  <td className="py-2.5 px-4 text-slate-500">{tx.dueDate}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'Issued' ? 'bg-amber-100 text-amber-800' :
                      tx.status === 'Returned' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
