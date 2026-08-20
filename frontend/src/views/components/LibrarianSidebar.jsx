
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  BookUp,
  BookDown,
  BookMarked,
  BarChart3,
  LogOut
} from 'lucide-react';

export default function LibrarianSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  // STRICT LIBRARIAN MENU ITEMS
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Books", path: "/librarian/books/manage", icon: BookOpen },
    { name: "Issue Book", path: "/librarian/transactions/issue", icon: BookUp },
    { name: "Return Book", path: "/librarian/transactions/return", icon: BookDown },
    { name: "Issued Books", path: "/librarian/transactions/issued", icon: BookMarked },
    { name: "View Reports", path: "/librarian/reports", icon: BarChart3 },
  ];

  function handleSignOut() {
    if (logoutUser) logoutUser();
    localStorage.removeItem('lms_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (onClose) onClose();
    navigate('/dashboard');
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-300 h-screen flex flex-col justify-between p-4 border-r border-indigo-900/30 shadow-xl transition-transform duration-300 ease-in-out md:static md:h-screen md:translate-x-0 shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="space-y-6 flex-1 flex flex-col min-h-0">

          {/* Header Logo */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-indigo-900/40 shrink-0">
            <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              L
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">LMS Portal</h2>
              <p className="text-[10px] text-indigo-300/80 font-medium">Librarian Suite</p>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-indigo-300/60 tracking-wider uppercase px-2">
              CIRCULATION & CATALOG
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/40'
                      : 'text-slate-300 hover:bg-indigo-900/40 hover:text-white'
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Profile */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-900/40 shrink-0 mt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-medium py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}