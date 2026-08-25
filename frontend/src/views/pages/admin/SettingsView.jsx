import { useSettingsController } from "../../../hooks/useSettingsHook";
import {
  User,
  Lock,
  Building,
  Sliders,
  Database,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Server,
  AlertCircle,
  HardDrive,
  CheckCircle,
  XCircle,
  Bell,
  Coins,
  Calendar,
  Layers,
} from "lucide-react";

export default function SettingsView() {
  const {
    activeTab,
    setActiveTab,
    saving,
    message,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    libraryInfo,
    setLibraryInfo,
    preferences,
    setPreferences,
    dbStats,
    handleProfileSubmit,
    handlePasswordSubmit,
    handleLibraryInfoSubmit,
    handlePreferencesSubmit,
    handleTestDatabase,
    handleBackupDatabase,
  } = useSettingsController();

  const tabs = [
    { name: "Profile", icon: User },
    { name: "Change Password", icon: Lock },
    { name: "Library Info", icon: Building },
    { name: "Preferences", icon: Sliders },
    { name: "Database & Backup", icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1 border border-indigo-500/30">
            <Sparkles size={13} className="text-amber-400 fill-amber-400" />
            <span>System & Database Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin & Portal Settings</h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage administrator credentials, library rules, preferences, and PostgreSQL database parameters.
          </p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 items-center justify-center text-indigo-300 shrink-0">
          <ShieldCheck size={24} />
        </div>
      </div>

      {/* Notification Toast Message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

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

      {/* TAB 1: PROFILE */}
      {activeTab === "Profile" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
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

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                required
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
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{saving ? "Saving..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CHANGE PASSWORD */}
      {activeTab === "Change Password" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security & Credentials</h3>
            <p className="text-xs text-slate-500 mt-1">Update your password to keep your administrator account secure.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Lock size={16} />
              <span>{saving ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LIBRARY INFO */}
      {activeTab === "Library Info" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Library Rules & Policies</h3>
            <p className="text-xs text-slate-500 mt-1">Configure general library details and book loan rules saved directly in database.</p>
          </div>

          <form onSubmit={handleLibraryInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Library Name</label>
                <input
                  type="text"
                  value={libraryInfo.library_name}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, library_name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Campus Address</label>
                <input
                  type="text"
                  value={libraryInfo.library_address}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, library_address: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={libraryInfo.library_email}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, library_email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Issue Limit Per Member</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={libraryInfo.max_issue_limit}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, max_issue_limit: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Standard Loan Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={libraryInfo.issue_period_days}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, issue_period_days: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Overdue Fine Rate (PKR / Week)</label>
                <input
                  type="number"
                  min="0"
                  value={libraryInfo.fine_per_week}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, fine_per_week: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{saving ? "Saving..." : "Save Library Policy Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PREFERENCES */}
      {activeTab === "Preferences" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Preferences</h3>
            <p className="text-xs text-slate-500 mt-1">Configure automated task behaviors and user interface options.</p>
          </div>

          <form onSubmit={handlePreferencesSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-[11px] text-slate-500">Send automatic email alerts for due dates and overdue fines.</p>
                  </div>
                </div>
                <select
                  value={preferences.email_notifications}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, email_notifications: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Coins size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Automatic Overdue Fine Calculation</h4>
                    <p className="text-[11px] text-slate-500">Automatically calculate weekly fines (500 PKR/wk) on overdue books.</p>
                  </div>
                </div>
                <select
                  value={preferences.auto_fine_calc}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, auto_fine_calc: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Default Portal Theme</h4>
                    <p className="text-[11px] text-slate-500">Choose system display aesthetic theme.</p>
                  </div>
                </div>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, theme: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="light">Light Slate</option>
                  <option value="dark">Dark Indigo</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{saving ? "Saving..." : "Save System Preferences"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: DATABASE & BACKUP */}
      {activeTab === "Database & Backup" && (
        <div className="space-y-6">
          {/* Database Health Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Server size={18} className="text-indigo-600" />
                  <span>PostgreSQL Database Connection</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Live database status, table metrics, and snapshot management.</p>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  dbStats.connected
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {dbStats.connected ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>{dbStats.status || "Connected"}</span>
              </div>
            </div>

            {/* Connection Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database Host</span>
                <span className="text-xs font-extrabold text-slate-800 mt-1 block">{dbStats.dbHost || "localhost"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Port</span>
                <span className="text-xs font-extrabold text-slate-800 mt-1 block">{dbStats.dbPort || 5432}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database Name</span>
                <span className="text-xs font-extrabold text-slate-800 mt-1 block">{dbStats.dbName || "library_db"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User</span>
                <span className="text-xs font-extrabold text-slate-800 mt-1 block">{dbStats.dbUser || "postgres"}</span>
              </div>
            </div>

            {/* Database Tables Stats Grid */}
            {dbStats.tableCounts && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-500" />
                  <span>Database Table Row Counts</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(dbStats.tableCounts).map(([tableName, count]) => (
                    <div key={tableName} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 capitalize">{tableName}</span>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleTestDatabase}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={15} className={saving ? "animate-spin" : ""} />
                <span>Test DB Connection</span>
              </button>

              <button
                onClick={handleBackupDatabase}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <HardDrive size={15} />
                <span>{saving ? "Processing..." : "Create Database Backup"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
