import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Search,
  BookMarked,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function MemberSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser } = useAuth();

  const navSections = [
    {
      heading: "DASHBOARD",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      heading: "USERS / MEMBERS",
      items: [
        { name: "Search Books", path: "/search", icon: Search },
        { name: "My Borrowed Books", path: "/my-books", icon: BookMarked },
        { name: "My Profile", path: "/profile", icon: User },
      ],
    },
  ];

  const handleSignOut = () => {
    if (logoutUser) logoutUser();
    localStorage.removeItem("user");
    localStorage.removeItem("lms_user");
    localStorage.removeItem("token");
    if (onClose) onClose();
    navigate("/dashboard");
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

      {/* Member Sidebar Navigation Slider */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 h-screen overflow-y-auto flex flex-col justify-between p-4 border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out md:static md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800 shrink-0">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-600/30">
              L
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Member Portal <Sparkles size={13} className="text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-[10px] text-indigo-300 font-medium">Library Users Suite</p>
            </div>
          </div>

          {/* Navigation Links Slider */}
          <nav className="flex-1 overflow-y-auto my-4 space-y-5 pr-1 scrollbar-thin">
            {navSections.map((section) => (
              <div key={section.heading} className="space-y-1.5">
                <div className="px-3 text-[10px] font-extrabold text-indigo-300/70 uppercase tracking-wider mb-1 select-none">
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
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 border border-indigo-500/40"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon size={17} className={isActive ? "text-white" : "text-indigo-400"} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Member Profile Footer Card */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0 mt-2 shadow-inner">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-semibold py-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
