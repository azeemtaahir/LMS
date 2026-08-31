import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBookController } from "../../../hooks/useBookHook";
import BookCoverImage from "../../components/BookCoverImage";
import Pagination from "../../components/Pagination";

import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  Info,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";

export default function MemberSearchBooksView() {
  const { books, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useBookController();
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservedBookIds, setReservedBookIds] = useState([]);
  const [reservationSuccessMessage, setReservationSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 50;

  const categories = [
    "All",
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Fiction",
    "Business",
  ];

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    const availCount = Number(b.availableCopies ?? b.copies_owned ?? 0);
    const matchesAvail = availabilityFilter === "All" || availCount > 0;

    return matchesSearch && matchesCat && matchesAvail;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, availabilityFilter]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReserveBook = (book) => {
    if (reservedBookIds.includes(book.id)) {
      toast.warning(`You have already requested to reserve "${book.title}".`);
      return;
    }
    setReservedBookIds((prev) => [...prev, book.id]);
    toast.success(`Reservation request submitted successfully for "${book.title}"!`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {reservationSuccessMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 size={18} />
            <span>{reservationSuccessMessage}</span>
          </div>
          <button onClick={() => setReservationSuccessMessage("")} className="text-white hover:text-emerald-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* SEARCH HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl space-y-4 text-white">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 text-indigo-300/70" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, category, ISBN..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-indigo-500/30 bg-slate-900/80 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <label className="text-xs font-semibold text-indigo-200 flex items-center gap-1">
              <Filter size={14} /> Availability:
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-indigo-500/30 bg-slate-900/80 text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Catalog Books</option>
              <option value="Available" className="bg-slate-900 text-white">Available Now Only</option>
            </select>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* BOOKS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">
            Search Books Catalog ({filteredBooks.length})
          </h2>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
            <BookOpen size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No books found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 mb-6">
              {paginatedBooks.map((book) => {
                const isAvailable = Number(book.availableCopies ?? book.copies_owned ?? 0) > 0;
                const isReserved = reservedBookIds.includes(book.id);

                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="w-full aspect-[3/4] rounded-xl bg-slate-900 border border-slate-200 flex items-center justify-center text-white relative overflow-hidden">
                        <BookCoverImage book={book} className="w-full h-full object-cover rounded-xl" />
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-sm z-10 ${
                            isAvailable
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-xs"
                              : "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-xs"
                          }`}
                        >
                          {isAvailable ? "Available" : "Checked Out"}
                        </span>
                      </div>

                      <div>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100 inline-block mb-1">
                          {book.category || "General"}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">By {book.author}</p>
                      </div>
                    </div>

                    <div className="p-2 sm:p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="flex-1 py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 min-w-[70px]"
                      >
                        <Info size={13} />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => handleReserveBook(book)}
                        disabled={!isAvailable || isReserved}
                        className={`flex-1 py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 min-w-[70px] ${
                          isReserved
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isAvailable
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isReserved ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
                        <span>{isReserved ? "Requested" : "Reserve"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION COMPONENT */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredBooks.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>

      {/* BOOK DETAILS MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5">
            <div className="flex items-start gap-3.5 sm:gap-4 border-b border-slate-100 pb-3">
              <div className="w-20 sm:w-24 aspect-[2/3] shrink-0">
                <BookCoverImage book={selectedBook} className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                    {selectedBook.category || "General"}
                  </span>
                  <button onClick={() => setSelectedBook(null)} className="text-slate-400 hover:text-slate-700 p-1">
                    <X size={18} />
                  </button>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1 line-clamp-2">{selectedBook.title}</h2>
                <p className="text-xs text-slate-500 font-medium">By {selectedBook.author}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div><span className="font-bold text-slate-800">ISBN:</span> {selectedBook.isbn || "978-0132350884"}</div>
                <div><span className="font-bold text-slate-800">Shelf Location:</span> Floor 2, Aisle 4</div>
              </div>
              <p className="text-slate-500 leading-relaxed">
                {selectedBook.description || "Comprehensive reference guide covering software engineering and computer science practices."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleReserveBook(selectedBook);
                  setSelectedBook(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
              >
                Request Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
