import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { User, Lock, Save, CheckCircle2 } from "lucide-react";

export default function MemberProfileView() {
  const { user, loginUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    role: user?.role || "Student",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [updateMessage, setUpdateMessage] = useState("");

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    loginUser({ ...user, ...profileData });
    setUpdateMessage("Profile updated successfully!");
    setTimeout(() => setUpdateMessage(""), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New password and confirm password do not match.");
      return;
    }
    setPasswords({ current: "", new: "", confirm: "" });
    setUpdateMessage("Password updated successfully!");
    setTimeout(() => setUpdateMessage(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {updateMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{updateMessage}</span>
        </div>
      )}

      {/* MEMBER HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
          {profileData.name ? profileData.name[0].toUpperCase() : "M"}
        </div>
        <div>
          <h1 className="text-lg font-bold">{profileData.name}</h1>
          <p className="text-xs text-indigo-200">{profileData.role} • {profileData.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDIT PROFILE FORM */}
        <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 uppercase">Personal Details</h2>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={profileData.phone}
              onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save size={15} />
            <span>Save Profile</span>
          </button>
        </form>

        {/* SECURITY FORM */}
        <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 uppercase">Change Password</h2>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
              placeholder="Enter new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-md hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Lock size={15} />
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}