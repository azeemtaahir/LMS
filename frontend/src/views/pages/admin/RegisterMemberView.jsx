import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberController } from "../../../hooks/useMemberHook";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function RegisterUsersView({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const { handleAddStudentSubmit } = useMemberController();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "Student",
    password: "",
    confirmPassword: "",
    status: "active",
    joined_date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please check and try again.");
      return;
    }
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();
    try {
      await handleAddStudentSubmit({
        ...formData,
        studentId: formData.user_id,
        user_id: formData.user_id,
        fullName,
        name: fullName,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      alert(`Member ${fullName} (${formData.user_id}) registered successfully into database!`);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin/users/manage");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to register user");
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
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Member Account Registration</h2>
          <p className="text-xs text-slate-500">Register a new Member to grant library portal privileges (Saves into Member & Users tables).</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">User ID *</label>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                placeholder="e.g. MEM-101"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. John"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Doe"
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
                placeholder="user@university.edu"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* User Role */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">User Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition font-medium text-stone-800"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition font-medium text-stone-800"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
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
            Register Member
          </button>
        </div>
      </form>
    </div>
  );
}
