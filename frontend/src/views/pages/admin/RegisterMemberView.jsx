import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberController } from "../../../hooks/useMemberHook";
import { ArrowLeft, Eye, EyeOff, GraduationCap, UserCheck } from "lucide-react";

export default function RegisterUsersView({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const { handleAddStudentSubmit } = useMemberController();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: "Student", // "Student" | "Teacher"
    studentId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    department: "CS",
    semester: "Semester 1",
    designation: "Professor",
    registrationDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please check and try again.");
      return;
    }
    handleAddStudentSubmit({
      ...formData,
      name: formData.fullName,
    });
    alert(`${formData.role} ${formData.fullName} registered successfully!`);
    if (onSuccess) {
      onSuccess();
    } else {
      navigate("/admin/users/manage");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin/users/manage");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">User Registration</h2>
          <p className="text-xs text-slate-500">Register a new Student or Teacher to grant borrowing privileges.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Manage Users
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* ROLE SELECTION HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-xl border border-indigo-900/40 shadow-md text-white">
          <label className="block text-xs font-bold text-indigo-200 mb-2">Select User Type / Role *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: "Student" }))}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition border cursor-pointer ${
                formData.role === "Student"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <GraduationCap size={18} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: "Teacher" }))}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition border cursor-pointer ${
                formData.role === "Teacher"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <UserCheck size={18} />
              <span>Teacher / Faculty</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {formData.role === "Teacher" ? "Teacher / Employee ID *" : "Student ID / Roll No. *"}
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder={formData.role === "Teacher" ? "e.g. TCH-201" : "e.g. STU-101"}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={formData.role === "Teacher" ? "e.g. Dr. Robert Smith" : "e.g. John Doe"}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={formData.role === "Teacher" ? "faculty@university.edu" : "student@university.edu"}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Account Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Account Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create strong password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="CS">Computer Science (CS)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics & Communication (ECE)</option>
                <option value="ME">Mechanical Engineering (ME)</option>
                <option value="CE">Civil Engineering (CE)</option>
              </select>
            </div>

            {/* Dynamic Role Field: Semester for Student vs Designation for Teacher */}
            {formData.role === "Teacher" ? (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Designation / Rank</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Lecturer">Senior Lecturer</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Semester / Class</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>
            )}

            {/* Confirm Password (shifted under Semester block) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Register {formData.role}
          </button>
        </div>
      </form>
    </div>
  );
}
