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
    lastBackupTime,
    fetchLiveDbStats,
    handleProfileSubmit,
    handlePasswordSubmit,
    handleLibraryInfoSubmit,
    handlePreferencesSubmit,
    handleTestDatabase,
    handleBackupDatabase,
  } = useSettingsController();

  const tabs = [
    { name: "Profile", icon: User },
    { name: "Library Info", icon: Building },
    { name: "Database & Backup", icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">


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

      {/* Tabs Navigation - Dark Navy Sub-Bar */}
      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 shadow-md flex flex-wrap gap-1.5 text-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 border border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-indigo-400"} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "Profile" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {/* Top Profile Header - Dark Navy Sub-Bar */}
          <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-md flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {profileData?.name ? profileData.name[0].toUpperCase() : <User size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">{profileData.name}</h3>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">{profileData.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Full system administrator access enabled</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  placeholder="e.g. +92 300 1234567"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>{saving ? "Saving..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}



      {/* TAB 3: LIBRARY INFO */}
      {activeTab === "Library Info" && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          {/* Library Rules & Policies Header - Dark Navy Bar */}
          <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-md text-white">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Library Rules & Policies</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Configure general library details and book loan rules saved directly in database.</p>
          </div>

          <form onSubmit={handleLibraryInfoSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Library Name</label>
                <input
                  type="text"
                  value={libraryInfo.library_name}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, library_name: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={libraryInfo.library_address}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, library_address: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={libraryInfo.library_email}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, library_email: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Issue Limit Per Member</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={libraryInfo.max_issue_limit}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, max_issue_limit: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Loan Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={libraryInfo.issue_period_days}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, issue_period_days: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overdue Fine Rate (PKR / Week)</label>
                <input
                  type="number"
                  min="0"
                  value={libraryInfo.fine_per_week}
                  onChange={(e) => setLibraryInfo((prev) => ({ ...prev, fine_per_week: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-slate-800 transition font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>{saving ? "Saving..." : "Save Policy Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      )}



      {/* TAB 5: DATABASE & BACKUP */}
      {activeTab === "Database & Backup" && (
        <div className="space-y-4">
          {/* Database Health Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* PostgreSQL Database Connection Header - Dark Navy Bar */}
          <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-md text-white flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Server size={16} className="text-indigo-400" />
                <span>PostgreSQL Database Connection</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Live status, real-time table row metrics, and dynamic backup management.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  dbStats.connected
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dbStats.connected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></span>
                <span>{dbStats.status || "Connected"}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Updated: {dbStats.lastRefreshedAt || "Live"}
              </span>
            </div>
          </div>

            {/* Connection Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Database Host</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{dbStats.dbHost || "localhost"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Port</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{dbStats.dbPort || 5432}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Database Name</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{dbStats.dbName || "library_db"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">User</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{dbStats.dbUser || "postgres"}</span>
              </div>
            </div>



            {/* Database Tables Stats Grid */}
            {dbStats.tableCounts && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-500" />
                    <span>Real-Time Table Row Counts</span>
                  </h4>
                  <button
                    type="button"
                    onClick={fetchLiveDbStats}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    Refresh Counts
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(dbStats.tableCounts).map(([tableName, count]) => (
                    <div key={tableName} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 capitalize">{tableName}</span>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      )}
    </div>
  );
}
