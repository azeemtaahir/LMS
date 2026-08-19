import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMemberController } from "../../../hooks/useMemberHook";
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, GraduationCap, UserCheck, UserPlus } from "lucide-react";
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
  } = useMemberController();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil((students || []).length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentStudents = (students || []).slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

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
          {/* Filter and Search Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between text-white">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-2.5 text-indigo-300/70" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users (Student or Teacher)..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-indigo-500/30 bg-slate-900/80 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition"
              />
            </div>

            {/* Filters: Role & Department + Register Action */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-indigo-200">Role:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-indigo-500/30 bg-slate-900/80 text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Roles</option>
                  <option value="Student" className="bg-slate-900 text-white">Student</option>
                  <option value="Teacher" className="bg-slate-900 text-white">Teacher</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-indigo-200">Dept:</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-indigo-500/30 bg-slate-900/80 text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Depts</option>
                  <option value="CS" className="bg-slate-900 text-white">Computer Science</option>
                  <option value="EE" className="bg-slate-900 text-white">Electrical Eng</option>
                  <option value="BBA" className="bg-slate-900 text-white">Business Admin</option>
                  <option value="ME" className="bg-slate-900 text-white">Mechanical Eng</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenRegisterForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Register User</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">ID Number</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Department / Semester</th>
                    <th className="py-3.5 px-4">Registered Date</th>
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
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{s.name}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.studentId}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              s.role === "Teacher"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {s.role === "Teacher" ? <UserCheck size={12} /> : <GraduationCap size={12} />}
                            {s.role || "Student"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {s.department} {s.semester ? `• ${s.semester}` : s.designation ? `• ${s.designation}` : ""}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{s.registeredDate || "N/A"}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
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

            {/* Dynamic Pagination Footer - Only rendered when totalPages > 1 */}
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
        </>
      )}
    </div>
  );
}