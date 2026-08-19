import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLibrarianController } from "../../../hooks/useLibrarianHook";
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, UserPlus, X } from "lucide-react";
import RegisterLibrarianView from "./RegisterLibrarianView";

export default function ManageLibrarianView() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Derive state directly from URL search params
  const showRegisterForm = searchParams.get("register") === "true";

  const {
    librarians,
    searchQuery,
    setSearchQuery,
    selectedShift,
    setSelectedShift,
    handleUpdateLibrarian,
    handleDeleteLibrarian,
  } = useLibrarianController();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil((librarians || []).length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentLibrarians = (librarians || []).slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // Modals state
  const [viewingLibrarian, setViewingLibrarian] = useState(null);
  const [editingLibrarian, setEditingLibrarian] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "Morning",
    status: "Active",
  });

  const handleOpenRegisterForm = () => {
    setSearchParams((prev) => {
      prev.set("register", "true");
      return prev;
    });
  };

  const handleCloseRegisterForm = () => {
    setSearchParams((prev) => {
      prev.delete("register");
      return prev;
    });
  };

  const handleViewLibrarian = (lib) => {
    setViewingLibrarian(lib);
  };

  const handleEditLibrarian = (lib) => {
    setEditingLibrarian(lib);
    setEditFormData({
      name: lib.name || "",
      email: lib.email || "",
      phone: lib.phone || "",
      shift: lib.shift || "Morning",
      status: lib.status || "Active",
    });
  };

  const handleSaveEditLibrarian = (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.email) {
      alert("Librarian Name and Email are required.");
      return;
    }
    if (editingLibrarian && handleUpdateLibrarian) {
      handleUpdateLibrarian(editingLibrarian.id, editFormData);
    }
    setEditingLibrarian(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Conditionally Render Registration Form OR Table */}
      {showRegisterForm ? (
        <div className="bg-amber-50/20 p-4 sm:p-6 rounded-2xl border border-amber-900/10 transition-all duration-300">
          <RegisterLibrarianView
            onCancel={handleCloseRegisterForm}
            onSuccess={handleCloseRegisterForm}
          />
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between text-white">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-2.5 text-indigo-300/70" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search librarians..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-indigo-500/30 bg-slate-900/80 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition"
              />
            </div>

            {/* Shift Filter & Register Button */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-indigo-200">Shift:</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-indigo-500/30 bg-slate-900/80 text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Shifts</option>
                  <option value="Morning" className="bg-slate-900 text-white">Morning</option>
                  <option value="Evening" className="bg-slate-900 text-white">Evening</option>
                  <option value="Night" className="bg-slate-900 text-white">Night</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenRegisterForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Register Librarian</span>
              </button>
            </div>
          </div>

          {/* Librarians Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Librarian ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Shift</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentLibrarians.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No librarians found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentLibrarians.map((lib) => (
                      <tr key={lib.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{lib.librarianId || `LIB-${lib.id}`}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{lib.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                            {lib.shift || "Morning"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{lib.email}</div>
                          <div className="text-[11px] text-slate-400">{lib.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lib.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {lib.status || "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleViewLibrarian(lib)}
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleEditLibrarian(lib)}
                              title="Edit Librarian"
                              className="p-1.5 text-indigo-600 hover:text-indigo-900 rounded-md hover:bg-indigo-50 transition cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteLibrarian(lib.id)}
                              title="Delete Librarian"
                              className="p-1.5 text-rose-600 hover:text-rose-800 rounded-md hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
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
                  {Math.min(validCurrentPage * ITEMS_PER_PAGE, (librarians || []).length)} of {(librarians || []).length} librarians
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

      {/* VIEW LIBRARIAN MODAL */}
      {viewingLibrarian && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Librarian Details</h3>
              <button
                onClick={() => setViewingLibrarian(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Librarian ID:</span>
                <span className="font-bold text-slate-800">{viewingLibrarian.librarianId || `LIB-${viewingLibrarian.id}`}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Full Name:</span>
                <span className="font-semibold text-slate-800">{viewingLibrarian.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Email:</span>
                <span className="text-slate-700">{viewingLibrarian.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Phone:</span>
                <span className="text-slate-700">{viewingLibrarian.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Assigned Shift:</span>
                <span className="font-bold text-indigo-600">{viewingLibrarian.shift || "Morning"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Status:</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${viewingLibrarian.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  {viewingLibrarian.status || "Active"}
                </span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingLibrarian(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LIBRARIAN MODAL */}
      {editingLibrarian && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Librarian Profile</h3>
              <button
                onClick={() => setEditingLibrarian(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditLibrarian} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shift</label>
                  <select
                    value={editFormData.shift}
                    onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLibrarian(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
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