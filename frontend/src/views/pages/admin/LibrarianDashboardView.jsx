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
    <div className="space-y-6 select-none">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-2">
              Circulation Desk
            </span>
            <h1 className="text-xl font-bold tracking-wide text-white">Librarian Workbench</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">Manage catalog inventory, execute book circulation, and inspect analytics.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => navigate('/issue-lib')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <BookUp size={15} />
              <span>Issue Book</span>
            </button>
            
            <button 
              onClick={() => navigate('/return-lib')}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-700/80 cursor-pointer"
            >
              <BookDown size={15} />
              <span>Fine Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* Circulation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">{item.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Circulation Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white border-b border-indigo-900/40">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Circulation Logs</h2>
            <p className="text-xs text-slate-300">Real-time status of issued and returned items.</p>
          </div>
          
          <button 
            onClick={() => navigate('/issued-lib')}
            className="text-xs text-indigo-300 font-semibold hover:text-white self-start sm:self-auto flex items-center gap-1 transition-colors cursor-pointer"
          >
            View Issued Books →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-200 text-[11px] font-semibold uppercase tracking-wider border-b border-indigo-950">
                <th className="py-3.5 px-5">TX ID</th>
                <th className="py-3.5 px-5">Member Name</th>
                <th className="py-3.5 px-5">Book Title</th>
                <th className="py-3.5 px-5">Issue Date</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentTransactions.slice(0, 4).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-500 font-medium">{tx.id}</td>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">{tx.member}</td>
                  <td className="py-3.5 px-5">{tx.book}</td>
                  <td className="py-3.5 px-5 text-slate-500">{tx.issueDate}</td>
                  <td className="py-3.5 px-5 text-slate-500">{tx.dueDate}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-block ${
                      tx.status === 'Issued' ? 'bg-amber-50 text-amber-600 border border-amber-200/60' :
                      tx.status === 'Returned' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' :
                      'bg-rose-50 text-rose-600 border border-rose-200/60'
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
