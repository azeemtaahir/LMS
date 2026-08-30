import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, LogOut, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LibrarianNavbar({ onToggleSidebar }) {
  const { user: authUser, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const lmsUser = JSON.parse(localStorage.getItem('lms_user'));

  const user = lmsUser || (authUser && authUser.role === 'Librarian' ? authUser : { name: authUser?.name || 'Librarian', role: 'Librarian' });

  const getPageTitle = (path) => {
    if (path === "/manage-lib" || path === "/librarian/manage-lib" || path === "/managelib") return "Manage Books";
    if (path === "/issue-lib" || path === "/librarian/issue-lib") return "Issue Book";
    if (path === "/return-lib" || path === "/librarian/return-lib") return "Fine Book";
    if (path === "/issued-lib" || path === "/librarian/issued-lib") return "Issued Books";
    if (path === "/reports-lib" || path === "/librarian/reports-lib") return "Reports & Analytics";
    if (path.includes("manage-lib")) return "Manage Books";
    if (path.includes("issue-lib") || path.includes("return-lib") || path.includes("issued-lib")) return "Transactions";
    if (path.includes("dashboard")) return "Dashboard Overview";
    return "Dashboard Overview";
  };

  const pageTitle = getPageTitle(location.pathname);
  const isFineBookPage = location.pathname === "/return-lib" || location.pathname === "/return" || location.pathname.includes("return");

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Toggle Button */}
      <button 
        type="button" 
        onClick={onToggleSidebar}
        className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="flex items-center gap-2 pr-2 sm:pr-4 border-r border-slate-200 shrink-0">
        <h2 className="font-bold text-slate-800 text-xs sm:text-base tracking-tight select-none truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search books, transaction ID, member..." 
          className="w-full pl-9 pr-12 py-2 bg-slate-100/80 border-0 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-slate-400 bg-white rounded border border-slate-200 shadow-sm">⌘K</kbd>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3 ml-auto">
        {isFineBookPage && (
          <button
            onClick={() => {
              const currentVal = searchParams.get("records") === "true";
              const newParams = new URLSearchParams(searchParams);
              if (currentVal) {
                newParams.delete("records");
              } else {
                newParams.set("records", "true");
              }
              setSearchParams(newParams, { replace: true });
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              searchParams.get("records") === "true"
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95"
            }`}
          >
            <Receipt size={15} />
            <span>{searchParams.get("records") === "true" ? "Pending Fines" : "Fine Records"}</span>
          </button>
        )}

        
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-none capitalize">{user.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}