import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, Users, UserCheck, 
  BookUp, BookDown, BookMarked, BarChart3, Settings, 
  Search, User, LogOut
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logoutUser } = useAuth();
  const user = authUser || JSON.parse(localStorage.getItem('user') || 'null') || JSON.parse(localStorage.getItem('lms_user') || 'null');
  const normRole = String(user?.role || '').toLowerCase().trim();

  const isLibrarianRole = normRole.includes('librarian') || location.pathname.startsWith('/librarian');
  const isMemberRole = normRole.includes('student') || normRole.includes('teacher') || normRole.includes('member');
  const isAdminRole = !isLibrarianRole && !isMemberRole;

  const suiteName = isAdminRole
    ? 'Admin Suite'
    : isLibrarianRole
    ? 'Librarian Suite'
    : 'Library Users Suite';

  // Define exact routes with section headings for each role
  const getNavSections = () => {
    if (isLibrarianRole) {
      return [
        {
          heading: "DASHBOARD",
          items: [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ]
        },
        {
          heading: "MANAGE",
          items: [
            { name: "Manage Books", path: "/librarian/books/manage", icon: BookOpen },
          ]
        },
        {
          heading: "CIRCULATION",
          items: [
            { name: "Issue Book", path: "/librarian/transactions/issue", icon: BookUp },
            { name: "Return Book", path: "/librarian/transactions/return", icon: BookDown },
            { name: "Issued Books", path: "/librarian/transactions/issued", icon: BookMarked },
          ]
        },
        {
          heading: "REPORTS",
          items: [
            { name: "Reports & Analytics", path: "/librarian/reports", icon: BarChart3 },
          ]
        }
      ];
    } else if (isAdminRole) {
      return [
        {
          heading: "DASHBOARD",
          items: [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ]
        },
        {
          heading: "MANAGEMENT",
          items: [
            { name: "Manage Books", path: "/admin/books/manage", icon: BookOpen },
            { name: "Manage Users", path: "/admin/users/manage", icon: Users },
            { name: "Manage Librarians", path: "/admin/librarians/manage", icon: UserCheck },
          ]
        },
        {
          heading: "CIRCULATION",
          items: [
            { name: "Issue Book", path: "/admin/transactions/issue", icon: BookUp },
            { name: "Return Book", path: "/admin/transactions/return", icon: BookDown },
            { name: "Issued Books", path: "/admin/transactions/issued", icon: BookMarked },
          ]
        },
        {
          heading: "REPORTS & SYSTEM",
          items: [
            { name: "Reports & Analytics", path: "/admin/reports", icon: BarChart3 },
            { name: "Settings", path: "/admin/settings", icon: Settings },
          ]
        }
      ];
    } else {
      return [
        {
          heading: "DASHBOARD",
          items: [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ]
        },
        {
          heading: "USERS",
          items: [
            { name: "Search Books", path: "/member/search", icon: Search },
            { name: "My Borrowed Books", path: "/member/my-books", icon: BookMarked },
            { name: "My Profile", path: "/member/profile", icon: User },
          ]
        }
      ];
    }
  };

  const handleSignOut = () => {
    if (logoutUser) logoutUser();
    localStorage.removeItem('lms_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (onClose) onClose();
    navigate('/dashboard');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 h-screen overflow-y-auto flex flex-col justify-between p-4 border-r border-slate-800/80 shadow-lg transition-transform duration-300 ease-in-out md:static md:h-screen md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800 shrink-0">
            <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">L</div>
            <div>
              <h2 className="text-sm font-bold text-white">LMS Portal</h2>
              <p className="text-[10px] text-slate-400 font-medium">{suiteName}</p>
            </div>
          </div>

          {/* Links with section headings & scrolling */}
          <nav className="flex-1 overflow-y-auto my-3 py-1 space-y-4 pr-1 scrollbar-thin">
            {getNavSections().map((section) => (
              <div key={section.heading} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 select-none">
                  {section.heading}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 shrink-0 mt-2">
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
