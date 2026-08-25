import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useBookController } from "../../../hooks/useBookHook";
import BookCoverImage from "../../components/BookCoverImage";
import {
  Search,
  BookOpen,
  LogIn,
  Filter,
  Info,
  X,
  Sparkles,
  UserCheck,
  BookmarkPlus,
  BookCheck,
  BookCopy,
  Layers,
  ArrowRight,
  Library,
} from "lucide-react";

export default function PublicDashboardView() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const { books, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categoriesList } = useBookController();

  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);

  const defaultCategories = [
    "All",
    "Fiction",
    "Self Help",
    "Finance",
    "Computer Science",
    "Literature",
    "Physics",
    "Mathematics",
  ];

  const categories = categoriesList && categoriesList.length > 0
    ? ["All", ...categoriesList.map((c) => c.name)]
    : defaultCategories;

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    const isAvail = (b.availableCopies !== undefined ? b.availableCopies : b.availableQuantity || 1) > 0;
    const matchesAvail = availabilityFilter === "All" || (availabilityFilter === "Available" && isAvail);

    return matchesSearch && matchesCat && matchesAvail;
  });

  const getUserDashboardPath = () => {
    if (!user) return "/login";
    return "/dashboard";
  };

  const getUserDashboardLabel = () => {
    if (!user) return "Login";
    if (user.role === "Admin") return "Admin Dashboard";
    if (user.role === "Librarian") return "Librarian Dashboard";
    return "My Dashboard";
  };

  const totalBooksCount = books.length;
  const availableBooksCount = books.filter(
    (b) => (b.availableCopies !== undefined ? b.availableCopies : b.availableQuantity || 1) > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-3.5 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-indigo-500/25 shrink-0">
            L
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 truncate">
              LMS Portal <Sparkles size={14} className="text-amber-400 fill-amber-400 shrink-0" />
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block truncate">Public Library & Digital Catalog</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user && (
            <button
              onClick={() => logoutUser()}
              className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Logout
            </button>
          )}
          <Link
            to={getUserDashboardPath()}
            className="py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            {user ? <ArrowRight size={15} /> : <LogIn size={15} />}
            <span className="truncate">{getUserDashboardLabel()}</span>
          </Link>
        </div>
      </header>

      {/* HERO & STATS SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/60 py-8 sm:py-12 md:py-14 px-3.5 sm:px-6 md:px-8">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Library size={13} /> Welcome to Central Library Catalog
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Explore Our Collection of <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Knowledge</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Browse books across various disciplines. Sign in to your Admin, Librarian, or Member account to borrow, reserve, or manage books.
            </p>
          </div>

          {/* QUICK STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <BookCopy size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-xl font-extrabold text-white truncate">{totalBooksCount}</div>
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">Total Books</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <BookCheck size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-xl font-extrabold text-white truncate">{availableBooksCount}</div>
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">Available Now</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Layers size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-xl font-extrabold text-white truncate">{categories.length - 1}</div>
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">Categories</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <UserCheck size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-xl font-extrabold text-white truncate">3 Roles</div>
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">Admin/Librarian/User</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG FILTER & BOOK LIST */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6">
        {/* CONTROLS BAR */}
        <div className="bg-slate-900/80 p-3.5 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3.5 sm:space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* SEARCH INPUT */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books by title, author, category, ISBN..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* AVAILABILITY FILTER */}
            <div className="flex items-center gap-2.5 justify-between md:justify-end shrink-0">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                <Filter size={14} className="text-indigo-400" /> Availability:
              </label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
              >
                <option value="All">All Books</option>
                <option value="Available">Available Only</option>
              </select>
            </div>
          </div>

          {/* CATEGORY CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar sm:scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* BOOK GRID */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-slate-200">
              Catalog Books ({filteredBooks.length})
            </h2>
            {(searchQuery || selectedCategory !== "All" || availabilityFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setAvailabilityFilter("All");
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 sm:p-12 text-center text-slate-500 space-y-3">
              <BookOpen size={44} className="mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">No books found matching your criteria.</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {filteredBooks.map((book) => {
                const copies = book.availableCopies !== undefined ? book.availableCopies : (book.availableQuantity || 1);
                const isAvailable = copies > 0;

                return (
                  <div
                    key={book.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 shadow-md hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-3 sm:p-3.5 space-y-2.5">
                      <div className="w-full aspect-[3/4] rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden group-hover:scale-[1.02] transition-transform flex items-center justify-center">
                        <BookCoverImage book={book} className="w-full h-full object-cover rounded-xl" />
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold border shadow-md backdrop-blur-sm ${
                            isAvailable
                              ? "bg-emerald-500/80 text-emerald-100 border-emerald-400/50"
                              : "bg-rose-500/80 text-rose-100 border-rose-400/50"
                          }`}
                        >
                          {isAvailable ? `${copies} Avail` : "Out"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] sm:text-[10px] font-semibold border border-indigo-500/20 inline-block max-w-full truncate">
                          {book.category || "General"}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate" title={book.author}>
                          By {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 sm:p-2.5 bg-slate-950/60 border-t border-slate-800/80 grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="w-full py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 text-[10px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 min-w-0"
                      >
                        <Info size={13} className="shrink-0" />
                        <span className="truncate">Details</span>
                      </button>

                      {user ? (
                        <button
                          onClick={() => navigate(getUserDashboardPath())}
                          className="w-full py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-[10px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20 min-w-0"
                        >
                          <BookmarkPlus size={13} className="shrink-0" />
                          <span className="truncate">Reserve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[10px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 border border-slate-700 min-w-0"
                        >
                          <LogIn size={13} className="shrink-0" />
                          <span className="truncate">Login</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* BOOK DETAILS MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-700/80 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-slate-800 pb-4">
              <div className="w-24 sm:w-28 aspect-[2/3] shrink-0">
                <BookCoverImage book={selectedBook} className="w-full h-full object-cover rounded-xl border border-slate-700 shadow-md" />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20">
                    {selectedBook.category || "General"}
                  </span>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-white mt-2 leading-snug">{selectedBook.title}</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">Author: {selectedBook.author}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-left">
                <div><span className="font-bold text-slate-400">ISBN:</span> {selectedBook.isbn || "978-0132350884"}</div>
                <div><span className="font-bold text-slate-400">Shelf Location:</span> {selectedBook.shelfNumber || "Floor 2, Shelf A-12"}</div>
                <div><span className="font-bold text-slate-400">Publisher:</span> {selectedBook.publisher || "Central Library Press"}</div>
                <div><span className="font-bold text-slate-400">Edition:</span> {selectedBook.edition || "1st Edition"}</div>
              </div>
              <p className="text-slate-400 leading-relaxed text-left">
                {selectedBook.description || "A recommended reading title available in our central library database catalog."}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedBook(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer text-center"
              >
                Close
              </button>
              {user ? (
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    navigate(getUserDashboardPath());
                  }}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to My Dashboard to Reserve</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    navigate("/login");
                  }}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Login to Reserve</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Central Library Management System. All Rights Reserved.</p>
      </footer>
    </div>
  );
}