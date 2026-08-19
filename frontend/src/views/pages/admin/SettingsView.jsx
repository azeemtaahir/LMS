import { useSettingsController } from "../../../hooks/useSettingsHook";
import { User, Lock, Building, Sliders, Database, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SettingsView() {
  const { activeTab, setActiveTab, profileData, setProfileData, handleProfileSubmit } = useSettingsController();

  const tabs = [
    { name: "Profile", icon: User },
    { name: "Change Password", icon: Lock },
    { name: "Library Info", icon: Building },
    { name: "Preferences", icon: Sliders },
    { name: "Backup", icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1 border border-indigo-500/30">
            <Sparkles size={13} className="text-amber-400 fill-amber-400" />
            <span>System Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin & Portal Settings</h1>
          <p className="text-xs text-slate-300 mt-1">Manage administrator profile, security credentials, and system parameters.</p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 items-center justify-center text-indigo-300 shrink-0">
          <ShieldCheck size={24} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents: PROFILE TAB */}
      {activeTab === "Profile" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* Avatar Area */}
          <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/30 shrink-0">
              {profileData?.name ? profileData.name[0].toUpperCase() : <User size={36} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{profileData.name}</h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{profileData.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">Full system administrator access enabled</p>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHANGE PASSWORD TAB */}
      {activeTab === "Change Password" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Security & Credentials
            </h3>
            <p className="text-xs text-slate-500 mt-1">Update your password to keep your administrator account secure.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
              />
            </div>
            <button
              onClick={() => alert("Password changed successfully!")}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <Lock size={16} />
              <span>Update Password</span>
            </button>
          </div>
        </div>
      )}

      {/* OTHER TABS MOCKUPS */}
      {activeTab !== "Profile" && activeTab !== "Change Password" && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center py-12 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Building size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900">{activeTab} Settings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Configure system preferences and operational parameters for {activeTab}.</p>
        </div>
      )}
    </div>
  );
}
