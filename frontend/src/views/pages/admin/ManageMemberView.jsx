import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMemberController } from "../../../hooks/useMemberHook";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import RegisterUsersView from "./RegisterMemberView";

export default function ManageUsersView() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state directly from URL query params
  const showRegisterForm = searchParams.get("register") === "true";

  const {
    students,
    searchQuery,
    setSearchQuery,
    selectedDept,
    setSelectedDept,
    selectedRole,
    setSelectedRole,
    handleDeleteStudent,
    handleUpdateStudent,
  } = useMemberController();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil((students || []).length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentStudents = (students || []).slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // View Details Modal State
  const [viewMember, setViewMember] = useState(null);

  // Edit User Modal State
  const [editMember, setEditMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "Student",
    status: "active",
  });

  const handleOpenEdit = (member) => {
    setEditMember(member);
    const names = (member.name || "").split(" ");
    setEditFormData({
      first_name: member.first_name || names[0] || "",
      last_name: member.last_name || names.slice(1).join(" ") || "",
      email: member.email || "",
      role: member.role || "Student",
      status: (member.status || "active").toLowerCase(),
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editMember) return;
    const fullName = `${editFormData.first_name} ${editFormData.last_name}`.trim();
    await handleUpdateStudent(editMember.id, {
      ...editFormData,
      name: fullName,
      fullName,
    });
    setEditMember(null);
  };

  const handleCloseRegisterForm = () => {
    setSearchParams((prev) => {
      prev.delete("register");
      return prev;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Conditionally Render User Registration Form OR Manage Users Table */}
      {showRegisterForm ? (
        <div className="bg-indigo-50/30 p-4 sm:p-6 rounded-2xl border border-indigo-900/10 transition-all duration-300">
          <RegisterUsersView
            onCancel={handleCloseRegisterForm}
            onSuccess={handleCloseRegisterForm}
          />
        </div>
      ) : (
        <>
          {/* Members Table */}

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-200 font-semibold uppercase tracking-wider text-[11px] border-b border-indigo-950">
                  <tr>
                    <th className="py-3.5 px-4">User ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.studentId || `MEM-${s.id}`}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="py-3 px-4 text-slate-600">{s.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {s.role || "Student"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              (s.status || "active").toLowerCase() === "active"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : (s.status || "active").toLowerCase() === "suspended"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {s.status || "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewMember(s)}
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              title="Edit User"
                              className="p-1.5 text-indigo-600 hover:text-indigo-900 rounded-md hover:bg-indigo-50 transition cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.id)}
                              title="Delete User"
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

            {/* Dynamic Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(validCurrentPage * ITEMS_PER_PAGE, (students || []).length)} of {(students || []).length} users
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

          {/* VIEW DETAILS MODAL */}
          {viewMember && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base">User Details</h3>
                  <button
                    onClick={() => setViewMember(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block">User ID:</span>
                    <span className="font-bold text-slate-800 text-sm">{viewMember.studentId || `MEM-${viewMember.id}`}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Full Name:</span>
                    <span className="text-slate-800 font-medium">{viewMember.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Email Address:</span>
                    <span className="text-slate-800 font-medium">{viewMember.email}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Role:</span>
                    <span className="text-indigo-600 font-bold">{viewMember.role || "Student"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Account Status:</span>
                    <span className="capitalize font-bold text-slate-800">{viewMember.status || "active"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Joined Date:</span>
                    <span className="text-slate-700">{viewMember.registeredDate || "N/A"}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setViewMember(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT USER MODAL */}
          {editMember && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base">Edit User</h3>
                  <button
                    type="button"
                    onClick={() => setEditMember(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editFormData.first_name}
                      onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.last_name}
                      onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMember(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}