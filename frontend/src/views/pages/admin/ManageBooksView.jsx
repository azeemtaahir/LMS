import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useBookController } from "../../../hooks/useBookHook";
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import AddBookView from "./AddBookView";
import api from "../../../api/api";

export default function ManageBooksView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isLibrarian = location.pathname.includes("/librarian");
  
  // Directly derive state from URL search params (no useEffect or useState needed)
  const showAddForm = searchParams.get("add") === "true";

  const { books, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categoriesList, refreshBooks } =
    useBookController();

  const DEFAULT_CATEGORIES = [
    "Fiction",
    "Non-Fiction",
    "Self Help",
    "Finance",
    "Computer Science",
    "Science & Technology",
    "History",
    "Biography & Memoir",
    "Philosophy",
    "Mathematics",
    "Literature",
    "General",
  ];

  const fetchedCatNames = (categoriesList || [])
    .map((cat) => (typeof cat === "object" ? cat.name : cat))
    .filter(Boolean);
  const bookCatNames = (books || []).map((b) => b.category).filter(Boolean);

  const allCategoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...fetchedCatNames, ...bookCatNames])
  );

  const [statusFilter, setStatusFilter] = useState("All");

  // Action Modals State
  const [viewingBook, setViewingBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: 1,
    publisher: "",
    edition: "",
    shelfNumber: "",
    status: "Available",
  });

  const handleOpenAddForm = () => {
    setSearchParams((prev) => {
      prev.set("add", "true");
      return prev;
    });
  };

  const handleCloseAddForm = () => {
    if (refreshBooks) refreshBooks();
    setSearchParams((prev) => {
      prev.delete("add");
      return prev;
    });
  };

  const handleViewBook = (book) => {
    setViewingBook(book);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "",
      quantity: book.totalQuantity ?? book.copies_owned ?? 1,
      publisher: book.publisher || "",
      edition: book.edition || "",
      shelfNumber: book.shelfNumber || "",
      status: book.status || "Available",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.author) {
      alert("Book Title and Author Name are required.");
      return;
    }
    try {
      const payload = {
        title: editFormData.title,
        author: editFormData.author,
        isbn: editFormData.isbn,
        category: editFormData.category || "General",
        copies_owned: Number(editFormData.quantity) || 1,
        totalQuantity: Number(editFormData.quantity) || 1,
        publisher: editFormData.publisher,
        edition: editFormData.edition,
        shelfNumber: editFormData.shelfNumber,
        status: editFormData.status,
      };
      await api.put(`/books/${editingBook.id}`, payload);
      alert("Book updated successfully!");
      if (refreshBooks) await refreshBooks();
      setEditingBook(null);
    } catch (err) {
      console.error("Failed to update book", err);
      alert(err.response?.data?.message || "Failed to update book.");
    }
  };

  const handleDeleteBook = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await api.delete(`/books/${book.id}`);
        alert(`Book "${book.title}" deleted successfully!`);
        if (refreshBooks) await refreshBooks();
      } catch (err) {
        console.error("Failed to delete book", err);
        alert(err.response?.data?.message || "Failed to delete book.");
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredBooks = (books || []).filter((book) => {
    const matchesStatus = statusFilter === "All" || book.status === statusFilter;
    return matchesStatus;
  });

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentBooks = filteredBooks.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Conditionally Render Add Book Form OR Manage Books Table */}
      {showAddForm ? (
        <div className="bg-amber-50/20 p-4 sm:p-6 rounded-2xl border border-amber-900/10 transition-all duration-300">
          <AddBookView
            onCancel={handleCloseAddForm}
            onSuccess={handleCloseAddForm}
          />
        </div>
      ) : (
        <>
          {/* Books Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-200 font-semibold uppercase tracking-wider text-[11px] border-b border-indigo-950">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Book Title</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Status</th>
                    {!isLibrarian && <th className="py-3.5 px-4 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentBooks.length === 0 ? (
                    <tr>
                      <td colSpan={isLibrarian ? "6" : "7"} className="py-8 text-center text-slate-400">
                        No books found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{book.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{book.title}</td>
                        <td className="py-3 px-4 text-slate-600">{book.author || "Unknown Author"}</td>
                        <td className="py-3 px-4 text-slate-600">{book.category || "General"}</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">{book.totalQuantity ?? book.copies_owned ?? 1}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              (book.status || "Available") === "Available"
                                ? "bg-emerald-100 text-emerald-800"
                                : (book.status || "Available") === "Issued"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {book.status || "Available"}
                          </span>
                        </td>
                        {!isLibrarian && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleViewBook(book)}
                                title="View"
                                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleEditBook(book)}
                                title="Edit"
                                className="p-1.5 text-indigo-600 hover:text-indigo-900 rounded-md hover:bg-indigo-50 transition cursor-pointer"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book)}
                                title="Delete"
                                className="p-1.5 text-rose-600 hover:text-rose-800 rounded-md hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic Pagination Footer - Only rendered when totalPages > 1 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} books
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={validCurrentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        validCurrentPage === page
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={validCurrentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW BOOK MODAL */}
      {viewingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden space-y-4 p-6 select-none animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Eye className="text-indigo-600" size={18} />
                Book Details
              </h3>
              <button
                onClick={() => setViewingBook(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Book Title</span>
                <span className="text-slate-800 font-bold text-sm block mt-0.5">{viewingBook.title}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Author</span>
                <span className="text-slate-700 font-semibold block mt-0.5">{viewingBook.author || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">ISBN</span>
                <span className="text-slate-700 font-semibold block mt-0.5">{viewingBook.isbn || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Category</span>
                <span className="text-indigo-600 font-semibold block mt-0.5">{viewingBook.category || "General"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Status</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                    (viewingBook.status || "Available") === "Available"
                      ? "bg-emerald-100 text-emerald-800"
                      : (viewingBook.status || "Available") === "Issued"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {viewingBook.status || "Available"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Total Quantity</span>
                <span className="text-slate-800 font-semibold block mt-0.5">{viewingBook.totalQuantity ?? viewingBook.copies_owned ?? 1}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Shelf Number</span>
                <span className="text-slate-700 font-semibold block mt-0.5">{viewingBook.shelfNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Publisher</span>
                <span className="text-slate-700 font-semibold block mt-0.5">{viewingBook.publisher || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Edition</span>
                <span className="text-slate-700 font-semibold block mt-0.5">{viewingBook.edition || "N/A"}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                onClick={() => setViewingBook(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BOOK MODAL */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden space-y-4 p-6 select-none animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit className="text-indigo-600" size={18} />
                Edit Book
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Book Title *</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Author Name *</label>
                  <input
                    type="text"
                    value={editFormData.author}
                    onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={editFormData.isbn}
                    onChange={(e) => setEditFormData({ ...editFormData, isbn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {allCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={editFormData.publisher}
                    onChange={(e) => setEditFormData({ ...editFormData, publisher: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Edition</label>
                  <input
                    type="text"
                    value={editFormData.edition}
                    onChange={(e) => setEditFormData({ ...editFormData, edition: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="Available">Available</option>
                    <option value="Issued">Issued</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Shelf Number</label>
                  <input
                    type="text"
                    value={editFormData.shelfNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, shelfNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}