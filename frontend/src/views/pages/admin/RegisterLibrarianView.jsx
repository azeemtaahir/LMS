import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrarianController } from "../../../hooks/useLibrarianHook";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function RegisterLibrarianView({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const { handleAddLibrarian } = useLibrarianController();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    librarianId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    shift: "Morning",
    accessLevel: "Standard Librarian",
    status: "active",
    joinedDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.librarianId || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please check and try again.");
      return;
    }
    try {
      await handleAddLibrarian({
        ...formData,
        name: formData.fullName,
      });
      alert(`Librarian ${formData.fullName} registered successfully!`);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/librarians");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to register librarian");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/librarians");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Register New Librarian</h2>
          <p className="text-xs text-stone-500">Add staff member details to grant portal access</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#522E1E] hover:text-[#2C1810] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Manage Librarians
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-900/10 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Librarian ID */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Librarian ID *</label>
              <input
                type="text"
                name="librarianId"
                value={formData.librarianId}
                onChange={handleChange}
                placeholder="Enter ID (e.g. LIB-104)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
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
                placeholder="Enter full name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
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
                placeholder="librarian@library.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
                required
              />
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition font-medium text-stone-800"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 (310) 0000000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>

            {/* Access Role */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <ShieldCheck size={14} className="text-indigo-600" />
                Access Permission Level
              </label>
              <select
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition font-medium text-stone-800"
              >
                <option value="Standard Librarian">Standard Librarian (Manage Books & Transactions)</option>
                <option value="Senior Administrator">Senior Administrator (Full Management)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set initial password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
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
                  placeholder="Re-enter initial password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#2C1810] hover:bg-[#522E1E] text-white text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            Register Librarian
          </button>
        </div>
      </form>
    </div>
  );
}
