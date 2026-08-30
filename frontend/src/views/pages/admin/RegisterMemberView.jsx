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
        navigate("/users");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to register user");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/users");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-2 pb-2 select-none">
      {/* Top Header - Dark Navy Bar */}
      <div className="bg-slate-900 p-3 sm:px-4 sm:py-3 rounded-xl border border-slate-800 shadow-md flex items-center justify-between text-white">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight">Register User</h2>
          <p className="text-[11px] text-slate-400 font-medium">Enter user details and security credentials to add a new member.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 hover:text-white transition-colors cursor-pointer bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-1.5 rounded-xl border border-indigo-500/30 shadow-xs"
        >
          <ArrowLeft size={13} />
          <span>Back to Manage Users</span>
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={onSubmit} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          {/* User ID */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">User ID *</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              placeholder="e.g. MEM-101"
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="e.g. John"
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="e.g. Doe"
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@university.edu"
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              required
            />
          </div>

          {/* User Role */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">User Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition font-medium text-stone-800"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Account Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition font-medium text-stone-800"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Account Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create strong password"
                className="w-full pl-3 pr-9 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full pl-3 pr-9 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Register Member
          </button>
        </div>
      </form>
    </div>
  );
}
