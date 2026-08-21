import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, Bell, User as UserIcon, Menu, PlusCircle, UserPlus, X } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const getPageTitle = (path) => {
    if (path === "/manage" || path.includes("books/manage")) return "Manage Books";
    if (path === "/manage-lib") return "Manage Books";
    if (path === "/users" || path.includes("users/manage")) return "Manage Users";
    if (path === "/librarians" || path.includes("librarians/manage")) return "Manage Librarians";
    if (path === "/issue" || path === "/issue-lib") return "Issue Book";
    if (path === "/return" || path === "/return-lib") return "Return Book";
    if (path === "/issued" || path === "/issued-lib") return "Issued Books";
    if (path === "/reports" || path === "/reports-lib") return "Reports & Analytics";
    if (path === "/settings") return "Settings";
    if (path === "/search") return "Search Books & Catalog";
    if (path === "/my-books") return "My Borrowed Books";
    if (path === "/profile") return "My Profile & Account";
    if (path === "/dashboard") return "Dashboard Overview";
    return "Dashboard Overview";
  };

  const pageTitle = getPageTitle(location.pathname);
  const isBooksPage = location.pathname.includes("/books") || location.pathname === "/manage" || location.pathname === "/manage-lib";
  const isUsersPage = location.pathname.includes("/users") || location.pathname.includes("/students") || location.pathname === "/users";
  const isLibrariansPage = location.pathname.includes("/librarians") || location.pathname === "/librarians";
  const isIssuedBooksPage = location.pathname.includes("/transactions/issued") || location.pathname === "/issued" || location.pathname === "/issued-lib";

  const isAddBookOpen = searchParams.get("add") === "true";
  const isRegisterUserOpen = searchParams.get("register") === "true";
  const isRegisterLibrarianOpen = searchParams.get("register") === "true" || location.pathname === "/admin/librarians/register";

  const handleToggleAddBook = () => {
    const basePath = (location.pathname.endsWith("-lib") || user?.role?.toLowerCase()?.includes("librarian")) ? "/manage-lib" : "/manage";
    if (isAddBookOpen) {
      navigate(basePath);
    } else {
      navigate(`${basePath}?add=true`);
    }
  };

  const handleToggleRegisterUser = () => {
    const basePath = "/users";
    if (isRegisterUserOpen) {
      navigate(basePath);
    } else {
      navigate(`${basePath}?register=true`);
    }
  };

  const handleToggleRegisterLibrarian = () => {
    if (isRegisterLibrarianOpen) {
      navigate("/librarians");
    } else {
      navigate("/librarians?register=true");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && currentSearch) {
      if (!location.pathname.includes("/manage") && !location.pathname.includes("/issued")) {
        const basePath = (location.pathname.endsWith("-lib") || user?.role?.toLowerCase()?.includes("librarian"))
          ? "/manage-lib"
          : "/manage";
        navigate(`${basePath}?search=${encodeURIComponent(currentSearch)}`);
      }
    }
  };

  const userRoleNorm = String(user?.role || "").toLowerCase().trim();
  const isAdminRole = userRoleNorm.includes("admin") || location.pathname.startsWith("/admin");
  const isLibrarianRole = userRoleNorm.includes("librarian") || location.pathname.startsWith("/librarian/") || location.pathname.endsWith("-lib");

  const profileName = user?.name || user?.username || (isAdminRole ? "System Admin" : isLibrarianRole ? "Librarian Staff" : "Member");

  const profileRole = isAdminRole
    ? "Admin"
    : isLibrarianRole
    ? "Librarian"
    : (user?.role || "Student");

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-8 py-2 flex items-center justify-between sticky top-0 z-20 transition-all gap-2">
      {/* Left side: Mobile Toggle, Section Title & Search Input */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Section Title */}
        <div className="flex items-center gap-2 pr-2 sm:pr-4 border-r border-slate-200 shrink-0">
          <h2 className="font-bold text-slate-800 text-xs sm:text-base tracking-tight select-none truncate">
            {pageTitle}
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={currentSearch}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder={
              isUsersPage
                ? "Search User..."
                : isBooksPage
                ? "Search Books..."
                : isLibrariansPage
                ? "Search Librarians..."
                : "Search..."
            }
            className="w-full pl-8 pr-3 sm:pr-10 py-1.5 text-xs bg-slate-100/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
          <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-200/60 rounded border border-slate-300/60 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* User profile / notifications / Header action buttons */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {isBooksPage && (
          <>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-slate-500 text-xs">Category:</span>
              <select
                value={searchParams.get("category") || "All"}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value && e.target.value !== "All") {
                    newParams.set("category", e.target.value);
                  } else {
                    newParams.delete("category");
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer text-slate-800 max-w-[75px] truncate"
              >
                <option value="All">All</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Self Help">Self Help</option>
                <option value="Finance">Finance</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Science & Technology">Science & Technology</option>
                <option value="History">History</option>
                <option value="Biography & Memoir">Biography & Memoir</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-slate-500 text-xs">Status:</span>
              <select
                value={searchParams.get("status") || "All"}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value && e.target.value !== "All") {
                    newParams.set("status", e.target.value);
                  } else {
                    newParams.delete("status");
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer text-slate-800 max-w-[75px] truncate"
              >
                <option value="All">All</option>
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <button
              onClick={handleToggleAddBook}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                isAddBookOpen
                  ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95"
              }`}
            >
              {isAddBookOpen ? <X size={15} /> : <PlusCircle size={15} />}
              <span className="hidden sm:inline">{isAddBookOpen ? "Close Form" : "Add New Book"}</span>
            </button>
          </>
        )}

        {isUsersPage && (
          <>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-slate-500 text-xs">Role:</span>
              <select
                value={searchParams.get("role") || "All"}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value && e.target.value !== "All") {
                    newParams.set("role", e.target.value);
                  } else {
                    newParams.delete("role");
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer text-slate-800 max-w-[75px] truncate"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>

            <button
              onClick={handleToggleRegisterUser}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                isRegisterUserOpen
                  ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95"
              }`}
            >
              {isRegisterUserOpen ? <X size={15} /> : <UserPlus size={15} />}
              <span className="hidden sm:inline">{isRegisterUserOpen ? "Close Form" : "Register User"}</span>
            </button>
          </>
        )}

        {isLibrariansPage && (
          <>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-slate-500 text-xs">Status:</span>
              <select
                value={searchParams.get("status") || "All"}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value && e.target.value !== "All") {
                    newParams.set("status", e.target.value);
                  } else {
                    newParams.delete("status");
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer text-slate-800 max-w-[75px] truncate"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
                <option value="Locked">Locked</option>
              </select>
            </div>

            <button
              onClick={handleToggleRegisterLibrarian}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                isRegisterLibrarianOpen
                  ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95"
              }`}
            >
              {isRegisterLibrarianOpen ? <X size={15} /> : <UserPlus size={15} />}
            </button>
          </>
        )}

        {isIssuedBooksPage && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700">
            <span className="font-semibold text-slate-500 text-xs">Status:</span>
            <select
              value={searchParams.get("status") || "All"}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value && e.target.value !== "All") {
                  newParams.set("status", e.target.value);
                } else {
                  newParams.delete("status");
                }
                setSearchParams(newParams, { replace: true });
              }}
              className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer text-slate-800 max-w-[75px] truncate"
            >
              <option value="All">All</option>
              <option value="Issued">Issued</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        )}

        {!isUsersPage && !isBooksPage && !isLibrariansPage && !isIssuedBooksPage && (
          <button className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-3 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0">
            {profileName ? profileName[0].toUpperCase() : <UserIcon size={15} />}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {profileName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">{profileRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

